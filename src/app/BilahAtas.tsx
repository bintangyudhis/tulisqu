export default function BilahAtas() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-8 gap-y-2 px-4 py-4 sm:px-6">
        <a href="/" className="font-display text-xl font-extrabold tracking-tight">
          Tulisqu
        </a>
        <nav aria-label="Bagian halaman" className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
          <a href="/#catatan" className="hover:text-accent">
            Catatan
          </a>
          <a href="/#berkas" className="hover:text-accent">
            Berkas dan tautan
          </a>
          <a href="/#tugas" className="hover:text-accent">
            Tugas harian
          </a>
          <a href="/meja" className="font-bold text-accent">
            Meja kerja
          </a>
        </nav>
        <p className="ml-auto font-mono text-xs text-muted">catatan · berkas · tugas</p>
      </div>
    </header>
  );
}
