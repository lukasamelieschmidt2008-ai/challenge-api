import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // States aus FlutterFlow
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

    // Debug: Ausgabe ins Log
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

    // Dauer berechnen
    const totalMinutes =
      (parseInt(userHours, 10) || 0) * 60 + (parseInt(userMinutes, 10) || 0);

    console.log("⏱️ Berechnete Dauer (Minuten):", totalMinutes);

    const prompt = `
Du bist ein Challenge-Generator. 
Erstelle GENAU EINE Challenge, die zu den Eingaben passt. 
Alle Eingaben sind verbindlich. 

Eingaben:
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
1. Die Challenge dauert exakt ${totalMinutes} Minuten. Nicht mehr, nicht weniger.
2. Benutze genau die Kategorie ${userCategories}. Keine andere.
3. Die Personenanzahl ist ${userPersons}. Passe die Aufgabe daran an.
4. Einschränkungen (${userDisabilityImpact}) müssen beachtet werden.
5. Intensität ${userIntensity} muss klar spürbar sein.
6. Ort (${userLocation}) muss berücksichtigt werden.
7. Stimmung (${userMood}) soll in der Formulierung erkennbar sein.
8. Antworte nur im Format:
{challenge: "…"}
`;

    // GPT Call
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
