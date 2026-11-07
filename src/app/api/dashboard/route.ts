import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/validation";
import { connection } from "next/server";

// Ringkasan meja kerja: jumlah catatan dan kategori, tugas hari ini
// (total dan yang sudah selesai), tugas yang lewat tanggalnya, dan
// lima catatan yang terakhir diubah. Semua batas hari memakai WIB.
export async function GET() {
  await connection();
  try {
    const hariIni = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Jakarta",
    });
    const mulaiHari = new Date(`${hariIni}T00:00:00+07:00`);
    const akhirHari = new Date(mulaiHari.getTime() + 24 * 60 * 60 * 1000);
    const [
      jumlahCatatan,
      jumlahKategori,
      tugasHariIni,
      tugasSelesaiHariIni,
      tugasTerlambat,
      catatanTerbaru,
      tugasHariIniDaftar,
    ] = await Promise.all([
      prisma.note.count(),
      prisma.tulisCategory.count(),
      prisma.task.count({
        where: { dueDate: { gte: mulaiHari, lt: akhirHari } },
      }),
      prisma.task.count({
        where: {
          dueDate: { gte: mulaiHari, lt: akhirHari },
          done: true,
        },
      }),
      prisma.task.count({
        where: { dueDate: { lt: mulaiHari }, done: false },
      }),
      prisma.note.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { attachments: true, links: true } },
        },
      }),
      prisma.task.findMany({
        where: { dueDate: { gte: mulaiHari, lt: akhirHari } },
        orderBy: [{ done: "asc" }, { createdAt: "asc" }],
      }),
    ]);
    return Response.json({
      summary: {
        jumlahCatatan,
        jumlahKategori,
        tugasHariIni,
        tugasSelesaiHariIni,
        tugasTerlambat,
        tanggal: hariIni,
      },
      catatanTerbaru,
      tugasHariIni: tugasHariIniDaftar,
    });
  } catch {
    return errorResponse("Gagal memuat ringkasan.", 500);
  }
}
