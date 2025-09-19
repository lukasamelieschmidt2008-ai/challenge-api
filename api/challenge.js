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
Du bist ein intelligenter Challenge-Generator. Deine Aufgabe ist es, eine klare, kurze und realistische Challenge zu erstellen. 
ALLE Eingaben sind vorhanden. 
Wenn eine Eingabe "None" lautet, behandle sie als neutral (freie Wahl). 
WICHTIG: Antworte IMMER nur mit einer Challenge, niemals mit Nachfragen oder Erklärungen.

Eingaben des Users:
- Dauer: maximal ${totalMinutes} Minuten
- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Einschränkungen: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}

Wichtige Regeln:
1. Die Challenge muss in ${totalMinutes} Minuten machbar sein.
2. Nutze die Stimmung (Mood), Intensität und das Ziel, um die Art der Challenge zu bestimmen. 
   Beispiel: "Energetic" + "Very High" = körperlich fordernde Aufgabe. "Sad" + "Low" = beruhigende Aufgabe.
3. Einschränkungen ("Disability Impact") müssen berücksichtigt werden:
   - "Complex" = sehr einfache Bewegungen, keine gefährlichen Aufgaben, keine hohen körperlichen Anforderungen.
   - "None" = keine Einschränkungen.
4. Location und Personenanzahl MÜSSEN beachtet werden (Inside/Outside, Solo/Duo usw.).
5. Die Challenge muss Spaß machen und sinnvoll klingen.
6. Antworte nur mit einem Satz.

Beispiele:
- Mood=Happy, Intensity=Low, Time=5min, Location=Inside → "Tanze für 5 Minuten in deinem Zimmer zu deinem Lieblingslied."
- Mood=Energetic, Intensity=High, Time=15min, Location=Outside, Disability=Complex → "Gehe draußen spazieren und finde in 15 Minuten so viele verschiedene Baumarten wie möglich."
- Mood=Neutral, Intensity=Medium, Goal=Learning, Time=10min → "Schreibe 5 neue Wörter in einer Fremdsprache auf und übe sie laut auszusprechen."

Jetzt generiere die passende Challenge für die Eingaben oben:
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
