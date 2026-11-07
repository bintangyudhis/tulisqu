import type { Metadata } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import MejaKerja from "./MejaKerja";

export const metadata: Metadata = {
  title: "Meja Kerja — Tulisqu",
  description:
    "Tulis, kelompokkan, dan lengkapi catatan kuliah dengan berkas dan tautan referensi.",
};

// Data awal dimuat di server supaya klien tidak perlu mengambilnya
// lewat effect saat halaman dibuka. connection() menandai halaman ini
// dinamis; tanpa itu build akan mencoba memuat data tanpa DATABASE_URL.
export default async function MejaPage() {
  await connection();
  const hariIni = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Jakarta",
  });
  const mulaiHari = new Date(`${hariIni}T00:00:00+07:00`);
  const akhirHari = new Date(mulaiHari.getTime() + 24 * 60 * 60 * 1000);
  const [categories, notes, tasks, summary, catatanTerbaru] = await Promise.all([
    prisma.tulisCategory.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { notes: true } } },
    }),
    prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { attachments: true, links: true } },
      },
    }),
    prisma.task.findMany({
      where: { dueDate: { gte: mulaiHari, lt: akhirHari } },
      orderBy: [{ done: "asc" }, { createdAt: "asc" }],
    }),
    Promise.all([
      prisma.note.count(),
      prisma.tulisCategory.count(),
      prisma.task.count({
        where: { dueDate: { gte: mulaiHari, lt: akhirHari } },
      }),
      prisma.task.count({
        where: { dueDate: { gte: mulaiHari, lt: akhirHari }, done: true },
      }),
      prisma.task.count({
        where: { dueDate: { lt: mulaiHari }, done: false },
      }),
    ]).then(
      ([
        jumlahCatatan,
        jumlahKategori,
        tugasHariIni,
        tugasSelesaiHariIni,
        tugasTerlambat,
      ]) => ({
        jumlahCatatan,
        jumlahKategori,
        tugasHariIni,
        tugasSelesaiHariIni,
        tugasTerlambat,
        tanggal: hariIni,
      }),
    ),
    prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { attachments: true, links: true } },
      },
    }),
  ]);
  return (
    <MejaKerja
      initialCategories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        _count: { notes: category._count.notes },
      }))}
      initialNotes={notes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        categoryId: note.categoryId,
        category: note.category,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        _count: {
          attachments: note._count.attachments,
          links: note._count.links,
        },
      }))}
      initialTasks={tasks.map((task) => ({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate.toISOString(),
        done: task.done,
        createdAt: task.createdAt.toISOString(),
      }))}
      initialSummary={summary}
      initialRecentNotes={catatanTerbaru.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        categoryId: note.categoryId,
        category: note.category,
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
        _count: {
          attachments: note._count.attachments,
          links: note._count.links,
        },
      }))}
    />
  );
}
