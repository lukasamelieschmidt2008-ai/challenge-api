import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Werte aus Body auslesen, Default-Werte setzen
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

    // Zeitlimit in Minuten berechnen (robust gegen Strings oder invalid values)
    const totalMinutes = (() => {
      const hours = parseInt(userHours) || 0;
      const minutes = parseInt(userMinutes) || 0;
      return hours * 60 + minutes;
    })();

    // Prompt bauen, None-Werte ignorieren
    const promptLines = [];
    if (userMood !== "None") promptLines.push(`- Mood: ${userMood}`);
    if (userIntensity !== "None") promptLines.push(`- Intensity: ${userIntensity}`);
    if (userDisabilityImpact !== "None") promptLines.push(`- Disability Impact: ${userDisabilityImpact}`);
    if (userCategories !== "None") promptLines.push(`- Category: ${userCategories}`);
    if (userGoal !== "None") promptLines.push(`- Goal: ${userGoal}`);
    if (userPersons !== "None") promptLines.push(`- Participants: ${userPersons}`);
    if (userAge !== "None") promptLines.push(`- Age: ${userAge}`);
    if (userLocation !== "None") promptLines.push(`- Location: ${userLocation}`);
    promptLines.push(`- Duration: ${totalMinutes} minutes`);

    const prompt = `You are a creative challenge generator. Generate **one concise challenge** in English that exactly fits the given parameters. Include any relevant instructions, and ensure the challenge is feasible within the duration. Only output the challenge text, do not include any JSON or extra labels. Here are the parameters:\n${promptLines.join("\n")}`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative challenge generator." },
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
