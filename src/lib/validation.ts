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
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1024 * 1024) {
    throw new Error("Badan permintaan terlalu besar (maks 1 MB).");
  }
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

// Tanggal tugas memakai format YYYY-MM-DD dari input date di peramban.
// Disimpan sebagai tengah malam WIB (UTC+7) supaya filter "hari ini"
// tidak bergeser saat server berjalan di UTC.
export function parseTanggalTugas(value: unknown): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Tanggal tugas harus memakai format YYYY-MM-DD.");
  }
  const parsed = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Tanggal tugas tidak valid.");
  }
  const year = Number(value.slice(0, 4));
  if (year < 2020 || year > 2100) {
    throw new Error("Tanggal tugas di luar jangkauan yang wajar.");
  }
  return parsed;
}

export function parseTaskBody(body: Record<string, unknown>): {
  title: string;
  dueDate: Date;
} {
  return {
    title: requiredText(body.title, "Judul tugas", 200),
    dueDate: parseTanggalTugas(body.dueDate),
  };
}

export function parseTaskPatchBody(body: Record<string, unknown>): {
  title?: string;
  dueDate?: Date;
  done?: boolean;
} {
  const patch: { title?: string; dueDate?: Date; done?: boolean } = {};
  if (body.title !== undefined) {
    patch.title = requiredText(body.title, "Judul tugas", 200);
  }
  if (body.dueDate !== undefined) {
    patch.dueDate = parseTanggalTugas(body.dueDate);
  }
  if (body.done !== undefined) {
    if (typeof body.done !== "boolean") {
      throw new Error("Status selesai harus berupa benar atau salah.");
    }
    patch.done = body.done;
  }
  if (
    patch.title === undefined &&
    patch.dueDate === undefined &&
    patch.done === undefined
  ) {
    throw new Error("Tidak ada perubahan yang diberikan.");
  }
  return patch;
}
