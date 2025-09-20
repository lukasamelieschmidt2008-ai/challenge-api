import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
      (parseInt(userHours, 10) || 0) * 60 + (parseInt(userMinutes, 10) || 0);

    // Minimale Beschreibung für DisabilityImpact
    const disabilityDescription = {
      None: "keine Einschränkungen",
      Mild: "leichte Anpassungen",
      Moderate: "schonendere Versionen",
      Severe: "sitzend oder liegend, keine Belastung",
      Complex: "klare Schritt-für-Schritt-Anweisungen"
    }[userDisabilityImpact] || "keine speziellen Anpassungen";

    const prompt = `
Erstelle eine Challenge basierend auf:
- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Einschränkungen: ${disabilityDescription}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}
- Dauer: ${totalMinutes} Minuten

Antwort nur so: {challenge: "..."}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return res.status(200).json({ challenge: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
