import Link from "next/link";

export default function Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr] md:py-20">
        <div>
          <p className="font-mono text-xs tracking-wide text-accent uppercase">
            Untuk mahasiswa yang materinya menumpuk
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] font-extrabold tracking-tight sm:text-6xl">
            Satu meja untuk semua materi kuliah.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Tulisqu menyimpan catatan per mata kuliah, menempelkan berkas dan
            tautan referensi di tempat yang sama dengan catatan, dan menata
            tugas harian supaya tidak ada yang tercecer di antara jadwal.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/meja"
              className="bg-accent px-5 py-2.5 text-sm font-bold text-paper"
            >
              Buka meja kerja
            </Link>
            <Link
              href="/#catatan"
              className="border border-line px-5 py-2.5 text-sm font-bold"
            >
              Lihat cara kerja
            </Link>
          </div>
        </div>
        <aside className="border-t-2 border-accent pt-4">
          <h2 className="text-sm font-bold tracking-wide uppercase">Daftar isi meja ini</h2>
          <dl className="mt-4 space-y-4 text-sm leading-relaxed">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-mono text-xs text-muted">Catatan</dt>
              <dd>Teks bebas yang dikelompokkan per mata kuliah.</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-mono text-xs text-muted">Berkas</dt>
              <dd>PDF, dokumen, dan presentasi yang menempel pada catatan.</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-mono text-xs text-muted">Tautan</dt>
              <dd>Referensi web yang tersimpan bersama judulnya.</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0 font-mono text-xs text-muted">Tugas</dt>
              <dd>Daftar harian yang bisa ditandai selesai.</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
