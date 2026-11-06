"use client";

import { useState } from "react";
import type { CategoryItem } from "./tipe";

type Props = {
  categories: CategoryItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChanged: () => void;
};

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "Terjadi kesalahan.";
  } catch {
    return "Terjadi kesalahan.";
  }
}

export default function DaftarKategori({
  categories,
  selectedId,
  onSelect,
  onChanged,
}: Props) {
  const [namaBaru, setNamaBaru] = useState("");
  const [mengubahId, setMengubahId] = useState<string | null>(null);
  const [namaUbah, setNamaUbah] = useState("");
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function tambahKategori(event: React.FormEvent) {
    event.preventDefault();
    if (!namaBaru.trim() || sibuk) return;
    setSibuk(true);
    setGalat(null);
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: namaBaru }),
    });
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      setNamaBaru("");
      onChanged();
    }
    setSibuk(false);
  }

  async function simpanUbah(id: string) {
    if (!namaUbah.trim() || sibuk) return;
    setSibuk(true);
    setGalat(null);
    const response = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: namaUbah }),
    });
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      setMengubahId(null);
      onChanged();
    }
    setSibuk(false);
  }

  async function hapusKategori(category: CategoryItem) {
    const hitung = category._count.notes;
    const pesan =
      hitung > 0
        ? `Hapus kategori "${category.name}"? ${hitung} catatan di dalamnya tetap tersimpan tanpa kategori.`
        : `Hapus kategori "${category.name}"?`;
    if (!window.confirm(pesan) || sibuk) return;
    setSibuk(true);
    setGalat(null);
    const response = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      if (selectedId === category.id) onSelect(null);
      onChanged();
    }
    setSibuk(false);
  }

  return (
    <div>
      <h2 className="font-mono text-xs tracking-wide text-accent uppercase">
        Kategori
      </h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`flex w-full items-baseline justify-between gap-4 py-3 text-left ${
              selectedId === null ? "font-bold text-accent" : ""
            }`}
          >
            <span>Semua catatan</span>
            <span className="font-mono text-xs text-muted">
              {categories.reduce((sum, item) => sum + item._count.notes, 0)}
            </span>
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            {mengubahId === category.id ? (
              <form
                className="flex items-center gap-2 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void simpanUbah(category.id);
                }}
              >
                <input
                  value={namaUbah}
                  onChange={(event) => setNamaUbah(event.target.value)}
                  className="min-w-0 flex-1 border border-line bg-panel px-2 py-1 text-sm"
                  aria-label="Nama kategori baru"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={sibuk}
                  className="text-sm font-bold text-accent disabled:opacity-50"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setMengubahId(null)}
                  className="text-sm text-muted"
                >
                  Batal
                </button>
              </form>
            ) : (
              <div className="flex items-baseline gap-2 py-3">
                <button
                  type="button"
                  onClick={() => onSelect(category.id)}
                  className={`min-w-0 flex-1 text-left ${
                    selectedId === category.id
                      ? "font-bold text-accent"
                      : ""
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="truncate">{category.name}</span>
                    <span className="font-mono text-xs text-muted">
                      {category._count.notes}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMengubahId(category.id);
                    setNamaUbah(category.name);
                  }}
                  className="shrink-0 text-xs text-muted hover:text-accent"
                >
                  Ubah
                </button>
                <button
                  type="button"
                  onClick={() => void hapusKategori(category)}
                  className="shrink-0 text-xs text-muted hover:text-accent"
                >
                  Hapus
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={tambahKategori} className="mt-4 flex gap-2">
        <input
          value={namaBaru}
          onChange={(event) => setNamaBaru(event.target.value)}
          placeholder="Kategori baru, mis. Algoritma"
          maxLength={80}
          className="min-w-0 flex-1 border border-line bg-panel px-3 py-2 text-sm"
          aria-label="Nama kategori baru"
        />
        <button
          type="submit"
          disabled={sibuk || !namaBaru.trim()}
          className="shrink-0 bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
        >
          Tambah
        </button>
      </form>
      {galat && (
        <p role="alert" className="mt-3 text-sm text-accent">
          {galat}
        </p>
      )}
    </div>
  );
}
