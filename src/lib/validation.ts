// Validasi masukan sisi server untuk semua route API tulisqu.
// Validasi di peramban saja tidak dihitung; setiap route memakai
// pembantu ini sebelum menyentuh Prisma atau Storage.

export function errorResponse(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

export function requiredText(
  value: unknown,
  field: string,
  maxLength: number,
): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} wajib diisi.`);
  }
  if (value.trim().length > maxLength) {
    throw new Error(`${field} terlalu panjang (maks ${maxLength} karakter).`);
  }
  return value.trim();
}

export function optionalText(
  value: unknown,
  maxLength: number,
): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return null;
  return value.trim().slice(0, maxLength) || null;
}

export function validId(value: string): string {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(value)) {
    throw new Error("ID tidak valid.");
  }
  return value;
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    throw new Error("Isi permintaan harus berupa JSON.");
  }
  const record = asRecord(parsed);
  if (!record) throw new Error("Isi permintaan harus berupa objek JSON.");
  return record;
}

export function parseCategoryBody(body: Record<string, unknown>): {
  name: string;
} {
  return { name: requiredText(body.name, "Nama kategori", 80) };
}

export function parseNoteBody(body: Record<string, unknown>): {
  title: string;
  content: string;
  categoryId: string | null;
} {
  const categoryId =
    typeof body.categoryId === "string" && body.categoryId.length > 0
      ? validId(body.categoryId)
      : null;
  return {
    title: requiredText(body.title, "Judul catatan", 200),
    content: requiredText(body.content, "Isi catatan", 100000),
    categoryId,
  };
}

export function parseLinkBody(body: Record<string, unknown>): { url: string } {
  const raw = requiredText(body.url, "Alamat tautan", 2048);
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Alamat tautan tidak valid.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Tautan harus memakai http atau https.");
  }
  return { url: parsed.toString() };
}
