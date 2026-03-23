"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Deck, Card } from "@/lib/decks";
import { getDeckByIdFromSupabase } from "@/lib/supabase-decks";

type ResultState = "idle" | "correct" | "incorrect";

export default function QuizPage() {
  const params = useParams();

  const id = useMemo(() => {
    const raw = params?.id;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  }, [params]);

  const inputRef = useRef<HTMLInputElement>(null);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizCards, setQuizCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [completed, setCompleted] = useState(false);
  const [resultState, setResultState] = useState<ResultState>("idle");
  const [awaitingNext, setAwaitingNext] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    getDeckByIdFromSupabase(id)
      .then((foundDeck) => {
        setDeck(foundDeck);
        if (foundDeck) setQuizCards([...foundDeck.cards]);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load quiz deck:", error);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && !completed) {
      inputRef.current?.focus();
    }
  }, [loading, completed, currentIndex, awaitingNext]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading quiz...</p>
      </main>
    );
  }

  if (!deck) {
    notFound();
  }

  if (completed || quizCards.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-8">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-lg">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Quiz Complete 🎉
          </h1>

          <p className="mb-8 text-lg text-gray-600">
            You answered every card correctly.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/decks"
              className="rounded-2xl bg-gray-800 px-6 py-3 font-semibold text-white hover:bg-gray-900"
            >
              Back to Decks
            </Link>

            <button
              onClick={() => {
                setQuizCards([...deck.cards]);
                setCurrentIndex(0);
                setAnswer("");
                setFeedback("");
                setCompleted(false);
                setResultState("idle");
                setAwaitingNext(false);
                setShowCorrectAnswer(false);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className="rounded-2xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      </main>
    );
  }

  const currentCard = quizCards[currentIndex];

  function normalize(text: string) {
    return text.trim().toLowerCase();
  }

  function insertCardLater(cards: Card[], card: Card, currentIdx: number) {
    const minOffset = 1;
    const maxOffset = Math.max(2, cards.length - currentIdx);
    const insertIndex =
      currentIdx + Math.floor(Math.random() * maxOffset) + minOffset;

    cards.splice(Math.min(insertIndex, cards.length), 0, card);
  }

  function removeCurrentCardAsCorrect() {
    const updatedCards = quizCards.filter((_, i) => i !== currentIndex);

    if (updatedCards.length === 0) {
      setCompleted(true);
      return;
    }

    setQuizCards(updatedCards);
    setCurrentIndex((prev) => (prev >= updatedCards.length ? 0 : prev));
    setAnswer("");
    setFeedback("");
    setResultState("idle");
    setAwaitingNext(false);
    setShowCorrectAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function moveCurrentCardLaterAsIncorrect() {
    const wrongCard = currentCard;
    const updatedCards = quizCards.filter((_, i) => i !== currentIndex);

    insertCardLater(updatedCards, wrongCard, currentIndex);

    setQuizCards(updatedCards);
    setCurrentIndex((prev) => (prev >= updatedCards.length ? 0 : prev));
    setAnswer("");
    setFeedback("");
    setResultState("idle");
    setAwaitingNext(false);
    setShowCorrectAnswer(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSubmit() {
    if (awaitingNext) return;

    const userAnswer = normalize(answer);
    const correctAnswer = normalize(currentCard.en);

    if (!userAnswer) {
      setFeedback("Please enter an answer.");
      return;
    }

    if (userAnswer === correctAnswer) {
      setFeedback("Correct ✅");
      setResultState("correct");
      setAwaitingNext(true);
      setShowCorrectAnswer(false);
      return;
    }

    setFeedback("Incorrect ❌");
    setResultState("incorrect");
    setAwaitingNext(true);
    setShowCorrectAnswer(true);
  }

  function handleNext() {
    if (!awaitingNext) return;

    if (resultState === "correct") {
      removeCurrentCardAsCorrect();
      return;
    }

    if (resultState === "incorrect") {
      moveCurrentCardLaterAsIncorrect();
    }
  }

  function handleOverrideCorrect() {
    if (resultState !== "incorrect") return;
    setFeedback("Accepted as correct ✅");
    setResultState("correct");
    setShowCorrectAnswer(true);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/decks"
            className="rounded-lg bg-white px-4 py-2 text-gray-800 shadow"
          >
            Back
          </Link>

          <p className="font-semibold text-gray-800">
            Quiz Mode: {deck.title}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-10 shadow-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
            Translate into English
          </p>

          <h1 className="mb-8 text-5xl font-bold text-gray-900">
            {currentCard.pt}
          </h1>

          <input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!awaitingNext) handleSubmit();
                else handleNext();
              }
            }}
            placeholder="Type the English translation"
            disabled={awaitingNext}
            className="mb-4 w-full rounded-2xl border border-gray-300 p-4 text-xl text-gray-900 outline-none focus:border-purple-500 disabled:bg-gray-100"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              onClick={handleSubmit}
              disabled={awaitingNext}
              className="rounded-2xl bg-purple-600 px-6 py-4 text-lg font-semibold text-white disabled:bg-purple-300"
            >
              Submit
            </button>

            <button
              onClick={handleNext}
              disabled={!awaitingNext}
              className="rounded-2xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white disabled:bg-blue-300"
            >
              Next
            </button>
          </div>

          {showCorrectAnswer && (
            <div className="mt-6 rounded-2xl bg-green-50 p-5">
              <p className="mb-2 text-sm font-semibold text-green-700">
                Correct Answer
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {currentCard.en}
              </p>

              {currentCard.example_pt && (
                <>
                  <p className="mt-4 mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Example in Portuguese
                  </p>
                  <p className="text-lg text-gray-900">{currentCard.example_pt}</p>
                </>
              )}

              {currentCard.example_en && (
                <>
                  <p className="mt-4 mb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                    English translation
                  </p>
                  <p className="text-lg text-gray-700">{currentCard.example_en}</p>
                </>
              )}
            </div>
          )}

          {feedback && (
            <div className="mt-6 rounded-2xl bg-gray-50 p-4">
              <p className="text-lg text-gray-800">{feedback}</p>

              {awaitingNext && (
                <p className="mt-2 text-sm text-gray-500">
                  Press Enter or click Next to continue.
                </p>
              )}
            </div>
          )}

          {resultState === "incorrect" && awaitingNext && (
            <div className="mt-4">
              <button
                onClick={handleOverrideCorrect}
                className="rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700"
              >
                Accept as Correct
              </button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xl font-medium text-gray-700">
          Remaining: {quizCards.length}
        </p>
      </div>
    </main>
  );
}