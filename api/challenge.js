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

Eingaben:
- Dauer: maximal ${totalMinutes} Minuten
- Stimmung: ${userMood}
- Intensität: ${userIntensity}
- Einschränkungen: ${userDisabilityImpact}
- Kategorie: ${userCategories}
- Ziel: ${userGoal}
- Personenanzahl: ${userPersons}
- Alter: ${userAge}
- Ort: ${userLocation}

Feste Regeln:
1. Die Challenge MUSS in ${totalMinutes} Minuten machbar sein (nicht länger, nicht kürzer als 1 Minute).
2. Die Kategorie MUSS exakt eingehalten werden:
   - Mobility = Bewegungsaufgabe (Stretching, leichte Aktivität, Balance).
   - Fitness = Training.
   - Mind = mentale Übung.
   - Creative = kreatives Gestalten.
   - Digital = digitale Aktivität.
   - Social = Interaktion.
   - Self-Care = Pflege, Erholung.
   - Nature = Bezug zur Natur.
   - Mission = kleine konkrete Aufgabe.
   - Learning = etwas Neues lernen.
   - None = freie Wahl.
3. Das Ziel ${userGoal} MUSS berücksichtigt werden (Relaxation = beruhigende, entspannende Variante).
4. Stimmung + Intensität bestimmen die Ausprägung (Neutral + Medium = moderat, nicht zu leicht, nicht zu schwer).
5. Ort & Personenanzahl sind verpflichtend (Outside + Group = draußen in einer Gruppe).
6. KEINE Atemübungen oder reinen Denkaufgaben, wenn Kategorie ≠ "Mind".
7. Antworte nur mit EINEM klaren Satz für die Challenge.

Beispiele:
- Mood=Neutral, Intensity=Medium, Category=Mobility, Goal=Relaxation, Time=10min, Outside, Group → "Trefft euch draußen im Kreis und macht gemeinsam 10 Minuten lang sanfte Dehnübungen im Stehen."
- Mood=Happy, Intensity=High, Category=Fitness, Time=15min, Inside → "Macht 3 Runden á 10 Liegestütze, 10 Sit-ups und 10 Hampelmänner."
- Mood=Sad, Intensity=Low, Category=Self-Care, Time=5min, Inside → "Setz dich bequem hin und höre für 5 Minuten beruhigende Musik."
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
