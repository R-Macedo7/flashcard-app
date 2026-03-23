import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-center text-4xl font-bold text-gray-900">
          Portuguese Flashcards 🇵🇹
        </h1>

        <p className="mb-8 text-center text-gray-600">
          Learn European Portuguese with flashcards made for English speakers.
        </p>

        <div className="grid gap-4">
          <Link
            href="/decks"
            className="rounded-xl border border-blue-700 bg-blue-600 px-6 py-4 text-center text-lg font-medium text-white"
          >
            View Decks
          </Link>

          <Link
            href="/create"
            className="rounded-xl border border-green-700 bg-green-600 px-6 py-4 text-center text-lg font-medium text-white"
          >
            Create Deck
          </Link>
        </div>
      </div>
    </main>
  );
}