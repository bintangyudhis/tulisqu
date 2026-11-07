import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseTaskPatchBody,
  readJsonBody,
  validId,
} from "@/lib/validation";
import { writeLimitExceeded } from "@/lib/rate-limit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (writeLimitExceeded(request, "tasks")) {
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
  let patch: { title?: string; dueDate?: Date; done?: boolean };
  try {
    const body = await readJsonBody(request);
    patch = parseTaskPatchBody(body);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Masukan tidak valid.",
      400,
    );
  }
  try {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return errorResponse("Tugas tidak ditemukan.", 404);
    const task = await prisma.task.update({ where: { id }, data: patch });
    return Response.json({ task });
  } catch {
    return errorResponse("Gagal mengubah tugas.", 500);
  }
}
