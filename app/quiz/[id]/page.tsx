"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";

type ResultState = "idle" | "correct" | "incorrect";

export default function QuizPage() {
  const params = useParams();
  const id = params?.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const inputRef = useRef<HTMLInputElement>(null);

  // States
  const [deckName, setDeckName] = useState("");
  const [loading, setLoading] = useState(true);
  const [quizCards, setQuizCards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);
  const [resultState, setResultState] = useState<ResultState>("idle");
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [ptToEn, setPtToEn] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    if (!id) return;
    async function loadQuizData() {
      try {
        const { data: deckData } = await supabase.from("decks").select("name").eq("id", id).single();
        const { data: cardData } = await supabase.from("cards").select("*").eq("deck_id", id);
        if (deckData) setDeckName(deckData.name);
        if (cardData) setQuizCards([...cardData].sort(() => Math.random() - 0.5));
      } catch (error) {
        console.error("Quiz Load Error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadQuizData();
  }, [id, supabase]);

  // Focus management
  useEffect(() => {
    if (!loading && !completed) {
      inputRef.current?.focus();
    }
  }, [loading, completed, currentIndex, awaitingNext]);

  const currentCard = quizCards[currentIndex];

  const speakPortuguese = useCallback(() => {
    if (!window.speechSynthesis || !currentCard) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentCard.pt);
    utterance.lang = "pt-PT";
    window.speechSynthesis.speak(utterance);
  }, [currentCard]);

  const handleSubmit = () => {
    if (awaitingNext || !currentCard) return;
    const userAnswer = answer.trim().toLowerCase();
    const correctAnswer = (ptToEn ? currentCard.en : currentCard.pt).trim().toLowerCase();

    if (!userAnswer) return;

    if (userAnswer === correctAnswer) {
      setFeedback("Correct ✅");
      setResultState("correct");
      setAwaitingNext(true);
    } else {
      setFeedback("Incorrect ❌");
      setResultState("incorrect");
      setAwaitingNext(true);
      setShowCorrectAnswer(true);
    }
  };

  const handleNext = () => {
    if (!awaitingNext) return;
    const updatedCards = [...quizCards];
    const wrongCard = updatedCards[currentIndex];

    if (resultState === "correct") {
      updatedCards.splice(currentIndex, 1);
    } else {
      updatedCards.splice(currentIndex, 1);
      const insertIdx = Math.min(currentIndex + 2, updatedCards.length);
      updatedCards.splice(insertIdx, 0, wrongCard);
    }

    if (updatedCards.length === 0) {
      setCompleted(true);
    } else {
      setQuizCards(updatedCards);
      setCurrentIndex(0);
      setAnswer("");
      setFeedback("");
      setResultState("idle");
      setAwaitingNext(false);
      setShowCorrectAnswer(false);
    }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-gray-50"><p className="font-bold text-gray-400">Loading Quiz...</p></main>;

  if (completed || quizCards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-8 flex items-center justify-center">
        <div className="mx-auto max-w-2xl rounded-[3rem] bg-white p-12 text-center shadow-2xl w-full border border-gray-100">
          <span className="text-6xl mb-6 block">🏆</span>
          <h1 className="mb-4 text-4xl font-black text-gray-900">Quiz Complete!</h1>
          <p className="text-gray-500 mb-8">You finished "{deckName}"</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()} className="rounded-2xl bg-purple-600 px-6 py-4 font-bold text-white hover:bg-purple-700 transition-all">Restart Quiz</button>
            {/* UPDATED: Points to /decks */}
            <Link href="/decks" className="rounded-2xl bg-gray-100 px-6 py-4 font-bold text-gray-600 hover:bg-gray-200 transition-all">Back to Decks</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          {/* UPDATED: Points to /decks */}
          <Link href="/decks" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-gray-500 shadow-sm border border-gray-100 hover:text-purple-600 transition-colors">← Exit Quiz</Link>
          <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">{deckName}</p>
          <button 
            onClick={() => { setPtToEn(!ptToEn); setAnswer(""); setAwaitingNext(false); setResultState("idle"); setFeedback(""); setShowCorrectAnswer(false); }}
            className="bg-white border-2 border-purple-50 px-4 py-2 rounded-xl text-xs font-black shadow-sm text-purple-700"
          >
            {ptToEn ? "🇵🇹 ➔ 🇬🇧" : "🇬🇧 ➔ 🇵🇹"}
          </button>
        </div>

        <div className="rounded-[2.5rem] bg-white p-10 shadow-xl border border-gray-100 relative">
          <div className="flex justify-between items-center mb-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              {ptToEn ? "Translate to English" : "Traduz para Português"}
            </p>
            <button onClick={speakPortuguese} className="text-2xl hover:scale-110 p-3 bg-purple-50 rounded-2xl transition-all">🔊</button>
          </div>

          <h1 className="mb-10 text-5xl font-black text-gray-900 leading-tight tracking-tight">
            {ptToEn ? currentCard.pt : currentCard.en}
          </h1>

          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  !awaitingNext ? handleSubmit() : handleNext();
                }
              }}
              placeholder={ptToEn ? "Your English translation..." : "A tua tradução..."}
              readOnly={awaitingNext}
              className={`w-full rounded-2xl border-2 p-5 text-xl font-bold outline-none transition-all ${
                awaitingNext 
                  ? (resultState === 'correct' ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700') 
                  : 'border-gray-100 bg-gray-50 !text-black focus:border-purple-300 focus:bg-white'
              }`}
              style={{ color: awaitingNext ? undefined : 'black' }}
            />

            <button 
              onClick={!awaitingNext ? handleSubmit : handleNext} 
              className={`w-full py-5 rounded-2xl text-lg font-bold shadow-xl transition-all ${
                awaitingNext ? 'bg-purple-600 text-white' : 'bg-gray-900 text-white hover:bg-black'
              }`}
            >
              {!awaitingNext ? "Check Answer" : "Next Question"}
            </button>
          </div>

          {(showCorrectAnswer || feedback) && (
            <div className={`mt-8 rounded-3xl p-6 border-2 ${resultState === 'correct' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-[10px] font-black uppercase mb-1 ${resultState === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                  {resultState === 'correct' ? 'Well Done!' : 'The correct answer was:'}
                </p>
                <p className="text-2xl font-black text-gray-900">{showCorrectAnswer ? (ptToEn ? currentCard.en : currentCard.pt) : feedback}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-center items-center gap-4">
          <div className="h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 transition-all duration-500" style={{ width: `${(1 - quizCards.length / (quizCards.length + 1)) * 100}%` }} />
          </div>
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">
            {quizCards.length} cards remaining
          </p>
        </div>
      </div>
    </main>
  );
}