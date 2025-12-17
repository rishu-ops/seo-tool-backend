/**
 * Text Utilities Service
 * Non-AI text processing functions for various text tools
 */

import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';

// Word Counter
export function countWords(text) {
  if (!text || text.trim() === "") return 0;
  return text.trim().split(/\s+/).length;
}

// Line Counter
export function countLines(text) {
  if (!text) return 0;
  return text.split(/\n/).length;
}

// Character Counter
export function countCharacters(text, options = {}) {
  const includeSpaces = options.includeSpaces !== false;
  let count = text.length;
  
  if (!includeSpaces) {
    count = text.replace(/\s/g, "").length;
  }
  
  return {
    total: count,
    withoutSpaces: text.replace(/\s/g, "").length,
    letters: (text.match(/[a-zA-Z]/g) || []).length,
    digits: (text.match(/[0-9]/g) || []).length,
    spaces: (text.match(/\s/g) || []).length,
  };
}

// Text Repeater
export function repeatText(text, count) {
  const repeatCount = Math.max(1, Math.min(count, 100)); // Limit to 100 repeats
  return text.repeat(repeatCount);
}

// Reverse Text Generator
export function reverseText(text) {
  return text.split("").reverse().join("");
}

// Case Converter
export function convertCase(text, caseType) {
  switch (caseType) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return text
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    case "sentencecase":
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case "camelcase":
      return text
        .split(/[\s-_]+/)
        .map((word, i) =>
          i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    case "snakecase":
      return text.toLowerCase().replace(/\s+/g, "_");
    case "kebabcase":
      return text.toLowerCase().replace(/\s+/g, "-");
    default:
      return text;
  }
}

// Small Text Generator (Superscript/Subscript simulation)
export function generateSmallText(text) {
  const smallTextMap = {
    a: "ᵃ", b: "ᵇ", c: "ᶜ", d: "ᵈ", e: "ᵉ", f: "ᶠ", g: "ᵍ", h: "ʰ", i: "ⁱ", j: "ʲ", k: "ᵏ", l: "ˡ", m: "ᵐ", n: "ⁿ", o: "ᵒ", p: "ᵖ", r: "ʳ", s: "ˢ", t: "ᵗ", u: "ᵘ", v: "ᵛ", w: "ʷ", x: "ˣ", y: "ʸ", z: "ᶻ",
    A: "ᴬ", B: "ᴮ", D: "ᴰ", E: "ᴱ", F: "ᶠ", G: "ᴳ", H: "ᴴ", I: "ᴵ", J: "ᴶ", K: "ᴷ", L: "ᴸ", M: "ᴹ", N: "ᴺ", O: "ᴼ", P: "ᴾ", R: "ᴿ", T: "ᵀ", U: "ᵁ", V: "ᵛ", W: "ᵂ", Y: "ʸ",
  };

  return text
    .split("")
    .map((char) => smallTextMap[char] || char)
    .join("");
}

// Readability Checker (Flesch Reading Ease simulation)
export function checkReadability(text) {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const words = countWords(text);
  const syllables = estimateSyllables(text);

  const fleschScore = 206.835 - 1.015 * (words / Math.max(1, sentences)) - 84.6 * (syllables / Math.max(1, words));

  let difficulty = "";
  if (fleschScore >= 90) difficulty = "Very Easy";
  else if (fleschScore >= 80) difficulty = "Easy";
  else if (fleschScore >= 70) difficulty = "Fairly Easy";
  else if (fleschScore >= 60) difficulty = "Standard";
  else if (fleschScore >= 50) difficulty = "Fairly Difficult";
  else if (fleschScore >= 30) difficulty = "Difficult";
  else difficulty = "Very Difficult";

  return {
    fleschScore: Math.round(fleschScore * 10) / 10,
    difficulty,
    sentences,
    words,
    averageWordsPerSentence: Math.round((words / Math.max(1, sentences)) * 10) / 10,
  };
}

// Helper: Estimate syllables in text
function estimateSyllables(text) {
  let count = 0;
  const vowels = "aeiouAEIOU";
  let previousWasVowel = false;

  for (let char of text) {
    const isVowel = vowels.includes(char);
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }

  return Math.max(1, count);
}

// Keyword Density Checker
export function checkKeywordDensity(text, keyword) {
  if (!keyword || keyword.trim() === "") {
    return { error: "Keyword is required" };
  }

  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const keywordCount = words.filter((w) => w === keyword.toLowerCase()).length;
  const density = words.length > 0 ? ((keywordCount / words.length) * 100).toFixed(2) : 0;

  return {
    keyword,
    occurrences: keywordCount,
    totalWords: words.length,
    density: parseFloat(density),
  };
}

// Keyword / Total Words
export function getKeywordMetrics(text) {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const uniqueWords = new Set(words);

  const wordFrequency = {};
  words.forEach((word) => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });

  const sortedWords = Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return {
    totalWords: words.length,
    uniqueWords: uniqueWords.size,
    topKeywords: sortedWords.map(([word, count]) => ({
      word,
      count,
      density: ((count / words.length) * 100).toFixed(2),
    })),
  };
}

// SEO Friendly URLs Checker
export function generateSEOFriendlyURL(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Remove multiple hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// Code To Text Ratio
export function analyzeCodeToTextRatio(text) {
  const codePatterns = /(<[^>]+>|`{1,3}[^`]*`{1,3}|\/\/.*|\/\*[\s\S]*?\*\/|\{[\s\S]*?\})/g;
  const codeMatches = text.match(codePatterns) || [];
  const codeLength = codeMatches.reduce((sum, match) => sum + match.length, 0);
  const textLength = text.length - codeLength;

  return {
    totalLength: text.length,
    codeLength,
    textLength,
    codeRatio: text.length > 0 ? ((codeLength / text.length) * 100).toFixed(2) : 0,
    textRatio: text.length > 0 ? ((textLength / text.length) * 100).toFixed(2) : 0,
  };
}

// Acronym Generator
export function generateAcronym(text) {
  const words = text.split(/[\s\n-]+/).filter((w) => w.length > 0);
  const acronym = words.map((word) => word.charAt(0).toUpperCase()).join("");
  return acronym;
}

// Word Combiner
export function combineWords(text, separator = "-") {
  return text
    .split(/[\s\n]+/)
    .filter((w) => w.length > 0)
    .join(separator);
}

// Basic Spell Checker (using simple dictionary)
const basicDictionary = new Set([
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "i",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  // Common words
  "about", "after", "again", "before", "been", "between", "can", "could",
  "did", "does", "each", "even", "few", "find", "first", "get", "give", "go",
  "good", "great", "had", "has", "him", "how", "if", "into", "just", "know",
  "last", "like", "long", "made", "make", "many", "more", "most", "much", "must",
  "name", "need", "never", "new", "next", "now", "only", "other", "our", "out",
  "over", "own", "right", "said", "same", "see", "seem", "should", "some", "such",
  "take", "tell", "than", "thank", "that", "them", "then", "these", "think", "this",
  "those", "through", "two", "under", "up", "use", "very", "want", "was", "way",
  "well", "went", "were", "when", "where", "which", "while", "who", "why", "work",
  "world", "year", "yes", "yet", "you", "young", "your", "him", "how", "if",
]);

export function checkSpelling(text) {
  const words = text.toLowerCase().split(/[\s\n.,!?;:—-]+/).filter((w) => w.length > 0);
  const misspelledWords = words.filter((word) => !basicDictionary.has(word));
  const uniqueMisspelled = [...new Set(misspelledWords)];

  return {
    totalWords: words.length,
    misspelledCount: misspelledWords.length,
    uniqueMisspelled,
    accuracy: words.length > 0 ? (((words.length - misspelledWords.length) / words.length) * 100).toFixed(2) : 100,
  };
}

// Basic Grammar Checker (simple rule-based)
export function checkGrammar(text) {
  const issues = [];

  // Rule 1: Check for double spaces
  if (/  +/.test(text)) {
    issues.push({ type: "Double spaces", suggestion: "Remove extra spaces" });
  }

  // Rule 2: Check for space before punctuation
  if (/\s+[.,!?;:]/.test(text)) {
    issues.push({ type: "Space before punctuation", suggestion: "Remove space before punctuation marks" });
  }

  // Rule 3: Check for capitalization after periods
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const lowercaseStarts = sentences.filter((s) => /^\s*[a-z]/.test(s)).length;
  if (lowercaseStarts > 0) {
    issues.push({ type: "Lowercase after period", suggestion: "Capitalize first letter of sentences" });
  }

  // Rule 4: Check for common grammar mistakes
  if (/\bit's\b(?!\s+(a|an|the|[A-Z]))/i.test(text)) {
    issues.push({ type: "Potential 'it's' misuse", suggestion: "Use 'its' for possessive" });
  }

  return {
    issueCount: issues.length,
    issues,
    score: Math.max(0, 100 - issues.length * 10),
  };
}

// Text to Word (.docx)
export async function textToWord(text) {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun(text)],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer.toString('base64');
}

// Text to PDF
export async function textToPdf(text) {
  const doc = new PDFDocument();
  const chunks = [];
  
  return new Promise((resolve, reject) => {
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    doc.on('error', reject);
    
    doc.text(text);
    doc.end();
  });
}

// Image to Text (OCR)
export async function imageToText(imageBase64) {
  const worker = await createWorker('eng');
  try {
    const { data: { text } } = await worker.recognize(imageBase64);
    return text.trim();
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image for OCR');
  } finally {
    await worker.terminate();
  }
}

// Image to Excel
export async function imageToExcel(imageBase64) {
  // First get text from image
  const text = await imageToText(imageBase64);
  
  // Assume text is CSV-like, split by lines and commas
  const rows = text.split('\n').map(line => line.split(','));
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return buffer.toString('base64');
}
