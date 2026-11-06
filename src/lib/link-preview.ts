import { lookup } from "node:dns/promises";

// Mengambil judul halaman sebuah tautan, untuk disimpan bersama tautan
// referensi. Dipanggil sekali saat tautan disimpan, bukan saat daftar
// dibuka, supaya daftar tetap bisa dibaca walau situs asalnya lambat.
//
// Pagar SSRF: hanya http/https, host lokal dan alamat privat ditolak
// (termasuk lewat redirect dan lewat DNS yang menunjuk ke alamat
// privat), isi dibatasi 256 KB, dan waktu tunggu 8 detik.

const MAX_BODY_BYTES = 256 * 1024;
const FETCH_TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

function isPrivateIp(ip: string): boolean {
  if (ip === "::1" || ip === "0.0.0.0") return true;
  const v4 = ip.split(".");
  if (v4.length === 4 && v4.every((part) => /^\d+$/.test(part))) {
    const [a, b] = v4.map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
  }
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return true;
  }
  return false;
}

function isForbiddenHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local")) return true;
  if (host === "metadata.google.internal") return true;
  return isPrivateIp(host.replace(/^\[|\]$/g, ""));
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Alamat tautan tidak valid.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Tautan harus memakai http atau https.");
  }
  if (isForbiddenHost(parsed.hostname)) {
    throw new Error("Alamat tautan tidak boleh menunjuk ke jaringan lokal.");
  }
  let addresses: { address: string }[];
  try {
    addresses = await lookup(parsed.hostname, { all: true });
  } catch {
    throw new Error("Alamat tautan tidak bisa diurai.");
  }
  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error("Alamat tautan menunjuk ke jaringan lokal.");
  }
  return parsed;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => {
      const point = Number(code);
      return Number.isSafeInteger(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : "";
    });
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i);
  if (!match) return null;
  const cleaned = decodeEntities(match[1].replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 200) : null;
}

export async function fetchPageTitle(rawUrl: string): Promise<string | null> {
  let current = await assertPublicUrl(rawUrl);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(current.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "user-agent": "Tulisqu/1.0 (pengambil judul tautan)",
          accept: "text/html,application/xhtml+xml",
        },
      });
    } catch {
      throw new Error("Halaman tautan tidak bisa dibuka.");
    } finally {
      clearTimeout(timer);
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || hop === MAX_REDIRECTS) return null;
      current = await assertPublicUrl(
        new URL(location, current).toString(),
      );
      continue;
    }
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;
    if (!response.body) return null;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > MAX_BODY_BYTES) return null;
        chunks.push(value);
        const partial = new TextDecoder().decode(
          Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
        );
        if (/<\/title\s*>/i.test(partial)) break;
      }
    } finally {
      await reader.cancel().catch(() => undefined);
    }
    const html = new TextDecoder().decode(
      Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))),
    );
    return extractTitle(html);
  }
  return null;
}
