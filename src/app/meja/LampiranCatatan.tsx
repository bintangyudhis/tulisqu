"use client";

import { useRef, useState } from "react";
import type { AttachmentItem } from "./tipe";

type Props = {
  noteId: string;
  attachments: AttachmentItem[];
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

function formatUkuran(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LampiranCatatan({
  noteId,
  attachments,
  onChanged,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [mengunggah, setMengunggah] = useState(false);
  const [sibukId, setSibukId] = useState<string | null>(null);

  async function unggah(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMengunggah(true);
    setGalat(null);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`/api/notes/${noteId}/attachments`, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      onChanged();
    }
    setMengunggah(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function unduh(attachment: AttachmentItem) {
    setSibukId(attachment.id);
    const response = await fetch(
      `/api/notes/${noteId}/attachments/${attachment.id}`,
    );
    if (!response.ok) {
      setGalat(await readError(response));
      setSibukId(null);
      return;
    }
    const body = (await response.json()) as { url: string };
    setSibukId(null);
    window.open(body.url, "_blank", "noopener,noreferrer");
  }

  async function hapus(attachment: AttachmentItem) {
    if (!window.confirm(`Hapus lampiran "${attachment.fileName}"?`)) return;
    setSibukId(attachment.id);
    setGalat(null);
    const response = await fetch(
      `/api/notes/${noteId}/attachments/${attachment.id}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setGalat(await readError(response));
    } else {
      onChanged();
    }
    setSibukId(null);
  }

  return (
    <section aria-label="Lampiran berkas">
      <h3 className="font-mono text-xs tracking-wide text-accent uppercase">
        Lampiran berkas
      </h3>
      {attachments.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Belum ada berkas. Unggah PDF, dokumen Word, atau presentasi
          pendukung catatan ini.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {attachment.fileName}
              </span>
              <span className="font-mono text-xs text-muted">
                {formatUkuran(attachment.sizeBytes)} ·{" "}
                {formatTanggal(attachment.createdAt)}
              </span>
              <button
                type="button"
                onClick={() => void unduh(attachment)}
                disabled={sibukId === attachment.id}
                className="text-sm font-bold text-accent disabled:opacity-50"
              >
                Unduh
              </button>
              <button
                type="button"
                onClick={() => void hapus(attachment)}
                disabled={sibukId === attachment.id}
                className="text-sm text-muted hover:text-accent disabled:opacity-50"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx"
          onChange={(event) => void unggah(event)}
          className="hidden"
          id="unggah-berkas"
        />
        <label
          htmlFor="unggah-berkas"
          className={`inline-block cursor-pointer border border-accent px-4 py-2 text-sm font-bold text-accent ${
            mengunggah ? "opacity-50" : ""
          }`}
        >
          {mengunggah ? "Mengunggah…" : "Unggah berkas"}
        </label>
        <p className="mt-2 font-mono text-xs text-muted">
          pdf, doc, docx, ppt, pptx — maks 10 MB per berkas.
        </p>
      </div>
      {galat && (
        <p role="alert" className="mt-3 text-sm font-bold text-danger">
          {galat}
        </p>
      )}
    </section>
  );
}
