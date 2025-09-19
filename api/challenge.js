import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const {
      userMood, userIntensity, userDisabilityImpact, userCategories,
      userGoal, userPersons, userAge, userLocation, userHours, userMinutes
    } = req.body;

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

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
- Zeitlimit: ${userHours}h ${userMinutes}min
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein kreativer Challenge-Generator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9,
    });

    const challengeText = response.choices[0].message.content;

    res.status(200).json({ challenge: challengeText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
