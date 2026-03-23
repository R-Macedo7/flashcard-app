import { Deck, starterDecks } from "./decks";

const DB_NAME = "pt-flashcards-db";
const DB_VERSION = 1;
const DECK_STORE = "decks";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(DECK_STORE)) {
        db.createObjectStore(DECK_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllDecks(): Promise<Deck[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DECK_STORE, "readonly");
    const store = tx.objectStore(DECK_STORE);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as Deck[]);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDeck(deck: Deck): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DECK_STORE, "readwrite");
    const store = tx.objectStore(DECK_STORE);
    store.put(deck);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteDeckById(id: string): Promise<void> {
  if (!id) return;

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DECK_STORE, "readwrite");
    const store = tx.objectStore(DECK_STORE);
    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDeckById(id: string | undefined): Promise<Deck | null> {
  if (!id || typeof id !== "string" || !id.trim()) {
    return null;
  }

  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(DECK_STORE, "readonly");
    const store = tx.objectStore(DECK_STORE);
    const request = store.get(id);

    request.onsuccess = () => resolve((request.result as Deck) || null);
    request.onerror = () => reject(request.error);
  });
}

export async function seedStarterDecks(): Promise<void> {
  const existing = await getAllDecks();

  if (existing.length > 0) return;

  for (const deck of starterDecks) {
    await saveDeck(deck);
  }
}