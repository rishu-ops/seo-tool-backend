import { textPrompts } from "../prompts/textPrompts.js";
import { runTextTool } from "../utils/aiTextTool.js";
import dotenv from "dotenv";

dotenv.config();

// AI-powered tools that require API calls
const AI_TOOLS = [
  "paraphrase",
  "summarize",
  "grammar",
  "spellChecker",
  "rewrite_formal",
  "rewrite_simple",
  "article_rewriter",
  "paraphrasingTool",
  "expand",
  "sentenceExpander",
  "shorten",
  "sentenceShortener",
  "metaDescriptionGenerator",
  "faqGenerator",
  "outlineGenerator",
  "conclusionGenerator",
  "paragraphGenerator",
  "textCompare",
  "diffChecker"
];


export async function aiToolController(req, res) {
  try {
    const { type, text, options } = req.body;

    // Validate required fields
    if (!type || !text) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: ["type", "text"]
      });
    }

    // Check if tool exists
    if (!AI_TOOLS.includes(type)) {
      return res.status(400).json({ 
        error: `Unknown AI tool type: ${type}`,
        available: AI_TOOLS
      });
    }

    // Check if prompt exists for the tool
    if (!textPrompts[type]) {
      return res.status(500).json({ 
        error: `Prompt configuration missing for tool: ${type}`
      });
    }

    try {
      const prompt = textPrompts[type];
      const startTime = Date.now();
      
      // Call AI service
      const result = await runTextTool(prompt, text, options);
      
      const processTime = Date.now() - startTime;

      // Return successful result with metadata
      return res.json({ 
        success: true,
        result,
        tool: type,
        processTime: `${processTime}ms`
      });
    } catch (error) {
      console.error(`Error in AI tool ${type}:`, error);
      return res.status(500).json({ 
        error: `Failed to process AI tool: ${type}`,
        details: error.message
      });
    }
  } catch (error) {
    console.error("AI Tool Controller Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message
    });
  }
}
