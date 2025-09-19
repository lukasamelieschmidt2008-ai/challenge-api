import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus Request Body
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

    // Prompt bauen
    const prompt = `
You are a creative challenge generator. Always follow these strict rules:

Inputs for the challenge:
${userMood !== "None" ? `- Mood: ${userMood}` : ""}
${userIntensity !== "None" ? `- Intensity: ${userIntensity}` : ""}
${userDisabilityImpact !== "None" ? `- Disability Impact: ${userDisabilityImpact}` : ""}
${userCategories !== "None" ? `- Category: ${userCategories}` : ""}
${userGoal !== "None" ? `- Goal: ${userGoal}` : ""}
${userPersons !== "None" ? `- Participants: ${userPersons}` : ""}
${userAge !== "None" ? `- Age: ${userAge}` : ""}
${userLocation !== "None" ? `- Location: ${userLocation}` : ""}
- Time Limit: ${totalMinutes} minutes

Rules:
1. ALWAYS respect the time limit: the entire challenge must be fully doable within ${totalMinutes} minutes (not longer).
2. ALWAYS consider all inputs above. If an input is "None", treat it as "no specific restriction".
3. The output must be ONE clear, creative challenge that matches the given context.
4. Do not explain yourself, do not repeat the inputs.
5. Output ONLY the challenge text, nothing else (no JSON, no labels, no keys).
`.trim();

    // OpenAI-Client
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Anfrage an GPT
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a creative challenge generator. Respond only with the challenge text itself."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.9
    });

    const challengeText = response.choices[0].message.content.trim();

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error("Challenge API error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
