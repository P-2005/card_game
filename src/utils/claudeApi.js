import { questions } from "../data/questions";

const TOPICS = [
  "history", "records", "2026 tournament", "famous goals", "World Cup winners",
  "top scorers", "iconic moments", "player facts", "host countries", "group stage facts"
];

// Fallback: Get a random offline question
export const getOfflineQuestion = () => {
  const randomIndex = Math.floor(Math.random() * questions.length);
  return { ...questions[randomIndex], isOffline: true };
};

// Call Anthropic Claude API to generate a trivia question
export const fetchAiQuestion = async (apiKey) => {
  if (!apiKey) {
    return getOfflineQuestion();
  }

  const topic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  const systemPrompt = `You are a World Cup football trivia master. Generate one multiple-choice question about the FIFA World Cup.
You must respond with ONLY a valid JSON object. Do not include any markdown formatting, code blocks, or extra text.
The JSON object must follow this structure exactly:
{
  "question": "The question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0, // integer (0-3) indicating correct index
  "fact": "A short, interesting fun fact about the answer."
}
Question Topic Category: ${topic}`;

  // Make up to 2 attempts in case JSON parsing fails
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "dangerously-allow-browser": "true" // In case headers check it
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022", // Use modern Claude model
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: systemPrompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: status ${response.status}`);
      }

      const data = await response.json();
      const contentText = data.content?.[0]?.text || "";
      
      // Attempt to clean and parse JSON
      const cleanJsonText = contentText
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();

      const parsed = JSON.parse(cleanJsonText);
      
      // Validate structure
      if (
        parsed.question &&
        Array.isArray(parsed.options) &&
        parsed.options.length === 4 &&
        typeof parsed.correct === "number" &&
        parsed.correct >= 0 &&
        parsed.correct <= 3 &&
        parsed.fact
      ) {
        // Map category dynamically
        parsed.category = `🤖 AI Generated (${topic})`;
        return parsed;
      }
    } catch (e) {
      console.warn(`AI question generation failed (attempt ${attempt}):`, e);
    }
  }

  // Graceful fallback to offline question if both API attempts fail
  return getOfflineQuestion();
};
