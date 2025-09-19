import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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

    // Debug: prüfen, welche Werte ankommen
    console.log("📥 Received states:", req.body);

    // Dauer berechnen + Fallback
    let totalMinutes = (parseInt(userHours, 10) || 0) * 60 + (parseInt(userMinutes, 10) || 0);
    if (totalMinutes <= 0) totalMinutes = 1;

    const prompt = `
Du bist ein Challenge-Generator. Erstelle eine Challenge exakt nach den Eingaben:

- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Einschränkungen: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}
- Dauer: ${totalMinutes} Minuten

Regeln:
1. Dauer = ${totalMinutes} Minuten
2. Kategorie = ${userCategories} (Muss eingehalten werden)
3. Personenanzahl = ${userPersons}
4. Einschränkungen beachten
5. Ort beachten
6. Intensität beachten
7. Stimmung beachten
8. Nur EIN Satz, Format: {challenge: "…"}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const challengeText = completion.choices[0].message.content.trim();

    return res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error("❌ Challenge API error:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
