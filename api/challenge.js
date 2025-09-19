// api/challenge.js

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus dem Body mit Defaults
    const {
      userMood = "Neutral",
      userIntensity = "Medium",
      userDisabilityImpact = "None",
      userCategories = "None",
      userGoal = "None",
      userPersons = "Solo",
      userAge = "Any",
      userLocation = "Any",
      userHours = 0,
      userMinutes = 0,
    } = req.body;

    // Zeitlimit in Minuten berechnen
    const totalMinutes =
      parseInt(userHours, 10) * 60 + parseInt(userMinutes, 10);

    // Prompt bauen – nur Werte einfügen, die nicht "None" sind
    const details = `
${userMood !== "None" ? `- Mood: ${userMood}` : ""}
${userIntensity !== "None" ? `- Intensity: ${userIntensity}` : ""}
${userDisabilityImpact !== "None" ? `- Disability Impact: ${userDisabilityImpact}` : ""}
${userCategories !== "None" ? `- Category: ${userCategories}` : ""}
${userGoal !== "None" ? `- Goal: ${userGoal}` : ""}
${userPersons !== "None" ? `- Persons: ${userPersons}` : ""}
${userAge !== "None" ? `- Age: ${userAge}` : ""}
${userLocation !== "None" ? `- Location: ${userLocation}` : ""}
- Time limit: ${totalMinutes} minutes
    `.trim();

    const prompt = `
Create a short, clear and fun challenge based on these parameters:

${details}

Rules:
1. The challenge must fit exactly into the given time limit of ${totalMinutes} minutes.
2. Use only the provided parameters, do not ask for missing ones.
3. The output must be a single challenge in max. 3 sentences.
4. Do not output lists, bullet points, or explanations.
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a creative challenge generator. Answer only with the challenge text.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.8,
    });

    const challengeText = response.choices[0].message.content.trim();

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
