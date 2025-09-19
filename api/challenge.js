import OpenAI from "openai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    // Werte aus dem Body
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
      userMinutes
    } = req.body;

    // OpenAI-Client mit Key aus Environment
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Optimierter Prompt für GPT
    const prompt = `
Du bist ein kreativer Challenge-Generator. 
Erstelle eine Aufgabe, die genau zu den folgenden Angaben passt und **in der angegebenen Zeit machbar ist**. 
Antworte **nur mit der Aufgabe**, ohne Einleitung oder Extra-Text.

- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Beeinträchtigung: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}
- Zeitlimit: ${userHours} Stunden ${userMinutes} Minuten

⚠️ Wichtige Hinweise:
1. Die Aufgabe darf **nicht länger dauern** als die angegebene Zeit.
2. Wenn die Aufgabe mehrere Personen beinhaltet, muss sie innerhalb der Zeit machbar sein, **ohne dass sich jemand extra treffen muss**.
3. Formuliere die Aufgabe kurz, klar und realistisch.
4. Antworte nur mit einem Satz oder maximal 2 kurzen Absätzen.
`;

    // GPT-Request
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein kreativer Challenge-Generator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    // Antwort auslesen
    const challengeText = response.choices[0].message.content;

    // JSON zurückgeben
    res.status(200).json({ challenge: challengeText });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
