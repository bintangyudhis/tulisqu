import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Unggah berkas catatan ke bucket Storage `tulisqu-files`.
// Klien ini hanya dipakai di route API (sisi server): kunci service role
// tidak boleh sampai ke peramban, jadi tidak ada NEXT_PUBLIC_* di sini.
export const STORAGE_BUCKET = "tulisqu-files";

// Batas ukuran satu berkas: 10 MB.
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Jenis berkas yang diterima, per ekstensi. docx/pptx diperiksa dari
// ekstensi dan tipe MIME yang dikirim peramban; isi berkas tidak
// diurai, jadi ini penyaring permukaan, bukan verifikasi isi.
export const ALLOWED_FILES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

let cachedClient: SupabaseClient | null | undefined;

export function getStorageClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    cachedClient = null;
    return null;
  }
  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
}

export function isStorageConfigured(): boolean {
  return getStorageClient() !== null;
}

function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "berkas";
  const cleaned = base.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^\.+/, "");
  return cleaned.slice(0, 80) || "berkas";
}

export function describeUpload(file: File): { ext: string; mimeType: string } {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = ALLOWED_FILES[ext];
  if (!mimeType) {
    throw new Error(
      "Jenis berkas tidak diterima. Hanya pdf, doc, docx, ppt, dan pptx.",
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Berkas terlalu besar. Batas satu berkas adalah 10 MB.");
  }
  if (file.size === 0) {
    throw new Error("Berkas kosong tidak bisa diunggah.");
  }
  return { ext, mimeType };
}

export async function uploadAttachment(
  noteId: string,
  file: File,
): Promise<string> {
  const client = getStorageClient();
  if (!client) {
    throw new Error(
      "Penyimpanan berkas belum dipasang. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di environment.",
    );
  }
  const { ext } = describeUpload(file);
  const storagePath = `notes/${noteId}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await client.storage
    .from(STORAGE_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || ALLOWED_FILES[ext],
      upsert: false,
    });
  if (error) {
    throw new Error(`Gagal mengunggah berkas: ${error.message}`);
  }
  return storagePath;
}

export async function removeAttachment(storagePath: string): Promise<void> {
  const client = getStorageClient();
  if (!client) return;
  await client.storage.from(STORAGE_BUCKET).remove([storagePath]);
}

export async function getDownloadUrl(
  storagePath: string,
): Promise<string | null> {
  const client = getStorageClient();
  if (!client) return null;
  const { data, error } = await client.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(storagePath, 3600);
  if (error || !data) return null;
  return data.signedUrl;
}
