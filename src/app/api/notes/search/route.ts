import { prisma } from "@/lib/prisma";
import { errorResponse, validId } from "@/lib/validation";
import { connection } from "next/server";

// Pencarian catatan berdasarkan judul atau isi. Query minimal dua
// karakter supaya pencarian satu huruf tidak memindai seluruh tabel;
// hasil dibatasi 20 dan diurutkan dari yang terakhir diubah.
export async function GET(request: Request) {
  await connection();
  try {
    const params = new URL(request.url).searchParams;
    const query = (params.get("q") ?? "").trim();
    if (query.length < 2) {
      return errorResponse("Kata kunci pencarian minimal dua karakter.", 400);
    }
    if (query.length > 200) {
      return errorResponse("Kata kunci terlalu panjang.", 400);
    }
    const categoryId = params.get("categoryId") ?? undefined;
    if (categoryId) {
      try {
        validId(categoryId);
      } catch {
        return errorResponse("Kategori tidak valid.", 400);
      }
    }
    const notes = await prisma.note.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { attachments: true, links: true } },
      },
    });
    return Response.json({ notes, query });
  } catch {
    return errorResponse("Gagal mencari catatan.", 500);
  }
}
