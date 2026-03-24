"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link"; // Added this import

export default function StudyPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [cards, setCards] = useState<any[]>([]);
  const [deckName, setDeckName] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Load Data
  useEffect(() => {
    async function loadDeck() {
      if (!id) return;
      const { data: deckData } = await supabase.from("decks").select("name").eq("id", id).single();
      const { data: cardData } = await supabase.from("cards").select("*").eq("deck_id", id);
      if (deckData) setDeckName(deckData.name);
      if (cardData) setCards(cardData);
      setLoading(false);
    }
    loadDeck();
  }, [id, supabase]);

  // 2. Portuguese Pronunciation Function
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop current speech before starting new one
    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-PT') || voices.find(v => v.lang.includes('pt'));
    
    if (ptVoice) utterance.voice = ptVoice;
    utterance.lang = 'pt-PT';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  // 3. Navigation
  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  }, [cards.length]);

  const handlePrevious = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  }, [cards.length]);

  const toggleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // 4. Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "v" || e.key === "V") {
        speak(cards[currentIndex]?.pt);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrevious, toggleFlip, speak, cards, currentIndex]);

  if (loading) return <div className="p-20 text-center font-black text-gray-300 animate-pulse uppercase tracking-widest">A Carregar...</div>;
  if (cards.length === 0) return <div className="p-20 text-center font-bold text-gray-400">Deck is empty.</div>;

  const currentCard = cards[currentIndex];

  return (
    <main className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* TOP NAVIGATION BAR (Added Exit Button here) */}
        <div className="mb-10 flex items-center justify-between">
          <Link 
            href="/decks" 
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-500 shadow-sm border border-gray-100 hover:text-purple-600 transition-colors"
          >
            ← Exit
          </Link>
          
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-2">{deckName}</p>
            <div className="h-1.5 w-32 bg-gray-100 mx-auto rounded-full overflow-hidden">
               <div 
                 className="h-full bg-black transition-all duration-500" 
                 style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
               />
            </div>
          </div>

          {/* Empty div to keep the deck name perfectly centered */}
          <div className="w-20 hidden md:block"></div>
        </div>

        {/* Card Component */}
        <div onClick={toggleFlip} className="relative h-96 w-full cursor-pointer perspective-1000">
          <div className={`relative h-full w-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
            
            {/* FRONT SIDE (Portuguese) */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[3rem] bg-gray-50 border-2 border-gray-100 shadow-sm backface-hidden p-12 z-20 text-center"
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); speak(currentCard.pt); }}
                className="mb-6 p-4 rounded-full bg-white shadow-md hover:scale-110 transition-transform text-2xl border border-gray-100"
              >
                🔊
              </button>
              <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight">
                {currentCard.pt}
              </h2>
              <span className="mt-8 text-[9px] font-bold text-gray-300 uppercase tracking-widest">Tap to flip or press Space</span>
            </div>

            {/* BACK SIDE (English) */}
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[3rem] bg-white border-4 border-gray-900 shadow-2xl backface-hidden rotate-y-180 p-12 z-10 text-center"
              style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)' 
              }}
            >
              <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight uppercase">
                {currentCard.en}
              </h2>
              
              {currentCard.example_pt && (
                <div className="mt-8 pt-8 border-t border-gray-100 w-full text-center">
                  <p className="text-lg text-gray-600 font-medium italic mb-2 leading-relaxed">
                    "{currentCard.example_pt}"
                  </p>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                    {currentCard.example_en}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Controls */}
        <div className="mt-12 flex items-center justify-center gap-4 max-w-sm mx-auto">
          <button onClick={handlePrevious} className="flex-1 py-4 bg-gray-50 rounded-2xl text-gray-400 font-black text-xs hover:bg-gray-100 transition-all active:scale-95 uppercase tracking-widest">
            Prev
          </button>
          <button onClick={handleNext} className="flex-1 py-4 bg-gray-900 rounded-2xl text-white font-black text-xs hover:bg-black transition-all shadow-lg active:scale-95 uppercase tracking-widest">
            Next
          </button>
        </div>

        <div className="mt-10 flex justify-center gap-8 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2">
            <kbd className="bg-gray-100 px-2 py-1 rounded text-gray-400">V</kbd> Pronounce
          </span>
          <span className="flex items-center gap-2 text-gray-400">
             {currentIndex + 1} / {cards.length} Cards
          </span>
        </div>
      </div>
    </main>
  );
}