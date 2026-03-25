"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  // Hide the Navbar on the Home page to keep the landing clean
  if (pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        
        {/* LOGO / HOME LINK */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <span className="text-2xl group-hover:rotate-12 transition-transform">🇵🇹</span>
          <span className="text-xl font-black text-gray-900 tracking-tighter">
            Lisbon <span className="text-purple-600">Lingo</span>
          </span>
        </Link>

        {/* NEW GROUPED NAV LINKS */}
        <div className="flex items-center gap-8">
          {/* 1. Library Link */}
          <Link 
            href="/decks" 
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              pathname.startsWith("/decks") ? "text-purple-600" : "text-gray-400 hover:text-gray-900"
            }`}
          >
            Library
          </Link>

          {/* 2. AI PDF Import (Text Link Style) */}
          <Link 
            href="/upload" 
            className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
              pathname === "/upload" ? "text-purple-600" : "text-gray-400 hover:text-gray-900"
            }`}
          >
            AI PDF Import ✨
          </Link>

          {/* 3. New Manual Deck (Button Style) */}
          <Link 
            href="/create" 
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-purple-100 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all"
          >
            + New Deck
          </Link>
        </div>
      </div>
    </nav>
  );
}