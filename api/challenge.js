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
      userMinutes = 5
    } = req.body;

    // Gesamtzeit in Minuten berechnen
    const totalMinutes = parseInt(userHours) * 60 + parseInt(userMinutes);

    // Prompt bauen – None-Werte sauber behandeln
    let prompt = `You are a creative challenge generator.
Create **one short, actionable challenge** that can be realistically completed in ${totalMinutes} minutes.
Follow these rules strictly:
- Only include inputs that are not "None".
- Include Mood: ${userMood !== "None" ? userMood : "any"}.
- Include Intensity: ${userIntensity !== "None" ? userIntensity : "any"}.
- Include Disability Impact: ${userDisabilityImpact !== "None" ? userDisabilityImpact : "any"}.
- Include Category: ${userCategories !== "None" ? userCategories : "any"}.
- Include Goal: ${userGoal !== "None" ? userGoal : "any"}.
- Participants: ${userPersons !== "None" ? userPersons : "any"}.
- Age: ${userAge !== "None" ? userAge : "any"}.
- Location: ${userLocation !== "None" ? userLocation : "any"}.
- Only generate the challenge text itself. Do not include any JSON formatting or extra labels.`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a concise, creative challenge generator." },
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
