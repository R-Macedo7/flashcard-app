"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Deck } from "@/lib/decks";
import { getDeckByIdFromSupabase } from "@/lib/supabase-decks";

export default function DeckStudyPage() {
  const params = useParams();

  const id = useMemo(() => {
    const raw = params?.id;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  }, [params]);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    getDeckByIdFromSupabase(id)
      .then((foundDeck) => {
        setDeck(foundDeck);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load study deck:", error);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading deck...</p>
      </main>
    );
  }

  if (!deck) {
    notFound();
  }

  const currentDeck = deck as Deck;
  const currentCard = currentDeck.cards[index];

  function nextCard() {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % currentDeck.cards.length);
  }

  function flipCard() {
    setFlipped((prev) => !prev);
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/decks"
            className="rounded-lg bg-white px-4 py-2 text-gray-800 shadow hover:bg-gray-50"
          >
            Back
          </Link>

          <p className="text-base font-semibold text-gray-800">
            {currentDeck.title}
          </p>
        </div>

        <div
          onClick={flipCard}
          className="flex min-h-[420px] cursor-pointer items-center justify-center rounded-3xl bg-white p-10 text-center shadow-lg"
        >
          {!flipped ? (
            <div className="w-full">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
                Portuguese
              </p>
              <h2 className="text-5xl font-bold text-gray-900">
                {currentCard.pt}
              </h2>
            </div>
          ) : (
            <div className="w-full">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
                English
              </p>

              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                {currentCard.en}
              </h2>

              <div className="rounded-2xl bg-gray-50 p-5 text-left">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Example in Portuguese
                </p>
                <p className="mb-5 text-xl text-gray-900">
                  {currentCard.example_pt || "—"}
                </p>

                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  English translation
                </p>
                <p className="text-lg text-gray-700">
                  {currentCard.example_en || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={flipCard}
            className="rounded-2xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700"
          >
            {flipped ? "Show Portuguese" : "Flip Card"}
          </button>

          <button
            onClick={nextCard}
            className="rounded-2xl bg-gray-800 px-6 py-4 text-lg font-semibold text-white hover:bg-gray-900"
          >
            Next Card
          </button>
        </div>

        <p className="mt-6 text-center text-xl font-medium text-gray-700">
          Card {index + 1} of {currentDeck.cards.length}
        </p>
      </div>
    </main>
  );
}