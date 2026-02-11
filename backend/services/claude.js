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

module.exports = { analyzeLyrics, chatAboutSong };
