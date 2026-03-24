"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deck, Card } from "@/lib/decks";
import { saveDeckToSupabase } from "@/lib/supabase-decks";
import { generatePTCards } from "@/app/actions/generate-cards";

export default function AICreatePage() {
  const router = useRouter();

  // State
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<"en-to-pt" | "pt-to-en">("en-to-pt"); // Default: English to PT
  const [isGenerating, setIsGenerating] = useState(false);
  const [cards, setCards] = useState<Card[]>([
    { pt: "", en: "", example_pt: "", example_en: "" },
  ]);

  // --- AI LOGIC ---
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

  // --- CARD LOGIC ---
  function updateCard(index: number, field: keyof Card, value: string) {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  }

  async function handleSave() {
    if (!title.trim()) return alert("Please name your deck.");
    const filteredCards = cards.filter((card) => card.pt.trim() && card.en.trim());
    
    const newDeck: Deck = {
      id: title.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      title,
      description: `AI Generated: ${mode === "en-to-pt" ? "EN to PT" : "PT to EN"}`,
      cards: filteredCards,
    };

    try {
      await saveDeckToSupabase(newDeck);
      alert("Deck saved successfully!");
      router.push("/decks");
    } catch (error) {
      alert("Error saving to database.");
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-8 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">AI Flashcard Builder</h1>
          <Link href="/" className="text-blue-600 font-medium hover:underline">Back Home</Link>
        </div>

        {/* AI GENERATOR BOX (ENGLISH UI) */}
        <div className="mb-8 rounded-2xl bg-purple-600 p-8 shadow-xl text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">✨ Magic Generator</h2>
              <p className="text-purple-100 text-sm">Powered by Mistral & Gemini</p>
            </div>
            
            {/* MODE TOGGLE */}
            <div className="flex bg-purple-800 p-1 rounded-xl border border-purple-400">
              <button 
                onClick={() => setMode("en-to-pt")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "en-to-pt" ? "bg-white text-purple-700" : "text-purple-200"}`}
              >
                English ➔ PT
              </button>
              <button 
                onClick={() => setMode("pt-to-en")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === "pt-to-en" ? "bg-white text-purple-700" : "text-purple-200"}`}
              >
                PT ➔ English
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder={mode === "en-to-pt" ? "Enter English topic (e.g. Shopping)..." : "Introduza o tema em Português..."}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 rounded-xl p-4 text-black outline-none focus:ring-4 focus:ring-purple-300"
            />
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="rounded-xl bg-white px-8 py-4 font-bold text-purple-600 hover:bg-purple-50 disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Cards"}
            </button>
          </div>
        </div>

        {/* DECK SETTINGS (ENGLISH UI) */}
        <div className="mb-8">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">Deck Title</label>
          <input
            type="text"
            placeholder="e.g. My Lisbon Trip"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white p-4 text-xl font-semibold outline-none focus:border-blue-500"
          />
        </div>

        {/* CARD LIST */}
        <div className="space-y-6">
          {cards.map((card, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-[10px] font-bold text-purple-600 uppercase">Portuguese (PT-PT)</label>
                  <input 
                    value={card.pt} 
                    onChange={(e) => updateCard(i, "pt", e.target.value)} 
                    className="w-full border-b-2 p-2 outline-none focus:border-purple-500" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-600 uppercase">English</label>
                  <input 
                    value={card.en} 
                    onChange={(e) => updateCard(i, "en", e.target.value)} 
                    className="w-full border-b-2 p-2 outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button onClick={handleSave} className="mt-10 w-full rounded-xl bg-blue-600 py-5 text-xl font-bold text-white hover:bg-blue-700 shadow-lg transition-transform active:scale-95">
          Save Deck to Library
        </button>
      </div>
    </main>
  );
}