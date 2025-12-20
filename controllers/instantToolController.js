import * as textUtils from "../services/textUtilsService.js";
import dotenv from "dotenv";

dotenv.config();

// Non-AI tools that provide instant results without API calls
const INSTANT_TOOLS = {
  wordCounter: textUtils.countWords,
  lineCounter: textUtils.countLines,
  characterCounter: textUtils.countCharacters,
  textRepeater: textUtils.repeatText,
  reverseText: textUtils.reverseText,
  caseConverter: textUtils.convertCase,
  smallTextGenerator: textUtils.generateSmallText,
  readabilityChecker: textUtils.checkReadability,
  keywordDensity: textUtils.checkKeywordDensity,
  keywordMetrics: textUtils.getKeywordMetrics,
  seoFriendlyUrl: textUtils.generateSEOFriendlyURL,
  codeToTextRatio: textUtils.analyzeCodeToTextRatio,
  acronymGenerator: textUtils.generateAcronym,
  wordCombiner: textUtils.combineWords,
  spellCheckerBasic: textUtils.checkSpelling,
  grammarCheckerBasic: textUtils.checkGrammar,
  textToWord: textUtils.textToWord,
  textToPdf: textUtils.textToPdf,
  imageToText: textUtils.imageToText,
  imageToExcel: textUtils.imageToExcel,
  jsonFormatter: textUtils.jsonFormatter,
  urlEncoderDecoder: textUtils.urlEncoderDecoder,
  hashGenerator: textUtils.hashGenerator,
};

export async function instantToolController(req, res) {
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
    if (!INSTANT_TOOLS[type]) {
      return res.status(400).json({ 
        error: `Unknown instant tool type: ${type}`,
        available: Object.keys(INSTANT_TOOLS)
      });
    }

    try {
      const toolFunction = INSTANT_TOOLS[type];
      let result;

      // Special handling for tools that need additional parameters
      if (type === "characterCounter") {
        result = await toolFunction(text, options);
      } else if (type === "repeatText") {
        const count = options?.count || 2;
        result = await toolFunction(text, count);
      } else if (type === "convertCase") {
        const caseType = options?.caseType || "lowercase";
        result = await toolFunction(text, caseType);
      } else if (type === "keywordDensity") {
        const keyword = options?.keyword;
        if (!keyword) {
          return res.status(400).json({ 
            error: "Missing required parameter",
            parameter: "keyword"
          });
        }
        result = await toolFunction(text, keyword);
      } else if (type === "wordCombiner") {
        const separator = options?.separator || "-";
        result = await toolFunction(text, separator);
      } else if (type === "jsonFormatter") {
        const indent = options?.indent || 2;
        result = await toolFunction(text, { indent });
      } else if (type === "urlEncoderDecoder") {
        const action = options?.action || "encode";
        result = await toolFunction(text, { action });
      } else if (type === "hashGenerator") {
        const algorithm = options?.algorithm || "sha256";
        result = await toolFunction(text, { algorithm });
      } else {
        // Default: just pass the text
        result = await toolFunction(text);
      }

      // Return successful result with metadata
      return res.json({ 
        success: true,
        result,
        tool: type,
        processTime: `instant`
      });
    } catch (error) {
      console.error(`Error in instant tool ${type}:`, error);
      return res.status(500).json({ 
        error: `Failed to process ${type}`,
        details: error.message
      });
    }
  } catch (error) {
    console.error("Instant Tool Controller Error:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message
    });
  }
}
