"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

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
        ? "text-amber-500 bg-amber-500/10 border-amber-500/25 shadow-lg shadow-amber-500/5 font-bold"
        : "text-stone-400 border-transparent hover:text-stone-100 hover:bg-stone-900/40"
    }`;
  };

  return (
    <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 border-b border-stone-800/80 bg-stone-950/80 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-14 h-14 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
            <Image
              src="/ParirimbonLogo.svg"
              alt="Paririmbon"
              width={60}
              height={60}
              className="object-contain"
            />
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

        {/* Nav Menu + Toggle */}
        <div className="flex items-center gap-2 md:gap-3">
          <nav className="flex items-center gap-1 md:gap-2">
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

          {/* Theme Toggle */}
          <div className="ml-1 pl-2 border-l border-stone-800/60">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
