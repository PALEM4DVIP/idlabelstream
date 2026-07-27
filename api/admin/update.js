// api/admin/update.js
// Endpoint TERPROTEKSI — hanya bisa diakses dengan header x-admin-token
// yang cocok dengan env var ADMIN_TOKEN (di-set lewat dashboard Vercel).
//
// POST/PATCH /api/admin/update
// Body: { id: "198", homeScore: 1, awayScore: 0, status: "live", ... }

const { updateMatch } = require("../_store");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST" && req.method !== "PATCH") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "Token admin salah atau tidak ada" });
    return;
  }

  const { id, ...updates } = req.body || {};
  if (!id) {
    res.status(400).json({ error: "Field 'id' wajib diisi" });
    return;
  }

  try {
    const updated = await updateMatch(id, updates);
    if (!updated) {
      res.status(404).json({ error: "Pertandingan dengan id tersebut tidak ditemukan" });
      return;
    }
    res.status(200).json({ match: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
