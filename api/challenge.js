// /api/debug.js
export default function handler(req, res) {
  try {
    // x-www-form-urlencoded kommt direkt als req.body, alles Strings
    console.log("📥 Received body:", req.body);

    // Rückgabe an FlutterFlow
    return res.status(200).json({
      message: "Debug API received the following x-www-form-urlencoded data",
      receivedBody: req.body,
      receivedHeaders: req.headers,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
