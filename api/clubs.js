const { getAll, buildClubsFrom } = require('./_store');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const matches = await getAll();
    res.status(200).json(buildClubsFrom(matches));
  } catch (err) {
    res.status(500).json({ error: 'Gagal memuat data. Pastikan Vercel KV sudah terhubung ke project.', detail: err.message });
  }
};
