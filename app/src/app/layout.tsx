import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "./components/Navbar";
import Providers from "./providers";
import { NavigationProgress } from "./components/NavigationProgress";

export const metadata: Metadata = {
  title: "Paririmbon — Terminologi Sunda Kuno",
  description: "Sistem Knowledge Graph & Pencarian Semantik Kosakata Sunda Kuno pada Naskah Klasik",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased flex flex-col min-h-screen">
        <Providers>
          {/* Slim amber top progress bar — shows on every navigation */}
          <NavigationProgress />

          {/* Navigation Bar */}
          <Navbar />

        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] bg-amber-500/5 blur-[120px] rounded-full z-0" />

        {/* Main Content — page-enter gives the fade+slide on every route mount */}
        <main className="flex-grow z-10 relative page-enter">
          {children}
        </main>

        {/* ═══════════════════════════════════════
            FOOTER — Premium 4-column layout
            ═══════════════════════════════════════ */}
        <footer className="border-t border-stone-900 bg-stone-950 pt-14 pb-6 px-4 text-stone-400 z-10 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-amber-600/5 blur-[80px] rounded-full" />

          <div className="max-w-7xl mx-auto relative">
            {/* ── Top section: 4 columns ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-stone-900">

              {/* Brand */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    <Image
                      src="/ParirimbonLogo.svg"
                      alt="Paririmbon"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-lg font-bold tracking-wider text-stone-100 font-display">PARIRIMBON</span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed max-w-[220px]">
                  Sistem Knowledge Graph &amp; Pencarian Semantik Terminologi Sunda Kuno berbasis RDF, OWL, dan SPARQL.
                </p>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                  Sunda Kuno RDF
                </div>
              </div>

              {/* Navigation */}
              <div className="space-y-4">
                <h4 className="text-stone-200 font-bold text-xs tracking-widest uppercase">Navigasi</h4>
                <ul className="space-y-2.5 text-sm">
                  {[
                    { href: "/",       label: "Beranda" },
                    { href: "/search", label: "Pencarian Semantik" },
                    { href: "/about",  label: "Tentang Proyek" },
                  ].map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="text-stone-500 hover:text-amber-400 transition-colors flex items-center gap-2 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-stone-700 group-hover:bg-amber-500 transition-colors shrink-0" />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div className="space-y-4">
                <h4 className="text-stone-200 font-bold text-xs tracking-widest uppercase">Tumpukan Teknologi</h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Apache Jena Fuseki",
                    "RDF / Turtle",
                    "SPARQL 1.1",
                    "OWL Ontology",
                    "Next.js 15",
                    "Tailwind CSS v4",
                    "GSAP",
                    "TypeScript",
                    "React Query",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800/80 text-[10px] text-stone-400 font-mono tracking-wide"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-4">
                <h4 className="text-stone-200 font-bold text-xs tracking-widest uppercase">Tim Pengembang</h4>
                <ul className="space-y-3.5">
                  {[
                    { name: "Siti Aisyah Nurdyanti", nim: "140810230015", image: "/Ica.jpg" },
                    { name: "Clarisya Adeline",       nim: "140810230017", image: "/Cla.jpg" },
                    { name: "Nazwa Nashatasya",        nim: "140810230019", image: "/Awa.jpg" },
                  ].map((member) => (
                    <li key={member.nim} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-stone-800 bg-stone-900 shadow-md relative">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          sizes="32px"
                          className="object-cover grayscale brightness-90 hover:grayscale-0 hover:scale-110 transition duration-300"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-stone-300 font-semibold leading-tight">{member.name}</p>
                        <p className="text-[10px] text-stone-600 font-mono tracking-wider">{member.nim}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* ── Bottom bar ── */}
            <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-600">
              <p className="text-center sm:text-left">
                Tugas Akhir &nbsp;·&nbsp;
                <span className="text-stone-500 font-semibold">Semantic Web</span>
                &nbsp;·&nbsp; Semester Genap 2025/2026 &nbsp;·&nbsp;
                <span className="hidden sm:inline">Teknik Informatika, Universitas Padjadjaran</span>
                <span className="sm:hidden">Teknik Informatika, Unpad</span>
              </p>
              <p className="shrink-0 text-stone-700">© 2026 Kelompok Paririmbon</p>
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
