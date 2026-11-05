import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import BilahAtas from "./BilahAtas";
import KakiHalaman from "./KakiHalaman";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Tulisqu — Catatan Kuliah, Berkas, dan Tugas Harian",
  description:
    "Tulisqu merapikan catatan per mata kuliah, menyimpan berkas dan tautan referensi di dalam catatan, dan menyusun tugas harian dalam satu tempat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${bricolage.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-100 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-paper"
        >
          Lewati ke konten
        </a>
        <BilahAtas />
        <main id="konten">{children}</main>
        <KakiHalaman />
      </body>
    </html>
  );
}
