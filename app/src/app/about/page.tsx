"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { Landmark, Cpu, Check, Zap } from "lucide-react";

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-fade",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-20 space-y-10 md:space-y-16">
      
      {/* Title Header */}
      <section className="text-center space-y-3 md:space-y-4 max-w-3xl mx-auto">
        <h1 className="about-fade text-3xl md:text-5xl font-bold tracking-tight text-glow text-stone-100 font-display">
          Tentang Proyek <span className="gradient-gold">Paririmbon</span>
        </h1>
        <p className="about-fade text-stone-400 text-sm sm:text-base leading-relaxed">
          Sistem informasi berbasis jaringan semantik (Semantic Web) untuk pemetaan leksikon Sunda Kuno secara digital menggunakan standar internasional RDF, OWL, dan SPARQL.
        </p>
      </section>

      {/* Main Grid Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Core Description Card */}
        <section className="about-fade glass-card p-6 md:p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-stone-100 font-display flex items-center gap-2">
            <Landmark className="w-5 h-5 text-amber-500 shrink-0" /> Latar Belakang
          </h2>
          <div className="text-stone-300 text-sm space-y-4 leading-relaxed">
            <p>
              Manuskrip Sunda Kuno (lontar abad 14–16 Masehi) seperti <em>Sanghyang Siksakanda Ng Karesian</em> dan <em>Amanat Galunggung</em> memuat kearifan hidup adat terperinci. Namun, tingginya ambiguitas istilah kuno dan tersebarnya data teks menghambat eksplorasi mendalam bagi para sejarawan dan akademisi modern.
            </p>
            <p>
              Proyek ini menerapkan teknologi Semantic Web untuk melakukan digitalisasi struktural. Kosakata yang mulanya tak terstruktur ditransformasikan ke dalam model ontologi web ontologis (OWL) terinterkoneksi penuh, memungkinkan pencarian semantik bernalar tinggi.
            </p>
          </div>
        </section>

        {/* Technology Stack Card */}
        <section className="about-fade glass-card p-6 md:p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-bold text-stone-100 font-display flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-500 shrink-0" /> Arsitektur RDF & Triplestore
          </h2>
          <div className="text-stone-300 text-sm space-y-4 leading-relaxed">
            <p>
              Tumpukan teknologi yang dirancang guna membangun ekosistem Knowledge Graph ini meliputi:
            </p>
            <ul className="space-y-2.5 text-xs text-stone-400">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Apache Jena Fuseki:</strong> Server triplestore sebagai SPARQL 1.1 query engine yang memproses kueri semantik secara realtime.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>RDF Turtle Format:</strong> Sintaks serialization representasi grafis relasi subjek-predikat-objek kosakata kuno.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Next.js App Router:</strong> Server-side API routing and responsive UI rendering dengan proteksi offline.</span>
              </li>
            </ul>
          </div>
        </section>

      </div>

      {/* Ontology Blueprint Map */}
      <section className="about-fade glass-card p-6 md:p-8 rounded-3xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-stone-100 font-display">Struktur Skema Ontologi (Ontology Schema)</h2>
          <p className="text-stone-500 text-xs">Blueprint model kosakata Paririmbon.org</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-stone-850">
          <div className="space-y-2">
            <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider">1. Kategori Kelas (OWL Class)</h4>
            <ul className="space-y-1 text-xs text-stone-400">
              <li>• <code>pari:Manuscript</code> (Representasi naskah fisik)</li>
              <li>• <code>pari:SundaKunoTerm</code> (Representasi leksikon kosakata)</li>
              <li>• <code>pari:WordClass</code> (Kategori sintaksis kelas kata)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider">2. Relasi (Object Property)</h4>
            <ul className="space-y-1 text-xs text-stone-400">
              <li>• <code>pari:isSynonymOf</code> (Relasi persamaan makna)</li>
              <li>• <code>pari:isOppositeOf</code> (Relasi pertentangan makna)</li>
              <li>• <code>pari:isRelatedTo</code> (Asosiasi semantik umum)</li>
              <li>• <code>pari:foundInManuscript</code> (Sumber naskah terkait)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider">3. Atribut (Data Property)</h4>
            <ul className="space-y-1 text-xs text-stone-400">
              <li>• <code>pari:entryID</code> (Pengenal unik string kosakata)</li>
              <li>• <code>pari:scriptTerm</code> (Ejaan transliterasi aksara Sunda)</li>
              <li>• <code>pari:definition</code> (Makna deskriptif dalam Bahasa)</li>
              <li>• <code>pari:creationPeriod</code> (Era penulisan naskah klasik)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Namespace prefix declaration box */}
      <section className="about-fade glass-card p-6 rounded-2xl space-y-4">
        <h3 className="text-stone-200 font-bold text-xs uppercase tracking-wider">Deklarasi Prefix RDF</h3>
        <pre className="bg-stone-950/80 p-4 rounded-xl text-xs text-amber-500 overflow-x-auto border border-stone-900 font-mono">
{`PREFIX pari: <https://paririmbon.org/>
PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>`}
        </pre>
      </section>

      {/* Team Section */}
      <section className="about-fade space-y-10 pt-6 border-t border-stone-850">
        <h2 className="text-center text-3xl font-bold tracking-tight text-glow text-stone-100 font-display">
          Tentang <span className="gradient-gold">Kami</span>
        </h2>

        {/* 3 Member Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Siti Aisyah Nurdyanti */}
          <div className="glass-card p-5 md:p-6 rounded-3xl flex flex-col items-center text-center space-y-4 hover:border-amber-500/35 transition">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-stone-850 bg-stone-900/60 relative flex items-center justify-center">
              <Image
                src="/Ica.jpg"
                alt="Siti Aisyah Nurdyanti"
                width={176}
                height={176}
                className="w-full h-full object-cover md:grayscale brightness-90 md:hover:grayscale-0 hover:scale-105 transition duration-300"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-100 font-display text-base">
                Siti Aisyah Nurdyanti
              </h3>
              <p className="text-xs text-amber-500 font-semibold tracking-wider">
                140810230015
              </p>
            </div>
          </div>

          {/* Card 2: Clarisya Adeline */}
          <div className="glass-card p-5 md:p-6 rounded-3xl flex flex-col items-center text-center space-y-4 hover:border-amber-500/35 transition">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-stone-850 bg-stone-900/60 relative flex items-center justify-center">
              <Image
                src="/Cla.jpg"
                alt="Clarisya Adeline"
                width={176}
                height={176}
                className="w-full h-full object-cover md:grayscale brightness-90 md:hover:grayscale-0 hover:scale-105 transition duration-300"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-100 font-display text-base">
                Clarisya Adeline
              </h3>
              <p className="text-xs text-amber-500 font-semibold tracking-wider">
                140810230017
              </p>
            </div>
          </div>

          {/* Card 3: Nazwa Nashatasya */}
          <div className="glass-card p-5 md:p-6 rounded-3xl flex flex-col items-center text-center space-y-4 hover:border-amber-500/35 transition">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-stone-850 bg-stone-900/60 relative flex items-center justify-center">
              <Image
                src="/Awa.jpg"
                alt="Nazwa Nashatasya"
                width={176}
                height={176}
                className="w-full h-full object-cover md:grayscale brightness-90 md:hover:grayscale-0 hover:scale-105 transition duration-300"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-100 font-display text-base">
                Nazwa Nashatasya
              </h3>
              <p className="text-xs text-amber-500 font-semibold tracking-wider">
                140810230019
              </p>
            </div>
          </div>
        </div>

        {/* Project Description Bottom Section */}
        <div className="max-w-3xl mx-auto text-center space-y-4 pt-8">
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-6 h-6 text-amber-500 shrink-0 animate-bounce" />
            <span className="text-lg font-bold tracking-wider text-stone-100 font-display uppercase">
              Paririmbon Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed max-w-2xl mx-auto">
            Paririmbon adalah sebuah platform search engine yang dirancang khusus untuk menelusuri, mencari, dan menampilkan detail kosakata, relasi semantik, dan struktur konseptual bahasa Sunda Kuno yang terenkripsi dalam naskah-naskah lontar klasik abad 14–16 Masehi. Platform ini berbasis pada teknologi Semantic Web dengan standar RDF, OWL, dan memanfaatkan Apache Jena Fuseki sebagai triplestore SPARQL Query.
          </p>
        </div>
      </section>

    

    </div>
  );
}
