import axios from "axios";

// The client automatically uses the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function callAI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API key missing");

  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" +
    apiKey;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const res = await axios.post(url, body);
  return res.data;
}
