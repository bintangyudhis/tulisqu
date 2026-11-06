## Pelajaran Day 18 (scaffold + skema tulisqu)

- Repo sudah dibuat sebelumnya (hanya README + LICENSE); Day 18 mengisi
  scaffold Next.js 16 + Tailwind v4 + Prisma v6, vercel.json hemat deploy
  (copy dari dompetku-web/topi-surya-iot, regions sin1), dan skema awal —
  tanpa perlu buat repo baru lewat browser. Issues rencana sudah ada
  (#1 scaffold + skema, #2 CRUD catatan + kategori, #3 upload file,
  #4 simpan link + preview judul, #5 daily task, #6 pencarian + dasbor,
  #7 polish + README final).
- Issue #1 ditutup lewat badan pesan commit TERAKHIR fitur scaffold
  (`Closes #1`), bukan commit pertama — pelajaran Day 13/15.
- Skema: `TulisCategory` (name; awalan Tulis karena `Category` sudah
  dipakai dompetku-web di DB yang sama), `Note` (title, content, categoryId opsional,
  indeks categoryId+updatedAt), `Task` (title, dueDate, done, indeks
  dueDate+done). Migrasi `0001_tulis_init` ditulis tangan (nama unik,
  tidak bentrok dengan repo lain di DB `dompetku` yang sama);
  `prisma migrate deploy` hanya jalan di Vercel karena env DB tidak ada
  di VM — build lokal diverifikasi lewat `prisma generate && next build`.
- Tema "Meja Kuliah": kertas terang hangat (#fbfaf4), aksen hijau daun
  solid (#1f5c3d), tanpa gradasi, tanpa emoji, tanpa angka karangan.
  Struktur beranda sengaja tidak seragam: hero + daftar isi definisi,
  tiga kolom catatan, tabel jenis berkas, daftar tugas bernomor.
- Sapuan keamanan ringan Day 18: tidak ada endpoint/auth/upload baru —
  hanya halaman statis + skema; tidak ada secret yang di-commit
  (.env.example hanya berisi placeholder).
- TERBUKA untuk Day 19: bucket Storage `tulisqu-files` belum dibuat
  (perlu token Supabase; tidak diminta ke user di run ini) dan relasi
  berkas/tautan ke catatan belum ada di skema — ditambahkan sebagai
  migrasi berikutnya saat fitur unggah berkas dibangun.

## Pelajaran Day 19 (CRUD catatan + kategori, unggah berkas, simpan tautan)
- 29 commit, semua ter-push. Issues #2 (CRUD catatan + kategori), #3
  (upload file), #4 (simpan link + preview judul) TERTUTUP via `Closes #n`
  di commit terakhir tiap fitur; #5–#7 tetap terbuka untuk Day 20–21.
- Skema: model `Attachment` (fileName, mimeType, sizeBytes, storagePath)
  dan `Link` (url, title) + migrasi `0002_tulis_files_links`; keduanya
  ON DELETE CASCADE ke Note. `migration_lock.toml` (provider postgresql)
  ditambahkan karena `prisma migrate diff` menolak tanpa berkas itu.
- API: categories, notes, attachments (POST form-data, GET tautan unduh
  bertanda tangan 1 jam), links (POST mengambil judul halaman sekali
  simpan). Validasi sisi server di `lib/validation.ts`, pembatas laju
  tulis 30/menit per IP di `lib/rate-limit.ts`, badan JSON dibatasi 1 MB.
  Pagar SSRF di `lib/link-preview.ts`: hanya http/https, tolak host lokal
  dan IP privat (termasuk hasil DNS dan redirect manual maks 3 hop),
  batas isi 256 KB, timeout 8 detik.
- Unggah memakai `@supabase/supabase-js` + `SUPABASE_SERVICE_ROLE_KEY`
  (sisi server saja, tanpa awalan NEXT_PUBLIC). Bucket `tulisqu-files`
  BELUM dibuat — route unggah menjawab 503 sampai env + bucket dipasang.
- Next 16 + `cacheComponents: true` MENOLAK `export const dynamic =
  "force-dynamic"` di route handler. Penggantinya: `await connection()`
  dari `next/server` di awal tiap handler GET; POST/PATCH/DELETE sudah
  dinamis karena memakai request. Impor `connection` yang tidak terpakai
  di file tanpa GET memicu warning lint — hapus.
- Lint React 19 (`react-hooks/set-state-in-effect`) menolak setState
  sinkron di dalam effect, termasuk lewat fungsi pembantu yang dipanggil
  effect. Perbaikan: data awal `/meja` dimuat di server component
  (`await connection()` + Prisma, lalu props) sehingga klien tidak
  mengambil data lewat effect; editor direset dengan `key` saat catatan
  yang diedit berganti, bukan dengan effect sinkronisasi.
- Sapuan keamanan ringan Day 19: tidak ada secret di history
  (hanya placeholder `.env.example`); `.env` diabaikan; kunci service
  role tidak memakai NEXT_PUBLIC_*. `npm audit` TIDAK bisa jalan di VM
  (registry menolak: policy_denied) — dicatat, bukan dianggap lolos.
  Belum ada autentikasi di tulisqu (alat pribadi satu pengguna, sama
  seperti repo streak lain sebelum auth ditambahkan) — dicatat sebagai
  batasan yang diketahui, bukan temuan baru.
- DEPLOY Day 19 SENGAJA TIDAK DIPICU: cek live Vercel 6 Nov 08:40
  menunjukkan deploy nyata terakhir ("Day 18: deploy" 5 Nov 08:22 dan
  commit perbaikan 5 Nov 10:48) masih ERROR dan tidak ada deployment
  READY — catatan migrasi 0001 yang gagal (P3009) masih menunggu SQL
  `resolve --rolled-back` dari Yudhis. Commit deploy kosong hanya akan
  mengulang ERROR yang sama dan membakar satu build. Semua 29 commit
  Day 19 berstatus CANCELED di Vercel (ignoreCommand `[skip-vercel]`
  bekerja sesuai rancangan).
