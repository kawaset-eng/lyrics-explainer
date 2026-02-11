require('dotenv').config({ path: '.env', override: true });

// デバッグ用：環境変数が読み込まれているか確認
console.log('========================================');
console.log('[ENV DEBUG] .env ファイルからの読み込み確認');
console.log('  process.env.GENIUS_API_KEY:', process.env.GENIUS_API_KEY ? '✅ 設定済み' : '❌ 未設定');
console.log('  process.env.ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ 設定済み' : '❌ 未設定');
console.log('  process.env.USE_MOCK:', process.env.USE_MOCK);
console.log('========================================');

const express = require("express");
const cors = require("cors");
const { load } = require("cheerio");
const { analyzeLyrics, chatAboutSong, getArtistTrivia, getRecommendations } = require("./services/claude");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ========== モックデータ ==========
const mockResponse = {
  title: "Bohemian Rhapsody",
  artist: "Queen",
  lyrics:
    "[Intro]\nIs this the real life?\nIs this just fantasy?\nCaught in a landslide,\nNo escape from reality.\n\n[Verse 1]\nOpen your eyes,\nLook up to the skies and see,\nI'm just a poor boy, I need no sympathy,\nBecause I'm easy come, easy go,\nLittle high, little low,\nAny way the wind blows\nDoesn't really matter to me, to me.",
  translation:
    "[イントロ]\nこれは現実なのか？\nただの幻想なのか？\n地滑りに巻き込まれ、\n現実から逃れられない。\n\n[Verse 1]\n目を開けて、\n空を見上げてごらん、\n僕はただの貧しい少年、同情なんていらない、\nだって僕は気楽にやってきて、気楽に去る、\n少し高く、少し低く、\n風がどちらに吹こうと\n僕にはどうでもいいことさ。",
  interpretation:
    "「Bohemian Rhapsody」は、ロック史上最も革新的な楽曲の一つです。この曲はオペラ、バラード、ハードロックを融合させた6分間の組曲形式で構成されています。\n\n冒頭の「Is this the real life?」という問いかけは、現実と幻想の境界を曖昧にし、聴く者を非日常的な世界へ引き込みます。歌詞全体を通じて、罪悪感、逃避、運命への抗いといったテーマが描かれています。\n\n「I'm just a poor boy」というフレーズは、主人公の無力感と社会からの疎外感を表現しており、「easy come, easy go」は人生の無常さを受け入れる姿勢を示しています。",
  background:
    "Freddie Mercury（フレディ・マーキュリー）が作詞・作曲し、1975年にリリースされました。当時のレコード会社は6分という長さに難色を示しましたが、バンドは妥協せずリリースを押し通しました。\n\nレコーディングには3週間を要し、特にオペラセクションでは180回ものオーバーダビングが行われました。リリース後、全英チャートで9週連続1位を獲得し、Queenの代表曲となりました。\n\n1991年のフレディの死後、1992年の映画「ウェインズ・ワールド」での使用をきっかけに再びチャートを席巻。2018年の伝記映画「ボヘミアン・ラプソディ」でも新世代のファンを獲得しました。",
  artistInfo:
    "Queen（クイーン）は1970年にロンドンで結成されたイギリスのロックバンドです。フレディ・マーキュリー（ボーカル）、ブライアン・メイ（ギター）、ロジャー・テイラー（ドラム）、ジョン・ディーコン（ベース）の4人で構成されています。\n\nロック、オペラ、ポップ、プログレッシブ・ロックなど多彩なジャンルを融合させた独自の音楽スタイルで知られています。代表曲には「Bohemian Rhapsody」「We Will Rock You」「We Are the Champions」などがあります。\n\n全世界で3億枚以上のアルバムを売り上げ、ロックの殿堂入りを果たしています。フレディ・マーキュリーの圧倒的な歌唱力とパフォーマンスは今なお伝説として語り継がれています。",
};

// ========== USE_MOCK 判定ヘルパー ==========
function useMock() {
  return process.env.USE_MOCK !== "false";
}

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

    // Geniusの歌詞は複数のdiv要素に分かれています
    const lyricsContainers = $('[data-lyrics-container="true"]');

    if (lyricsContainers.length === 0) {
      console.log(`[${requestId}] [Genius Scrape] ⚠️ 歌詞コンテナが見つかりません`);
      return null;
    }

    let lyrics = '';
    lyricsContainers.each((i, elem) => {
      // HTMLタグを削除しつつ、改行を保持
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
      .replace(/\n{3,}/g, '\n\n'); // 3つ以上の連続改行を2つに

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
  console.log(`[${requestId}] USE_MOCK: ${useMock()}`);

  if (!title || !artist) {
    console.log(`[${requestId}] ❌ バリデーションエラー: 曲名またはアーティスト名が空`);
    return res.status(400).json({ error: "曲名とアーティスト名は必須です" });
  }

  try {
    // ---------- モックモード ----------
    if (useMock()) {
      console.log(`[${requestId}] 📦 モックモードで応答`);
      const responseData = { ...mockResponse, title, artist };
      console.log(`[${requestId}] ✅ レスポンス送信完了`);
      return res.json(responseData);
    }

    // ---------- 実APIモード ----------
    console.log(`[${requestId}] 🌐 実APIモードで処理開始`);

    // Step 1: Genius API で曲を検索（曲名・アーティスト名の特定）
    console.log(`[${requestId}] [Genius] リクエスト開始...`);
    if (!process.env.GENIUS_API_KEY) {
      console.log(`[${requestId}] [Genius] ❌ GENIUS_API_KEY が未設定`);
      throw new Error("GENIUS_API_KEY が設定されていません。.env ファイルを確認してください。");
    }

    // アーティスト名を先に、曲名を後に配置すると検索精度が向上
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

    // より良いマッチングを探す：アーティスト名が部分一致するものを優先
    let bestMatch = hits[0]?.result;
    if (hits.length > 1) {
      const artistLower = artist.toLowerCase();
      const titleLower = title.toLowerCase();

      for (const hit of hits) {
        const hitArtist = hit.result.primary_artist?.name || '';
        const hitTitle = hit.result.title || '';

        // アーティスト名と曲名の両方が一致度が高いものを選択
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

    // Step 2: Lyrics.ovh で実際の歌詞テキストを取得
    console.log(`[${requestId}] [Lyrics.ovh] 歌詞取得開始...`);
    let fetchedLyrics = await fetchLyricsFromOvh(songArtist, songTitle, requestId);

    // アーティスト名・曲名が Genius で正規化されている場合、元の入力でもリトライ
    if (!fetchedLyrics && (songArtist !== artist || songTitle !== title)) {
      console.log(`[${requestId}] [Lyrics.ovh] 元の入力でリトライ...`);
      fetchedLyrics = await fetchLyricsFromOvh(artist, title, requestId);
    }

    // Step 2.5: Lyrics.ovh で取得できない場合、Genius からスクレイピング
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
      throw new Error("ANTHROPIC_API_KEY が設定されていません。.env ファイルを確認してください。");
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

    console.log(`[${requestId}] レスポンスデータのキー: ${Object.keys(responseData).join(", ")}`);
    console.log(`[${requestId}] lyrics長: ${responseData.lyrics.length}文字`);
    console.log(`[${requestId}] translation長: ${responseData.translation.length}文字`);
    console.log(`[${requestId}] ✅ レスポンス送信完了`);
    return res.json(responseData);
  } catch (err) {
    console.error(`[${requestId}] ❌ エラー発生:`);
    console.error(`[${requestId}]   名前: ${err.name}`);
    console.error(`[${requestId}]   メッセージ: ${err.message}`);
    console.error(`[${requestId}]   スタック: ${err.stack}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== POST /api/chat ==========
app.post("/api/chat", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { songContext, messages, userMessage } = req.body;

  console.log(`\n[${requestId}] ===== チャットリクエスト受信 =====`);
  console.log(`[${requestId}] 曲: "${songContext?.title}" by ${songContext?.artist}`);
  console.log(`[${requestId}] 会話履歴: ${messages?.length || 0}件`);
  console.log(`[${requestId}] 質問: "${userMessage?.slice(0, 80)}"`);

  if (!songContext || !userMessage) {
    return res.status(400).json({ error: "songContext と userMessage は必須です" });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY が設定されていません。");
    }

    const reply = await chatAboutSong(songContext, messages || [], userMessage, requestId);

    console.log(`[${requestId}] ✅ チャットレスポンス送信完了 (${reply.length}文字)`);
    return res.json({ reply });
  } catch (err) {
    console.error(`[${requestId}] ❌ チャットエラー: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== POST /api/news ==========
app.post("/api/news", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { artist } = req.body;

  console.log(`\n[${requestId}] ===== ニュースリクエスト受信 =====`);
  console.log(`[${requestId}] アーティスト: "${artist}"`);

  if (!artist) {
    return res.status(400).json({ error: "アーティスト名は必須です" });
  }

  try {
    // 簡易実装：Google検索へのリンクを含むダミーニュース
    const mockNews = [
      {
        title: `${artist}の最新情報をチェック`,
        description: `${artist}に関する最新のニュース、ツアー情報、アルバムリリースなどをチェックできます。`,
        url: `https://www.google.com/search?q=${encodeURIComponent(artist + " news")}`,
        source: "Google News",
      },
      {
        title: `${artist}のコンサート情報`,
        description: `${artist}の今後のライブやツアー情報を確認できます。`,
        url: `https://www.google.com/search?q=${encodeURIComponent(artist + " tour concert")}`,
        source: "Concert Search",
      },
      {
        title: `${artist}の新曲・新アルバム`,
        description: `${artist}の最新リリースやミュージックビデオをチェックできます。`,
        url: `https://www.google.com/search?q=${encodeURIComponent(artist + " new album")}`,
        source: "Music Updates",
      },
    ];

    console.log(`[${requestId}] ✅ ニュースリンク生成完了: ${mockNews.length}件`);
    return res.json({ news: mockNews });
  } catch (err) {
    console.error(`[${requestId}] ❌ ニュース取得エラー: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== POST /api/artist-trivia ==========
app.post("/api/artist-trivia", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { artist } = req.body;

  console.log(`\n[${requestId}] ===== アーティスト豆知識リクエスト受信 =====`);
  console.log(`[${requestId}] アーティスト: "${artist}"`);

  if (!artist) {
    return res.status(400).json({ error: "アーティスト名は必須です" });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY が設定されていません。");
    }

    const trivia = await getArtistTrivia(artist, requestId);

    console.log(`[${requestId}] ✅ 豆知識取得完了`);
    return res.json({ trivia });
  } catch (err) {
    console.error(`[${requestId}] ❌ 豆知識取得エラー: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== 類似曲レコメンドエンドポイント ==========
app.post("/api/recommendations", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { title, artist, interpretation } = req.body;

  console.log(`\n[${requestId}] ===== 類似曲レコメンドリクエスト受信 =====`);
  console.log(`[${requestId}] 曲: "${title}" by "${artist}"`);

  if (!title || !artist) {
    return res.status(400).json({ error: "曲名とアーティスト名は必須です" });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY が設定されていません。");
    }

    const recommendations = await getRecommendations(title, artist, interpretation || "", requestId);

    console.log(`[${requestId}] ✅ レコメンド取得完了`);
    return res.json({ recommendations });
  } catch (err) {
    console.error(`[${requestId}] ❌ レコメンド取得エラー: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== フィードバックエンドポイント ==========
app.post("/api/feedback", async (req, res) => {
  const requestId = Date.now().toString(36);
  const { feedback, timestamp, userAgent } = req.body;

  console.log(`\n[${requestId}] ===== フィードバック受信 =====`);
  console.log(`[${requestId}] タイムスタンプ: ${timestamp}`);
  console.log(`[${requestId}] フィードバック: ${feedback.substring(0, 100)}${feedback.length > 100 ? '...' : ''}`);
  console.log(`[${requestId}] User Agent: ${userAgent}`);

  if (!feedback || !feedback.trim()) {
    return res.status(400).json({ error: "フィードバック内容は必須です" });
  }

  try {
    // フィードバックをログに記録
    const fs = require('fs');
    const path = require('path');
    const feedbackDir = path.join(__dirname, 'feedback');

    // feedbackディレクトリがなければ作成
    if (!fs.existsSync(feedbackDir)) {
      fs.mkdirSync(feedbackDir, { recursive: true });
    }

    const feedbackFile = path.join(feedbackDir, 'feedback.json');
    let feedbacks = [];

    // 既存のフィードバックを読み込み
    if (fs.existsSync(feedbackFile)) {
      const data = fs.readFileSync(feedbackFile, 'utf8');
      feedbacks = JSON.parse(data);
    }

    // 新しいフィードバックを追加
    feedbacks.push({
      id: requestId,
      feedback: feedback.trim(),
      timestamp,
      userAgent,
    });

    // ファイルに保存
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks, null, 2));

    // メール送信 (RESEND_API_KEYが設定されている場合のみ)
    if (process.env.RESEND_API_KEY && process.env.FEEDBACK_EMAIL) {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      const formattedDate = new Date(timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

      await resend.emails.send({
        from: 'Lyrics Explainer <onboarding@resend.dev>',
        to: [process.env.FEEDBACK_EMAIL],
        subject: `[Lyrics Explainer] 新しいフィードバック受信`,
        html: `
          <h2>新しいフィードバックが届きました</h2>
          <p><strong>受信日時:</strong> ${formattedDate}</p>
          <p><strong>ID:</strong> ${requestId}</p>
          <hr>
          <h3>フィードバック内容:</h3>
          <p>${feedback.trim().replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small><strong>User Agent:</strong> ${userAgent}</small></p>
        `,
      });

      console.log(`[${requestId}] ✅ メール送信完了`);
    }

    console.log(`[${requestId}] ✅ フィードバック保存完了`);
    return res.json({ success: true });
  } catch (err) {
    console.error(`[${requestId}] ❌ フィードバック処理エラー: ${err.message}`);
    return res.status(500).json({ error: err.message });
  }
});

// ========== ヘルスチェック ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mock: useMock(),
    genius: !!process.env.GENIUS_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
  });
});

app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`モード: ${useMock() ? "📦 モック" : "🌐 実API"}\n`);
});
