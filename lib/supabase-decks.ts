import type { Deck } from "@/lib/decks";
import { supabase } from "@/lib/supabase";

export async function getAllDecksFromSupabase(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Deck[];
}

export async function getDeckByIdFromSupabase(
  id: string
): Promise<Deck | null> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as Deck | null) ?? null;
}

export async function saveDeckToSupabase(deck: Deck): Promise<void> {
  const { error } = await supabase.from("decks").upsert(deck);

  if (error) {
    throw error;
  }
}

export async function deleteDeckFromSupabase(id: string): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", id);

  if (error) {
    throw error;
  }
}