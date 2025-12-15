import { textPrompts } from "../prompts/textPrompts.js";
import { runTextTool } from "../utils/aiTextTool.js";

import dotenv from "dotenv";

dotenv.config();


export async function textToolController(req, res) {
  try {

     const { type, text } = req.body;

     if (!type || !text) {
      return res.status(400).json({ error: "type and text are required" });
     }

      const prompt = textPrompts[type];

      const result = await runTextTool(prompt, text)

      // return under `result` key so client code can read `json.result`
      res.json({ result });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

