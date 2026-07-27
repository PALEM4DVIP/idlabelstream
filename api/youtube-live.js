// api/youtube-live.js
// Mengecek status live streaming dari channel-channel partner (via handle @xxx)
// Menggunakan YouTube Data API v3 — butuh env var YOUTUBE_API_KEY di Vercel.

const CHANNELS = [
  { handle: 'ybrap', name: 'AFF Championship 2026' },
  { handle: 'CazeTV', name: 'Live Football' }
];

// Cache in-memory sederhana supaya tidak boros kuota API
// (kuota search.list = 100 unit/panggilan, default kuota harian 10.000 unit)
let cache = { data: null, expires: 0 };
const CACHE_TTL_MS = 60 * 1000; // 60 detik

async function resolveChannelId(handle, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
  const r = await fetch(url);
  const data = await r.json();
  if (data.items && data.items.length > 0) return data.items[0].id;
  return null;
}

async function checkLive(channelId, apiKey) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
  const r = await fetch(url);
  const data = await r.json();
  if (data.items && data.items.length > 0) {
    const item = data.items[0];
    return {
      isLive: true,
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: (item.snippet.thumbnails && item.snippet.thumbnails.medium && item.snippet.thumbnails.medium.url) || ''
    };
  }
  return { isLive: false, videoId: null, title: null, thumbnail: null };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      message: 'YOUTUBE_API_KEY belum diset. Tambahkan di Vercel > Project Settings > Environment Variables.'
    });
  }

  const now = Date.now();
  if (cache.data && cache.expires > now) {
    return res.status(200).json(cache.data);
  }

  try {
    const results = await Promise.all(
      CHANNELS.map(async (ch) => {
        const channelId = await resolveChannelId(ch.handle, apiKey);
        if (!channelId) {
          return { handle: ch.handle, name: ch.name, isLive: false, videoId: null, title: null, thumbnail: null, error: 'Channel tidak ditemukan' };
        }
        const liveInfo = await checkLive(channelId, apiKey);
        return { handle: ch.handle, name: ch.name, channelId, ...liveInfo };
      })
    );

    cache = { data: results, expires: now + CACHE_TTL_MS };
    res.status(200).json(results);
  } catch (err) {
    console.error('YouTube API error:', err);
    res.status(500).json({ message: 'Gagal mengambil status live dari YouTube API.' });
  }
};
