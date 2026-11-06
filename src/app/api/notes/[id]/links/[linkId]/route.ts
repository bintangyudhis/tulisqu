import { prisma } from "@/lib/prisma";
import { errorResponse, validId } from "@/lib/validation";
import { writeLimitExceeded } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string; linkId: string }> };

export async function DELETE(request: Request, { params }: RouteParams) {
  if (writeLimitExceeded(request, "links-id")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let noteId: string;
  let linkId: string;
  try {
    const resolved = await params;
    noteId = validId(resolved.id);
    linkId = validId(resolved.linkId);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "ID tidak valid.",
      400,
    );
  }
  try {
    const link = await prisma.link.findFirst({
      where: { id: linkId, noteId },
    });
    if (!link) return errorResponse("Tautan tidak ditemukan.", 404);
    await prisma.link.delete({ where: { id: link.id } });
    return Response.json({ ok: true });
  } catch {
    return errorResponse("Gagal menghapus tautan.", 500);
  }
}
