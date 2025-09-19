// File: api/challenge.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
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
      (Number(userHours) || 0) * 60 + (Number(userMinutes) || 0);

    const prompt = `
Du bist ein Challenge-Generator. Deine Aufgabe ist es, eine klare, kurze und realistische Challenge zu erstellen. 
ALLE Eingaben sind bereits vorhanden. 
Wenn eine Eingabe "None" lautet, behandle sie als neutral (also freie Wahl oder ohne Einschränkung). 
WICHTIG: Fordere niemals zusätzliche Eingaben an. Antworte IMMER nur mit einer Challenge.

Eingaben des Users:
- Dauer (maximal): ${totalMinutes} Minuten
- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Einschränkungen: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}

Regeln:
1. Die Challenge darf die Zeit von ${totalMinutes} Minuten nicht überschreiten.
2. Die Challenge muss realistisch und durchführbar sein.
3. Wenn "None" angegeben ist, bedeutet das neutral – benutze eine beliebige passende Option, aber frag nicht nach Infos.
4. Keine unmöglichen oder widersprüchlichen Aufgaben (z. B. 100 km laufen in 5 Minuten, draußen wenn "Inside").
5. Antworte nur mit der Challenge als kurzem, klaren Satz.

Beispiele:
- Eingaben: Mood=Happy, Intensity=Low, Time=5 Minuten, Location=Inside → Antwort: "Tanze für 5 Minuten zu deinem Lieblingslied im Zimmer."
- Eingaben: Mood=Sad, Intensity=Medium, Time=10 Minuten, Goal=Relaxation → Antwort: "Mach eine 10-minütige Atemübung mit ruhiger Musik."

Jetzt generiere die Challenge für die obigen Eingaben:
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.6,
    });

    const challenge = response.choices[0].message.content.trim();

    return res.status(200).json({ challenge });
  } catch (error) {
    console.error("Challenge API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
