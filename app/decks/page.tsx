"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  cards: { count: number }[];
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function loadDecks() {
    const { data, error } = await supabase
      .from("decks")
      .select(`id, name, description, cards(count)`)
      .order("created_at", { ascending: false });

    if (!error && data) setDecks(data as any);
    setLoading(false);
  }

  useEffect(() => { loadDecks(); }, []);

  async function deleteDeck(id: string) {
    if (!window.confirm("Delete this deck forever?")) return;
  
    try {
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", id);
  
      if (error) throw error;
  
      setDecks((currentDecks) => currentDecks.filter((d) => d.id !== id));
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting deck.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-black text-gray-300 uppercase tracking-widest animate-pulse">Carregando Biblioteca...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER SECTION - Cleaned up (No buttons here anymore) */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight mb-2">My Library</h1>
          <p className="text-gray-500 font-medium italic">Your personalized collection of Portuguese vocabulary</p>
        </div>

        {/* DECKS GRID */}
        {decks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold mb-4">You haven't created any decks yet.</p>
            <Link href="/create" className="text-purple-600 font-black uppercase tracking-widest text-sm hover:underline">Start Creating ✨</Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <div key={deck.id} className="group bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-50 hover:shadow-2xl transition-all flex flex-col justify-between relative overflow-hidden">
                
                {/* DECK INFO */}
                <div className="mb-8">
                  <div className="flex justify-between items-start mb-4">
                     <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                       {deck.cards?.[0]?.count || 0} Cards
                     </span>
                     
                     {/* TEXT-BASED ACTION BUTTONS */}
                     <div className="flex gap-4">
                        <Link 
                          href={`/decks/${deck.id}/edit`} 
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          Edit
                        </Link>
                        <button 
                          onClick={() => deleteDeck(deck.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Delete
                        </button>
                     </div>
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 leading-tight mb-2 group-hover:text-purple-600 transition-colors">
                    {deck.name}
                  </h2>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-3">
                  <Link 
                    href={`/decks/${deck.id}`} 
                    className="flex items-center justify-center bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200"
                  >
                    Study
                  </Link>
                  <Link 
                    href={`/quiz/${deck.id}`} 
                    className="flex items-center justify-center bg-purple-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-100"
                  >
                    Quiz
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}