"use client";

import type { DashboardSummary, NoteListItem, TaskItem } from "./tipe";

type Props = {
  summary: DashboardSummary;
  catatanTerbaru: NoteListItem[];
  tugasHariIni: TaskItem[];
  onSelectNote: (id: string) => void;
};

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DasborRingkas({
  summary,
  catatanTerbaru,
  tugasHariIni,
  onSelectNote,
}: Props) {
  const angka = [
    { label: "Catatan", nilai: summary.jumlahCatatan },
    { label: "Kategori", nilai: summary.jumlahKategori },
    {
      label: "Tugas hari ini",
      nilai: `${summary.tugasSelesaiHariIni}/${summary.tugasHariIni}`,
    },
    { label: "Tugas terlambat", nilai: summary.tugasTerlambat },
  ];
  return (
    <section aria-label="Ringkasan meja kerja" className="border-b border-line pb-10">
      <p className="font-mono text-xs tracking-wide text-accent uppercase">
        Ringkasan · {formatTanggal(`${summary.tanggal}T00:00:00+07:00`)}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
        {angka.map((item) => (
          <div key={item.label} className="bg-paper px-5 py-6">
            <p className="font-display text-3xl font-bold tracking-tight">
              {item.nilai}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
