import { prisma } from "@/lib/prisma";
import { getDownloadUrl, removeAttachment } from "@/lib/storage";
import { errorResponse, validId } from "@/lib/validation";
import { writeLimitExceeded } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string; attachmentId: string }>;
};

async function readIds(params: RouteParams["params"]) {
  const { id, attachmentId } = await params;
  return { noteId: validId(id), attachmentId: validId(attachmentId) };
}

async function findAttachment(noteId: string, attachmentId: string) {
  return prisma.attachment.findFirst({
    where: { id: attachmentId, noteId },
  });
}

// Tautan unduh bertanda tangan (berlaku 1 jam). Bucket bersifat privat,
// jadi berkas tidak pernah diekspos lewat alamat Storage mentah.
export async function GET(_request: Request, { params }: RouteParams) {
  let ids: { noteId: string; attachmentId: string };
  try {
    ids = await readIds(params);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const attachment = await findAttachment(ids.noteId, ids.attachmentId);
    if (!attachment) return errorResponse("Lampiran tidak ditemukan.", 404);
    const url = await getDownloadUrl(attachment.storagePath);
    if (!url) return errorResponse("Tautan unduh tidak tersedia.", 503);
    return Response.json({ url });
  } catch {
    return errorResponse("Gagal membuat tautan unduh.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "attachments-id")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let ids: { noteId: string; attachmentId: string };
  try {
    ids = await readIds(params);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const attachment = await findAttachment(ids.noteId, ids.attachmentId);
    if (!attachment) return errorResponse("Lampiran tidak ditemukan.", 404);
    await removeAttachment(attachment.storagePath);
    await prisma.attachment.delete({ where: { id: attachment.id } });
    return Response.json({ ok: true });
  } catch {
    return errorResponse("Gagal menghapus lampiran.", 500);
  }
}
