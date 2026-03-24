"use server";

import { mistral } from '@ai-sdk/mistral';
import { generateText } from 'ai';

export async function translateText(text: string, mode: "en-to-pt" | "pt-to-en") {
  if (!text.trim()) return "";

  // Set context based on the mode provided by the UI
  const fromLang = mode === "en-to-pt" ? "English" : "European Portuguese";
  const toLang = mode === "en-to-pt" ? "European Portuguese (PT-PT)" : "English";

  const { text: translation } = await generateText({
    model: mistral('mistral-large-latest'),
    prompt: `Translate the following text from ${fromLang} to ${toLang}. 
             IMPORTANT: If translating to Portuguese, use strictly European Portuguese (PT-PT). 
             Avoid Brazilian terms (e.g., use 'comboio' instead of 'trem').
             Text: "${text}"
             Provide only the translated text, no explanations.`,
  });

  return translation;
}