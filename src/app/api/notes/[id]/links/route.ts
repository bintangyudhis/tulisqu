import { prisma } from "@/lib/prisma";
import { fetchPageTitle } from "@/lib/link-preview";
import {
  errorResponse,
  parseLinkBody,
  readJsonBody,
  validId,
} from "@/lib/validation";
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
    const links = await prisma.link.findMany({
      where: { noteId },
      orderBy: { createdAt: "asc" },
    });
    return Response.json({ links });
  } catch {
    return errorResponse("Gagal memuat tautan.", 500);
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "links")) {
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
  let url: string;
  try {
    const body = await readJsonBody(request);
    ({ url } = parseLinkBody(body));
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Masukan tidak valid.",
      400,
    );
  }
  try {
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) return errorResponse("Catatan tidak ditemukan.", 404);
    // Judul diambil sekali di sini; kalau halaman tidak bisa dibuka
    // atau tidak punya judul, tautan tetap tersimpan tanpa judul.
    let title: string | null = null;
    try {
      title = await fetchPageTitle(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes("jaringan lokal")) {
        return errorResponse(error.message, 400);
      }
      title = null;
    }
    const link = await prisma.link.create({
      data: { noteId, url, title },
    });
    return Response.json({ link }, { status: 201 });
  } catch {
    return errorResponse("Gagal menyimpan tautan.", 500);
  }
}
