const { matches } = require('../_data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { id } = req.query;
  const match = matches.find(m => m.id === id);
  if (!match) {
    return res.status(404).json({ message: 'Pertandingan tidak ditemukan' });
  }
  res.status(200).json(match);
};
