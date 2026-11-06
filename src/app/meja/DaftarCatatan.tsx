"use client";

import type { NoteListItem } from "./tipe";

type Props = {
  notes: NoteListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
};

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DaftarCatatan({
  notes,
  selectedId,
  onSelect,
  onNew,
}: Props) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-xs tracking-wide text-accent uppercase">
          Catatan
        </h2>
        <button
          type="button"
          onClick={onNew}
          className="bg-accent px-3 py-1.5 text-sm font-bold text-paper"
        >
          Catatan baru
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="mt-6 leading-relaxed text-muted">
          Belum ada catatan di sini. Tulis yang pertama dengan tombol di atas.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {notes.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => onSelect(note.id)}
                className={`block w-full py-3 text-left ${
                  selectedId === note.id ? "text-accent" : ""
                }`}
              >
                <span
                  className={`block font-display text-lg leading-snug font-bold ${
                    selectedId === note.id ? "" : "text-ink"
                  }`}
                >
                  {note.title}
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted">
                  {note.content.length > 120
                    ? `${note.content.slice(0, 120)}…`
                    : note.content}
                </span>
                <span className="mt-2 flex flex-wrap gap-x-4 font-mono text-xs text-muted">
                  <span>{note.category?.name ?? "Tanpa kategori"}</span>
                  <span>{formatTanggal(note.updatedAt)}</span>
                  {note._count.attachments > 0 && (
                    <span>{note._count.attachments} berkas</span>
                  )}
                  {note._count.links > 0 && (
                    <span>{note._count.links} tautan</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
