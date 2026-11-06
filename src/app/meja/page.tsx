import type { Metadata } from "next";
import MejaKerja from "./MejaKerja";

export const metadata: Metadata = {
  title: "Meja Kerja — Tulisqu",
  description:
    "Tulis, kelompokkan, dan lengkapi catatan kuliah dengan berkas dan tautan referensi.",
};

export default function MejaPage() {
  return <MejaKerja />;
}
