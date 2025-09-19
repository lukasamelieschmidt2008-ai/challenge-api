import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus dem Body auslesen mit Defaults
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

    // Prompt zusammenbauen, None/Any-Werte sauber ignorieren
    const promptLines = [];
    if (userMood !== "None") promptLines.push(`- Mood: ${userMood}`);
    if (userIntensity !== "None") promptLines.push(`- Intensity: ${userIntensity}`);
    if (userDisabilityImpact !== "None") promptLines.push(`- Disability Impact: ${userDisabilityImpact}`);
    if (userCategories !== "None") promptLines.push(`- Category: ${userCategories}`);
    if (userGoal !== "None") promptLines.push(`- Goal: ${userGoal}`);
    if (userPersons !== "None") promptLines.push(`- Participants: ${userPersons}`);
    if (userAge !== "Any") promptLines.push(`- Age: ${userAge}`);
    if (userLocation !== "Any") promptLines.push(`- Location: ${userLocation}`);
    promptLines.push(`- Duration: ${totalMinutes} minutes`);

    const prompt = `
Create a single, short, realistic challenge based on the following inputs:
${promptLines.join("\n")}

Important:
- Only create a challenge that can realistically be completed within the given duration and location.
- Reply **only with the challenge text**, no JSON, no labels, no extra formatting.
- Keep it concise, clear, and actionable.
`;

    // OpenAI-Client initialisieren
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Chat Completion anfordern
    const response = await client.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: "You are a creative challenge generator. Reply only with the challenge text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.9
    });

    // Challenge aus der Antwort extrahieren
    const challengeText = response.choices[0].message.content.trim();

    res.status(200).json({ challenge: challengeText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
