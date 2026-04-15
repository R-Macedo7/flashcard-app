"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ReviewTable } from "@/components/ReviewTable";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

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
  
  // Only track the new deck name
  const [newDeckName, setNewDeckName] = useState("");

  useEffect(() => { setHasMounted(true); }, []);

  if (!hasMounted) return null;

  const handleFinalSave = async (finalCards: any[]) => {
    setIsSaving(true);
    try {
      // Always create a new deck. Fallback to a default name if left empty.
      const finalDeckName = newDeckName.trim() || `New Deck - ${new Date().toLocaleDateString()}`;
      
      const { data, error } = await supabase.from("decks")
        .insert([{ name: finalDeckName }])
        .select()
        .single();
      
      if (error) throw error;
      const targetId = data.id;

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
               <input 
                 placeholder="Name your new deck (e.g., Chapter 1)..." 
                 value={newDeckName} 
                 onChange={e => setNewDeckName(e.target.value)} 
                 className="border p-2 rounded flex-1 text-gray-900"
                 autoFocus
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