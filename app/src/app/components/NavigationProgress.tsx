"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* ─────────────────────────────────────────────
   Inner component (needs Suspense boundary
   because useSearchParams is inside)
───────────────────────────────────────────── */
function ProgressInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevKey = useRef(pathname + searchParams.toString());

  /* When pathname/searchParams change → navigation completed */
  useEffect(() => {
    const currentKey = pathname + searchParams.toString();
    if (currentKey !== prevKey.current) {
      prevKey.current = currentKey;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setWidth(100);
      const t = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 380);
      return () => clearTimeout(t);
    }
  }, [pathname, searchParams]);

  /* Intercept any anchor click → start fake progress */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href") ?? "";
      /* Skip external links, hash links, mailto, etc. */
      if (!href || href.startsWith("http") || href.startsWith("#") || href.startsWith("mailto:")) return;

      setVisible(true);
      setWidth(12);

      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setWidth((prev) => {
          if (prev >= 82) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 82;
          }
          /* Decelerate naturally as it approaches 82 */
          return prev + Math.random() * Math.max(1, (82 - prev) * 0.18);
        });
      }, 220);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
      style={{
        width: `${width}%`,
        opacity: visible ? 1 : 0,
        background: "linear-gradient(90deg, #b45309, #d97706, #f59e0b, #fcd34d)",
        boxShadow: "0 0 10px 1px rgba(245,158,11,0.55)",
        transition: width === 100
          ? "width 0.32s ease-out, opacity 0.38s ease-out 0.32s"
          : "width 0.22s linear, opacity 0.2s ease",
      }}
    />
  );
}

/* Public export — wraps with Suspense */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressInner />
    </Suspense>
  );
}
