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

    const totalMinutes =
      (Number(userHours) || 0) * 60 + (Number(userMinutes) || 0);

    // Prompt bauen, mit "None" als neutral
    const prompt = `
Du bist ein Challenge-Generator. Deine Aufgabe ist es, eine logische, realistische und machbare Challenge zu erstellen.
Alle Eingaben sind gesetzt. Wenn eine Eingabe "None" ist, behandle sie neutral (also als keine Einschränkung oder freie Wahl).

Bedingungen:
- Maximale Dauer: ${totalMinutes} Minuten.
- Stimmung (Mood): ${userMood}.
- Intensität: ${userIntensity}.
- Einschränkungen: ${userDisabilityImpact}.
- Kategorie: ${userCategories}.
- Ziel: ${userGoal}.
- Personenanzahl: ${userPersons}.
- Alter: ${userAge}.
- Ort: ${userLocation}.

Regeln:
1. Die Challenge muss in der angegebenen Zeit machbar sein.
2. Berücksichtige Stimmung, Intensität und Einschränkungen passend.
3. Kategorie, Ziel, Personenanzahl, Alter und Ort müssen eingehalten werden (außer sie sind "None").
4. Keine unmöglichen oder widersprüchlichen Aufgaben (z. B. 100 km rennen in 5 Minuten, draußen wenn "Inside" angegeben ist).
5. Formuliere die Challenge als kurzen, klaren Satz.
6. Antworte nur mit der Challenge, ohne Erklärungen.

Gib nur die Challenge zurück.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    const challenge = response.choices[0].message.content.trim();

    return res.status(200).json({ challenge });
  } catch (error) {
    console.error("Challenge API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
