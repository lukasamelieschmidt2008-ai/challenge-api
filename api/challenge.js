import OpenAI from "openai";

export default async function handler(req, res) {
  // Nur POST zulassen
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Body auslesen (alles als Strings)
    const {
      userMood, userIntensity, userDisabilityImpact, userCategories,
      userGoal, userPersons, userAge, userLocation, userHours, userMinutes
    } = req.body;

    // Zahlen konvertieren
    const hours = parseInt(userHours);
    const minutes = parseInt(userMinutes);

    // OpenAI Client initialisieren
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Prompt bauen
    const prompt = `
Erstelle eine Challenge basierend auf:
- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Beeinträchtigung: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}
- Zeitlimit: ${hours}h ${minutes}min
`;

    // Chat Completion Request
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein kreativer Challenge-Generator. Antworte nur mit einer kurzen Aufgabe." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    // Challenge Text auslesen
    const challengeText = response.choices[0].message.content;

    // JSON zurückgeben
    res.status(200).json({ challenge: challengeText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
