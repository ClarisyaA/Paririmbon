import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "Paririmbon — Terminologi Sunda Kuno",
  description: "Sistem Knowledge Graph & Pencarian Semantik Kosakata Sunda Kuno pada Naskah Klasik",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar />

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-amber-500/5 blur-[120px] rounded-full z-0" />

        {/* Main Content */}
        <main className="flex-grow z-10 relative">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-stone-900 bg-stone-950 py-12 px-4 text-stone-400 z-10 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <span className="text-lg font-bold text-stone-200 tracking-wider">PARIRIMBON</span>
              <p className="text-sm text-stone-500 leading-relaxed max-w-sm">
                Sistem Knowledge Graph & Pencarian Semantik Terminologi Sunda Kuno pada Naskah Klasik Berbasis RDF dan SPARQL.
              </p>
            </div>
            <div>
              <h4 className="text-stone-200 font-semibold mb-4 text-sm tracking-wider uppercase">Menu</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="hover:text-amber-400 transition-colors">Beranda</Link></li>
                <li><Link href="/search" className="hover:text-amber-400 transition-colors">Pencarian Semantik</Link></li>
                <li><Link href="/about" className="hover:text-amber-400 transition-colors">Tentang Proyek</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-stone-200 font-semibold mb-4 text-sm tracking-wider uppercase">Tumpukan Teknologi</h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Apache Jena Fuseki • RDF / Turtle • SPARQL 1.1 • Next.js 15 • Tailwind CSS v4 • GSAP Animations
              </p>
              <div className="mt-4 pt-4 border-t border-stone-900 text-xs text-stone-600">
                Kelompok Tugas Akhir Semantik Web © 2026. Semua hak dilindungi.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
