export function errorHandler(err, req, res, next) {
  console.error("🔥 Backend Error:", err.message);
  res.status(500).json({ error: err.message });
}
