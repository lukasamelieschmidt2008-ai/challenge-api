import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus dem Body auslesen
    const {
      userMood = "Neutral",
      userIntensity = "Medium",
      userDisabilityImpact = "None",
      userCategories = "None",
      userGoal = "None",
      userPersons = "Solo",
      userAge = "Any",
      userLocation = "Any",
      userHours = 0,
      userMinutes = 0
    } = req.body;

    // Zeitlimit berechnen
    const totalMinutes = parseInt(userHours) * 60 + parseInt(userMinutes);

    // Prompt bauen, None-Werte sauber behandeln
    const prompt = `
Erstelle eine kreative Challenge basierend auf diesen Angaben:
${userMood !== "None" ? `- Stimmung: ${userMood}` : ""}
${userIntensity !== "None" ? `- Intensität: ${userIntensity}` : ""}
${userDisabilityImpact !== "None" ? `- Beeinträchtigung: ${userDisabilityImpact}` : ""}
${userCategories !== "None" ? `- Kategorie: ${userCategories}` : ""}
${userGoal !== "None" ? `- Ziel: ${userGoal}` : ""}
${userPersons !== "None" ? `- Personenanzahl: ${userPersons}` : ""}
${userAge !== "None" ? `- Alter: ${userAge}` : ""}
${userLocation !== "None" ? `- Ort: ${userLocation}` : ""}
- Zeitlimit: ${totalMinutes} Minuten

Gib nur eine kurze Challenge aus, die in dieser Zeit machbar ist.`;
    
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du bist ein kreativer Challenge-Generator. Antworte nur mit der Aufgabe." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    const challengeText = response.choices[0].message.content;

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
