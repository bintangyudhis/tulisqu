"use client";

import { useState } from "react";
import type { TaskItem } from "./tipe";

type Props = {
  tasks: TaskItem[];
  tanggalDipilih?: string | null;
  onPilihTanggal?: (tanggal: string | null) => void;
  onChanged: () => void;
};

function tanggalHariIni(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DaftarTugas({
  tasks,
  tanggalDipilih,
  onPilihTanggal,
  onChanged,
}: Props) {
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState(tanggalHariIni());
  const [menyimpan, setMenyimpan] = useState(false);
  const [mengubahId, setMengubahId] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const tanggalAktif = tanggalDipilih ?? tanggalHariIni();
  const modeSemua = tanggalDipilih === null;

  function besok(): string {
    const besok = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return besok.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  }

  async function hapusTugas(task: TaskItem) {
    setGalat(null);
    setMengubahId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Tugas tidak bisa dihapus.");
      }
      onChanged();
    } catch (error) {
      setGalat(
        error instanceof Error ? error.message : "Tugas tidak bisa dihapus.",
      );
    } finally {
      setMengubahId(null);
    }
  }

  async function ubahStatus(task: TaskItem) {
    setGalat(null);
    setMengubahId(task.id);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ done: !task.done }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Status tugas tidak bisa diubah.");
      }
      onChanged();
    } catch (error) {
      setGalat(
        error instanceof Error ? error.message : "Status tugas tidak bisa diubah.",
      );
    } finally {
      setMengubahId(null);
    }
  }

  async function tambahTugas(event: React.FormEvent) {
    event.preventDefault();
    if (judul.trim().length === 0 || tanggal.length === 0) return;
    setGalat(null);
    setMenyimpan(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: judul.trim(), dueDate: tanggal }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Tugas tidak bisa ditambahkan.");
      }
      setJudul("");
      setTanggal(tanggalHariIni());
      onChanged();
    } catch (error) {
      setGalat(
        error instanceof Error ? error.message : "Tugas tidak bisa ditambahkan.",
      );
    } finally {
      setMenyimpan(false);
    }
  }

  return (
    <div>
      <h2 className="font-mono text-xs tracking-wide text-accent uppercase">
        Tugas harian
      </h2>
      <form onSubmit={(event) => void tambahTugas(event)} className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onPilihTanggal?.(tanggalHariIni())}
            className={`border px-3 py-1.5 text-sm font-bold ${
              !modeSemua && tanggalAktif === tanggalHariIni()
                ? "border-accent bg-accent text-paper"
                : "border-line"
            }`}
          >
            Hari ini
          </button>
          <button
            type="button"
            onClick={() => onPilihTanggal?.(besok())}
            className={`border px-3 py-1.5 text-sm font-bold ${
              !modeSemua && tanggalAktif === besok()
                ? "border-accent bg-accent text-paper"
                : "border-line"
            }`}
          >
            Besok
          </button>
          <button
            type="button"
            onClick={() => onPilihTanggal?.(null)}
            className={`border px-3 py-1.5 text-sm font-bold ${
              modeSemua ? "border-accent bg-accent text-paper" : "border-line"
            }`}
          >
            Semua
          </button>
          <label className="flex items-center gap-2 text-sm">
            <span className="font-bold">Tanggal</span>
            <input
              type="date"
              value={modeSemua ? "" : tanggalAktif}
              onChange={(event) =>
                onPilihTanggal?.(event.target.value || null)
              }
              aria-label="Pilih tanggal tugas"
              className="border border-line bg-paper px-2 py-1.5 text-sm"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-bold">Tugas baru</span>
          <input
            type="text"
            value={judul}
            onChange={(event) => setJudul(event.target.value)}
            maxLength={200}
            placeholder="Contoh: kerjakan latihan basis data"
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-sm font-bold">Tanggal</span>
          <input
            type="date"
            value={tanggal}
            onChange={(event) => setTanggal(event.target.value)}
            className="mt-1 w-full border border-line bg-paper px-3 py-2 text-sm"
          />
        </label>
        {galat && (
          <p role="alert" className="text-sm font-bold text-danger">
            {galat}
          </p>
        )}
        <button
          type="submit"
          disabled={menyimpan || judul.trim().length === 0}
          className="bg-accent px-4 py-2 text-sm font-bold text-paper disabled:opacity-50"
        >
          {menyimpan ? "Menyimpan…" : "Tambah tugas"}
        </button>
      </form>
      {tasks.length === 0 ? (
        <p className="mt-6 leading-relaxed text-muted">
          Belum ada tugas pada tanggal yang dipilih.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start gap-3 py-3">
              <input
                type="checkbox"
                checked={task.done}
                disabled={mengubahId === task.id}
                onChange={() => void ubahStatus(task)}
                aria-label={`Tandai selesai: ${task.title}`}
                className="mt-1 h-5 w-5 accent-[#1f5c3d]"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block font-display text-lg leading-snug font-bold ${
                    task.done ? "text-muted line-through" : ""
                  }`}
                >
                  {task.title}
                </span>
                <span className="mt-1 block font-mono text-xs text-muted">
                  {formatTanggal(task.dueDate)}
                  {task.done ? " · selesai" : ""}
                </span>
              </span>
              <button
                type="button"
                disabled={mengubahId === task.id}
                onClick={() => void hapusTugas(task)}
                aria-label={`Hapus tugas: ${task.title}`}
                className="px-2 py-1 text-sm font-bold text-danger disabled:opacity-50"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
