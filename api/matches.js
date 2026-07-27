const { matches } = require('./_data');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(matches.map(({ streamUrl, ...rest }) => rest));
};
