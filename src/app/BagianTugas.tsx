import Link from "next/link";

export default function BagianTugas() {
  return (
    <section id="tugas" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="font-mono text-xs tracking-wide text-accent uppercase">03 — Tugas harian</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Hari ini dikerjakan apa, dijawab dengan satu daftar.
        </h2>
        <ol className="mt-8 max-w-2xl space-y-5">
          <li className="flex gap-4">
            <span className="font-display text-lg font-extrabold text-accent">1.</span>
            <p className="leading-relaxed text-muted">
              <strong className="font-bold text-ink">Tambah tugas dengan tanggal.</strong> Satu
              tugas punya judul dan tanggal pengerjaan, supaya daftar hari ini
              tidak tercampur tugas minggu depan.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="font-display text-lg font-extrabold text-accent">2.</span>
            <p className="leading-relaxed text-muted">
              <strong className="font-bold text-ink">Centang bila selesai.</strong> Tugas yang
              sudah dikerjakan ditandai, bukan dihapus, sehingga jejak hari itu
              tetap terlihat.
            </p>
          </li>
          <li className="flex gap-4">
            <span className="font-display text-lg font-extrabold text-accent">3.</span>
            <p className="leading-relaxed text-muted">
              <strong className="font-bold text-ink">Hapus yang batal.</strong> Tugas yang tidak
              jadi dikerjakan bisa dihapus dari daftar tanpa sisa.
            </p>
          </li>
        </ol>
        <Link
          href="/meja"
          className="mt-8 inline-block bg-accent px-4 py-2 text-sm font-bold text-paper"
        >
          Buka meja kerja
        </Link>
      </div>
    </section>
  );
}
