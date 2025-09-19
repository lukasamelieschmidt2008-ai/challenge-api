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
Create a creative challenge based on the following inputs:
${userMood !== "None" ? `- Mood: ${userMood}` : ""}
${userIntensity !== "None" ? `- Intensity: ${userIntensity}` : ""}
${userDisabilityImpact !== "None" ? `- Disability Impact: ${userDisabilityImpact}` : ""}
${userCategories !== "None" ? `- Category: ${userCategories}` : ""}
${userGoal !== "None" ? `- Goal: ${userGoal}` : ""}
${userPersons !== "None" ? `- Participants: ${userPersons}` : ""}
${userAge !== "None" ? `- Age: ${userAge}` : ""}
${userLocation !== "None" ? `- Location: ${userLocation}` : ""}
- Time limit: ${totalMinutes} minutes

Return only the challenge text, nothing else. Do not include "{challenge: ...}" or JSON formatting.
    `;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative challenge generator. Respond only with the challenge text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    // Rohtext holen
    const challengeTextRaw = response.choices[0].message.content.trim();

    // Falls doch "{challenge: ...}" vorkommt → rausfiltern
    const challengeText = challengeTextRaw
      .replace(/^\{?challenge:\s*/i, "")
      .replace(/\}$/i, "")
      .trim();

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
