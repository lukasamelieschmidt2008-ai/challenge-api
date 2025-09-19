// File: api/challenge.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
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

    // Zeitlimit in Minuten berechnen
    const totalMinutes = (Number(userHours) || 0) * 60 + (Number(userMinutes) || 0);

    // Prompt bauen
    const prompt = `
Du bist ein Challenge-Generator. Deine Aufgabe ist es, eine logische, realistische und machbare Challenge zu erstellen.
Halte dich strikt an die Bedingungen des Users.

Bedingungen:
- Dauer: maximal ${totalMinutes} Minuten (nicht länger!).
- Stimmung (Mood): ${userMood}.
- Intensität: ${userIntensity}.
- Einschränkungen: ${userDisabilityImpact}.
- Kategorie: ${userCategories}.
- Ziel: ${userGoal}.
- Personenanzahl: ${userPersons}.
- Alter: ${userAge}.
- Ort: ${userLocation}.

Regeln:
- Die Challenge muss realistisch in der angegebenen Zeit machbar sein.
- Kein Widerspruch (z.B. keine Outdoor-Aufgaben, wenn "Inside" gewählt wurde).
- Keine unmöglichen Aufgaben (z.B. "100 km rennen" bei 5 Minuten).
- Schreibe die Challenge als kurzen, klaren Satz.

Gib nur die Challenge zurück, ohne Erklärungen.
    `;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini", // günstig & stark, du kannst auch andere Modelle testen
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    const challenge = response.choices[0].message.content.trim();

    return res.status(200).json({ challenge });
  } catch (error) {
    console.error("Challenge API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
