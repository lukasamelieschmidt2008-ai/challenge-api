import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Body auslesen und Defaults setzen
    const {
      userMood = "None",
      userIntensity = "None",
      userDisabilityImpact = "None",
      userCategories = "None",
      userGoal = "None",
      userPersons = "Solo",
      userAge = "Any",
      userLocation = "Any",
      userHours = 0,
      userMinutes = 0
    } = req.body;

    // Zeitlimit in Minuten
    const totalMinutes = parseInt(userHours) * 60 + parseInt(userMinutes);

    // Prompt bauen
    const prompt = `
You are a creative challenge generator. Generate a single challenge based on the inputs below.
Always follow these rules:

- Do NOT ask for missing inputs. Treat "None" as "no restriction".
- The challenge must be fully doable in ${totalMinutes} minutes or less.
- Consider all inputs and integrate them into the challenge.
- Output ONLY the challenge text. Do NOT include JSON, labels, or explanations.
- Keep it short, clear, and actionable.

Inputs:
Mood: ${userMood}
Intensity: ${userIntensity}
Disability Impact: ${userDisabilityImpact}
Category: ${userCategories}
Goal: ${userGoal}
Participants: ${userPersons}
Age: ${userAge}
Location: ${userLocation}
Time Limit: ${totalMinutes} minutes
`.trim();

    // OpenAI Client
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a creative challenge generator. Respond ONLY with the challenge text."
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
