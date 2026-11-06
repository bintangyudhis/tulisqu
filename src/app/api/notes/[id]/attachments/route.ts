import { prisma } from "@/lib/prisma";
import {
  describeUpload,
  isStorageConfigured,
  removeAttachment,
  uploadAttachment,
} from "@/lib/storage";
import { errorResponse, validId } from "@/lib/validation";
import { connection } from "next/server";
import { writeLimitExceeded } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  await connection();
  let noteId: string;
  try {
    noteId = validId((await params).id);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const attachments = await prisma.attachment.findMany({
      where: { noteId },
      orderBy: { createdAt: "asc" },
    });
    return Response.json({ attachments });
  } catch {
    return errorResponse("Gagal memuat lampiran.", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "attachments")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let noteId: string;
  try {
    noteId = validId((await params).id);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  if (!isStorageConfigured()) {
    return errorResponse(
      "Penyimpanan berkas belum dipasang. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di environment.",
      503,
    );
  }
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Isi permintaan harus berupa form-data.", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return errorResponse("Pilih satu berkas untuk diunggah.", 400);
  }
  try {
    describeUpload(file);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Berkas tidak diterima.",
      400,
    );
  }
  try {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) return errorResponse("Catatan tidak ditemukan.", 404);
    const storagePath = await uploadAttachment(noteId, file);
    try {
      const attachment = await prisma.attachment.create({
        data: {
          noteId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          storagePath,
        },
      });
      return Response.json({ attachment }, { status: 201 });
    } catch {
      // Baris metadata gagal disimpan: hapus objek yang sudah terunggah
      // supaya Storage tidak menumpuk berkas yatim.
      await removeAttachment(storagePath);
      return errorResponse("Gagal menyimpan lampiran.", 500);
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Gagal mengunggah")) {
      return errorResponse(error.message, 502);
    }
    return errorResponse("Gagal mengunggah berkas.", 500);
  }
}
