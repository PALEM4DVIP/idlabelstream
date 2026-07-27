// api/_store.js
// PENTING: file ini TIDAK mengubah _data.js sama sekali.
// KV hanya menyimpan PERUBAHAN (override) skor/status/corner per id pertandingan.
// Saat data diminta, override digabung (merge) di atas data statis dari _data.js.
//
// Kenapa begini? Supaya field seperti streamUrl, warna tim, dsb tetap
// dikelola di _data.js seperti biasa (dan youtube-live.js / bagian lain
// yang sudah pakai _data.js tidak perlu diubah / tidak ikut terpengaruh).

const { kv } = require("@vercel/kv");
const { matches: staticMatches } = require("./_data");

const KEY = "match-overrides";

// Field yang boleh diubah lewat admin panel
const EDITABLE_FIELDS = [
  "status",
  "homeScore",
  "awayScore",
  "htScore",
  "cornerHome",
  "cornerAway",
  "time"
];

async function getOverrides() {
  const data = await kv.get(KEY);
  return data || {};
}

// Data "hidup" = data statis _data.js + override terbaru dari KV
async function getMatches() {
  const overrides = await getOverrides();
  return staticMatches.map((m) => {
    const o = overrides[m.id];
    return o ? { ...m, ...o } : m;
  });
}

async function updateMatch(id, updates) {
  const overrides = await getOverrides();
  const current = overrides[String(id)] || {};

  const safeUpdates = {};
  for (const key of EDITABLE_FIELDS) {
    if (key in updates) safeUpdates[key] = updates[key];
  }

  overrides[String(id)] = { ...current, ...safeUpdates };
  await kv.set(KEY, overrides);

  const base = staticMatches.find((m) => m.id === String(id));
  if (!base) return null;
  return { ...base, ...overrides[String(id)] };
}

// Setara buildClubs() di _data.js, tapi menerima array matches sebagai parameter
// supaya bisa dipakai dengan data yang sudah digabung override (bukan cuma data statis)
function buildClubsFrom(matches) {
  const clubMap = new Map();

  matches.forEach((m) => {
    [
      { name: m.home, color: m.homeColor },
      { name: m.away, color: m.awayColor }
    ].forEach(({ name, color }) => {
      if (!name) return;
      if (!clubMap.has(name)) {
        clubMap.set(name, { name, color: color || "#1F4D2E", matches: [] });
      }
      clubMap.get(name).matches.push({
        id: m.id,
        opponent: name === m.home ? m.away : m.home,
        league: m.league,
        time: m.time,
        status: m.status
      });
    });
  });

  return Array.from(clubMap.values());
}

module.exports = { getMatches, updateMatch, buildClubsFrom };
