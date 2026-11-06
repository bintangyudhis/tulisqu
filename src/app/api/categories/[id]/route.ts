import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseCategoryBody,
  readJsonBody,
  validId,
} from "@/lib/validation";
import { connection } from "next/server";
import { writeLimitExceeded } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

async function findCategory(id: string) {
  return prisma.tulisCategory.findUnique({ where: { id } });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "categories-id")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let id: string;
  try {
    id = validId((await params).id);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  let name: string;
  try {
    const body = await readJsonBody(request);
    ({ name } = parseCategoryBody(body));
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Masukan tidak valid.",
      400,
    );
  }
  try {
    const existing = await findCategory(id);
    if (!existing) return errorResponse("Kategori tidak ditemukan.", 404);
    const category = await prisma.tulisCategory.update({
      where: { id },
      data: { name },
    });
    return Response.json({ category });
  } catch {
    return errorResponse("Gagal mengubah kategori.", 500);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "categories-id")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let id: string;
  try {
    id = validId((await params).id);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const existing = await findCategory(id);
    if (!existing) return errorResponse("Kategori tidak ditemukan.", 404);
    // Catatan di kategori ini tidak ikut terhapus: kunci asing
    // Note.categoryId memakai ON DELETE SET NULL.
    await prisma.tulisCategory.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch {
    return errorResponse("Gagal menghapus kategori.", 500);
  }
}
