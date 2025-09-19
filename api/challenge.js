export default function handler(req, res) {
  console.log("📥 Received body:", req.body);
  return res.status(200).json({ received: req.body });
}
