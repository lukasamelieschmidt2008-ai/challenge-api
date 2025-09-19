// pages/api/challenge.js

import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    // Allowed values for validation
    const allowedValues = {
      userMood: ["Happy", "Sad", "Mad", "Energetic", "Neutral"],
      userIntensity: ["Low", "Medium", "High", "Very High"],
      userDisabilityImpact: ["None", "Mild", "Moderate", "Severe", "Complex"],
      userCategories: ["Fitness", "Mobility", "Mind", "Creative", "Digital", "Social", "Self-Care", "Nature", "Mission", "None"],
      userGoal: ["None", "Social", "Learning", "Fitness", "Fun", "Relaxation"],
      userPersons: ["Solo", "Duo", "Squad", "Team", "Group", "No Limit"],
      userAge: ["13-15", "16-17", "18-24", "25-34", "35+", "Any"],
      userLocation: ["Inside", "Outside", "Any"]
    };

    // Extract values with fallback
    let {
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

    // Validate inputs: if not allowed, set fallback
    function validate(value, key) {
      if (allowedValues[key] && allowedValues[key].includes(value)) {
        return value;
      }
      return allowedValues[key] ? allowedValues[key][0] : value;
    }

    userMood = validate(userMood, "userMood");
    userIntensity = validate(userIntensity, "userIntensity");
    userDisabilityImpact = validate(userDisabilityImpact, "userDisabilityImpact");
    userCategories = validate(userCategories, "userCategories");
    userGoal = validate(userGoal, "userGoal");
    userPersons = validate(userPersons, "userPersons");
    userAge = validate(userAge, "userAge");
    userLocation = validate(userLocation, "userLocation");

    // Numbers safe parse
    userHours = parseInt(userHours) || 0;
    userMinutes = parseInt(userMinutes) || 0;

    const totalMinutes = userHours * 60 + userMinutes;

    // Build dynamic prompt (skip "None")
    const prompt = `
Create a creative, short and doable challenge based on these inputs:
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
- The challenge must always be possible to complete in the given time.
- Respond ONLY with the challenge text.
- Do not include keys like {challenge: ...}, no JSON, no labels.
- If inputs are minimal or vague, still create a valid challenge.
    `.trim();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a creative challenge generator. Always output only the challenge text." },
        { role: "user", content: prompt }
      ],
      max_tokens: 250,
      temperature: 0.8,
      top_p: 0.95
    });

    let challengeText = response.choices[0]?.message?.content?.trim() || "";

    // Cleanup: remove unwanted prefixes like {challenge: ...}
    challengeText = challengeText.replace(/^{?challenge:?\s*/i, "").replace(/^\{?["']?challenge["']?\s*:\s*/i, "").trim();

    // Fallback if empty
    if (!challengeText) {
      challengeText = "Take a deep breath and smile right now.";
    }

    res.status(200).json({ challenge: challengeText });
  } catch (error) {
    console.error("Challenge API error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
