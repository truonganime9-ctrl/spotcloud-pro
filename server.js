const express = require('express');
const cors = require('cors');
const scdl = require('soundcloud-downloader').default;

const app = express();

app.use(cors());
app.use(express.static(__dirname));

/* =========================
CACHE
========================= */
const memoryCache = new Map();

/* =========================
SEARCH API
========================= */
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    if (memoryCache.has(query)) return res.json(memoryCache.get(query));

    try {
        const results = await scdl.search({ query: query, resourceType: 'tracks', limit: 60 });
        const songs = results.collection.map(song => ({
            title: song.title || 'Unknown',
            artist: song.user?.username || 'Unknown Artist',
            img: song.artwork_url ? song.artwork_url.replace('-large', '-t500x500') : 'https://picsum.photos/500?random=' + Math.random(),
            src: song.permalink_url,
            duration: song.duration || 0,
            plays: song.playback_count || 0,
            likes: song.likes_count || 0
        }));
        memoryCache.set(query, songs);
        res.json(songs);
    } catch (err) {
        res.json([]);
    }
});

/* =========================
HOME & RANDOM API
========================= */
app.get('/api/home', async (req, res) => {
    try {
        const result = await scdl.search({ query: 'Top Music', resourceType: 'tracks', limit: 20 });
        res.json(result.collection.map(song => ({ title: song.title, artist: song.user.username, img: song.artwork_url, src: song.permalink_url })));
    } catch (e) { res.json([]); }
});

/* =========================
SERVER START (ĐÃ SỬA ĐỂ CHẠY TRÊN RENDER)
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port: ${PORT}`);
});
