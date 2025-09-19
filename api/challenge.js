import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
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

    const totalMinutes = parseInt(userHours) * 60 + parseInt(userMinutes);

    const prompt = `
You are a creative challenge generator.
Create **one short, actionable challenge** that can be **completed in exactly ${totalMinutes} minutes**.
Include only the following parameters if they are not "None":
- Mood: ${userMood !== "None" ? userMood : "any"}
- Intensity: ${userIntensity !== "None" ? userIntensity : "any"}
- Disability Impact: ${userDisabilityImpact !== "None" ? userDisabilityImpact : "any"}
- Category: ${userCategories !== "None" ? userCategories : "any"}
- Goal: ${userGoal !== "None" ? userGoal : "any"}
- Participants: ${userPersons !== "None" ? userPersons : "any"}
- Age: ${userAge !== "None" ? userAge : "any"}
- Location: ${userLocation !== "None" ? userLocation : "any"}

⚠️ Important: The challenge **must be exactly ${totalMinutes} minutes long**. 
Do not round up or down. 
Do not include any extra labels or JSON formatting. Only return the challenge text.
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a concise, precise challenge generator." },
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
