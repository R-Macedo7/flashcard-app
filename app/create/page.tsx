"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function CreateDeckPage() {
  const router = useRouter();
  
  // Initialize Supabase Client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [cards, setCards] = useState([
    { pt: "", en: "", example_pt: "", example_en: "" },
  ]);

  function addCard() {
    setCards([...cards, { pt: "", en: "", example_pt: "", example_en: "" }]);
  }

  function removeCard(index: number) {
    setCards(cards.filter((_, i) => i !== index));
  }

  function updateCard(index: number, field: string, value: string) {
    const updatedCards = [...cards];
    (updatedCards[index] as any)[field] = value;
    setCards(updatedCards);
  }

  async function handleSave() {
    if (!title.trim()) {
      alert("Please enter a deck title.");
      return;
    }

    const filteredCards = cards.filter(
      (card) => card.pt.trim() && card.en.trim()
    );

    if (filteredCards.length === 0) {
      alert("Please add at least one card with Portuguese and English text.");
      return;
    }

    setIsSaving(true);

    try {
      // 1. Insert the Deck and get the generated ID back
      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert([{ name: title, description: "Custom user-created deck" }])
        .select()
        .single();

      if (deckError) throw deckError;

      // 2. Prepare the Cards with the new deck_id
      const cardsToInsert = filteredCards.map((card) => ({
        deck_id: deck.id,
        pt: card.pt,
        en: card.en,
        example_pt: card.example_pt || "",
        example_en: card.example_en || "",
      }));

      // 3. Insert the Cards
      const { error: cardsError } = await supabase
        .from("cards")
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;

      alert("Deck saved successfully! ✅");
      router.push("/decks");
      router.refresh();
    } catch (error: any) {
      console.error("Detailed Save Error:", error);
      alert(`Failed to save: ${error.message || "Unknown Error"}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create New Deck</h1>
          <Link href="/decks" className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
            Cancel
          </Link>
        </div>

        <div className="mb-10">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Deck Title</label>
          <input
            type="text"
            placeholder="e.g. Portuguese Slang"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[2rem] border-2 border-transparent bg-white p-6 text-2xl font-bold shadow-xl outline-none focus:border-purple-200 !text-black"
          />
        </div>

        <div className="space-y-6">
          {cards.map((card, i) => (
            <div key={i} className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-lg relative group">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-widest">Card #{i + 1}</span>
                {cards.length > 1 && (
                  <button onClick={() => removeCard(i)} className="text-xs font-bold text-red-300 hover:text-red-500 transition-colors">
                    Remove
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Portuguese</label>
                  <input
                    type="text"
                    value={card.pt}
                    onChange={(e) => updateCard(i, "pt", e.target.value)}
                    className="w-full border-b-2 border-gray-100 py-2 text-xl font-bold outline-none focus:border-purple-500 !text-black"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">English</label>
                  <input
                    type="text"
                    value={card.en}
                    onChange={(e) => updateCard(i, "en", e.target.value)}
                    className="w-full border-b-2 border-gray-100 py-2 text-xl font-bold outline-none focus:border-blue-500 !text-black"
                  />
                </div>
                <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-50 mt-2">
                   <input
                    type="text"
                    placeholder="Example Sentence (Portuguese)"
                    value={card.example_pt}
                    onChange={(e) => updateCard(i, "example_pt", e.target.value)}
                    className="w-full border-b border-gray-50 py-1 text-sm italic text-gray-600 outline-none focus:border-gray-200 !text-black"
                  />
                  <input
                    type="text"
                    placeholder="Example Translation (English)"
                    value={card.example_en}
                    onChange={(e) => updateCard(i, "example_en", e.target.value)}
                    className="w-full border-b border-gray-50 py-1 text-sm italic text-gray-600 outline-none focus:border-gray-200 !text-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 space-y-4">
          <button
            onClick={addCard}
            className="w-full rounded-[2rem] border-4 border-dashed border-gray-200 py-6 text-sm font-black uppercase tracking-[0.2em] text-gray-300 hover:border-purple-200 hover:text-purple-300 transition-all"
          >
            + Add Card
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-[2rem] bg-black py-6 text-xl font-black text-white shadow-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-400"
          >
            {isSaving ? "SAVING..." : "SAVE DECK"}
          </button>
        </div>
      </div>
    </main>
  );
}