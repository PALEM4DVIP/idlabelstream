// api/admin/matches.js
// Endpoint TERPROTEKSI (butuh header x-admin-token yang cocok dengan env ADMIN_TOKEN)
// dipakai dashboard admin untuk kelola jadwal + skor secara penuh.
//
// GET    /api/admin/matches            -> daftar lengkap (termasuk streamUrl)
// POST   /api/admin/matches            -> tambah pertandingan baru
// PATCH  /api/admin/matches            -> update pertandingan (body wajib berisi id)
// DELETE /api/admin/matches?id=xxx     -> hapus pertandingan

const { getAll, create, update, remove } = require("../_store");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const token = req.headers["x-admin-token"];
  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "Token admin salah atau tidak ada" });
    return;
  }

  try {
    if (req.method === "GET") {
      const matches = await getAll();
      res.status(200).json({ matches });
      return;
    }

    if (req.method === "POST") {
      const newMatch = await create(req.body || {});
      res.status(201).json({ match: newMatch });
      return;
    }

    if (req.method === "PATCH" || req.method === "PUT") {
      const { id, ...updates } = req.body || {};
      if (!id) {
        res.status(400).json({ error: "Field 'id' wajib diisi" });
        return;
      }
      const updated = await update(id, updates);
      if (!updated) {
        res.status(404).json({ error: "Pertandingan tidak ditemukan" });
        return;
      }
      res.status(200).json({ match: updated });
      return;
    }

    if (req.method === "DELETE") {
      const id = req.query.id || (req.body && req.body.id);
      if (!id) {
        res.status(400).json({ error: "Parameter 'id' wajib diisi" });
        return;
      }
      const ok = await remove(id);
      if (!ok) {
        res.status(404).json({ error: "Pertandingan tidak ditemukan" });
        return;
      }
      res.status(200).json({ deleted: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
