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
  const [categories, notes] = await Promise.all([
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
    />
  );
}
