"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr"; // Use client directly for reliability
import { generatePTCards } from "@/app/actions/generate-cards";

export default function AICreatePage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"en-to-pt" | "pt-to-en">("en-to-pt");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [cards, setCards] = useState<any[]>([
    { pt: "", en: "", example_pt: "", example_en: "" },
  ]);

  async function handleAIGenerate() {
    if (!topic.trim()) return alert("Please enter a topic!");
    setIsGenerating(true);
    try {
      const result = await generatePTCards(topic, mode);
      if (result.success && result.data) {
        setCards(result.data || []);
        if (!title) setTitle(topic);
      } else {
        alert("AI Error: " + (result.error || "Generation failed."));
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateCard(index: number, field: string, value: string) {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  }

  // --- FIXED SAVE LOGIC ---
  async function handleSave() {
    if (!title.trim()) return alert("Please name your deck.");
    const filteredCards = cards.filter((card) => card.pt.trim() && card.en.trim());
    if (filteredCards.length === 0) return alert("Add at least one complete card.");

    setIsSaving(true);

    try {
      // 1. Save the Deck Title first
      const { data: deck, error: deckError } = await supabase
        .from("decks")
        .insert([{ name: title }])
        .select()
        .single();

      if (deckError) throw deckError;

      // 2. Save all cards linked to that new Deck ID
      const cardsToInsert = filteredCards.map((card) => ({
        deck_id: deck.id,
        pt: card.pt,
        en: card.en,
        example_pt: card.example_pt || "",
        example_en: card.example_en || ""
      }));

      const { error: cardsError } = await supabase.from("cards").insert(cardsToInsert);
      
      if (cardsError) throw cardsError;

      alert("Deck saved to your library! ✅");
      router.push("/decks");
      router.refresh();
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving to database. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">AI Deck Builder</h1>
          {/* UPDATED: Points to /decks */}
          <Link href="/decks" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-500 border border-gray-200 hover:text-purple-600 shadow-sm transition-all">
            ← Back to Decks
          </Link>
        </div>

        {/* AI GENERATOR BOX */}
        <div className="mb-8 rounded-[2.5rem] bg-purple-600 p-8 shadow-2xl text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">✨ Magic Generator</h2>
              <p className="text-purple-100 text-sm">European Portuguese Specialist</p>
            </div>
            
            <div className="flex bg-purple-800/50 p-1 rounded-xl border border-purple-400/30">
              <button onClick={() => setMode("en-to-pt")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "en-to-pt" ? "bg-white text-purple-700" : "text-purple-200"}`}>
                English ➔ PT
              </button>
              <button onClick={() => setMode("pt-to-en")} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "pt-to-en" ? "bg-white text-purple-700" : "text-purple-200"}`}>
                PT ➔ English
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder={mode === "en-to-pt" ? "Enter topic (e.g. Dining Out)..." : "Introduza o tema..."}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 rounded-2xl p-4 text-black outline-none !text-black"
              style={{ color: 'black' }}
            />
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="rounded-2xl bg-white px-8 py-4 font-black text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50"
            >
              {isGenerating ? "Magic in progress..." : "Generate Cards"}
            </button>
          </div>
        </div>

        {/* SETTINGS */}
        <div className="mb-8">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Deck Title</label>
          <input
            type="text"
            placeholder="e.g. Trip to Porto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-2xl border-2 border-transparent bg-white p-5 text-xl font-bold shadow-sm focus:border-purple-200 outline-none !text-black"
            style={{ color: 'black' }}
          />
        </div>

        {/* CARD LIST */}
        <div className="space-y-4">
          {cards.map((card, i) => (
            <div key={i} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="text-[9px] font-black text-purple-600 uppercase tracking-tighter">Português (PT-PT)</label>
                <input 
                  value={card.pt} 
                  onChange={(e) => updateCard(i, "pt", e.target.value)} 
                  className="w-full border-b-2 border-gray-50 py-2 text-lg font-bold outline-none focus:border-purple-500 !text-black"
                  style={{ color: 'black' }}
                />
              </div>
              <div className="flex-1">
                <label className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">English</label>
                <input 
                  value={card.en} 
                  onChange={(e) => updateCard(i, "en", e.target.value)} 
                  className="w-full border-b-2 border-gray-50 py-2 text-lg font-bold outline-none focus:border-blue-500 !text-black"
                  style={{ color: 'black' }}
                />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="mt-12 w-full rounded-[2rem] bg-gray-900 py-6 text-xl font-black text-white hover:bg-black shadow-2xl transition-all active:scale-95 disabled:bg-gray-400"
        >
          {isSaving ? "Saving to Library..." : "Save Deck to Library"}
        </button>
      </div>
    </main>
  );
}