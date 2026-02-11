# Lyrics Explainer - Vercelデプロイガイド

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（無料）
- Genius API キー
- Anthropic API キー

---

## 🚀 デプロイ手順

### 1. GitHubリポジトリを作成

```bash
# Gitリポジトリを初期化（まだの場合）
git init

# .gitignoreファイルを確認
# 以下が含まれていることを確認：
# node_modules/
# .env
# .env.backup
# dist/
# .DS_Store
```

### 2. GitHubにプッシュ

```bash
# すべてのファイルをステージング
git add .

# コミット
git commit -m "Initial commit: Lyrics Explainer"

# GitHubリポジトリを作成してリモートに追加
# （GitHubのWebUIで新規リポジトリを作成してから）
git remote add origin https://github.com/YOUR_USERNAME/lyrics-explainer.git

# プッシュ
git push -u origin main
```

### 3. Vercelにデプロイ

1. **Vercelにログイン**: https://vercel.com/
2. **「New Project」をクリック**
3. **GitHubリポジトリをインポート**
   - リポジトリ一覧から `lyrics-explainer` を選択
4. **プロジェクト設定**
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `frontend/dist`
5. **環境変数を設定**
   - `GENIUS_API_KEY`: あなたのGenius APIキー
   - `ANTHROPIC_API_KEY`: あなたのAnthropic APIキー
6. **「Deploy」をクリック**

---

## 🔑 環境変数の設定方法

Vercelのダッシュボードで：

1. プロジェクトを選択
2. 「Settings」→「Environment Variables」
3. 以下を追加：

| Name | Value |
|------|-------|
| `GENIUS_API_KEY` | あなたのGenius APIキー |
| `ANTHROPIC_API_KEY` | あなたのAnthropic APIキー |

**重要**: すべての環境（Production, Preview, Development）にチェックを入れる

---

## 🛠️ ローカルでの開発

```bash
# すべての依存関係をインストール
npm run install-all

# フロントエンドとバックエンドを別々のターミナルで起動
npm run dev:frontend  # ターミナル1
npm run dev:backend   # ターミナル2

# または、それぞれのディレクトリで
cd frontend && npm run dev
cd backend && npm run dev
```

---

## 📝 デプロイ後の確認

1. デプロイが完了すると、VercelからURLが発行されます
   - 例: `https://lyrics-explainer.vercel.app`

2. 動作確認：
   - アプリケーションにアクセス
   - 曲を検索してみる
   - 歌詞と翻訳が表示されることを確認
   - チャット機能をテスト

3. エラーが出た場合：
   - Vercelダッシュボードの「Logs」を確認
   - 環境変数が正しく設定されているか確認

---

## 🔄 更新のデプロイ

コードを更新したら：

```bash
git add .
git commit -m "Update: 説明"
git push
```

Vercelが自動的に新しいバージョンをデプロイします！

---

## 🐛 トラブルシューティング

### エラー: "GENIUS_API_KEY が設定されていません"
→ Vercelの環境変数を確認してください

### エラー: "Cannot find module"
→ `package.json` の dependencies を確認してください

### ビルドエラー
→ Vercelのビルドログを確認し、エラーメッセージを読んでください

---

## 💡 追加のヒント

- **カスタムドメイン**: Vercelの設定で独自ドメインを追加できます
- **分析**: Vercelダッシュボードでアクセス解析が見られます
- **プレビューデプロイ**: Pull Requestごとにプレビュー環境が自動作成されます
