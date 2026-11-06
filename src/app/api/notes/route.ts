import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseNoteBody,
  readJsonBody,
} from "@/lib/validation";
import { connection } from "next/server";
import { writeLimitExceeded } from "@/lib/rate-limit";

export async function GET(request: Request) {
  await connection();
  try {
    const categoryId =
      new URL(request.url).searchParams.get("categoryId") || undefined;
    const notes = await prisma.note.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { attachments: true, links: true } },
      },
    });
    return Response.json({ notes });
  } catch {
    return errorResponse("Gagal memuat catatan.", 500);
  }
}

export async function POST(request: Request) {
  if (writeLimitExceeded(request, "notes")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
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
    if (data.categoryId) {
      const category = await prisma.tulisCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) return errorResponse("Kategori tidak ditemukan.", 400);
    }
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        categoryId: data.categoryId,
      },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { attachments: true, links: true } },
      },
    });
    return Response.json({ note }, { status: 201 });
  } catch {
    return errorResponse("Gagal membuat catatan.", 500);
  }
}
