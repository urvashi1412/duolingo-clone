"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("duo-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("duo-theme", next ? "dark" : "light");
  };

  if (!mounted) {
    return (
      <div className="duo-card flex items-center justify-between px-4 py-4 font-bold text-duo-feather">
        Dark mode
        <span className="text-xs uppercase text-duo-gray-dark">…</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="duo-card flex w-full items-center justify-between px-4 py-4 font-bold text-duo-feather hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      Dark mode
      <span
        className={`relative h-8 w-14 rounded-full border-2 border-duo-gray-dark transition ${
          dark ? "bg-duo-blue" : "bg-duo-gray"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            dark ? "left-7" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
