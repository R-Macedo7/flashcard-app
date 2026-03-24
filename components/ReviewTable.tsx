"use client";
import { useState } from "react";

interface Flashcard {
  pt: string;
  en: string;
  example_pt: string;
  example_en: string;
}

export function ReviewTable({ 
  cards, 
  onSave 
}: { 
  cards: Flashcard[], 
  onSave: (final: Flashcard[]) => void 
}) {
  const [editableCards, setEditableCards] = useState(cards);

  const removeCard = (index: number) => {
    setEditableCards(editableCards.filter((_, i) => i !== index));
  };

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
      <div className="p-6 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-xl font-bold text-gray-900">Review New Cards</h3>
        <p className="text-sm text-gray-500">Remove any terms you already know before saving.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <tr>
              <th className="px-6 py-4">Portuguese</th>
              <th className="px-6 py-4">English</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {editableCards.map((card, i) => (
              <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">{card.pt}</td>
                <td className="px-6 py-4 text-gray-600">{card.en}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeCard(i)} 
                    className="rounded-lg px-3 py-1 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <button 
          onClick={() => onSave(editableCards)}
          className="w-full rounded-2xl bg-purple-600 py-4 text-lg font-bold text-white shadow-md hover:bg-purple-700 active:scale-[0.98] transition-all"
        >
          Add {editableCards.length} Cards to My Deck
        </button>
      </div>
    </div>
  );
}