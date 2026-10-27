
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateAIResponse(prompt) {
  try {
    const response = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: prompt,
      store: false,
    });

    return response.output_text;
  } catch (error) {
    console.error("Gemini Error:", error.message);
    throw new Error("AI response generation failed");
  }
}
