import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus dem Body auslesen mit Default-Werten
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

    // Zeitlimit in Minuten berechnen
    const totalMinutes = parseInt(userHours) * 60 + parseInt(userMinutes);

    // Prompt bauen, None-Werte ignorieren, Location beachten
    const prompt = `
Create a single, short challenge based on the following inputs:
${userMood !== "None" ? `- Mood: ${userMood}` : ""}
${userIntensity !== "None" ? `- Intensity: ${userIntensity}` : ""}
${userDisabilityImpact !== "None" ? `- Disability Impact: ${userDisabilityImpact}` : ""}
${userCategories !== "None" ? `- Category: ${userCategories}` : ""}
${userGoal !== "None" ? `- Goal: ${userGoal}` : ""}
${userPersons !== "None" ? `- Participants: ${userPersons}` : ""}
${userAge !== "Any" ? `- Age: ${userAge}` : ""}
${userLocation !== "Any" ? `- Location: ${userLocation}` : ""}
- Duration: ${totalMinutes} minutes

Important:
- Only create a challenge that can realistically be completed within the given duration and location.
- Respond **directly with the challenge text only**, no extra labels or formatting.
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a creative challenge generator. Reply only with the challenge text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.9
    });

    const challengeText = response.choices[0].message.content.trim();

    res.status(200).json({ challenge: challengeText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
