import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseCategoryBody,
  readJsonBody,
} from "@/lib/validation";
import { writeLimitExceeded } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await prisma.tulisCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { notes: true } } },
    });
    return Response.json({ categories });
  } catch {
    return errorResponse("Gagal memuat kategori.", 500);
  }
}

export async function POST(request: Request) {
  if (writeLimitExceeded(request, "categories")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
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
    const category = await prisma.tulisCategory.create({ data: { name } });
    return Response.json({ category }, { status: 201 });
  } catch {
    return errorResponse("Gagal membuat kategori.", 500);
  }
}
