import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus dem Body auslesen und Standardwerte setzen
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

    // Prompt für GPT bauen
    let prompt = `Create a single, actionable challenge based on the following details:\n`;

    if (userMood !== "None") prompt += `- Mood: ${userMood}\n`;
    if (userIntensity !== "None") prompt += `- Intensity: ${userIntensity}\n`;
    if (userDisabilityImpact !== "None") prompt += `- Disability Impact: ${userDisabilityImpact}\n`;
    if (userCategories !== "None") prompt += `- Category: ${userCategories}\n`;
    if (userGoal !== "None") prompt += `- Goal: ${userGoal}\n`;
    if (userPersons !== "None") prompt += `- Participants: ${userPersons}\n`;
    if (userAge !== "Any") prompt += `- Age: ${userAge}\n`;
    if (userLocation !== "Any") prompt += `- Location: ${userLocation}\n`;

    prompt += `- Time Limit: ${totalMinutes} minutes\n\n`;
    prompt += `Instructions: Only output a single challenge. The challenge must be feasible within the given time limit and location. Do not include labels like "challenge:" or JSON formatting. Keep it short, clear, and actionable.`;

    // OpenAI Client
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative challenge generator. Output only one challenge that can be completed based on the provided details." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    const challengeText = response.choices[0].message.content.trim();

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
