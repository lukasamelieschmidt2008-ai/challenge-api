// api/challenge.js

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const {
      userMood,
      userIntensity,
      userDisabilityImpact,
      userCategories,
      userGoal,
      userPersons,
      userAge,
      userLocation,
      userHours,
      userMinutes,
    } = req.body;

    // Fallbacks (z. B. wenn keine Zeit angegeben wird → 0)
    const hours = parseInt(userHours) || 0;
    const minutes = parseInt(userMinutes) || 0;
    const timeLimit = `${hours}h ${minutes}min`;

    const prompt = `
You are an assistant that generates ONE short, fun, and actionable challenge.

Here are the fixed parameters (do not reinterpret, change, or ignore them):
- Mood: "${userMood}"
- Intensity: "${userIntensity}"
- Disability Impact: "${userDisabilityImpact}"
- Category: "${userCategories}"
- Goal: "${userGoal}"
- Persons: "${userPersons}"
- Age group: "${userAge}"
- Location: "${userLocation}"
- Time limit: EXACTLY "${timeLimit}" (do not change, shorten, or extend this)

STRICT RULES:
1. Use the provided values EXACTLY as written (do not translate or rephrase them).
2. The challenge MUST fit inside the exact time limit "${timeLimit}".
3. The challenge must be doable given the parameters (location, persons, disability impact, etc.).
4. Output ONLY a valid JSON object in this format:
   {"challenge": "your text here"}
5. The challenge text must be max. 3 sentences.
6. No lists, no bullet points, no extra explanation, only the challenge.

Now generate the challenge:
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const challengeText = completion.choices[0].message.content.trim();

    return res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to generate challenge" });
  }
}
