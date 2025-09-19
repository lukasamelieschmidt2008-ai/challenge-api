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

    const totalMinutes = parseInt(userHours) * 60 + parseInt(userMinutes);

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // GPT-Prompt
    const prompt = `
Du bist ein kreativer Challenge-Generator. Erstelle eine Aufgabe basierend auf den folgenden Angaben:

- Stimmung: ${userMood !== "None" ? userMood : "beliebig"}
- Intensität: ${userIntensity !== "None" ? userIntensity : "mittel"}
- Beeinträchtigung: ${userDisabilityImpact !== "None" ? userDisabilityImpact : "keine"}
- Kategorie: ${userCategories !== "None" ? userCategories : "offen"}
- Ziel: ${userGoal !== "None" ? userGoal : "offen"}
- Personenanzahl: ${userPersons !== "None" ? userPersons : "beliebig"}
- Alter: ${userAge !== "Any" ? userAge : "alle Altersgruppen"}
- Ort: ${userLocation !== "Any" ? userLocation : "beliebig"}
- Zeitlimit: ${totalMinutes} Minuten

⚠️ WICHTIG:
- Die Aufgabe muss in der angegebenen Zeit machbar sein.
- Antworte **nur** mit der Aufgabe, ohne Einleitung oder Extra-Texte.
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
