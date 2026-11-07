import { prisma } from "@/lib/prisma";
import {
  errorResponse,
  parseTaskBody,
  readJsonBody,
} from "@/lib/validation";
import { connection } from "next/server";
import { writeLimitExceeded } from "@/lib/rate-limit";

// Batas hari dalam zona WIB: tanggal YYYY-MM-DD diartikan tengah malam
// WIB, supaya "hari ini" di server UTC sama dengan "hari ini" pengguna.
function rentangHari(tanggal: string): { mulai: Date; selesai: Date } {
  const mulai = new Date(`${tanggal}T00:00:00+07:00`);
  const selesai = new Date(mulai.getTime() + 24 * 60 * 60 * 1000);
  return { mulai, selesai };
}

export async function GET(request: Request) {
  await connection();
  try {
    const params = new URL(request.url).searchParams;
    const tanggal = params.get("date") ?? undefined;
    const semua = params.get("all") === "1";
    if (tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      return errorResponse("Parameter tanggal harus memakai format YYYY-MM-DD.", 400);
    }
    const where = semua
      ? undefined
      : tanggal
        ? (() => {
            const { mulai, selesai } = rentangHari(tanggal);
            return { dueDate: { gte: mulai, lt: selesai } };
          })()
        : (() => {
            // Tanpa parameter: kembalikan tugas hari ini (WIB).
            const hariIni = new Date()
              .toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
            const { mulai, selesai } = rentangHari(hariIni);
            return { dueDate: { gte: mulai, lt: selesai } };
          })();
    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ done: "asc" }, { dueDate: "asc" }, { createdAt: "asc" }],
    });
    return Response.json({ tasks });
  } catch {
    return errorResponse("Gagal memuat tugas.", 500);
  }
}

export async function POST(request: Request) {
  if (writeLimitExceeded(request, "tasks")) {
    return errorResponse("Terlalu banyak permintaan. Coba lagi sebentar.", 429);
  }
  let data: { title: string; dueDate: Date };
  try {
    const body = await readJsonBody(request);
    data = parseTaskBody(body);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Masukan tidak valid.",
      400,
    );
  }
  try {
    const task = await prisma.task.create({
      data: { title: data.title, dueDate: data.dueDate },
    });
    return Response.json({ task }, { status: 201 });
  } catch {
    return errorResponse("Gagal membuat tugas.", 500);
  }
}
