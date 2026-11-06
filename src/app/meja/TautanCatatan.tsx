"use client";

import { useState } from "react";
import type { LinkItem } from "./tipe";

type Props = {
  noteId: string;
  links: LinkItem[];
  onChanged: () => void;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Terjadi kesalahan.";
  } catch {
    return "Terjadi kesalahan.";
  }
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hostDari(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

export default function TautanCatatan({ noteId, links, onChanged }: Props) {
  const [alamat, setAlamat] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);
  const [sibukId, setSibukId] = useState<string | null>(null);

  async function simpan(event: React.FormEvent) {
    event.preventDefault();
    if (!alamat.trim() || sibuk) return;
    setSibuk(true);
    setGalat(null);
    const response = await fetch(`/api/notes/${noteId}/links`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: alamat }),
    });
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      setAlamat("");
      onChanged();
    }
    setSibuk(false);
  }

  async function hapus(link: LinkItem) {
    if (!window.confirm(`Hapus tautan "${link.title ?? link.url}"?`)) return;
    setSibukId(link.id);
    setGalat(null);
    const response = await fetch(`/api/notes/${noteId}/links/${link.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      onChanged();
    }
    setSibukId(null);
  }

  return (
    <section aria-label="Tautan referensi">
      <h3 className="font-mono text-xs tracking-wide text-accent uppercase">
        Tautan referensi
      </h3>
      {links.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Belum ada tautan. Simpan alamat artikel atau video rujukan; judul
          halamannya diambil otomatis saat disimpan.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent"
              >
                {link.title ?? link.url}
              </a>
              <span className="font-mono text-xs text-muted">
                {hostDari(link.url)} · {formatTanggal(link.createdAt)}
              </span>
              <button
                type="button"
                onClick={() => void hapus(link)}
                disabled={sibukId === link.id}
                className="text-sm text-muted hover:text-accent disabled:opacity-50"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={simpan} className="mt-4 flex gap-2">
        <input
          value={alamat}
          onChange={(event) => setAlamat(event.target.value)}
          placeholder="https://contoh.id/artikel"
          maxLength={2048}
          inputMode="url"
          className="min-w-0 flex-1 border border-line bg-panel px-3 py-2 text-sm"
          aria-label="Alamat tautan"
        />
        <button
          type="submit"
          disabled={sibuk || !alamat.trim()}
          className="shrink-0 bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
        >
          Simpan tautan
        </button>
      </form>
      {galat && (
        <p role="alert" className="mt-3 text-sm text-accent">
          {galat}
        </p>
      )}
    </section>
  );
}
