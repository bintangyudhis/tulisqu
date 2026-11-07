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
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-mono text-xs tracking-wide text-accent uppercase">
            Tugas hari ini
          </h2>
          {tugasHariIni.length === 0 ? (
            <p className="mt-4 leading-relaxed text-muted">
              Tidak ada tugas untuk hari ini. Tambah dari panel tugas di bawah.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {tugasHariIni.map((task) => (
                <li key={task.id} className="py-3">
                  <span
                    className={`block leading-snug font-bold ${
                      task.done ? "text-muted line-through" : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-muted">
                    {task.done ? "selesai" : "belum dikerjakan"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="font-mono text-xs tracking-wide text-accent uppercase">
            Catatan terbaru
          </h2>
          {catatanTerbaru.length === 0 ? (
            <p className="mt-4 leading-relaxed text-muted">
              Belum ada catatan. Tulis yang pertama dari daftar catatan.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {catatanTerbaru.map((note) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => onSelectNote(note.id)}
                    className="block w-full py-3 text-left"
                  >
                    <span className="block leading-snug font-bold">
                      {note.title}
                    </span>
                    <span className="mt-1 block font-mono text-xs text-muted">
                      {note.category?.name ?? "Tanpa kategori"} ·{" "}
                      {formatTanggal(note.updatedAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
