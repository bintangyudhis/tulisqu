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

## Pelajaran Day 20 (daily task, pencarian, dasbor ringkas)
- 21 commit, semua ter-push. Issues #5 (daily task) dan #6 (pencarian +
  dasbor) TERTUTUP via `Closes #5, Closes #6` di badan pesan commit
  wiring MejaKerja; #7 tetap terbuka untuk Day 21 (polish + README).
- API: `GET/POST /api/tasks` (saring `?date=YYYY-MM-DD` atau `?all=1`;
  tanpa parameter = tugas hari ini), `PATCH/DELETE /api/tasks/[id]`,
  `GET /api/notes/search` (judul/isi, min 2 karakter, maks 20 hasil,
  saring `?categoryId=`), `GET /api/dashboard` (jumlah catatan/kategori,
  tugas hari ini total+selesai, tugas terlambat, 5 catatan terbaru).
  Validasi tanggal tugas di `lib/validation.ts`: format YYYY-MM-DD,
  disimpan tengah malam WIB (+07:00) supaya filter hari tidak bergeser
  di server UTC. Pembatas laju tulis 30/menit per IP dipakai juga di
  route tugas; pencarian (GET) tidak dibatasi laju.
- UI: `DaftarTugas` (form tambah + centang + hapus + filter Hari ini/
  Besok/Semua/tanggal), `PencarianCatatan` (debounce 400 ms, hasil bisa
  diklik membuka catatan), `DasborRingkas` (4 kartu angka + tugas hari
  ini + catatan terbaru). Data awal dimuat di server component page.tsx
  (tugas hari ini + ringkasan + 5 catatan terbaru), lalu disegarkan
  lewat handler eksplisit, bukan effect.
- Jebakan tanggal: dueDate ISO tersimpan sebagai 17:00 UTC hari
  sebelumnya, jadi `startsWith(tanggal)` di klien SALAH untuk menyaring
  hari ini. Dasbor memakai daftar tugas hari ini dari API/server
  (`tugasHariIniDasbor`), bukan filter string di klien.
- Build: `prisma generate && next build` + `npm run lint` lolos; satu
  perbaikan tipe (`tanggalDipilih` menerima `null`) sesudah build
  pertama gagal type check. Tidak ada migrasi baru: tabel Task sudah
  ada di 0001_tulis_init.
- Sapuan keamanan ringan Day 20: tidak ada secret di history maupun
  file baru; service-role key hanya dibaca dari env (kode Day 19).
  Belum ada autentikasi di tulisqu — batasan yang diketahui.
- DEPLOY Day 20 SENGAJA TIDAK DIPICU: situs masih 404 pada cek 7 Nov
  ±06:47 WIB, tidak ada tanda SQL `resolve --rolled-back` sudah
  dijalankan Yudhis; pengingat SQL terakhir sudah terkirim pagi ini
  dengan janji tidak mengingatkan lagi. Semua 21 commit Day 20
  `[skip-vercel]` (CANCELED di Vercel, sesuai rancangan).

## Perbaikan pasca Day 20 (7 Nov 2026 malam, perintah Yudhis: selesaikan tanpa campur tangannya)
- Blokir P3009 DIBERSIHKAN Muse sendiri: baris migrasi gagal
  `0001_tulis_init` di tabel `_prisma_migrations` DB bersama terakses
  lewat PostgREST + service role key (project portfolio, berkas
  `.env.local` di luar repo) dan DIHAPUS setelah dibackup ke
  hidden_files goal streak. Setara `prisma migrate resolve
  --rolled-back 0001_tulis_init`. Yudhis tidak perlu menjalankan SQL
  apa pun lagi.
- Bentrok KEDUA ditemukan sebelum deploy: tabel `Link` di DB bersama
  SUDAH MILIK pendekin (migrasi 0001_pendekin_init), jadi migrasi
  0002 tulisqu akan gagal di `CREATE TABLE "Link"`. Model diganti
  nama menjadi `TulisLink` (pola awalan yang sama dengan
  `TulisCategory`): schema, SQL migrasi 0002 (tabel, pkey, indeks,
  fkey), dan pemanggilan `prisma.tulisLink` di 2 route tautan.
  Migrasi 0002 belum pernah teraplikasi, jadi aman diedit.
- Bucket Storage `tulisqu-files` DIBUAT (privat) lewat Storage API;
  route unggah tidak lagi 503 karena bucket. Kunci Supabase di env
  Vercel tulisqu sudah terpasang sejak persiapan infra.
- Verifikasi lokal: `prisma generate && next build` + lint lolos.
  Deploy dipicu lewat commit kosong `Deploy: tulisqu` sesudah
  commit perbaikan `[skip-vercel]` ter-push.
