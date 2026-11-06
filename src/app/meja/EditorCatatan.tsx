"use client";

import { useState } from "react";
import type { CategoryItem, NoteDetail } from "./tipe";

type Props = {
  note: NoteDetail | null;
  categories: CategoryItem[];
  defaultCategoryId: string | null;
  onSaved: (note: NoteDetail) => void;
  onDeleted: () => void;
  onCancel: () => void;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Terjadi kesalahan.";
  } catch {
    return "Terjadi kesalahan.";
  }
}

export default function EditorCatatan({
  note,
  categories,
  defaultCategoryId,
  onSaved,
  onDeleted,
  onCancel,
}: Props) {
  const [judul, setJudul] = useState(note?.title ?? "");
  const [isi, setIsi] = useState(note?.content ?? "");
  const [kategoriId, setKategoriId] = useState(
    note?.categoryId ?? defaultCategoryId ?? "",
  );
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function simpan(event: React.FormEvent) {
    event.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setGalat(null);
    const payload = {
      title: judul,
      content: isi,
      categoryId: kategoriId || null,
    };
    const response = note
      ? await fetch(`/api/notes/${note.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/notes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
    if (!response.ok) {
      setGalat(await readError(response));
      setSibuk(false);
      return;
    }
    const body = (await response.json()) as { note: NoteDetail };
    setSibuk(false);
    onSaved(body.note);
  }

  async function hapus() {
    if (!note) return;
    if (!window.confirm(`Hapus catatan "${note.title}" beserta lampirannya?`)) {
      return;
    }
    setSibuk(true);
    setGalat(null);
    const response = await fetch(`/api/notes/${note.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setGalat(await readError(response));
      setSibuk(false);
      return;
    }
    setSibuk(false);
    onDeleted();
  }

  return (
    <form onSubmit={simpan} className="border border-line bg-panel p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-mono text-xs tracking-wide text-accent uppercase">
          {note ? "Ubah catatan" : "Catatan baru"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-muted hover:text-accent"
        >
          Tutup
        </button>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-bold">Judul</span>
        <input
          value={judul}
          onChange={(event) => setJudul(event.target.value)}
          maxLength={200}
          required
          className="mt-1 w-full border border-line bg-paper px-3 py-2"
          placeholder="Judul catatan"
        />
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-bold">Kategori</span>
        <select
          value={kategoriId}
          onChange={(event) => setKategoriId(event.target.value)}
          className="mt-1 w-full border border-line bg-paper px-3 py-2"
        >
          <option value="">Tanpa kategori</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-bold">Isi</span>
        <textarea
          value={isi}
          onChange={(event) => setIsi(event.target.value)}
          required
          rows={12}
          className="mt-1 w-full border border-line bg-paper px-3 py-2 leading-relaxed"
          placeholder="Tulis isi catatan di sini."
        />
      </label>
      {galat && (
        <p role="alert" className="mt-4 text-sm text-accent">
          {galat}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sibuk || !judul.trim() || !isi.trim()}
          className="bg-accent px-5 py-2 text-sm font-bold text-paper disabled:opacity-50"
        >
          {note ? "Simpan perubahan" : "Simpan catatan"}
        </button>
        {note && (
          <button
            type="button"
            onClick={() => void hapus()}
            disabled={sibuk}
            className="text-sm text-muted hover:text-accent disabled:opacity-50"
          >
            Hapus catatan
          </button>
        )}
      </div>
    </form>
  );
}
