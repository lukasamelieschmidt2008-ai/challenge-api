import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
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
      userMinutes = 0
    } = req.body;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // GPT-Prompt
    const prompt = `
Du bist ein kreativer Challenge-Generator. Erstelle eine Aufgabe basierend auf den folgenden Angaben:

- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Beeinträchtigung: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}
- Zeitlimit: ${userHours}h ${userMinutes}min

⚠️ WICHTIG:
- Wenn ein Wert "None" oder "Any" ist, ignoriere ihn nicht als Fehler, sondern wähle ein neutrales, offenes Ziel oder Konzept.
- Die Aufgabe muss innerhalb der angegebenen Zeit machbar sein.
- Antworte nur mit der Aufgabe, keine Einleitung oder Extra-Texte.
- Kurz, klar, realistisch.
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein kreativer Challenge-Generator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.9
    });

    const challengeText = response.choices?.[0]?.message?.content || "⚠️ Keine Antwort von GPT";

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
