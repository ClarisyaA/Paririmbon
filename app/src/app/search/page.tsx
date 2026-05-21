"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SearchX, AlertCircle, FileText, Compass, ArrowLeft, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  id: string;
  label: string;
  scriptTerm: string | null;
  definition: string | null;
  wordClass: string | null;
  manuscriptTitle: string | null;
}

// Simulated mock search results for offline mode
const MOCK_RESULTS: SearchResult[] = [
  {
    id: "sanghyang",
    label: "Sanghyang",
    scriptTerm: "ᮞᮀᮠᮡᮀ",
    definition: "Sebutan kehormatan untuk entitas suci, dewata, kekuatan gaib tertinggi, atau spiritualitas tinggi dalam kebudayaan Sunda Kuno.",
    wordClass: "SundaKunoTerm",
    manuscriptTitle: "Sanghyang Siksakanda Ng Karesian"
  },
  {
    id: "tapa",
    label: "Tapa",
    scriptTerm: "ᮒᮕ",
    definition: "Praktik asketisme, meditasi mendalam, atau pengekangan diri dari nafsu duniawi untuk mencapai kesadaran spiritual spiritual tinggi.",
    wordClass: "SundaKunoTerm",
    manuscriptTitle: "Amanat Galunggung (Kropak 632)"
  },
  {
    id: "raga",
    label: "Raga",
    scriptTerm: "ᮛᮌ",
    definition: "Badan kasar, jasmani manusia yang menjadi wadah bagi suksma (jiwa) dalam mengarungi kehidupan materiil di bumi.",
    wordClass: "SundaKunoTerm",
    manuscriptTitle: "Sanghyang Raga Dewata"
  },
  {
    id: "darma",
    label: "Darma",
    scriptTerm: "ᮓᮁᮙ",
    definition: "Kewajiban moral, kebajikan, hukum alam semesta, atau kebenaran sejati yang harus dijunjung oleh setiap insan.",
    wordClass: "SundaKunoTerm",
    manuscriptTitle: "Sewaka Darman"
  },
  {
    id: "kerta",
    label: "Kerta",
    scriptTerm: "ᮊᮨᮁᮒ",
    definition: "Keadaan damai, sejahtera, makmur, tenteram, atau ketertiban sosial yang dicapai melalui kepatuhan hukum adat.",
    wordClass: "SundaKunoTerm",
    manuscriptTitle: "Carita Parahyangan"
  },
  {
    id: "Manuscript_SanghyangSiksakandaNgKaresian",
    label: "Sanghyang Siksakanda Ng Karesian",
    scriptTerm: null,
    definition: "Naskah lontar Sunda Klasik bertarikh 1518 Masehi, memuat tuntunan moral, susunan kemasyarakatan, keagamaan, dan keterampilan hidup karesian.",
    wordClass: "Manuscript",
    manuscriptTitle: "Sanghyang Siksakanda Ng Karesian"
  },
  {
    id: "Manuscript_CaritaParahyangan",
    label: "Carita Parahyangan",
    scriptTerm: null,
    definition: "Naskah sejarah Sunda Kuno yang menceritakan silsilah raja-raja Sunda-Galuh mulai dari era Sanjaya hingga keruntuhan Pajajaran.",
    wordClass: "Manuscript",
    manuscriptTitle: "Carita Parahyangan"
  },
  {
    id: "Manuscript_SewakaDarman",
    label: "Sewaka Darman",
    scriptTerm: null,
    definition: "Naskah bercorak keagamaan Buddha-Sunda kuno yang berisi ajaran kebaktian (sewaka) dan pengabdian hidup keagamaan.",
    wordClass: "Manuscript",
    manuscriptTitle: "Sewaka Darman"
  }
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") ?? "";
  const classParam = searchParams.get("class") ?? "";

  const [searchQuery, setSearchQuery] = useState(queryParam === "*" ? "" : queryParam);
  const [selectedClass, setSelectedClass] = useState(classParam);
  const pageNum = Number(searchParams.get("page") ?? "1");
  const lim = searchParams.get("limit") ?? "10";
  const [currentPage, setCurrentPage] = useState(pageNum);
  const [selectedLimit, setSelectedLimit] = useState(lim);

  // Sync state with URL params
  useEffect(() => {
    setSearchQuery(queryParam === "*" ? "" : queryParam);
    setSelectedClass(classParam);
    setCurrentPage(pageNum);
    setSelectedLimit(lim);
  }, [queryParam, classParam, pageNum, lim]);

  const { data: searchData, error: searchError, isLoading } = useQuery({
    queryKey: ["search", queryParam, classParam, pageNum, lim],
    queryFn: async () => {
      const limitVal = lim === "all" ? -1 : Number(lim);
      const offsetVal = (pageNum - 1) * (limitVal === -1 ? 0 : limitVal);

      try {
        const url = `/api/search?q=${encodeURIComponent(queryParam)}` +
                    `${classParam ? `&class=${encodeURIComponent(classParam)}` : ""}` +
                    `&limit=${lim}` +
                    `&offset=${offsetVal}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fuseki server error");
        const json = await res.json();
        
        if (json.results) {
          return {
            results: json.results as SearchResult[],
            total: json.total ?? json.results.length,
            isOffline: false,
          };
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        console.warn("Search API failed, falling back to mock search:", err);
        let baseList = MOCK_RESULTS;
        if (classParam === "SundaKunoTerm") {
          baseList = MOCK_RESULTS.filter((item) => item.wordClass !== "Manuscript");
        } else if (classParam === "Manuscript") {
          baseList = MOCK_RESULTS.filter((item) => item.wordClass === "Manuscript");
        }

        let matches = [];
        if (queryParam === "*") {
          matches = baseList;
        } else {
          const regex = new RegExp(queryParam.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
          matches = baseList.filter(
            (item) =>
              regex.test(item.label) ||
              (item.definition && regex.test(item.definition)) ||
              (item.manuscriptTitle && regex.test(item.manuscriptTitle))
          );
        }

        const limitVal = lim === "all" ? -1 : Number(lim);
        const offsetVal = (pageNum - 1) * (limitVal === -1 ? 0 : limitVal);
        const sliced = limitVal === -1 ? matches : matches.slice(offsetVal, offsetVal + limitVal);

        return {
          results: sliced,
          total: matches.length,
          isOffline: true,
        };
      }
    },
    enabled: !!queryParam,
    retry: false,
  });

  const results = searchData?.results ?? [];
  const total = searchData?.total ?? 0;
  const isOffline = searchData?.isOffline ?? false;
  const loading = isLoading && !!queryParam;
  const error = searchError ? (searchError instanceof Error ? searchError.message : "Pencarian gagal") : null;

  const limitVal = selectedLimit === "all" ? -1 : Number(selectedLimit);
  const totalPages = limitVal === -1 ? 1 : Math.ceil(total / limitVal);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const queryToSubmit = searchQuery.trim() === "" ? "*" : searchQuery.trim();
    updateURL(queryToSubmit, selectedClass, 1, selectedLimit);
  };

  const handleFilterClass = (cls: string) => {
    setSelectedClass(cls);
    const queryToSubmit = searchQuery.trim() === "" ? "*" : searchQuery.trim();
    updateURL(queryToSubmit, cls, 1, selectedLimit);
  };

  const handleLimitChange = (lim: string) => {
    setSelectedLimit(lim);
    const queryToSubmit = searchQuery.trim() === "" ? "*" : searchQuery.trim();
    updateURL(queryToSubmit, selectedClass, 1, lim);
  };

  const handlePageChange = (pageNum: number) => {
    setCurrentPage(pageNum);
    const queryToSubmit = searchQuery.trim() === "" ? "*" : searchQuery.trim();
    updateURL(queryToSubmit, selectedClass, pageNum, selectedLimit);
  };

  const updateURL = (q: string, cls: string, pageNum: number, lim: string) => {
    const params = new URLSearchParams();
    if (q.trim()) {
      params.set("q", q.trim());
    } else {
      params.set("q", "*");
    }
    if (cls) params.set("class", cls);
    if (pageNum > 1) params.set("page", String(pageNum));
    if (lim !== "10") params.set("limit", lim);
    router.push(`/search?${params.toString()}`);
  };

  // Highlighting function
  const highlightText = (text: string | null, search: string) => {
    if (!text) return "";
    if (!search.trim() || search === "*") return text;
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-amber-500/35 text-amber-200 px-1 py-0.5 rounded font-medium border border-amber-500/20">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-stone-100 font-bold text-base tracking-wide font-display mb-3">Filter Kategori</h3>
        <div className="flex flex-col gap-2">
          {[
            { value: "", label: "Semua Kelas" },
            { value: "SundaKunoTerm", label: "Kosakata (Term)" },
            { value: "Manuscript", label: "Naskah (Manuscript)" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterClass(value)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                selectedClass === value
                  ? "gradient-gold-bg text-stone-950 font-bold shadow-lg shadow-amber-700/20"
                  : "text-stone-400 bg-stone-900/40 hover:bg-stone-900 hover:text-stone-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 leading-relaxed space-y-2">
        <h4 className="font-semibold text-stone-400 uppercase tracking-widest">Informasi</h4>
        <p>Pencarian menggunakan regex memindai properti <code>rdfs:label</code> dan <code>pari:definition</code> pada repositori RDF.</p>
        {isOffline && (
          <p className="text-amber-500 font-semibold bg-amber-500/5 p-2 rounded border border-amber-500/10 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>Menampilkan hasil simulasi karena server Apache Jena Fuseki tidak terjangkau.</span>
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">

      {/* Mobile Filter Category Selector */}
      <div className="lg:hidden mb-5 space-y-2">
        <span className="text-[10px] text-stone-500 uppercase font-semibold tracking-wider block">
          Filter Kategori:
        </span>
        <div className="flex bg-stone-900/60 rounded-xl p-1 border border-stone-800/80">
          {[
            { value: "", label: "Semua" },
            { value: "SundaKunoTerm", label: "Kosakata" },
            { value: "Manuscript", label: "Naskah" },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterClass(value)}
              type="button"
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition text-center select-none cursor-pointer ${
                selectedClass === value
                  ? "gradient-gold-bg text-stone-950 shadow-md shadow-amber-500/10"
                  : "text-stone-400 hover:text-stone-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block space-y-6 lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl space-y-6 sticky top-28">
            {filterContent}
          </div>
        </aside>

        {/* Main Results Column */}
        <section className="lg:col-span-3 space-y-6 md:space-y-8">
          {/* Top Search Bar */}
          <form onSubmit={handleSearchSubmit} className="glass-card p-2 rounded-2xl flex gap-2">
            <div className="flex-grow flex items-center px-3 md:px-4 gap-2">
              <Search className="w-4 h-4 md:w-5 md:h-5 text-stone-500 shrink-0" />
              <input
                type="text"
                placeholder="Ketik kosakata Sunda Kuno atau makna kata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 md:py-3 bg-transparent text-stone-100 placeholder-stone-500 focus:outline-none text-sm md:text-base"
              />
            </div>
            <button
              type="submit"
              className="gradient-gold-bg hover:opacity-90 active:scale-95 text-stone-950 font-bold px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition duration-200 text-xs md:text-sm whitespace-nowrap cursor-pointer shadow-lg shadow-amber-700/20"
            >
              Cari
            </button>
          </form>

          {/* Offline Banner */}
          {isOffline && (
            <div className="glass-card p-4 rounded-xl border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase tracking-wider text-[10px] text-amber-300 mb-0.5">Mode Offline / Simulasi</p>
                <p className="leading-relaxed">Menampilkan hasil pencarian simulasi karena repositori RDF Apache Jena Fuseki tidak terjangkau.</p>
              </div>
            </div>
          )}

          {/* Results Metadata */}
          {queryParam && !loading && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
              <p>
                Ditemukan <span className="text-amber-400 font-bold">{total}</span> hasil untuk &quot;<span className="text-stone-200 italic font-medium">{queryParam === "*" ? "Semua" : queryParam}</span>&quot;
              </p>
              
              {total > 0 && (
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 uppercase font-semibold tracking-wider">Tampilkan:</span>
                    <div className="flex bg-stone-900/60 rounded-lg p-0.5 border border-stone-800">
                      {["5", "10", "20", "50", "all"].map((l) => (
                        <button
                          key={l}
                          onClick={() => handleLimitChange(l)}
                          type="button"
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition select-none cursor-pointer ${
                            selectedLimit === l
                              ? "gradient-gold-bg text-stone-950 font-bold"
                              : "text-stone-400 hover:text-stone-200"
                          }`}
                        >
                          {l === "all" ? "Semua" : l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-500 tracking-wider uppercase font-semibold">Urut abjad</span>
                </div>
              )}
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="glass-card p-4 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Results State */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="glass-card p-5 md:p-6 rounded-2xl animate-pulse space-y-4">
                  <div className="h-6 bg-stone-850 rounded w-1/3" />
                  <div className="h-4 bg-stone-850 rounded w-full" />
                  <div className="h-4 bg-stone-850 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="space-y-4">
                {results.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card p-5 md:p-6 rounded-2xl flex flex-col gap-4 md:gap-6 hover:border-amber-500/30 group transition duration-300"
                  >
                    <div className="space-y-3 flex-grow">
                      {/* Class Badge & Manuscript Info */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold text-[10px] uppercase tracking-wider">
                          {item.wordClass === "Manuscript" ? "Naskah" : "Kosakata"}
                        </span>
                        {item.manuscriptTitle && (
                          <span className="text-stone-500 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <span className="italic line-clamp-1">{item.manuscriptTitle}</span>
                          </span>
                        )}
                      </div>

                      {/* Label */}
                      <h3 className="text-xl md:text-2xl font-bold text-stone-100 font-display group-hover:text-amber-400 transition-colors">
                        {highlightText(item.label, queryParam)}
                      </h3>

                      {/* Definition */}
                      <p className="text-stone-400 text-sm leading-relaxed">
                        {highlightText(item.definition, queryParam)}
                      </p>
                    </div>

                    {/* Script and Exploration Link */}
                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800/60">
                      {item.scriptTerm ? (
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-semibold tracking-wider block mb-1">Aksara Sunda</span>
                          <span className="font-sundanese text-lg md:text-xl text-amber-500 tracking-wider bg-stone-900/60 px-3 py-1.5 rounded-lg border border-stone-800/80 block select-none">
                            {item.scriptTerm}
                          </span>
                        </div>
                      ) : <div />}

                      <Link
                        href={`/term/${encodeURIComponent(item.id)}`}
                        className="gradient-gold-bg text-stone-950 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-800/10 hover:shadow-amber-500/20 transition-all select-none hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                      >
                        <span>Jelajahi</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {selectedLimit !== "all" && totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-stone-900">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    type="button"
                    className={`px-3 md:px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                      currentPage === 1
                        ? "text-stone-600 bg-stone-900/10 cursor-not-allowed border border-stone-900/20"
                        : "text-stone-300 bg-stone-900/40 hover:bg-stone-900 hover:text-amber-400 border border-stone-800"
                    }`}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1.5">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pn = idx + 1;
                      if (totalPages > 7) {
                        if (pn !== 1 && pn !== totalPages && Math.abs(currentPage - pn) > 2) {
                          if (pn === 2 || pn === totalPages - 1) {
                            return <span key={pn} className="text-stone-600 px-1 text-xs select-none">...</span>;
                          }
                          return null;
                        }
                      }
                      return (
                        <button
                          key={pn}
                          onClick={() => handlePageChange(pn)}
                          type="button"
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                            currentPage === pn
                              ? "gradient-gold-bg text-stone-950"
                              : "text-stone-400 bg-stone-900/20 hover:bg-stone-900/60 hover:text-stone-200 border border-stone-850"
                          }`}
                        >
                          {pn}
                        </button>
                      );
                    })}
                  </div>

                  <div className="sm:hidden text-xs text-stone-500 font-medium">
                    Hal {currentPage} dari {totalPages}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    type="button"
                    className={`px-3 md:px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                      currentPage === totalPages
                        ? "text-stone-600 bg-stone-900/10 cursor-not-allowed border border-stone-900/20"
                        : "text-stone-300 bg-stone-900/40 hover:bg-stone-900 hover:text-amber-400 border border-stone-800"
                    }`}
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : queryParam ? (
            <div className="glass-card p-8 md:p-12 rounded-2xl text-center space-y-4">
              <SearchX className="w-10 md:w-12 h-10 md:h-12 text-stone-500 mx-auto" />
              <h3 className="text-lg md:text-xl font-bold text-stone-200 font-display">Kosakata Tidak Ditemukan</h3>
              <p className="text-stone-400 text-sm max-w-sm mx-auto">
                Tidak ditemukan kosakata yang cocok dengan kata kunci &quot;<span className="text-stone-200">{queryParam === "*" ? "Semua" : queryParam}</span>&quot;.
              </p>
            </div>
          ) : (
            <div className="glass-card p-8 md:p-12 rounded-2xl text-center space-y-4">
              <Compass className="w-10 md:w-12 h-10 md:h-12 text-amber-500/70 mx-auto animate-pulse" />
              <h3 className="text-lg md:text-xl font-bold text-stone-200 font-display">Mulai Penelusuran Semantik</h3>
              <p className="text-stone-400 text-sm max-w-sm mx-auto">
                Ketikkan kata kunci di atas untuk mencari istilah dalam naskah kuno Sunda. Contoh: <strong className="text-amber-500">sanghyang</strong>, <strong className="text-amber-500">tapa</strong>, atau <strong className="text-amber-500">raga</strong>.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-stone-400">
        Memuat mesin pencari...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
