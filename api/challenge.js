import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Key bleibt sicher auf Server
});

// Dein geheimes Token, das FlutterFlow mitsendet
const SECRET_TOKEN = process.env.MY_SECRET_TOKEN;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, ...userInputs } = req.body;

    // 🔒 Token prüfen
    if (!token || token !== SECRET_TOKEN) {
      return res.status(403).json({ error: "Unauthorized request" });
    }

    // Debug: Eingaben loggen
    console.log("📥 Eingaben empfangen:", userInputs);

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
    } = userInputs;

    const totalMinutes =
      (parseInt(userHours, 10) || 0) * 60 + (parseInt(userMinutes, 10) || 0);

    const disabilityDescription = {
      None: "Keine Einschränkungen, normale Übungen möglich.",
      Mild: "Leichte Anpassungen nötig, leichte Variation der Intensität.",
      Moderate: "Schonendere Versionen, wenig Sprünge.",
      Severe: "Alle Übungen müssen sitzend oder liegend machbar sein.",
      Complex: "Kognitive Einschränkungen: klare Schritt-für-Schritt-Anweisungen, einfache Sprache, langsames Tempo.",
    }[userDisabilityImpact] || "Keine speziellen Anpassungen.";

    const prompt = `
Du bist ein Challenge-Generator.
Erstelle genau EINE Challenge, die zu den Eingaben passt.
Berücksichtige jede Eingabe.

Eingaben:
- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Einschränkungen: ${userDisabilityImpact} (${disabilityDescription})
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}
- Dauer: ${totalMinutes} Minuten

Regeln:
1. Die Challenge dauert exakt ${totalMinutes} Minuten.
2. Benutze genau die Kategorie ${userCategories}.
3. Die Personenanzahl ist ${userPersons}. Passe die Aufgabe daran an.
4. Berücksichtige die Einschränkungen (${userDisabilityImpact}) entsprechend.
5. Intensität ${userIntensity} muss klar spürbar sein.
6. Ort (${userLocation}) berücksichtigen.
7. Stimmung (${userMood}) soll erkennbar sein.
8. Antworte nur im Format: {challenge: "..."}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const challengeText = completion.choices[0].message.content;

    console.log("✅ GPT Antwort:", challengeText);

    return res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error("❌ Fehler im Handler:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
