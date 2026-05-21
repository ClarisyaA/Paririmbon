"use client";

import { useTheme } from "../theme-provider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      title={isDark ? "Mode Terang" : "Mode Gelap"}
      className={`
        relative w-14 h-7 rounded-full border transition-all duration-300 cursor-pointer
        flex items-center overflow-hidden shrink-0
        ${isDark
          ? "bg-stone-800/80 border-stone-700/60 hover:border-amber-500/40"
          : "bg-amber-100/80 border-amber-300/60 hover:border-amber-500/60"}
      `}
    >
      {/* Sliding thumb */}
      <span
        className={`
          absolute w-5 h-5 rounded-full flex items-center justify-center shadow-md
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
          ${isDark
            ? "left-1 bg-stone-600 text-amber-400"
            : "left-8 gradient-gold-bg text-stone-950"}
        `}
      >
        {isDark
          ? <Moon className="w-2.5 h-2.5" />
          : <Sun className="w-2.5 h-2.5" />}
      </span>

      {/* Background icons hint */}
      <Sun
        className={`absolute left-8 w-2.5 h-2.5 transition-opacity duration-200
          ${isDark ? "opacity-20 text-stone-500" : "opacity-0"}`}
      />
      <Moon
        className={`absolute left-1.5 w-2.5 h-2.5 transition-opacity duration-200
          ${isDark ? "opacity-0" : "opacity-25 text-stone-600"}`}
      />
    </button>
  );
}
