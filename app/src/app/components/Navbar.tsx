"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/search") {
      return pathname === "/search" || pathname.startsWith("/term");
    }
    if (href === "/about") {
      return pathname === "/about";
    }
    return pathname === href;
  };

  const linkClass = (href: string) => {
    const active = isActive(href);
    return `px-3.5 py-2 rounded-xl text-sm font-semibold transition-all select-none border ${
      active
        ? "text-amber-400 bg-amber-500/10 border-amber-500/25 shadow-lg shadow-amber-500/5 font-bold"
        : "text-stone-400 border-transparent hover:text-stone-100 hover:bg-stone-900/40"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 border-b border-stone-800/80 bg-stone-950/80 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-gold-bg flex items-center justify-center font-bold text-stone-950 text-xl shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <span className="text-xl font-bold tracking-wider text-stone-100 group-hover:text-amber-400 transition-colors block">
              PARIRIMBON
            </span>
            <span className="text-[10px] tracking-widest text-amber-500 uppercase font-semibold block -mt-1">
              Sunda Kuno RDF
            </span>
          </div>
        </Link>

        {/* Nav Menu */}
        <nav className="flex items-center gap-1.5 md:gap-3">
          <Link href="/" className={linkClass("/")}>
            Beranda
          </Link>
          <Link href="/search" className={linkClass("/search")}>
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span>Cari</span>
              <span className="hidden sm:inline">Semantik</span>
            </span>
          </Link>
          <Link href="/about" className={linkClass("/about")}>
            Tentang
          </Link>
        </nav>
      </div>
    </header>
  );
}
