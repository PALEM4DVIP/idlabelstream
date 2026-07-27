// api/_store.js
// Redis (via Upstash, dipasang dari Vercel Marketplace) jadi SUMBER DATA UTAMA
// supaya admin bisa nambah pertandingan baru / edit jadwal / hapus, bukan cuma
// update skor. Saat pertama kali diakses dan datanya masih kosong, di-seed dari
// data awal di bawah.
//
// Catatan: Vercel KV (paket @vercel/kv) sudah dipensiunkan per akhir 2024/2025.
// Sekarang pakai @upstash/redis, dipasang lewat Marketplace -> Upstash for Redis.
// Env var otomatis ke-inject dengan nama KV_REST_API_URL / KV_REST_API_TOKEN
// (kompatibel) atau UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.

const { Redis } = require("@upstash/redis");
const redis = Redis.fromEnv();

const KEY = "matches:list";

// Data awal — hanya dipakai SEKALI saat KV masih benar-benar kosong
const seedMatches = [
  {
    id: "198",
    league: "Copa do Brasil",
    home: "Bragantino",
    away: "Coritiba PR",
    homeColor: "#E2231A",
    awayColor: "#046A38",
    title: "Bragantino vs Coritiba PR",
    time: "2026-07-27 04:30 WIB",
    status: "live",
    homeScore: 0,
    awayScore: 0,
    htScore: "0-0",
    cornerHome: 3,
    cornerAway: 2,
    streamType: "m3u8",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    thumbnail: ""
  },
  {
    id: "199",
    league: "La Liga",
    home: "Real Madrid",
    away: "Barcelona",
    homeColor: "#FEBE10",
    awayColor: "#A50044",
    title: "Real Madrid vs Barcelona",
    time: "2026-07-28 02:00 WIB",
    status: "upcoming",
    homeScore: null,
    awayScore: null,
    htScore: "-",
    cornerHome: 0,
    cornerAway: 0,
    streamType: "iframe",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID",
    thumbnail: ""
  },
  {
    id: "200",
    league: "Premier League",
    home: "Liverpool",
    away: "Manchester City",
    homeColor: "#C8102E",
    awayColor: "#6CABDD",
    title: "Liverpool vs Manchester City",
    time: "2026-07-28 21:00 WIB",
    status: "upcoming",
    homeScore: null,
    awayScore: null,
    htScore: "-",
    cornerHome: 0,
    cornerAway: 0,
    streamType: "iframe",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID",
    thumbnail: ""
  },
  {
    id: "201",
    league: "Serie A",
    home: "AC Milan",
    away: "Inter Milan",
    homeColor: "#FB090B",
    awayColor: "#0033A0",
    title: "AC Milan vs Inter Milan",
    time: "2026-07-26 23:45 WIB",
    status: "ended",
    homeScore: 2,
    awayScore: 1,
    htScore: "1-0",
    cornerHome: 6,
    cornerAway: 4,
    streamType: "iframe",
    streamUrl: "https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID",
    thumbnail: ""
  }
];

async function getAll() {
  let data = await redis.get(KEY);
  if (!data) {
    await redis.set(KEY, seedMatches);
    data = seedMatches;
  }
  return data;
}

async function saveAll(matches) {
  await redis.set(KEY, matches);
  return matches;
}

async function create(match) {
  const matches = await getAll();
  const id = match.id && String(match.id).trim() ? String(match.id).trim() : String(Date.now());

  if (matches.some((m) => m.id === id)) {
    throw new Error(`Pertandingan dengan id "${id}" sudah ada`);
  }

  const newMatch = {
    id,
    league: match.league || "",
    home: match.home || "",
    away: match.away || "",
    homeColor: match.homeColor || "#1F4D2E",
    awayColor: match.awayColor || "#1F4D2E",
    title: match.title || `${match.home} vs ${match.away}`,
    time: match.time || "",
    status: match.status || "upcoming",
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    htScore: match.htScore || "-",
    cornerHome: match.cornerHome ?? 0,
    cornerAway: match.cornerAway ?? 0,
    streamType: match.streamType || "iframe",
    streamUrl: match.streamUrl || "",
    thumbnail: match.thumbnail || ""
  };

  matches.unshift(newMatch);
  await saveAll(matches);
  return newMatch;
}

async function update(id, updates) {
  const matches = await getAll();
  const idx = matches.findIndex((m) => m.id === String(id));
  if (idx === -1) return null;

  matches[idx] = { ...matches[idx], ...updates, id: matches[idx].id };
  await saveAll(matches);
  return matches[idx];
}

async function remove(id) {
  const matches = await getAll();
  const filtered = matches.filter((m) => m.id !== String(id));
  if (filtered.length === matches.length) return false;
  await saveAll(filtered);
  return true;
}

// Setara buildClubs() versi lama di _data.js, menerima array matches sebagai parameter
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

module.exports = { getAll, create, update, remove, buildClubsFrom };
