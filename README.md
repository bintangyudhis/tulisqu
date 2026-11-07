# Tulisqu

Aplikasi produktivitas untuk mencatat dan mengorganisasi materi kuliah.
Catatan dikelompokkan per mata kuliah. Pengguna juga bisa mengunggah berkas,
menyimpan tautan, dan menyusun tugas harian.

## Fitur

- Catatan dengan kategori per mata kuliah — buat, baca, ubah, hapus
- Unggah berkas pendukung seperti PDF, dokumen, dan presentasi ke catatan
- Penyimpanan tautan referensi di dalam catatan, judul halaman diambil otomatis
- Daftar tugas harian — tambah, centang selesai, hapus, saring per tanggal
- Pencarian catatan berdasarkan judul dan isi, bisa disaring per kategori
- Dasbor ringkas — jumlah catatan dan kategori, tugas hari ini dan yang
  terlambat, lima catatan terakhir diubah

## Meja kerja

Halaman `/meja` adalah tempat kerja utama: bagian atas berisi ringkasan
(jumlah catatan dan kategori, tugas hari ini dan yang terlambat, catatan
terbaru), kolom kiri berisi pencarian, daftar kategori, panel tugas harian,
dan daftar catatan, kolom kanan berisi isi catatan beserta lampiran dan
tautannya. Semua perubahan tersimpan lewat API berikut:

| Route | Fungsi |
| --- | --- |
| `GET/POST /api/categories` | Daftar dan buat kategori |
| `PATCH/DELETE /api/categories/[id]` | Ubah dan hapus kategori |
| `GET/POST /api/notes` | Daftar (saring `?categoryId=`) dan buat catatan |
| `GET/PATCH/DELETE /api/notes/[id]` | Baca, ubah, dan hapus satu catatan |
| `GET/POST /api/notes/[id]/attachments` | Daftar dan unggah lampiran |
| `GET/DELETE /api/notes/[id]/attachments/[attachmentId]` | Tautan unduh dan hapus lampiran |
| `GET/POST /api/notes/[id]/links` | Daftar dan simpan tautan |
| `DELETE /api/notes/[id]/links/[linkId]` | Hapus tautan |
| `GET /api/notes/search` | Cari catatan (`?q=`, saring `?categoryId=`) |
| `GET/POST /api/tasks` | Daftar tugas (`?date=`, `?all=1`) dan buat tugas |
| `PATCH/DELETE /api/tasks/[id]` | Ubah, centang selesai, dan hapus tugas |
| `GET /api/dashboard` | Ringkasan: jumlah, tugas hari ini, catatan terbaru |

Berkas yang diterima: pdf, doc, docx, ppt, pptx, maks 10 MB per berkas.
Berkas disimpan di bucket Storage `tulisqu-files` (privat; unduhan memakai
tautan bertanda tangan 1 jam) dan membutuhkan `SUPABASE_URL` serta
`SUPABASE_SERVICE_ROLE_KEY` di environment server.

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
selesai). Migrasi `0002_tulis_files_links` menambah `Attachment` (nama berkas,
tipe MIME, ukuran, jalur Storage) dan `Link` (alamat dan judul halaman),
keduanya menempel pada catatan dan ikut terhapus saat catatannya dihapus.
Nama migrasi dibuat unik agar tidak bentrok dengan repo lain yang memakai
database yang sama.

## Lisensi

MIT. Lihat berkas [LICENSE](LICENSE).
