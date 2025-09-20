import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    console.log("📥 Eingaben empfangen:", {
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
    });

    const totalMinutes =
      (parseInt(userHours, 10) || 0) * 60 + (parseInt(userMinutes, 10) || 0);

    console.log("⏱️ Berechnete Dauer (Minuten):", totalMinutes);

    const disabilityDescription = {
      None: "Keine Einschränkungen, normale Übungen möglich.",
      Mild: "Kleine Anpassungen nötig, leichte Variation der Intensität.",
      Moderate: "Schonendere Versionen der Übungen, wenig Sprünge.",
      Severe: "Alle Übungen müssen sitzend oder liegend machbar sein, keine Belastung der Gelenke.",
      Complex: "Kognitive Einschränkungen berücksichtigen: klare Schritt-für-Schritt-Anweisungen, einfache Sprache, langsames Tempo."
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
5. Intensität ${userIntensity} muss klar spürbar sein, aber anpassbar.
6. Ort (${userLocation}) muss berücksichtigt werden.
7. Stimmung (${userMood}) soll in der Formulierung erkennbar sein.
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
