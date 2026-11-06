import { prisma } from "@/lib/prisma";
import { removeAttachment } from "@/lib/storage";
import {
  errorResponse,
  parseNoteBody,
  readJsonBody,
  validId,
} from "@/lib/validation";
import { connection } from "next/server";
import { writeLimitExceeded } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

const noteDetail = {
  category: { select: { id: true, name: true } },
  attachments: { orderBy: { createdAt: "asc" as const } },
  links: { orderBy: { createdAt: "asc" as const } },
} as const;

async function readId(params: RouteParams["params"]): Promise<string> {
  return validId((await params).id);
}

export async function GET(_request: Request, { params }: RouteParams) {
  await connection();
  let id: string;
  try {
    id = await readId(params);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const note = await prisma.note.findUnique({
      where: { id },
      include: noteDetail,
    });
    if (!note) return errorResponse("Catatan tidak ditemukan.", 404);
    return Response.json({ note });
  } catch {
    return errorResponse("Gagal memuat catatan.", 500);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "notes-id")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let id: string;
  try {
    id = await readId(params);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  let data: { title: string; content: string; categoryId: string | null };
  try {
    const body = await readJsonBody(request);
    data = parseNoteBody(body);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Masukan tidak valid.",
      400,
    );
  }
  try {
    const existing = await prisma.note.findUnique({ where: { id } });
    if (!existing) return errorResponse("Catatan tidak ditemukan.", 404);
    if (data.categoryId) {
      const category = await prisma.tulisCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) return errorResponse("Kategori tidak ditemukan.", 400);
    }
    const note = await prisma.note.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
      },
      include: noteDetail,
    });
    return Response.json({ note });
  } catch {
    return errorResponse("Gagal mengubah catatan.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "notes-id")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let id: string;
  try {
    id = await readId(params);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const existing = await prisma.note.findUnique({
      where: { id },
      include: { attachments: { select: { storagePath: true } } },
    });
    if (!existing) return errorResponse("Catatan tidak ditemukan.", 404);
    // Hapus objek Storage dulu; baris Attachment ikut terhapus lewat
    // ON DELETE CASCADE saat catatan dihapus.
    for (const attachment of existing.attachments) {
      await removeAttachment(attachment.storagePath);
    }
    await prisma.note.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return errorResponse("Gagal menghapus catatan.", 500);
  }
}
