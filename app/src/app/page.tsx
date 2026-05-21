"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, Network, Globe, FileText } from "lucide-react";
import gsap from "gsap";

interface Manuscript {
  uri: string;
  title: string;
  period: string;
  wordCount: number;
}

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [fusekiStatus, setFusekiStatus] = useState<"connected" | "disconnected" | "checking">("checking");

  const heroRef = useRef<HTMLDivElement>(null);
  const searchCardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const manuscriptsRef = useRef<HTMLDivElement>(null);

  // Fetch manuscripts and check Fuseki status
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/naskah");
        if (!res.ok) throw new Error("Fuseki unreachable");
        const data = await res.json();
        if (data.manuscripts) {
          setManuscripts(data.manuscripts);
          setFusekiStatus("connected");
        } else {
          throw new Error("Invalid response");
        }
      } catch (err) {
        console.warn("Fuseki not running or error fetching manuscripts:", err);
        setFusekiStatus("disconnected");
        // Premium fallback data so UI remains gorgeous
        setManuscripts([
          { uri: "https://paririmbon.org/Manuscript/SanghyangSiksakandaNgKaresian", title: "Sanghyang Siksakanda Ng Karesian", period: "Abad 16 Masehi (1518 M)", wordCount: 412 },
          { uri: "https://paririmbon.org/Manuscript/CaritaParahyangan", title: "Carita Parahyangan", period: "Akhir Abad 16 Masehi", wordCount: 320 },
          { uri: "https://paririmbon.org/Manuscript/SanghyangRagaDewata", title: "Sanghyang Raga Dewata", period: "Abad 15 Masehi", wordCount: 184 },
          { uri: "https://paririmbon.org/Manuscript/AmanatGalunggung", title: "Amanat Galunggung (Kropak 632)", period: "Abad 15 Masehi", wordCount: 156 },
          { uri: "https://paririmbon.org/Manuscript/SewakaDarman", title: "Sewaka Darman", period: "Abad 16 Masehi", wordCount: 122 },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in hero elements
      gsap.fromTo(
        ".hero-title",
        { opacity: 0, y: 30, filter: "blur(5px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power3.out", delay: 0.1 }
      );
      gsap.fromTo(
        ".hero-subtitle",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
      );

      // Search card zoom-in
      gsap.fromTo(
        searchCardRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 }
      );

      // Stats cards stagger
      gsap.fromTo(
        ".stat-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15, delay: 0.7 }
      );

      // Manuscripts reveal
      gsap.fromTo(
        ".manuscript-card",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1, delay: 0.9 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div ref={heroRef} className="px-4 md:px-8 py-12 md:py-20 max-w-7xl mx-auto space-y-24">
      
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold tracking-wider uppercase animate-pulse animate-duration-3000">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Knowledge Graph & Semantic Engine</span>
        </div>
        
        <h1 className="hero-title text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-glow text-stone-100 font-display">
          Menjelajahi <span className="gradient-gold">Paririmbon</span>
        </h1>
        
        <p className="hero-subtitle text-stone-400 text-sm sm:text-lg leading-relaxed">
          Sistem navigasi ontologis untuk menelusuri kosakata, relasi semantik, dan struktur konseptual bahasa Sunda Kuno yang terenkripsi dalam naskah-naskah lontar klasik abad 14–16 Masehi.
        </p>

        {/* Dynamic SPARQL Connection Badge */}
        <div className="flex justify-center items-center gap-2 text-xs">
          <span className="text-stone-500">Status Endpoint:</span>
          {fusekiStatus === "checking" && (
            <span className="text-stone-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-ping" />
              memeriksa...
            </span>
          )}
          {fusekiStatus === "connected" && (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Fuseki Terhubung
            </span>
          )}
          {fusekiStatus === "disconnected" && (
            <span className="text-amber-500 font-semibold flex items-center gap-1" title="Menggunakan data simulasi lokal untuk mempermudah eksekusi. Silakan nyalakan server Apache Jena Fuseki jika ingin data live!">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Simulasi Ontologi (Offline)
            </span>
          )}
        </div>
      </section>

      {/* Semantic Search Box */}
      <section ref={searchCardRef} className="max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="glass-card p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-2xl">
          <div className="flex-grow flex items-center px-4 gap-2">
            <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari kata kunci, arti kata, atau transliterasi (e.g. hyang, tapa, raga)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 bg-transparent text-stone-100 placeholder-stone-500 focus:outline-none text-sm md:text-base"
            />
          </div>
          <button
            type="submit"
            className="gradient-gold-bg hover:opacity-90 active:scale-95 text-stone-950 font-bold px-8 py-3.5 rounded-xl transition duration-200 text-sm md:text-base whitespace-nowrap cursor-pointer shadow-lg shadow-amber-700/20"
          >
            Cari Semantik
          </button>
        </form>
      </section>

      {/* Ontological Stats Overview */}
      <section ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="stat-card glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 flex items-center justify-center transition-colors text-amber-500/35 group-hover:text-amber-500/60">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-xs text-stone-500 font-semibold tracking-widest uppercase">Repositori Naskah</span>
          <h3 className="text-4xl font-extrabold text-stone-100 mt-2 font-display">11 <span className="text-amber-500 text-lg">Dokumen</span></h3>
          <p className="text-stone-400 text-xs mt-2">Naskah lontar Sunda Kuno yang ditransliterasi penuh.</p>
        </div>

        <div className="stat-card glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 flex items-center justify-center transition-colors text-amber-500/35 group-hover:text-amber-500/60">
            <Network className="w-7 h-7" />
          </div>
          <span className="text-xs text-stone-500 font-semibold tracking-widest uppercase">RDF Triples</span>
          <h3 className="text-4xl font-extrabold text-stone-100 mt-2 font-display">17.158 <span className="text-amber-500 text-lg">Pernyataan</span></h3>
          <p className="text-stone-400 text-xs mt-2">Relasi subjek-predikat-objek dalam Knowledge Graph.</p>
        </div>

        <div className="stat-card glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-16 h-16 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 flex items-center justify-center transition-colors text-amber-500/35 group-hover:text-amber-500/60">
            <Globe className="w-7 h-7" />
          </div>
          <span className="text-xs text-stone-500 font-semibold tracking-widest uppercase">Ontologi OWL</span>
          <h3 className="text-4xl font-extrabold text-stone-100 mt-2 font-display">1.411 <span className="text-amber-500 text-lg">Entri Terminologis</span></h3>
          <p className="text-stone-400 text-xs mt-2">Kosakata terstruktur dengan relasi semantik kompleks.</p>
        </div>
      </section>

      {/* Classical Manuscripts Grid */}
      <section ref={manuscriptsRef} className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide text-stone-100 font-display">Naskah Klasik Terdaftar</h2>
            <p className="text-stone-400 text-xs sm:text-sm">Dokumentasi naskah kuno yang menjadi sumber leksikografis repositori ini.</p>
          </div>
          <Link 
            href="/search?q=*"
            className="text-amber-500 text-xs font-semibold hover:text-amber-400 flex items-center gap-1.5 transition group"
          >
            Lihat Semua Kosakata
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl h-44 animate-pulse space-y-4">
                <div className="h-6 bg-stone-800 rounded w-2/3" />
                <div className="h-4 bg-stone-800 rounded w-1/2" />
                <div className="h-4 bg-stone-800 rounded w-1/3" />
              </div>
            ))
          ) : (
            manuscripts.map((ms) => (
              <div key={ms.uri} className="manuscript-card glass-card p-6 rounded-2xl flex flex-col justify-between hover:-translate-y-1 transition duration-200">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                    <h3 className="font-bold text-stone-100 font-display line-clamp-1 group-hover:text-amber-400 transition-colors">
                      {ms.title}
                    </h3>
                  </div>
                  <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed">
                    Estimasi Penulisan: <strong className="text-amber-500/80 font-medium">{ms.period}</strong>
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-500">
                  <span>Jumlah Terminologi</span>
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 font-bold">
                    {ms.wordCount} Kata
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
