import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const {
    userMood,
    userIntensity,
    userDisabilityImpact,
    userCategories,
    userGoal,
    userPersons,
    userAge,
    userLocation,
    userHours,
    userMinutes
  } = req.body;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Handle "None" or empty values
  const mood = userMood && userMood !== "None" ? userMood : "any mood";
  const intensity = userIntensity && userIntensity !== "None" ? userIntensity : "any intensity";
  const disability = userDisabilityImpact && userDisabilityImpact !== "None" ? userDisabilityImpact : "any level";
  const category = userCategories && userCategories !== "None" ? userCategories : "any category";
  const goal = userGoal && userGoal !== "None" ? userGoal : "any goal";
  const persons = userPersons && userPersons !== "No Limit" ? userPersons : "any number of people";
  const age = userAge && userAge !== "Any" ? userAge : "any age group";
  const location = userLocation && userLocation !== "Any" ? userLocation : "any location";
  const hours = parseInt(userHours) || 0;
  const minutes = parseInt(userMinutes) || 0;
  const timeLimit = hours > 0 || minutes > 0 ? `${hours}h ${minutes}min` : "no specific time limit";

  // Build English prompt
  const prompt = `
Create a creative challenge based on the following user input:
- Mood: ${mood}
- Intensity: ${intensity}
- Disability Impact: ${disability}
- Category: ${category}
- Goal: ${goal}
- Persons: ${persons}
- Age group: ${age}
- Location: ${location}
- Time limit: ${timeLimit}

Please generate a short, actionable challenge that fits these parameters.
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative challenge generator. Respond only with the challenge text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.9
    });

    const challengeText = response.choices[0]?.message?.content || "⚠️ No challenge generated";

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed" });
  }
}
