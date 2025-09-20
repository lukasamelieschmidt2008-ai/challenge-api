// /api/debug.js

export default function handler(req, res) {
  // Loggt den Body in der Vercel-Konsole
  console.log("📥 Received body:", req.body);

  // Optional: alle Header loggen
  console.log("📥 Received headers:", req.headers);

  // Einfach die Werte zurückgeben, damit FlutterFlow sie sehen kann
  return res.status(200).json({
    message: "Debug API received the following data",
    receivedBody: req.body,
    receivedHeaders: req.headers,
  });
}
