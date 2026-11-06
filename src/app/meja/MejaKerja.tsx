"use client";

import { useCallback, useState } from "react";
import DaftarKategori from "./DaftarKategori";
import DaftarCatatan from "./DaftarCatatan";
import EditorCatatan from "./EditorCatatan";
import LampiranCatatan from "./LampiranCatatan";
import TautanCatatan from "./TautanCatatan";
import type {
  CategoryItem,
  NoteDetail,
  NoteListItem,
} from "./tipe";

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MejaKerja({
  initialCategories,
  initialNotes,
}: {
  initialCategories: CategoryItem[];
  initialNotes: NoteListItem[];
}) {
  const [categories, setCategories] = useState<CategoryItem[]>(
    initialCategories,
  );
  const [notes, setNotes] = useState<NoteListItem[]>(initialNotes);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedNote, setSelectedNote] = useState<NoteDetail | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Kategori tidak bisa dimuat.");
    const body = (await response.json()) as { categories: CategoryItem[] };
    setCategories(body.categories);
  }, []);

  const loadNotes = useCallback(async (categoryId: string | null) => {
    const query = categoryId
      ? `/api/notes?categoryId=${encodeURIComponent(categoryId)}`
      : "/api/notes";
    const response = await fetch(query);
    if (!response.ok) throw new Error("Catatan tidak bisa dimuat.");
    const body = (await response.json()) as { notes: NoteListItem[] };
    setNotes(body.notes);
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const response = await fetch(`/api/notes/${id}`);
    if (!response.ok) throw new Error("Catatan tidak bisa dibuka.");
    const body = (await response.json()) as { note: NoteDetail };
    setSelectedNote(body.note);
  }, []);

  const refreshAll = useCallback(
    async (categoryId: string | null = selectedCategoryId) => {
      setGalat(null);
      setMemuat(true);
      try {
        await loadCategories();
        await loadNotes(categoryId);
      } catch (error) {
        setGalat(
          error instanceof Error ? error.message : "Data tidak bisa dimuat.",
        );
      } finally {
        setMemuat(false);
      }
    },
    [loadCategories, loadNotes, selectedCategoryId],
  );

  function pilihKategori(id: string | null) {
    setSelectedCategoryId(id);
    setSelectedNote(null);
    setEditorOpen(false);
    void refreshAll(id);
  }

  async function pilihCatatan(id: string) {
    setEditorOpen(false);
    setGalat(null);
    try {
      await loadDetail(id);
    } catch (error) {
      setGalat(
        error instanceof Error ? error.message : "Catatan tidak bisa dibuka.",
      );
    }
  }

  function catatanBaru() {
    setSelectedNote(null);
    setEditorOpen(true);
  }

  async function setelahSimpan(saved: { id: string }) {
    await loadNotes(selectedCategoryId);
    await loadCategories();
    await loadDetail(saved.id);
    setEditorOpen(false);
  }

  async function setelahHapus() {
    setSelectedNote(null);
    setEditorOpen(false);
    await loadNotes(selectedCategoryId);
    await loadCategories();
  }

  async function refreshDetail() {
    if (selectedNote) {
      await loadDetail(selectedNote.id);
      await loadNotes(selectedCategoryId);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs tracking-wide text-accent uppercase">
        Meja kerja
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
        Catatan, berkas, dan tautan dalam satu meja.
      </h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">
        Pilih kategori di sebelah kiri, buka catatannya, lalu lampirkan berkas
        dan tautan yang membahas hal yang sama.
      </p>
      {galat && (
        <p role="alert" className="mt-6 text-sm text-accent">
          {galat}
        </p>
      )}
      {memuat ? (
        <p className="mt-10 text-muted">Memuat meja kerja…</p>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-10">
            <DaftarKategori
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={pilihKategori}
              onChanged={() => void refreshAll()}
            />
            <DaftarCatatan
              notes={notes}
              selectedId={selectedNote?.id ?? null}
              onSelect={(id) => void pilihCatatan(id)}
              onNew={catatanBaru}
            />
          </div>
          <div>
            {editorOpen || (selectedNote === null && notes.length === 0) ? (
              <EditorCatatan
                key={editorOpen ? (selectedNote?.id ?? "baru") : "baru"}
                note={editorOpen ? selectedNote : null}
                categories={categories}
                defaultCategoryId={selectedCategoryId}
                onSaved={(saved) => void setelahSimpan(saved)}
                onDeleted={() => void setelahHapus()}
                onCancel={() => setEditorOpen(false)}
              />
            ) : selectedNote ? (
              <article>
                <div className="flex flex-wrap items-baseline justify-between gap-4">
                  <p className="font-mono text-xs tracking-wide text-accent uppercase">
                    {selectedNote.category?.name ?? "Tanpa kategori"} ·{" "}
                    {formatTanggal(selectedNote.updatedAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setEditorOpen(true)}
                    className="bg-accent px-4 py-2 text-sm font-bold text-paper"
                  >
                    Ubah catatan
                  </button>
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
                  {selectedNote.title}
                </h2>
                <p className="mt-5 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.content}
                </p>
                <div className="mt-10 space-y-10 border-t border-line pt-8">
                  <LampiranCatatan
                    noteId={selectedNote.id}
                    attachments={selectedNote.attachments}
                    onChanged={() => void refreshDetail()}
                  />
                  <TautanCatatan
                    noteId={selectedNote.id}
                    links={selectedNote.links}
                    onChanged={() => void refreshDetail()}
                  />
                </div>
              </article>
            ) : (
              <p className="leading-relaxed text-muted">
                Pilih satu catatan di sebelah kiri untuk membacanya, atau buat
                catatan baru.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
