"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ReviewTable } from "@/components/ReviewTable";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

// 1. Define the Deck type so TypeScript is happy
interface Deck {
  id: string;
  name: string;
}

const PdfUploader = dynamic(
  () => import("@/components/PdfUploader").then((mod) => mod.PdfUploader),
  { ssr: false }
);

export default function UploadPage() {
  const router = useRouter();
  const [hasMounted, setHasMounted] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  
  // 2. Tell the state it's an array of Decks
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [newDeckName, setNewDeckName] = useState("");

  useEffect(() => { setHasMounted(true); }, []);

  useEffect(() => {
    if (!hasMounted) return;
    async function fetchDecks() {
      // 3. Cast the response to our Deck type
      const { data, error } = await supabase
        .from("decks")
        .select("id, name");
      
      if (error) {
        console.error("Error fetching decks:", error);
        return;
      }

      if (data) {
        setDecks(data as Deck[]);
        if (data.length > 0) setSelectedDeckId(data[0].id);
      }
    }
    fetchDecks();
  }, [hasMounted, supabase]);

  if (!hasMounted) return null;

  const handleFinalSave = async (finalCards: any[]) => {
    setIsSaving(true);
    try {
      let targetId = selectedDeckId;
      
      if (newDeckName.trim()) {
        const { data, error } = await supabase.from("decks")
          .insert([{ name: newDeckName.trim() }])
          .select()
          .single();
        
        if (error) throw error;
        targetId = data.id;
      }

      if (!targetId) throw new Error("Please select a deck");

      const { error: cardError } = await supabase.from("cards").insert(
        finalCards.map(c => ({
          deck_id: targetId,
          pt: c.pt,
          en: c.en,
          example_pt: c.example_pt,
          example_en: c.example_en
        }))
      );
      if (cardError) throw cardError;

      router.push(`/decks/${targetId}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  async function handleGenerateFromPdf(text: string) {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-cards", { 
        method: "POST", 
        body: JSON.stringify({ text }) 
      });
      const data = await res.json();
      setGeneratedCards(data);
    } catch (error) {
      console.error("Generation error:", error);
    } finally { 
      setIsGenerating(false); 
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">AI Deck Creator</h1>
        {!generatedCards.length ? (
          <PdfUploader onTextExtracted={(text) => handleGenerateFromPdf(text)} loading={isGenerating} />
        ) : (
          <div className="space-y-4">
             <div className="p-4 bg-white border rounded-xl flex gap-4 items-center">
               <select 
                 value={selectedDeckId} 
                 onChange={e => setSelectedDeckId(e.target.value)} 
                 className="border p-2 rounded bg-white text-gray-900"
               >
                 <option value="" disabled>Select a deck</option>
                 {decks.map((d) => (
                   <option key={d.id} value={d.id}>
                     {d.name}
                   </option>
                 ))}
               </select>
               <input 
                 placeholder="Or new deck name..." 
                 value={newDeckName} 
                 onChange={e => setNewDeckName(e.target.value)} 
                 className="border p-2 rounded flex-1 text-gray-900"
               />
             </div>
             <ReviewTable cards={generatedCards} onSave={handleFinalSave} />
             {isSaving && <p className="text-center text-purple-600 font-bold">Saving to database...</p>}
          </div>
        )}
      </div>
    </main>
  );
}