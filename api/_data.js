// Database sementara (data dummy)
// status: 'live' | 'upcoming' | 'ended'
const matches = [
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
    streamType: "m3u8", // opsi: 'm3u8' atau 'iframe'
    // Ganti dengan URL m3u8 asli atau URL iframe penyedia stream
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

// Menyusun daftar klub unik (beserta warna & status pertandingan) dari data matches
function buildClubs() {
  const clubMap = new Map();

  matches.forEach(m => {
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

module.exports = { matches, buildClubs };
