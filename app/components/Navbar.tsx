"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Verbs", href: "/verbs", icon: "🗣️" },
    { name: "Translator", href: "/translator" },
    { name: "Decks", href: "/decks" },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-black text-xl tracking-tighter flex items-center gap-2">
          <span className="text-2xl">🇵🇹</span>
          <div className="hidden sm:flex items-center">
            {/* GREEN FOR PORTUGAL FLAG */}
            <span className="text-emerald-600">Lisbon</span>
            {/* RED FOR PORTUGAL FLAG */}
            <span className="text-red-600 ml-1">Lingo</span>
          </div>
        </Link>

        <div className="flex items-center gap-1 sm:gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? "bg-amber-50 text-amber-600" 
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.icon && <span className="mr-1.5">{link.icon}</span>}
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};