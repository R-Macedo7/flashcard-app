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

          <Link
            href="/decks/basics"
            className="rounded-xl border border-gray-400 bg-gray-200 px-6 py-4 text-center text-lg font-medium text-gray-900"
          >
            Start Studying
          </Link>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="mb-3 text-sm text-gray-500">Direct links for testing</p>
          <div className="flex flex-wrap justify-center gap-4 text-blue-600 underline">
            <Link href="/decks">/decks</Link>
            <Link href="/create">/create</Link>
            <Link href="/decks/basics">/decks/basics</Link>
          </div>
        </div>
      </div>
    </main>
  );
}