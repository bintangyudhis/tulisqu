export default function BagianCatatan() {
  return (
    <section id="catatan" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <p className="font-mono text-xs tracking-wide text-accent uppercase">01 — Catatan</p>
        <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Catatan ditulis per mata kuliah, bukan menumpuk di satu daftar.
        </h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold">Kategori per matkul</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Setiap catatan masuk ke satu kategori, misalnya satu mata kuliah.
              Mencari materi berarti membuka kategorinya, bukan menggulir
              seluruh arsip.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Teks bebas, bisa diubah</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Isi catatan adalah teks bebas yang bisa diedit kapan saja.
              Perubahan terakhir tercatat, jadi versi terbaru selalu yang
              tampil pertama.
            </p>
          </div>
          <div>
            <h3 className="font-bold">Satu catatan, banyak lampiran</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Berkas dan tautan menempel pada catatan yang membahasnya, bukan
              tersimpan di folder terpisah yang mudah lupa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
