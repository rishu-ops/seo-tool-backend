import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { makeKey, getCache, setCache } from "../cache/aiCache.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function runTextTool(prompt, text, options = {}) {
  if (!text || text.trim() === "") {
    throw new Error("Text input is required.");
  }

  const model = options.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const generationConfig = options.generationConfig || { maxOutputTokens: 120, temperature: 0.6 };

  const finalPrompt = `${prompt}\n\nText:\n${text}`;

  // Build cache key from prompt, text, model and generation config
  const cacheKey = makeKey(model, finalPrompt, JSON.stringify(generationConfig));

  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await ai.models.generateContent({
    model,
    contents: finalPrompt,
    generationConfig,
  });

  const out = (response?.text || "").trim();

  // Store in cache
  try { await setCache(cacheKey, out); } catch (e) {}

  return out;
}
