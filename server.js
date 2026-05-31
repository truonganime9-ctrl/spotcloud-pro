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
TREND TAGS
========================= */

const trendingTags = [
    'TikTok Viral',
    'Sơn Tùng MTP',
    'EDM Remix',
    'Lofi Chill',
    'USUK',
    'Nightcore',
    'Deep House',
    'Sad Chill',
    'Gaming Music',
    'Vinahouse'
];

/* =========================
SEARCH API
========================= */

app.get('/api/search', async (req, res) => {

    const query = req.query.q;

    if (!query) {
        return res.json([]);
    }

    /* CACHE */

    if (memoryCache.has(query)) {

        console.log('⚡ CACHE:', query);

        return res.json(
            memoryCache.get(query)
        );

    }

    try {

        console.log('🔍 Đang tìm:', query);

        const results = await scdl.search({
            query: query,
            resourceType: 'tracks',
            limit: 60
        });

        const songs = results.collection.map(song => ({

            title:
                song.title || 'Unknown',

            artist:
                song.user?.username
                || 'Unknown Artist',

            img:
                song.artwork_url
                ? song.artwork_url
                    .replace('-large', '-t500x500')
                : 'https://picsum.photos/500?random='
                    + Math.random(),

            src:
                song.permalink_url,

            duration:
                song.duration || 0,

            plays:
                song.playback_count || 0,

            likes:
                song.likes_count || 0

        }));

        /* SAVE CACHE */

        memoryCache.set(query, songs);

        console.log(
            `✅ Tìm thấy ${songs.length} bài`
        );

        res.json(songs);

    } catch (err) {

        console.log('❌ ERROR:', err);

        res.json([]);

    }

});

/* =========================
HOME MUSIC API
========================= */

app.get('/api/home', async (req, res) => {

    try {

        const queries = [
            'Top Music',
            'Viral TikTok',
            'Lofi Chill',
            'EDM Remix',
            'USUK',
            'Nightcore'
        ];

        let finalSongs = [];

        for (const q of queries) {

            try {

                const result = await scdl.search({
                    query: q,
                    resourceType: 'tracks',
                    limit: 10
                });

                const mapped = result.collection.map(song => ({

                    title:
                        song.title || 'Unknown',

                    artist:
                        song.user?.username
                        || 'Unknown Artist',

                    img:
                        song.artwork_url
                        ? song.artwork_url
                            .replace('-large', '-t500x500')
                        : 'https://picsum.photos/500?random='
                            + Math.random(),

                    src:
                        song.permalink_url,

                    duration:
                        song.duration || 0,

                    plays:
                        song.playback_count || 0,

                    likes:
                        song.likes_count || 0

                }));

                finalSongs.push(...mapped);

            } catch (e) {

                console.log('⚠️ Lỗi query:', q);

            }

        }

        res.json(finalSongs);

    } catch (err) {

        console.log(err);

        res.json([]);

    }

});

/* =========================
RANDOM MUSIC API
========================= */

app.get('/api/random', async (req, res) => {

    try {

        const randomQuery =
            trendingTags[
                Math.floor(
                    Math.random()
                    * trendingTags.length
                )
            ];

        console.log(
            '🎲 RANDOM:',
            randomQuery
        );

        const result =
            await scdl.search({

            query: randomQuery,
            resourceType: 'tracks',
            limit: 20

        });

        const songs =
            result.collection.map(song => ({

            title:
                song.title || 'Unknown',

            artist:
                song.user?.username
                || 'Unknown Artist',

            img:
                song.artwork_url
                ? song.artwork_url
                    .replace('-large', '-t500x500')
                : 'https://picsum.photos/500?random='
                    + Math.random(),

            src:
                song.permalink_url,

            duration:
                song.duration || 0,

            plays:
                song.playback_count || 0,

            likes:
                song.likes_count || 0

        }));

        res.json(songs);

    } catch (err) {

        console.log(err);

        res.json([]);

    }

});

/* =========================
STATUS API
========================= */

app.get('/api/status', (req, res) => {

    res.json({

        server: 'online',

        cache:
            memoryCache.size,

        uptime:
            process.uptime(),

        time:
            new Date()

    });

});

/* =========================
SERVER START
========================= */

app.listen(3000, () => {

    console.log(`
====================================
🎵 SPOTCLOUD PRO SERVER STARTED
====================================

🚀 Local:
http://localhost:3000

🔍 Search API:
http://localhost:3000/api/search?q=son+tung

🏠 Home API:
http://localhost:3000/api/home

🎲 Random API:
http://localhost:3000/api/random

📊 Status API:
http://localhost:3000/api/status

====================================
    `);

});