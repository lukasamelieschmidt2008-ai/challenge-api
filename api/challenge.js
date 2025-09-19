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
ALLE Eingaben sind vorhanden. 
Wenn eine Eingabe "None" lautet, behandle sie neutral (freie Wahl). 
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

Kategorien müssen eingehalten werden:
- Fitness = körperliche Übung
- Mobility = Bewegung, Stretching, Balance
- Mind = mentale Übung, Fokus
- Creative = etwas erschaffen oder gestalten
- Digital = digitale Aktivität (Smartphone/PC)
- Social = Interaktion mit anderen (auch online)
- Self-Care = sich um sich selbst kümmern
- Nature = Naturbezug (nur Outside)
- Mission = kleine Aufgabe oder Auftrag
- Learning = Wissen aneignen oder üben
- None = freie Wahl

Regeln:
1. Die Challenge darf die Zeit nicht überschreiten (${totalMinutes} Minuten).
2. Die Kategorie ${userCategories} MUSS eingehalten werden.
3. Das Ziel ${userGoal} MUSS berücksichtigt werden (z. B. Learning = etwas Neues lernen).
4. Stimmung und Intensität bestimmen, wie aktiv die Aufgabe ist (Sad + Medium = leicht, positiv, machbar).
5. Einschränkungen ("Disability Impact") berücksichtigen → Mild = nur leicht angepasst.
6. Ort und Personenanzahl MÜSSEN beachtet werden.
7. Keine Atem- oder Visualisierungsübungen, außer Kategorie = "Mind".
8. Antworte NUR mit einem Satz für die Challenge.

Beispiele:
- Mood=Sad, Intensity=Medium, Category=Learning, Time=10min, Outside → "Gehe 10 Minuten nach draußen und lerne dabei fünf neue Wörter einer Fremdsprache, indem du sie laut aussprichst."
- Mood=Happy, Intensity=High, Category=Fitness, Time=15min, Inside → "Mach 3 Runden á 10 Kniebeugen, 10 Liegestütze und 10 Hampelmänner."
- Mood=Neutral, Intensity=Low, Category=Creative, Time=5min, Inside → "Zeichne 5 Minuten lang ein Bild nur mit Kreisen."
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
