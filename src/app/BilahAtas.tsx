import Link from "next/link";

export default function BilahAtas() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-8 gap-y-2 px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight">
          Tulisqu
        </Link>
        <nav aria-label="Bagian halaman" className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
          <Link href="/#catatan" className="hover:text-accent">
            Catatan
          </Link>
          <Link href="/#berkas" className="hover:text-accent">
            Berkas dan tautan
          </Link>
          <Link href="/#tugas" className="hover:text-accent">
            Tugas harian
          </Link>
          <Link href="/meja" className="font-bold text-accent">
            Meja kerja
          </Link>
        </nav>
        <p className="ml-auto font-mono text-xs text-muted">catatan · berkas · tugas</p>
      </div>
    </header>
  );
}
