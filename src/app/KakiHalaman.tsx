import Link from "next/link";

export default function KakiHalaman() {
  return (
    <footer className="bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-4 px-4 py-8 sm:px-6">
        <p className="font-display text-lg font-bold">Tulisqu — meja kuliah yang rapi.</p>
        <p className="text-sm text-muted">
          Catatan, berkas, tautan, dan tugas harian dalam satu tempat.
        </p>
        <Link href="/meja" className="text-sm font-bold text-accent">
          Buka meja kerja
        </Link>
      </div>
    </footer>
  );
}
