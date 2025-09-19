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

Regeln:
1. Die Challenge muss in ${totalMinutes} Minuten machbar sein. 
2. Die Challenge MUSS die Kategorie ${userCategories} berücksichtigen. 
   - Fitness/Mobility = Bewegung.  
   - Mind = mentale Übung.  
   - Creative = kreativer Ausdruck.  
   - Social = soziale Interaktion (auch digital möglich, wenn Solo).  
   - Nature = Naturbezug (nur Outside).  
   - Wenn "None", dann freie Wahl.  
3. Stimmung und Intensität bestimmen den Schwierigkeitsgrad (z. B. Sad + Medium = leichte, aufmunternde Bewegung).  
4. Einschränkungen ("Disability Impact") müssen berücksichtigt werden.  
   - "Mild" = leichte Anpassung, kein Überfordern.  
5. Location & Personenanzahl MÜSSEN beachtet werden (Inside/Outside, Solo/Duo usw.).  
6. Keine Atemübungen oder statische Aufgaben, außer Kategorie = "Mind".  
7. Antworte nur mit einem einzigen Satz für die Challenge.

Beispiel:
- Mood=Sad, Intensity=Medium, Category=Mobility, Time=10min, Inside → "Mach 10 Minuten lang sanfte Dehnübungen im Zimmer und bewege dich zu ruhiger Musik."
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
