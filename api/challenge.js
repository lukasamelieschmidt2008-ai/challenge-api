export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
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
      userMinutes,
    } = req.body;

    // Debug: einfach alles zurückgeben, was angekommen ist
    return res.status(200).json({
      receivedStates: {
        userMood,
        userIntensity,
        userDisabilityImpact,
        userCategories,
        userGoal,
        userPersons,
        userAge,
        userLocation,
        userHours,
        userMinutes,
      },
    });
  } catch (error) {
    console.error("Error receiving states:", error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
