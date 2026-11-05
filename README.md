# Tulisqu

Aplikasi produktivitas untuk mencatat dan mengorganisasi materi kuliah.
Catatan dikelompokkan per mata kuliah. Pengguna juga bisa mengunggah berkas,
menyimpan tautan, dan menyusun tugas harian.

## Fitur

- Catatan dengan kategori per mata kuliah
- Unggah berkas pendukung seperti PDF, dokumen, dan presentasi
- Penyimpanan tautan referensi di dalam catatan
- Daftar tugas harian

## Teknologi

- Next.js 16 + Tailwind v4 + React 19
- Prisma 6 + Supabase Postgres (basis data bersama project `dompetku`)
- Supabase Storage untuk berkas (bucket `tulisqu-files`)

## Menjalankan lokal

Salin `.env.example` menjadi `.env`, isi `DATABASE_URL` dan `DIRECT_URL`,
lalu:

```bash
npm install
npm run dev
```

Build produksi menjalankan migrasi Prisma terlebih dahulu
(`prisma migrate deploy && next build`), sama seperti repo web lain dalam
program ini. Deploy Vercel dihemat dengan `vercel.json`: commit yang pesannya
mengandung `[skip-vercel]` tidak memicu build; deploy harian memakai commit
kosong tanpa penanda itu.

## Skema

Migrasi `0001_tulis_init` membuat tiga tabel: `TulisCategory` (nama kategori),
`Note` (judul, isi, kategori opsional), dan `Task` (judul, tanggal, status
selesai). Nama migrasi dibuat unik agar tidak bentrok dengan repo lain yang
memakai database yang sama.

## Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).
