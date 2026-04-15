"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [cards, setCards] = useState<any[]>([]);
  const [deckName, setDeckName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for tracking selected cards by their index
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadDeckData() {
      if (!id) return;
      setLoading(true);
      
      const { data: deckData } = await supabase.from("decks").select("name").eq("id", id).single();
      const { data: cardData } = await supabase.from("cards").select("*").eq("deck_id", id).order('created_at', { ascending: true });

      if (deckData) setDeckName(deckData.name);
      if (cardData) setCards(cardData || []);
      setLoading(false);
    }
    loadDeckData();
  }, [id, supabase]);

  const updateCard = (index: number, field: string, value: string) => {
    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setCards(updatedCards);
  };

  const addCard = () => {
    setCards([...cards, { pt: "", en: "", example_pt: "", example_en: "", deck_id: id }]);
  };

  // Toggle selection for a single card
  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedIndices(newSet);
  };

  // Delete multiple selected cards
  const deleteSelected = async () => {
    if (selectedIndices.size === 0) return;

    const cardsToDeleteFromDB = Array.from(selectedIndices)
      .map(index => cards[index])
      .filter(card => card && card.id);

    const idsToDelete = cardsToDeleteFromDB.map(c => c.id);

    if (idsToDelete.length > 0) {
      const { error } = await supabase
        .from("cards")
        .delete()
        .in("id", idsToDelete);
        
      if (error) {
        alert("Could not delete cards from database: " + error.message);
        return;
      }
    }

    setCards(cards.filter((_, i) => !selectedIndices.has(i)));
    setSelectedIndices(new Set());
  };

  // --- FIX: DELETE FROM DATABASE IMMEDIATELY ---
  const removeCard = async (index: number) => {
    const cardToDelete = cards[index];
    
    // If the card has an ID, it's already in the DB. We must delete it there.
    if (cardToDelete.id) {
      const { error } = await supabase
        .from("cards")
        .delete()
        .eq("id", cardToDelete.id);
        
      if (error) {
        alert("Could not delete card from database: " + error.message);
        return;
      }
    }
    
    setCards(cards.filter((_, i) => i !== index));
    setSelectedIndices(new Set()); // Reset selection to prevent index offset bugs
  };

  // --- FIX: DETAILED ERROR LOGGING ---
  const handleSave = async () => {
    if (!id) return;
    setIsSaving(true);
    
    try {
      // 1. Update Deck Name
      const { error: deckError } = await supabase
        .from("decks")
        .update({ name: deckName })
        .eq("id", id);

      if (deckError) throw deckError;

      // 2. Prepare cards (filtering out empty rows)
      const cardsToUpsert = cards
        .filter(c => c.pt.trim() || c.en.trim())
        .map(c => ({
          ...(c.id ? { id: c.id } : {}),
          deck_id: id,
          pt: c.pt,
          en: c.en,
          example_pt: c.example_pt || "",
          example_en: c.example_en || ""
        }));

      // 3. Sync Cards
      const { error: cardsError } = await supabase
        .from("cards")
        .upsert(cardsToUpsert);

      if (cardsError) throw cardsError;
      
      alert("Changes saved! ✅");
      router.push("/decks");
      router.refresh();
    } catch (err: any) {
      console.error("DATABASE ERROR:", err);
      alert("Save failed: " + (err.message || "Check browser console for details"));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-gray-300 animate-pulse">CARREGANDO...</div>;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6 text-black">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-10 flex items-center justify-between">
          <Link href="/decks" className="text-sm font-bold text-gray-400 hover:text-black">← Back</Link>
          <h1 className="text-2xl font-black uppercase tracking-widest">Edit Deck</h1>
          <div className="w-10"></div>
        </div>

        <div className="mb-10">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Deck Name</label>
          <input 
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="w-full p-6 rounded-[2rem] border-2 border-transparent bg-white shadow-xl text-2xl font-bold outline-none focus:border-purple-200 !text-black"
            style={{ color: 'black' }}
          />
        </div>

        {selectedIndices.size > 0 && (
          <div className="mb-6">
            <button 
              onClick={deleteSelected}
              className="w-full py-4 bg-red-100 text-red-600 border-2 border-red-200 rounded-[2rem] font-black uppercase tracking-widest hover:bg-red-200 hover:border-red-300 transition-all"
            >
              Delete {selectedIndices.size} Selected Card{selectedIndices.size > 1 ? 's' : ''}
            </button>
          </div>
        )}

        <div className="space-y-6">
          {cards?.map((card, i) => (
            <div 
              key={i} 
              className={`bg-white p-8 rounded-[2.5rem] shadow-lg border relative group transition-colors ${
                selectedIndices.has(i) ? 'border-red-400' : 'border-gray-100'
              }`}
            >
              <div className="absolute top-6 left-8 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIndices.has(i)}
                  onChange={() => toggleSelection(i)}
                  className="w-4 h-4 cursor-pointer accent-red-500"
                />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select</span>
              </div>

              <button 
                onClick={() => removeCard(i)}
                className="absolute top-6 right-8 text-xs font-bold text-red-300 hover:text-red-600 transition-colors"
              >
                Remove
              </button>

              <div className="grid md:grid-cols-2 gap-6 mb-4 mt-8">
                <div>
                  <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">Portuguese</label>
                  <input 
                    value={card.pt}
                    onChange={(e) => updateCard(i, "pt", e.target.value)}
                    className="w-full border-b-2 border-gray-50 py-2 text-xl font-bold outline-none focus:border-purple-500 !text-black"
                    style={{ color: 'black' }}
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">English</label>
                  <input 
                    value={card.en}
                    onChange={(e) => updateCard(i, "en", e.target.value)}
                    className="w-full border-b-2 border-gray-50 py-2 text-xl font-bold outline-none focus:border-blue-500 !text-black"
                    style={{ color: 'black' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-4">
          <button 
            onClick={addCard}
            className="w-full py-6 border-4 border-dashed border-gray-200 rounded-[2rem] text-gray-300 font-black uppercase tracking-widest hover:border-purple-200 hover:text-purple-300 transition-all"
          >
            + Add New Card
          </button>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-6 bg-black text-white rounded-[2rem] text-xl font-black shadow-2xl hover:bg-gray-800 transition-all active:scale-95 disabled:bg-gray-400"
          >
            {isSaving ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </div>
    </main>
  );
}