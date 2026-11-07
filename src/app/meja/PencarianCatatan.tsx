"use client";

import { useRef, useState } from "react";
import type { NoteListItem } from "./tipe";

type Props = {
  onSelect: (id: string) => void;
  categoryId?: string | null;
};

export default function PencarianCatatan({ onSelect, categoryId }: Props) {
  const [kataKunci, setKataKunci] = useState("");
  const [hasil, setHasil] = useState<NoteListItem[]>([]);
  const [mencari, setMencari] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [sudahMencari, setSudahMencari] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function cari(query: string) {
    const kata = query.trim();
    if (kata.length < 2) {
      setHasil([]);
      setSudahMencari(false);
      setGalat(null);
      return;
    }
    setMencari(true);
    setGalat(null);
    try {
      const params = new URLSearchParams({ q: kata });
      if (categoryId) params.set("categoryId", categoryId);
      const response = await fetch(`/api/notes/search?${params.toString()}`);
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Pencarian tidak bisa dilakukan.");
      }
      const body = (await response.json()) as { notes: NoteListItem[] };
      setHasil(body.notes);
      setSudahMencari(true);
    } catch (error) {
      setGalat(
        error instanceof Error ? error.message : "Pencarian tidak bisa dilakukan.",
      );
    } finally {
      setMencari(false);
    }
  }

  function ubahKataKunci(nilai: string) {
    setKataKunci(nilai);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void cari(nilai), 400);
  }

  return (
    <div>
      <label className="block">
        <span className="font-mono text-xs tracking-wide text-accent uppercase">
          Cari catatan
        </span>
        <input
          type="search"
          value={kataKunci}
          onChange={(event) => ubahKataKunci(event.target.value)}
          placeholder="Ketik minimal dua huruf, mis. basis data"
          className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm"
        />
      </label>
      {mencari && <p className="mt-3 text-sm text-muted">Mencari…</p>}
      {galat && (
        <p role="alert" className="mt-3 text-sm text-accent">
          {galat}
        </p>
      )}
      {sudahMencari && !mencari && !galat && (
        <p className="mt-3 text-sm text-muted">
          {hasil.length === 0
            ? `Tidak ada catatan yang cocok dengan “${kataKunci.trim()}”.`
            : `${hasil.length} catatan cocok dengan “${kataKunci.trim()}”.`}
        </p>
      )}
    </div>
  );
}
