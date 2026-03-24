"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  // Hide the Navbar on the Home page to keep the landing clean
  if (pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        {/* LOGO / HOME LINK */}
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
          <span className="text-2xl group-hover:rotate-12 transition-transform">🇵🇹</span>
          <span className="text-xl font-black text-gray-900 tracking-tighter">
            Lisbon <span className="text-purple-600">Lingo</span>
          </span>
        </Link>

        {/* NAV LINKS */}
        <div className="flex items-center gap-6">
          <Link 
            href="/decks" 
            className={`text-xs font-black uppercase tracking-widest transition-colors ${
              pathname === "/decks" ? "text-purple-600" : "text-gray-400 hover:text-gray-900"
            }`}
          >
            Library
          </Link>
          <Link 
            href="/upload" 
            className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-purple-700 transition-all"
          >
            + New Deck
          </Link>
        </div>
      </div>
    </nav>
  );
}