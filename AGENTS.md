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
