import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// We ONLY use the Groq Key here
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert European Portuguese tutor. 
          Extract vocabulary and phrases from the lesson text.
          Return ONLY a JSON object containing an array called "cards".
          Format: {"cards": [{"pt": "...", "en": "...", "example_pt": "...", "example_en": "..."}]}`
        },
        {
          role: "user",
          content: `Lesson Text: ${text.substring(0, 6000)}`,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, 
    });

    const responseContent = chatCompletion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(responseContent);

    // This "unwraps" the data so your Table gets a clean list
    const finalCards = parsed.cards || parsed.flashcards || (Array.isArray(parsed) ? parsed : []);

    console.log("Successfully extracted cards using Groq!");
    return NextResponse.json(finalCards);

  } catch (error: any) {
    console.error("GROQ ERROR:", error);
    return NextResponse.json({ error: "Groq failed to process" }, { status: 500 });
  }
}