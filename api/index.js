require('dotenv').config({ path: '../backend/.env' });

const express = require("express");
const cors = require("cors");
const { load } = require("cheerio");
const { analyzeLyrics, chatAboutSong } = require("../backend/services/claude");

const app = express();

app.use(cors());
app.use(express.json());

// ========== Lyrics.ovh で歌詞テキストを取得 ==========
async function fetchLyricsFromOvh(artist, title, requestId) {
  const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
  console.log(`[${requestId}] [Lyrics.ovh] URL: ${url}`);

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    console.log(`[${requestId}] [Lyrics.ovh] ステータス: ${res.status}`);

    if (!res.ok) {
      console.log(`[${requestId}] [Lyrics.ovh] ⚠️ 歌詞が見つかりません (HTTP ${res.status})`);
      return null;
    }

    const data = await res.json();
    const lyrics = data.lyrics?.trim();

    if (!lyrics) {
      console.log(`[${requestId}] [Lyrics.ovh] ⚠️ レスポンスに歌詞が含まれていません`);
      return null;
    }

    console.log(`[${requestId}] [Lyrics.ovh] ✅ 歌詞取得成功 (${lyrics.length}文字)`);
    return lyrics;
  } catch (err) {
    console.log(`[${requestId}] [Lyrics.ovh] ❌ エラー: ${err.message}`);
    return null;
  }
}

// ========== Genius から歌詞をスクレイピング ==========
async function fetchLyricsFromGenius(geniusUrl, requestId) {
  if (!geniusUrl) {
    console.log(`[${requestId}] [Genius Scrape] ⚠️ Genius URLが提供されていません`);
    return null;
  }

  console.log(`[${requestId}] [Genius Scrape] URL: ${geniusUrl}`);

  try {
    const res = await fetch(geniusUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    console.log(`[${requestId}] [Genius Scrape] ステータス: ${res.status}`);

    if (!res.ok) {
      console.log(`[${requestId}] [Genius Scrape] ⚠️ ページ取得失敗 (HTTP ${res.status})`);
      return null;
    }

    const html = await res.text();
    const $ = load(html);

    const lyricsContainers = $('[data-lyrics-container="true"]');

    if (lyricsContainers.length === 0) {
      console.log(`[${requestId}] [Genius Scrape] ⚠️ 歌詞コンテナが見つかりません`);
      return null;
    }

    let lyrics = '';
    lyricsContainers.each((i, elem) => {
      const text = $(elem)
        .html()
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      lyrics += text + '\n\n';
    });

    lyrics = lyrics
      .trim()
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\n{3,}/g, '\n\n');

    if (!lyrics || lyrics.length < 50) {
      console.log(`[${requestId}] [Genius Scrape] ⚠️ 歌詞が短すぎるか取得できませんでした (${lyrics.length}文字)`);
      return null;
    }

    console.log(`[${requestId}] [Genius Scrape] ✅ 歌詞取得成功 (${lyrics.length}文字)`);
    return lyrics;
  } catch (err) {
    console.log(`[${requestId}] [Genius Scrape] ❌ エラー: ${err.message}`);
    return null;
  }
}

// ========== POST /api/lyrics ==========
app.post("/api/lyrics", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { title, artist } = req.body;

  console.log(`\n[${requestId}] ===== リクエスト受信 =====`);
  console.log(`[${requestId}] 曲名: "${title}", アーティスト: "${artist}"`);

  if (!title || !artist) {
    console.log(`[${requestId}] ❌ バリデーションエラー: 曲名またはアーティスト名が空`);
    return res.status(400).json({ error: "曲名とアーティスト名は必須です" });
  }

  try {
    // Step 1: Genius API で曲を検索
    console.log(`[${requestId}] [Genius] リクエスト開始...`);
    if (!process.env.GENIUS_API_KEY) {
      console.log(`[${requestId}] [Genius] ❌ GENIUS_API_KEY が未設定`);
      throw new Error("GENIUS_API_KEY が設定されていません。");
    }

    const searchQuery = `${artist} ${title}`;
    const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(searchQuery)}`;
    const geniusRes = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${process.env.GENIUS_API_KEY}` },
    });

    console.log(`[${requestId}] [Genius] ステータス: ${geniusRes.status}`);

    if (!geniusRes.ok) {
      const errorBody = await geniusRes.text();
      console.log(`[${requestId}] [Genius] ❌ エラーレスポンス: ${errorBody.slice(0, 500)}`);
      throw new Error(`Genius API エラー (HTTP ${geniusRes.status})`);
    }

    const geniusData = await geniusRes.json();
    const hits = geniusData.response?.hits || [];
    console.log(`[${requestId}] [Genius] ヒット数: ${hits.length}`);

    let bestMatch = hits[0]?.result;
    if (hits.length > 1) {
      const artistLower = artist.toLowerCase();
      const titleLower = title.toLowerCase();

      for (const hit of hits) {
        const hitArtist = hit.result.primary_artist?.name || '';
        const hitTitle = hit.result.title || '';

        if (hitArtist.toLowerCase().includes(artistLower) || artistLower.includes(hitArtist.toLowerCase())) {
          if (hitTitle.toLowerCase().includes(titleLower) || titleLower.includes(hitTitle.toLowerCase())) {
            bestMatch = hit.result;
            console.log(`[${requestId}] [Genius] より良いマッチを発見: "${hitTitle}" by ${hitArtist}`);
            break;
          }
        }
      }
    }

    const songTitle = bestMatch ? bestMatch.title : title;
    const songArtist = bestMatch ? (bestMatch.primary_artist?.name || artist) : artist;
    const geniusUrl = bestMatch ? bestMatch.url : null;

    console.log(`[${requestId}] [Genius] 確定: "${songTitle}" by ${songArtist}`);

    // Step 2: Lyrics.ovh で歌詞取得
    console.log(`[${requestId}] [Lyrics.ovh] 歌詞取得開始...`);
    let fetchedLyrics = await fetchLyricsFromOvh(songArtist, songTitle, requestId);

    if (!fetchedLyrics && (songArtist !== artist || songTitle !== title)) {
      console.log(`[${requestId}] [Lyrics.ovh] 元の入力でリトライ...`);
      fetchedLyrics = await fetchLyricsFromOvh(artist, title, requestId);
    }

    // Step 2.5: Genius からスクレイピング
    if (!fetchedLyrics && geniusUrl) {
      console.log(`[${requestId}] [Genius Scrape] 歌詞取得開始...`);
      fetchedLyrics = await fetchLyricsFromGenius(geniusUrl, requestId);
    }

    if (fetchedLyrics) {
      console.log(`[${requestId}] 歌詞ソース: 外部API ✅ (${fetchedLyrics.length}文字)`);
    } else {
      console.log(`[${requestId}] 歌詞ソース: Claude にフォールバック ⚠️`);
    }

    // Step 3: Claude API で翻訳・解説を生成
    console.log(`[${requestId}] [Claude] リクエスト開始...`);
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log(`[${requestId}] [Claude] ❌ ANTHROPIC_API_KEY が未設定`);
      throw new Error("ANTHROPIC_API_KEY が設定されていません。");
    }

    const analysis = await analyzeLyrics(fetchedLyrics, songTitle, songArtist, requestId);

    const responseData = {
      title: songTitle,
      artist: songArtist,
      geniusUrl,
      lyrics: analysis.lyrics,
      translation: analysis.translation,
      interpretation: analysis.interpretation,
      background: analysis.background,
      artistInfo: analysis.artistInfo,
    };

    console.log(`[${requestId}] ✅ レスポンス送信完了`);
    return res.json(responseData);
  } catch (err) {
    console.error(`[${requestId}] ❌ エラー発生: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== POST /api/chat ==========
app.post("/api/chat", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { songContext, messages, userMessage } = req.body;

  console.log(`\n[${requestId}] ===== チャットリクエスト受信 =====`);

  if (!songContext || !userMessage) {
    return res.status(400).json({ error: "songContext と userMessage は必須です" });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY が設定されていません。");
    }

    const reply = await chatAboutSong(songContext, messages || [], userMessage, requestId);

    console.log(`[${requestId}] ✅ チャットレスポンス送信完了`);
    return res.json({ reply });
  } catch (err) {
    console.error(`[${requestId}] ❌ チャットエラー: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== ヘルスチェック ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    genius: !!process.env.GENIUS_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
  });
});

module.exports = app;
