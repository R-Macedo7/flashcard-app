"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  cards: { count: number }[];
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

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

  // --- DELETE FUNCTION ---
  async function deleteDeck(id: string) {
    if (!window.confirm("Delete this deck and all its cards forever?")) return;

    const { error } = await supabase.from("decks").delete().eq("id", id);
    
    if (error) {
      alert("Error: Make sure you ran the SQL Cascade script in Supabase!");
    } else {
      setDecks(decks.filter(d => d.id !== id));
    }
  }

  // --- EDIT FUNCTIONS ---
  function startEditing(deck: Deck) {
    setEditingId(deck.id);
    setEditName(deck.name);
  }

  async function saveName(id: string) {
    const { error } = await supabase
      .from("decks")
      .update({ name: editName })
      .eq("id", id);

    if (!error) {
      setDecks(decks.map(d => d.id === id ? { ...d, name: editName } : d));
      setEditingId(null);
    }
  }

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black text-gray-900">Your Library</h1>
          <Link href="/upload" className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-purple-700 transition-all">
            + New AI Deck
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {decks.map((deck) => (
            <div key={deck.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div>
                {editingId === deck.id ? (
                  <div className="flex gap-2 mb-4">
                    <input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border-2 border-purple-200 rounded-xl px-4 py-2 w-full font-bold outline-none"
                      autoFocus
                    />
                    <button onClick={() => saveName(deck.id)} className="bg-green-500 text-white px-4 rounded-xl font-bold">Save</button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-black text-gray-800 mb-2">{deck.name}</h2>
                )}
                <p className="text-gray-400 text-sm mb-6">{deck.cards?.[0]?.count || 0} vocabulary cards</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link href={`/decks/${deck.id}`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Study</Link>
                <Link href={`/quiz/${deck.id}`} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Quiz</Link>
                
                <div className="flex-1" /> {/* Spacer */}
                
                <button 
                  onClick={() => startEditing(deck)}
                  className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-200"
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteDeck(deck.id)}
                  className="bg-red-50 text-red-400 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}