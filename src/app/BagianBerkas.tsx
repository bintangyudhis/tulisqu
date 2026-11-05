export default function BagianBerkas() {
  return (
    <section id="berkas" className="border-b border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="font-mono text-xs tracking-wide text-accent uppercase">02 — Berkas dan tautan</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Materi pendukung tinggal di tempat yang sama.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Slide dosen, makalah rujukan, dan tautan artikel tidak perlu dicari
            di unduhan atau riwayat peramban. Semuanya tercatat bersama catatan
            yang memakainya.
          </p>
        </div>
        <table className="h-fit w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-ink text-left">
              <th className="py-2 pr-4 font-bold">Jenis</th>
              <th className="py-2 font-bold">Yang disimpan</th>
            </tr>
          </thead>
          <tbody className="text-muted">
            <tr className="border-b border-line">
              <td className="py-3 pr-4 font-medium text-ink">Dokumen</td>
              <td className="py-3">PDF, DOC, dan DOCX</td>
            </tr>
            <tr className="border-b border-line">
              <td className="py-3 pr-4 font-medium text-ink">Presentasi</td>
              <td className="py-3">PPT dan PPTX</td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-medium text-ink">Tautan</td>
              <td className="py-3">Alamat web beserta judul halamannya</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
