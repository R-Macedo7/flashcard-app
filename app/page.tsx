"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12 flex items-center justify-center">
      <div className="mx-auto max-w-2xl w-full rounded-[3rem] bg-white p-12 shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="mb-2 text-6xl font-black text-gray-900 tracking-tighter">
            Lisbon Lingo <span className="text-4xl">🇵🇹</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium">
            Master European Portuguese with AI-powered tools.
          </p>
        </div>

        <div className="grid gap-4">
          {/* VERB EXPLORER (The one we just finished!) */}
          <Link
            href="/verbs"
            className="group flex items-center justify-between rounded-3xl border-2 border-amber-100 bg-amber-50 px-8 py-6 transition-all hover:border-amber-400 hover:bg-white hover:shadow-xl"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black text-amber-900">Verb Explorer</span>
              <span className="text-sm text-amber-600 font-medium italic">500+ Conjugations with Audio</span>
            </div>
            <span className="text-4xl group-hover:scale-110 transition-transform">🗣️</span>
          </Link>

          {/* PDF TO DECK */}
          <Link
            href="/upload"
            className="group flex items-center justify-between rounded-3xl border-2 border-purple-100 bg-purple-50 px-8 py-6 transition-all hover:border-purple-400 hover:bg-white hover:shadow-xl"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black text-purple-900">PDF to Flashcards</span>
              <span className="text-sm text-purple-600 font-medium italic">Upload lesson PDFs or notes</span>
            </div>
            <span className="text-4xl group-hover:rotate-12 transition-transform">📄</span>
          </Link>

          {/* AI TRANSLATOR */}
          <Link
            href="/translator"
            className="group flex items-center justify-between rounded-3xl border-2 border-blue-100 bg-blue-50 px-8 py-6 transition-all hover:border-blue-400 hover:bg-white hover:shadow-xl"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black text-blue-900">AI Translator</span>
              <span className="text-sm text-blue-600 font-medium italic">PT-PT Grammar Specialist</span>
            </div>
            <span className="text-4xl group-hover:scale-110 transition-transform">🔄</span>
          </Link>

          {/* LIBRARY */}
          <Link
            href="/decks"
            className="group flex items-center justify-between rounded-3xl border-2 border-emerald-100 bg-emerald-50 px-8 py-6 transition-all hover:border-emerald-400 hover:bg-white hover:shadow-xl"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-black text-emerald-900">My Library</span>
              <span className="text-sm text-emerald-600 font-medium italic">Study & Quiz your saved decks</span>
            </div>
            <span className="text-4xl group-hover:-translate-y-1 transition-transform">📚</span>
          </Link>
          
          <div className="h-px bg-gray-100 my-4" />

          {/* SECONDARY OPTIONS */}
          <div className="grid grid-cols-3 gap-4">
             <Link
                href="/create"
                className="text-center py-4 rounded-2xl bg-gray-50 text-[10px] font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-100"
              >
                + Manual Deck
              </Link>
              <Link
                href="/ai-create"
                className="text-center py-4 rounded-2xl bg-gray-50 text-[10px] font-bold text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all border border-gray-100"
              >
                ✨ Prompt Gen
              </Link>
              <Link
                href="/quiz"
                className="text-center py-4 rounded-2xl bg-gray-50 text-[10px] font-bold text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all border border-gray-100"
              >
                📝 Quiz Mode
              </Link>
          </div>
        </div>

        <footer className="mt-12 text-center text-[10px] uppercase tracking-[0.3em] text-gray-300 font-black">
          PT-PT ENGINE: Mistral Large 2 & Groq
        </footer>
      </div>
    </main>
  );
}