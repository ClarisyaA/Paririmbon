"use client";

import React, { useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, BookOpen, FileText } from "lucide-react";

interface Relation {
  relation: string;
  targetId: string;
  targetLabel: string;
  direction: string;
}

interface TermDetail {
  id: string;
  label: string;
  scriptTerm: string | null;
  definition: string | null;
  usageContext: string | null;
  wordClass: string | null;
  wordClassDisplay: string | null;
  manuscript: {
    title: string | null;
    period: string | null;
  };
  relations: Relation[];
}

interface GraphNode {
  id: string;
  label: string;
  isCenter: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  relation: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

// Fallback data mapping for offline simulation
const MOCK_TERMS: Record<string, TermDetail> = {
  sanghyang: {
    id: "sanghyang",
    label: "Sanghyang",
    scriptTerm: "ᮞᮀᮠᮡᮀ",
    definition: "Sebutan kehormatan untuk entitas suci, dewata, kekuatan gaib tertinggi, atau spiritualitas tinggi dalam kebudayaan Sunda Kuno.",
    usageContext: "Digunakan dalam teks keagamaan atau petunjuk hidup kebatinan untuk menunjuk objek/entitas transendental.",
    wordClass: "SundaKunoTerm",
    wordClassDisplay: "Adjective / Noun",
    manuscript: {
      title: "Sanghyang Siksakanda Ng Karesian",
      period: "1518 M"
    },
    relations: [
      { relation: "isRelatedTo", targetId: "tapa", targetLabel: "Tapa", direction: "outgoing" },
      { relation: "isSynonymOf", targetId: "raga", targetLabel: "Raga", direction: "incoming" }
    ]
  },
  tapa: {
    id: "tapa",
    label: "Tapa",
    scriptTerm: "ᮒᮕ",
    definition: "Praktik asketisme, meditasi mendalam, atau pengekangan diri dari nafsu duniawi untuk mencapai kesadaran spiritual spiritual tinggi.",
    usageContext: "Sering muncul pada bab tuntunan moral naskah klasik sebagai prasyarat bagi pertapa (karesian).",
    wordClass: "SundaKunoTerm",
    wordClassDisplay: "Noun",
    manuscript: {
      title: "Amanat Galunggung (Kropak 632)",
      period: "Abad 15 Masehi"
    },
    relations: [
      { relation: "isRelatedTo", targetId: "sanghyang", targetLabel: "Sanghyang", direction: "incoming" },
      { relation: "isOppositeOf", targetId: "raga", targetLabel: "Raga", direction: "outgoing" }
    ]
  },
  raga: {
    id: "raga",
    label: "Raga",
    scriptTerm: "ᮛᮌ",
    definition: "Badan kasar, jasmani manusia yang menjadi wadah bagi suksma (jiwa) dalam mengarungi kehidupan materiil di bumi.",
    usageContext: "Digunakan dalam naskah deskripsi filosofi penciptaan mikrokosmos dan makrokosmos.",
    wordClass: "SundaKunoTerm",
    wordClassDisplay: "Noun",
    manuscript: {
      title: "Sanghyang Raga Dewata",
      period: "Abad 15 Masehi"
    },
    relations: [
      { relation: "isSynonymOf", targetId: "sanghyang", targetLabel: "Sanghyang", direction: "outgoing" },
      { relation: "isOppositeOf", targetId: "tapa", targetLabel: "Tapa", direction: "incoming" }
    ]
  }
};

const MOCK_GRAPH: Record<string, GraphData> = {
  sanghyang: {
    nodes: [
      { id: "sanghyang", label: "Sanghyang", isCenter: true },
      { id: "tapa", label: "Tapa", isCenter: false },
      { id: "raga", label: "Raga", isCenter: false }
    ],
    links: [
      { source: "sanghyang", target: "tapa", relation: "isRelatedTo" },
      { source: "raga", target: "sanghyang", relation: "isSynonymOf" }
    ]
  },
  tapa: {
    nodes: [
      { id: "tapa", label: "Tapa", isCenter: true },
      { id: "sanghyang", label: "Sanghyang", isCenter: false },
      { id: "raga", label: "Raga", isCenter: false }
    ],
    links: [
      { source: "sanghyang", target: "tapa", relation: "isRelatedTo" },
      { source: "tapa", target: "raga", relation: "isOppositeOf" }
    ]
  },
  raga: {
    nodes: [
      { id: "raga", label: "Raga", isCenter: true },
      { id: "sanghyang", label: "Sanghyang", isCenter: false },
      { id: "tapa", label: "Tapa", isCenter: false }
    ],
    links: [
      { source: "raga", target: "sanghyang", relation: "isSynonymOf" },
      { source: "tapa", target: "raga", relation: "isOppositeOf" }
    ]
  }
};

function buildFallbackTerm(id: string): TermDetail {
  const lowerId = id.toLowerCase();
  if (MOCK_TERMS[lowerId]) return MOCK_TERMS[lowerId];
  return {
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    scriptTerm: "ᮊᮧᮞᮊᮒ",
    definition: `Kosakata kuno '${id}' ditemukan dalam manuskrip tertua Sunda, merepresentasikan terminologi penting kehidupan spiritual adat paririmbon.`,
    usageContext: "Digunakan dalam deskripsi tata karma masyarakat kuno.",
    wordClass: "SundaKunoTerm",
    wordClassDisplay: "Kosakata Klasik",
    manuscript: {
      title: "Naskah Lontar Kuno Leksikon",
      period: "Abad 16 Masehi"
    },
    relations: []
  };
}

function buildFallbackGraph(id: string): GraphData {
  const lowerId = id.toLowerCase();
  if (MOCK_GRAPH[lowerId]) return MOCK_GRAPH[lowerId];
  return {
    nodes: [{ id, label: id.charAt(0).toUpperCase() + id.slice(1), isCenter: true }],
    links: []
  };
}

export default function TermPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // --- TanStack Query: Fetch Term Details ---
  const {
    data: term,
    isLoading: isTermLoading,
    error: termError,
  } = useQuery<TermDetail>({
    queryKey: ["term", id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/term/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        if (data.error) throw new Error("Invalid term ID");
        return data as TermDetail;
      } catch (err) {
        console.warn("Term API failed, using mock fallback:", err);
        return buildFallbackTerm(id);
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  // --- TanStack Query: Fetch Graph Data ---
  const {
    data: graphData,
    isLoading: isGraphLoading,
    error: graphError,
  } = useQuery<GraphData>({
    queryKey: ["graph", id],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/graph/${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error("Server error");
        const data = await res.json();
        if (data.error) throw new Error("No graph data");
        return data as GraphData;
      } catch (err) {
        console.warn("Graph API failed, using mock fallback:", err);
        return buildFallbackGraph(id);
      }
    },
    retry: false,
    staleTime: 60 * 1000,
  });

  // Combined loading and offline states
  const loading = isTermLoading || isGraphLoading;
  // Offline if either query had an error (meaning we fell back to mock data)
  const isOffline = !!(termError || graphError);

  // Entrance animations using GSAP (runs when data is loaded)
  useEffect(() => {
    if (!loading && term) {
      gsap.fromTo(
        ".fade-in-up",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.15 }
      );
      gsap.fromTo(
        ".satellite-node",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.5)", stagger: 0.1, delay: 0.4 }
      );
    }
  }, [loading, term]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
        <p className="text-stone-400 text-sm">Menghubungkan ke Knowledge Graph...</p>
      </div>
    );
  }

  if (!term) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <h2 className="text-2xl font-bold text-stone-200">Istilah Tidak Ditemukan</h2>
        <p className="text-stone-400 text-sm">Kosakata yang Anda cari tidak terdaftar dalam repositori.</p>
        <Link href="/search" className="gradient-gold-bg text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider inline-block">
          Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  // Define styling of nodes based on relationships
  const getRelationColor = (rel: string) => {
    switch (rel) {
      case "isSynonymOf": return { bg: "bg-emerald-500/10 border-emerald-500/40 text-emerald-300", glow: "rgba(16,185,129,0.3)", label: "Sinonim" };
      case "isOppositeOf": return { bg: "bg-rose-500/10 border-rose-500/40 text-rose-300", glow: "rgba(244,63,94,0.3)", label: "Antonim" };
      case "isDerivedFrom": return { bg: "bg-sky-500/10 border-sky-500/40 text-sky-300", glow: "rgba(14,165,233,0.3)", label: "Turunan" };
      case "isPartOf": return { bg: "bg-purple-500/10 border-purple-500/40 text-purple-300", glow: "rgba(168,85,247,0.3)", label: "Bagian Dari" };
      default: return { bg: "bg-amber-500/10 border-amber-500/40 text-amber-300", glow: "rgba(245,158,11,0.3)", label: "Terkait" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      
      {/* Back Button */}
      <div className="fade-in-up">
        <button
          onClick={() => router.back()}
          className="text-stone-400 hover:text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition select-none cursor-pointer"
        >
          <span>←</span>
          <span>Kembali</span>
        </button>
      </div>

      {isOffline && (
        <div className="fade-in-up p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-xs text-amber-400">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <p>
            <strong>Mode Simulasi Aktif:</strong> Anda sedang berselancar secara offline dengan basis data tiruan lokal. Silakan nyalakan Apache Jena Fuseki untuk integrasi langsung.
          </p>
        </div>
      )}

      {/* Main Grid: Details + Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Semantic Leksikografis Details */}
        <section className="lg:col-span-3 space-y-8">
          
          {/* Main Term Card */}
          <div className="fade-in-up glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden">
            {/* Header: Roman & Sundanese Script */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-stone-850">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] uppercase tracking-wider">
                  {term.wordClassDisplay || "Kosakata"}
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-100 font-display">
                  {term.label}
                </h1>
              </div>

              {term.scriptTerm && (
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-stone-500 text-[10px] uppercase font-bold tracking-wider block mb-1">Aksara Sunda</span>
                  <span className="font-sundanese text-3xl text-amber-500 tracking-wider bg-stone-900/60 px-4 py-2 rounded-xl border border-stone-800/80 block select-none">
                    {term.scriptTerm}
                  </span>
                </div>
              )}
            </div>

            {/* Definition */}
            <div className="py-6 space-y-2">
              <h3 className="text-stone-400 font-bold text-xs uppercase tracking-wider">Definisi Semantik</h3>
              <p className="text-stone-200 text-sm md:text-base leading-relaxed">
                {term.definition || "Tidak ada definisi tertulis untuk kosakata ini."}
              </p>
            </div>

            {/* Usage Context */}
            {term.usageContext && (
              <div className="p-4.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1.5">
                <h4 className="text-amber-500 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Konteks Penggunaan Klasik</span>
                </h4>
                <p className="text-stone-300 text-xs sm:text-sm italic leading-relaxed">
                  &ldquo;{term.usageContext}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Manuscript Provenance Source */}
          <div className="fade-in-up glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-stone-300 font-bold text-xs uppercase tracking-wider">Sumber Manuskrip Lontar</h3>
            <div className="flex items-start gap-4">
              <div className="shrink-0 p-3 bg-stone-900/80 border border-stone-800 rounded-xl">
                <FileText className="w-6 h-6 text-amber-500" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-stone-100 font-display text-base sm:text-lg">
                  {term.manuscript.title || "Manuskrip Tidak Disebutkan"}
                </h4>
                <p className="text-stone-400 text-xs sm:text-sm">
                  Estimasi Penulisan Klasik: <strong className="text-amber-500/80 font-medium">{term.manuscript.period || "Tidak Diketahui"}</strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Dynamic Semantic Graph Visualizer */}
        <section className="lg:col-span-2 space-y-6">
          <div className="fade-in-up glass-card p-6 rounded-3xl h-[420px] md:h-[500px] flex flex-col justify-between relative select-none">
            
            {/* Graph Header */}
            <div>
              <h3 className="text-stone-100 font-bold text-base tracking-wide font-display">Knowledge Graph</h3>
              <p className="text-stone-500 text-xs">Peta relasi semantik istilah saat ini terhadap kosakata lainnya.</p>
            </div>

            {/* Simulated Live SVG Node Map */}
            <div className="flex-grow relative flex items-center justify-center overflow-hidden">
              
              {/* Outer SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {graphData && graphData.links.map((link, idx) => {
                  const nodeCount = graphData.nodes.filter(n => !n.isCenter).length;
                  const itemIndex = graphData.nodes.filter(n => !n.isCenter).findIndex(n => n.id === (link.source === term.id ? link.target : link.source));
                  
                  if (itemIndex === -1) return null;
                  
                  const angle = (itemIndex * 2 * Math.PI) / nodeCount;
                  const radius = 110;
                  const startX = 200;
                  const startY = 180;
                  const endX = startX + radius * Math.cos(angle);
                  const endY = startY + radius * Math.sin(angle);

                  return (
                    <g key={idx}>
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke="rgba(217, 119, 6, 0.2)"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <circle r="4" fill="#fbbf24" className="animate-pulse">
                        <animateMotion
                          path={`M ${startX} ${startY} L ${endX} ${endY}`}
                          dur={`${2.5 + idx}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}
              </svg>

              {/* Central Node */}
              <div className="w-20 h-20 rounded-full gradient-gold-bg flex flex-col items-center justify-center font-bold text-stone-950 text-xs shadow-2xl shadow-amber-500/35 border-4 border-amber-300 z-10 text-center px-1 font-display animate-float select-none">
                <span className="font-bold text-[11px] uppercase tracking-wider block">Pusat</span>
                <span className="font-extrabold text-[12px] truncate w-full">{term.label}</span>
              </div>

              {/* Satellite Related Nodes */}
              {graphData && graphData.nodes.filter(n => !n.id.includes(term.id)).map((node, idx) => {
                const totalSatellites = graphData.nodes.filter(n => !n.isCenter).length;
                const angle = (idx * 2 * Math.PI) / totalSatellites;
                const radius = 120;
                
                const style = {
                  position: "absolute" as const,
                  left: `calc(50% + ${radius * Math.cos(angle)}px - 44px)`,
                  top: `calc(50% + ${radius * Math.sin(angle)}px - 44px)`,
                };

                const link = graphData.links.find(l => l.source === node.id || l.target === node.id);
                const relInfo = link ? getRelationColor(link.relation) : getRelationColor("");

                return (
                  <button
                    key={node.id}
                    onClick={() => router.push(`/term/${node.id}`)}
                    style={style}
                    className={`satellite-node w-22 h-22 rounded-2xl glass-card flex flex-col items-center justify-center text-center p-1.5 shadow-xl border cursor-pointer z-15 active:scale-90 select-none hover:z-30 hover:scale-105 ${relInfo.bg}`}
                    title={`Klik untuk melihat detail ${node.label}`}
                  >
                    <span className="text-[8px] uppercase tracking-widest font-extrabold opacity-80 block mb-0.5">
                      {relInfo.label}
                    </span>
                    <span className="font-bold text-[10px] text-stone-100 truncate w-full">
                      {node.label}
                    </span>
                    <span className="text-[7px] text-stone-500 font-semibold uppercase tracking-wider mt-0.5 block">
                      Klik Hubungkan
                    </span>
                  </button>
                );
              })}

            </div>

            {/* Guide Map */}
            <div className="pt-4 border-t border-stone-850 flex justify-between gap-1.5 flex-wrap text-[9px] text-stone-500">
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sinonim</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Antonim</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Turunan</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Bagian Dari</div>
              <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Terkait</div>
            </div>

          </div>
        </section>
      </div>

    </div>
  );
}
