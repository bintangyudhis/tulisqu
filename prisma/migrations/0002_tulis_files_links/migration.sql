-- Tulisqu: lampiran berkas dan tautan referensi untuk catatan.
-- Nama migrasi dibuat unik (0002_tulis_files_links) karena database
-- Supabase `dompetku` dipakai bersama repo lain.
-- Berkas sendiri disimpan sebagai objek di bucket Storage
-- `tulisqu-files`; tabel ini hanya menyimpan metadatanya.
CREATE TABLE "Attachment" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "storagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TulisLink" (
  "id" TEXT NOT NULL,
  "noteId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "title" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TulisLink_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Attachment_noteId_createdAt_idx" ON "Attachment"("noteId", "createdAt");
CREATE INDEX "TulisLink_noteId_createdAt_idx" ON "TulisLink"("noteId", "createdAt");

ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "Note"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TulisLink" ADD CONSTRAINT "TulisLink_noteId_fkey"
  FOREIGN KEY ("noteId") REFERENCES "Note"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
