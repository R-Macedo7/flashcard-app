"use server";

import { mistral } from '@ai-sdk/mistral';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function generatePTCards(topic: string, mode: "en-to-pt" | "pt-to-en" = "en-to-pt") {
  try {
    // We do EVERYTHING in one single request to Mistral Large
    const { object } = await generateObject({
      model: mistral('mistral-large-latest'),
      schema: z.object({
        cards: z.array(z.object({
          pt: z.string(),
          en: z.string(),
          example_pt: z.string(),
          example_en: z.string(),
        })),
      }),
      prompt: `Act as a European Portuguese linguistics expert. 
               Create 7 flashcards about: "${topic}".
               Direction: ${mode}.
               
               Rules:
               1. Use ONLY European Portuguese (PT-PT). 
               2. Avoid Brazilian terms (No 'trem', use 'comboio'; No 'você' as default, use 'tu').
               3. If mode is en-to-pt, 'pt' is the translation. If pt-to-en, 'pt' is the prompt.
               4. Provide natural, conversational examples used in Portugal.`,
    });

    return { success: true, data: object.cards };

  } catch (error: any) {
    console.error("AI Error:", error);
    return { success: false, error: error.message };
  }
}