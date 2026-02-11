const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Claude API を使って歌詞の翻訳・解釈・背景情報を生成する
 * @param {string|null} lyrics - Lyrics.ovhから取得した英語歌詞（取得できなかった場合はnull）
 * @param {string} title - 曲名
 * @param {string} artist - アーティスト名
 * @param {string} requestId - デバッグ用リクエストID
 */
async function analyzeLyrics(lyrics, title, artist, requestId) {
  const hasLyrics = lyrics && lyrics.trim().length > 0;

  const prompt = hasLyrics
    ? `あなたは洋楽の歌詞解説と英語教育の専門家です。以下の曲の歌詞について、JSON形式で回答してください。

曲名: ${title}
アーティスト: ${artist}

歌詞:
${lyrics}

以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

{
  "translation": "上記の歌詞の全文を日本語訳してください。必ず全ての歌詞を訳し、原文の構造（改行やセクション区切り）を保持してください。",
  "interpretation": "歌詞の詳しい解説（500-800字程度）。以下の内容を含めてください：\n- 曲全体のテーマとメッセージ\n- 重要な英語フレーズの意味と使い方（3-5個のフレーズを取り上げて詳しく解説）\n- イディオムやスラング、比喩表現の説明\n- 歌詞に込められた文化的背景や言葉遊び\n各フレーズは「"〇〇"」のように引用符で囲んで示してください。",
  "background": "曲の背景情報（200-300字程度）。制作経緯、リリース時期、チャート成績、文化的影響などを説明してください。",
  "artistInfo": "アーティストの紹介（200-300字程度）。経歴、音楽スタイル、代表曲、音楽シーンへの影響などを説明してください。"
}`
    : `あなたは洋楽の歌詞解説と英語教育の専門家です。以下の曲について、JSON形式で回答してください。

曲名: ${title}
アーティスト: ${artist}

以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

{
  "lyrics": "この曲の英語歌詞の完全な全文。セクション名（[Verse 1], [Chorus] など）を含め、原文の改行を保持してください。歌詞は省略せず全て記載してください。",
  "translation": "歌詞の全文を日本語訳してください。必ず全ての歌詞を訳し、原文の構造（改行やセクション区切り）を保持してください。",
  "interpretation": "歌詞の詳しい解説（500-800字程度）。以下の内容を含めてください：\n- 曲全体のテーマとメッセージ\n- 重要な英語フレーズの意味と使い方（3-5個のフレーズを取り上げて詳しく解説）\n- イディオムやスラング、比喩表現の説明\n- 歌詞に込められた文化的背景や言葉遊び\n各フレーズは「"〇〇"」のように引用符で囲んで示してください。",
  "background": "曲の背景情報（200-300字程度）。制作経緯、リリース時期、チャート成績、文化的影響などを説明してください。",
  "artistInfo": "アーティストの紹介（200-300字程度）。経歴、音楽スタイル、代表曲、音楽シーンへの影響などを説明してください。"
}`;

  console.log(`[${requestId}] [Claude] 歌詞ソース: ${hasLyrics ? "Lyrics.ovh (実歌詞あり)" : "Claude生成 (フォールバック)"}`);
  console.log(`[${requestId}] [Claude] プロンプト長: ${prompt.length}文字`);
  console.log(`[${requestId}] [Claude] モデル: claude-haiku-4-5-20251001 (高速)`);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  console.log(`[${requestId}] [Claude] レスポンス受信`);
  console.log(`[${requestId}] [Claude]   stop_reason: ${message.stop_reason}`);
  console.log(`[${requestId}] [Claude]   input_tokens: ${message.usage.input_tokens}`);
  console.log(`[${requestId}] [Claude]   output_tokens: ${message.usage.output_tokens}`);

  const rawText = message.content[0].text;
  console.log(`[${requestId}] [Claude]   raw_text長: ${rawText.length}文字`);

  // JSONを抽出してパース
  let jsonStr = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
    console.log(`[${requestId}] [Claude]   コードフェンスからJSON抽出`);
  }

  const parsed = JSON.parse(jsonStr);
  console.log(`[${requestId}] [Claude]   パース成功 - キー: ${Object.keys(parsed).join(", ")}`);

  return {
    lyrics: hasLyrics ? lyrics : (parsed.lyrics || ""),
    translation: parsed.translation || "",
    interpretation: parsed.interpretation || "",
    background: parsed.background || "",
    artistInfo: parsed.artistInfo || "",
  };
}

/**
 * 曲について質問に回答するチャット関数
 * @param {object} songContext - 曲のコンテキスト {title, artist, lyrics, translation, interpretation}
 * @param {Array} messages - 会話履歴 [{role: "user"|"assistant", content: "..."}]
 * @param {string} userMessage - ユーザーの新しい質問
 * @param {string} requestId - デバッグ用リクエストID
 */
async function chatAboutSong(songContext, messages, userMessage, requestId) {
  const systemPrompt = `あなたは洋楽の歌詞解説の専門家です。ユーザーが現在閲覧している曲について質問に答えてください。
日本語で回答してください。回答は簡潔で分かりやすくしてください。

=== 現在の曲情報 ===
曲名: ${songContext.title}
アーティスト: ${songContext.artist}

歌詞（英語）:
${songContext.lyrics || "(歌詞なし)"}

日本語訳:
${songContext.translation || "(翻訳なし)"}

解釈:
${songContext.interpretation || "(解釈なし)"}
=== 曲情報ここまで ===`;

  // 会話履歴 + 新メッセージを構築
  const allMessages = [
    ...messages.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  console.log(`[${requestId}] [Chat] system長: ${systemPrompt.length}文字`);
  console.log(`[${requestId}] [Chat] 会話数: ${allMessages.length}メッセージ`);
  console.log(`[${requestId}] [Chat] 質問: "${userMessage.slice(0, 80)}"`);
  console.log(`[${requestId}] [Chat] モデル: claude-haiku-4-5-20251001 (高速)`);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: systemPrompt,
    messages: allMessages,
  });

  console.log(`[${requestId}] [Chat] レスポンス受信`);
  console.log(`[${requestId}] [Chat]   input_tokens: ${message.usage.input_tokens}`);
  console.log(`[${requestId}] [Chat]   output_tokens: ${message.usage.output_tokens}`);

  const reply = message.content[0].text;
  console.log(`[${requestId}] [Chat]   reply長: ${reply.length}文字`);

  return reply;
}

/**
 * Web検索を使ってアーティストの最新ニュースを取得する（タイムアウト付き）
 * @param {string} artist - アーティスト名
 * @param {string} requestId - デバッグ用リクエストID
 */
async function getArtistTriviaWithWebSearch(artist, requestId) {
  console.log(`[${requestId}] [Artist News] Web検索を試行中...`);

  const prompt = `2026年現在、アーティスト「${artist}」の最新ニュース2-3件を簡潔に教えてください。

以下のJSON形式で回答してください。JSON以外の説明文は一切含めないでください：

{
  "trivia": [
    "情報1（50-100字）",
    "情報2（50-100字）"
  ]
}

注意: レスポンスはJSON形式のみで、説明やコメントは不要です。`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search"
      }
    ]
  });

  // tool_use と text ブロックから最終的なテキストを取得
  let finalText = "";
  for (const block of message.content) {
    if (block.type === "text") {
      finalText = block.text;
    }
  }

  console.log(`[${requestId}] [Artist News] 元のテキスト長: ${finalText.length}文字`);

  // JSONを抽出してパース（より堅牢に）
  let jsonStr = finalText;

  // まずコードフェンスをチェック
  const fenceMatch = finalText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  } else {
    // コードフェンスがない場合、{ } で囲まれた部分を抽出
    const jsonMatch = finalText.match(/\{[\s\S]*"trivia"[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
  }

  // JSON文字列からcitationタグのみを削除（開始タグと終了タグのみ削除、中身は残す）
  jsonStr = jsonStr.replace(/<cite[^>]*>/g, '').replace(/<\/cite>/g, '');

  const parsed = JSON.parse(jsonStr);

  console.log(`[${requestId}] [Artist News] ✅ Web検索成功: ${parsed.trivia.length}件`);
  return parsed.trivia || [];
}

/**
 * 通常の方法でアーティストの豆知識を生成する（フォールバック）
 * @param {string} artist - アーティスト名
 * @param {string} requestId - デバッグ用リクエストID
 */
async function getArtistTriviaFallback(artist, requestId) {
  console.log(`[${requestId}] [Artist Trivia] 通常モードで取得中...`);

  const prompt = `あなたは音楽評論家です。アーティスト「${artist}」について、興味深い豆知識を2-3個、簡潔に教えてください。

以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

{
  "trivia": [
    "情報1（50-100字程度）",
    "情報2（50-100字程度）",
    "情報3（50-100字程度）"
  ]
}

以下のような内容を含めてください：
- 代表曲の制作秘話や知られざるエピソード
- 音楽業界への影響や評価
- アルバムやツアーに関する話題
- 受賞歴やチャート記録

簡潔で興味深い内容にしてください。`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const rawText = message.content[0].text;

  // JSONを抽出してパース
  let jsonStr = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);
  console.log(`[${requestId}] [Artist Trivia] ✅ 通常モードで取得完了: ${parsed.trivia.length}件`);

  return parsed.trivia || [];
}

/**
 * アーティストの豆知識を生成する（Web検索 + フォールバック）
 * @param {string} artist - アーティスト名
 * @param {string} requestId - デバッグ用リクエストID
 */
async function getArtistTrivia(artist, requestId) {
  console.log(`[${requestId}] [Artist Trivia] リクエスト開始...`);
  console.log(`[${requestId}] [Artist Trivia] アーティスト: ${artist}`);

  try {
    // Web検索を15秒タイムアウトで試行
    const result = await Promise.race([
      getArtistTriviaWithWebSearch(artist, requestId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Web検索タイムアウト')), 15000)
      )
    ]);

    console.log(`[${requestId}] [Artist Trivia] ✅ Web検索で取得成功`);
    return result;
  } catch (error) {
    console.log(`[${requestId}] [Artist Trivia] ⚠️ Web検索失敗: ${error.message}`);
    console.log(`[${requestId}] [Artist Trivia] フォールバックモードに切り替え`);

    // フォールバック: 通常の方法で取得
    return await getArtistTriviaFallback(artist, requestId);
  }
}

/**
 * 曲の類似曲をレコメンドする
 * @param {string} title - 曲名
 * @param {string} artist - アーティスト名
 * @param {string} interpretation - 曲の解釈（ジャンル、テーマの参考用）
 * @param {string} requestId - デバッグ用リクエストID
 */
async function getRecommendations(title, artist, interpretation, requestId) {
  const prompt = `あなたは音楽評論家です。以下の曲が好きな人におすすめの類似曲を3曲提案してください。

曲名: ${title}
アーティスト: ${artist}
曲の特徴: ${interpretation.substring(0, 200)}...

以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

{
  "recommendations": [
    {
      "title": "曲名",
      "artist": "アーティスト名",
      "reason": "おすすめの理由（30-50字程度）"
    }
  ]
}

音楽性、テーマ、雰囲気が似ている曲を厳選して3曲提案してください。同じアーティストの曲は避けてください。`;

  console.log(`[${requestId}] [Recommendations] リクエスト開始...`);
  console.log(`[${requestId}] [Recommendations] 曲: ${title} by ${artist}`);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  console.log(`[${requestId}] [Recommendations] レスポンス受信`);

  const rawText = message.content[0].text;

  // JSONを抽出してパース
  let jsonStr = rawText;
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    jsonStr = fenceMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);
  console.log(`[${requestId}] [Recommendations] ✅ レコメンド取得完了: ${parsed.recommendations.length}曲`);

  return parsed.recommendations || [];
}

module.exports = { analyzeLyrics, chatAboutSong, getArtistTrivia, getRecommendations };
