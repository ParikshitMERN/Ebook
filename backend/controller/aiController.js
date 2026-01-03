const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function safeJsonParse(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}

const generateOutline = async (req, res) => {
  try {
    const { topic, style = "neutral", numChapters = 5 } = req.body;

    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = `
Create a book outline about "${topic}".

Rules:
- EXACTLY ${numChapters} chapters
- Each chapter has:
  - "title"
  - "description" (2–3 sentences)
- Writing style: "${style}"

Return ONLY a JSON array with the chapter details.
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      generationConfig: { responseMimeType: "application/json" },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const outline = safeJsonParse(result.text);
    res.json({ outline });
  } catch (error) {
    console.error("Error generating outline:", error);
    res.status(500).json({ error: "Failed to generate outline" });
  }
};

const generateChapterContent = async (req, res) => {
  try {
    const { chapterTitle, chapterDescription, style } = req.body;

    if (!chapterTitle) return res.status(400).json({ error: "chapterTitle" });

    const prompt = `
Write a detailed book chapter.

Title: ${chapterTitle}
Description: ${chapterDescription}
Style: ${style}

Minimum 1200-2000 words.
Plain text only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    res.status(200).json({ content: response.text });
  } catch (error) {
    console.error("Error generating chapter:", error);
    res.status(500).json({ error: "Failed to generate chapter" });
  }
};

module.exports = { generateOutline, generateChapterContent };
