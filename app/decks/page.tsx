"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Deck } from "@/lib/decks";
import {
  deleteDeckFromSupabase,
  getAllDecksFromSupabase,
} from "@/lib/supabase-decks";

const STARTER_DECK_IDS = new Set(["basics", "travel", "food"]);

export default function DecksPage() {
  const [allDecks, setAllDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadDecks() {
    try {
      const decks = await getAllDecksFromSupabase();
      console.log("Loaded decks from Supabase:", decks);
      setAllDecks(decks);
    } catch (error) {
      console.error("Failed to load decks:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDecks();
  }, []);

  async function deleteDeck(id: string) {
    const isStarterDeck = STARTER_DECK_IDS.has(id);
    if (isStarterDeck) return;

    const confirmed = window.confirm("Delete this deck?");
    if (!confirmed) return;

    await deleteDeckFromSupabase(id);
    await loadDecks();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-lg text-gray-700">Loading decks...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Your Decks</h1>

          <div className="flex gap-3">
            <Link
              href="/create"
              className="rounded-lg bg-green-600 px-4 py-2 text-white shadow hover:bg-green-700"
            >
              Create Deck
            </Link>

            <Link
              href="/"
              className="rounded-lg bg-white px-4 py-2 shadow hover:bg-gray-50"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {allDecks.map((deck) => {
            const isStarterDeck = STARTER_DECK_IDS.has(deck.id);

            return (
              <div key={deck.id} className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-2 text-2xl font-semibold text-gray-900">
                  {deck.title}
                </h2>

                <p className="mb-4 text-gray-600">{deck.description}</p>

                <p className="mb-6 text-sm text-gray-500">
                  {Array.isArray(deck.cards) ? deck.cards.length : 0} cards
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/decks/${deck.id}`}
                    className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
                  >
                    Study Cards
                  </Link>

                  <Link
                    href={`/quiz/${deck.id}`}
                    className="rounded-xl bg-purple-600 px-5 py-3 font-medium text-white hover:bg-purple-700"
                  >
                    Quiz Mode
                  </Link>

                  {!isStarterDeck && (
                    <>
                      <Link
                        href={`/edit/${deck.id}`}
                        className="rounded-xl bg-amber-500 px-5 py-3 font-medium text-white hover:bg-amber-600"
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteDeck(deck.id)}
                        className="rounded-xl bg-red-500 px-5 py-3 font-medium text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}