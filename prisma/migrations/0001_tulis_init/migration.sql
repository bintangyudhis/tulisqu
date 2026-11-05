-- Tulisqu: tabel awal TulisCategory, Note, dan Task.
-- Nama migrasi dibuat unik (0001_tulis_init) karena database Supabase
-- `dompetku` dipakai bersama repo lain; tabel-tabel ini milik tulisqu saja.
-- Tabel kategori bernama TulisCategory karena nama Category sudah dipakai
-- dompetku-web di database yang sama.
CREATE TABLE "TulisCategory" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TulisCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Note" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "categoryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "done" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TulisCategory_name_idx" ON "TulisCategory"("name");
CREATE INDEX "Note_categoryId_updatedAt_idx" ON "Note"("categoryId", "updatedAt");
CREATE INDEX "Task_dueDate_done_idx" ON "Task"("dueDate", "done");

ALTER TABLE "Note" ADD CONSTRAINT "Note_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "TulisCategory"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
