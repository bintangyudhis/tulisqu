// Bentuk data yang dikembalikan route API meja kerja.
// Dipakai bersama oleh panel kategori, daftar catatan, editor,
// lampiran, dan tautan supaya bentuknya tidak ditulis ulang.

export type CategoryItem = {
  id: string;
  name: string;
  _count: { notes: number };
};

export type AttachmentItem = {
  id: string;
  noteId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  createdAt: string;
};

export type LinkItem = {
  id: string;
  noteId: string;
  url: string;
  title: string | null;
  createdAt: string;
};

export type NoteListItem = {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  _count: { attachments: number; links: number };
};

export type NoteDetail = Omit<NoteListItem, "_count"> & {
  attachments: AttachmentItem[];
  links: LinkItem[];
};
