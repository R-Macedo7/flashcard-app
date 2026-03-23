"use client";

import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Deck, Card } from "@/lib/decks";
import {
  getDeckByIdFromSupabase,
  saveDeckToSupabase,
} from "@/lib/supabase-decks";

export default function EditDeckPage() {
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => {
    const raw = params?.id;
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState<Deck | null>(null);
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    getDeckByIdFromSupabase(id)
      .then((foundDeck) => {
        setDeck(foundDeck);

        if (foundDeck) {
          setTitle(foundDeck.title);
          setCards(foundDeck.cards);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load deck for editing:", error);
        setLoading(false);
      });
  }, [id]);

  function addCard() {
    setCards([
      ...cards,
      { pt: "", en: "", example_pt: "", example_en: "" },
    ]);
  }

  function removeCard(index: number) {
    setCards(cards.filter((_, i) => i !== index));
  }

  function updateCard(index: number, field: keyof Card, value: string) {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  }

  async function handleSave() {
    if (!deck) return;

    if (!title.trim()) {
      alert("Please enter a deck title.");
      return;
    }

    const filteredCards = cards.filter(
      (card) => card.pt.trim() && card.en.trim()
    );

    if (filteredCards.length === 0) {
      alert("Please keep at least one valid card.");
      return;
    }

    const updatedDeck: Deck = {
      ...deck,
      title,
      cards: filteredCards,
    };

    await saveDeckToSupabase(updatedDeck);
    alert("Deck updated successfully.");
    router.push("/decks");
  }

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

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-8 text-black">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">Edit Deck</h1>

          <Link
            href="/decks"
            className="text-lg font-medium text-blue-600 hover:text-blue-700"
          >
            Back
          </Link>
        </div>

        <input
          type="text"
          placeholder="Deck title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-8 w-full rounded-xl border border-gray-300 bg-white p-4 text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
        />

        {cards.map((card, i) => (
          <div
            key={i}
            className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-800">
                Card {i + 1}
              </div>

              <button
                onClick={() => removeCard(i)}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Remove
              </button>
            </div>

            <input
              type="text"
              placeholder="Portuguese"
              value={card.pt}
              onChange={(e) => updateCard(i, "pt", e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="English"
              value={card.en}
              onChange={(e) => updateCard(i, "en", e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Example (PT)"
              value={card.example_pt}
              onChange={(e) => updateCard(i, "example_pt", e.target.value)}
              className="mb-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />

            <input
              type="text"
              placeholder="Example (EN)"
              value={card.example_en}
              onChange={(e) => updateCard(i, "example_en", e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-500"
            />
          </div>
        ))}

        <button
          onClick={addCard}
          className="mb-4 w-full rounded-xl bg-gray-700 py-3 text-lg font-medium text-white hover:bg-gray-800"
        >
          + Add Card
        </button>

        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}