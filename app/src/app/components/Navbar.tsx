"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/search") return pathname === "/search" || pathname.startsWith("/term");
    if (href === "/about") return pathname === "/about";
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

  const mobileLinkClass = (href: string) => {
    const active = isActive(href);
    return `flex items-center gap-3 px-5 py-4 rounded-2xl text-base font-semibold transition-all border ${
      active
        ? "text-amber-500 bg-amber-500/10 border-amber-500/25"
        : "text-stone-300 border-transparent hover:text-stone-100 hover:bg-stone-900/40"
    }`;
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-card border-x-0 border-t-0 border-b border-stone-800/80 bg-stone-950/80 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-12 h-12 md:w-14 md:h-14 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <Image
                src="/ParirimbonLogo.svg"
                alt="Paririmbon"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold tracking-wider text-stone-100 group-hover:text-amber-400 transition-colors block">
                PARIRIMBON
              </span>
              <span className="text-[9px] md:text-[10px] tracking-widest text-amber-500 uppercase font-semibold block -mt-1">
                Sunda Kuno RDF
              </span>
            </div>
          </Link>

          {/* Desktop Nav Menu + Toggle */}
          <div className="hidden md:flex items-center gap-2 md:gap-3">
            <nav className="flex items-center gap-1 md:gap-2">
              <Link href="/" className={linkClass("/")}>Beranda</Link>
              <Link href="/search" className={linkClass("/search")}>
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span>Cari Semantik</span>
                </span>
              </Link>
              <Link href="/about" className={linkClass("/about")}>Tentang</Link>
            </nav>
            <div className="ml-1 pl-2 border-l border-stone-800/60">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile: Theme Toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-900/40 transition border border-transparent hover:border-stone-800/60"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 md:hidden bg-stone-950 border-l border-stone-800/80 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/60">
          <span className="text-stone-100 font-bold font-display">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-900/40 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Links */}
        <nav className="flex flex-col gap-2 p-4 flex-grow">
          <Link href="/" className={mobileLinkClass("/")}>
            
            <span>Beranda</span>
          </Link>
          <Link href="/search" className={mobileLinkClass("/search")}>
            
            <span>Cari Semantik</span>
          </Link>
          <Link href="/about" className={mobileLinkClass("/about")}>
           
            <span>Tentang</span>
          </Link>
        </nav>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-stone-800/60">
          <p className="text-[10px] text-stone-600 uppercase tracking-widest font-semibold text-center">
            Paririmbon · Sunda Kuno RDF
          </p>
        </div>
      </div>
    </>
  );
}
