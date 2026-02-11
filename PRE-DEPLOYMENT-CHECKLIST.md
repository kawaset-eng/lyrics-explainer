# 🚀 デプロイ前セキュリティチェックリスト

デプロイ前に必ず以下を確認してください。

## ✅ 必須チェック項目

### 1. APIキーの安全性

```bash
# .envファイルがGitに含まれていないことを確認
git status | grep .env
# 結果: 何も表示されないはず

# ステージングエリアを確認
git diff --cached | grep -i "api.*key"
# 結果: 何も表示されないはず
```

- [ ] `.env` ファイルがGitに追跡されていない
- [ ] `.env.backup` ファイルがGitに追跡されていない
- [ ] コードにAPIキーが直接書かれていない
- [ ] `.gitignore` に `.env` が含まれている

### 2. 環境変数の確認

- [ ] `backend/.env.example` が存在し、実際のAPIキーは含まれていない
- [ ] Vercelの環境変数設定手順を理解している
- [ ] 以下の環境変数を準備済み：
  - `GENIUS_API_KEY`
  - `ANTHROPIC_API_KEY`

### 3. コードの確認

```bash
# APIキーのハードコーディングをチェック
grep -r "sk-ant-" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" .
grep -r "api.*key.*=" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" . | grep -v "process.env"
```

- [ ] すべてのAPIキーが `process.env.*` で参照されている
- [ ] ログ出力にAPIキーが含まれていない
- [ ] エラーメッセージにAPIキーが含まれていない

### 4. 依存関係のセキュリティ

```bash
# セキュリティ脆弱性のチェック
npm audit

# 修正可能な脆弱性を自動修正
npm audit fix
```

- [ ] `npm audit` で重大な脆弱性がない
- [ ] 依存関係が最新（または意図的に古いバージョンを使用）

### 5. ビルドの確認

```bash
# ローカルでビルドが成功するか確認
cd frontend
npm run build

# エラーがないか確認
echo $?
# 結果: 0 であるべき
```

- [ ] フロントエンドのビルドが成功する
- [ ] ビルド成果物にAPIキーが含まれていない

---

## 🔒 Vercelデプロイ時の設定

### 環境変数の設定手順

1. Vercelダッシュボード → プロジェクト選択
2. Settings → Environment Variables
3. 以下を追加：

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GENIUS_API_KEY` | [あなたのキー] | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | [あなたのキー] | Production, Preview, Development |

**注意**:
- キーの前後にスペースを入れない
- すべての環境にチェックを入れる

---

## ⚠️ デプロイ後の確認

### デプロイ成功後に確認すべきこと

1. **動作確認**
   ```
   https://your-app.vercel.app/api/health
   ```
   - `genius: true` と `claude: true` が表示される

2. **実際の検索をテスト**
   - 曲を検索して歌詞が表示されるか確認
   - エラーがログに出ていないか確認

3. **ログの確認**
   - Vercelダッシュボード → Logs
   - APIキーが出力されていないか確認

---

## 🚨 緊急時の対応

### もしAPIキーが漏洩したら

1. **即座にAPIキーを無効化**
   - Anthropic: https://console.anthropic.com/settings/keys
   - Genius: https://genius.com/api-clients

2. **新しいキーを発行**

3. **Vercelの環境変数を更新**

4. **過去のコミット履歴を確認**
   ```bash
   git log --all --full-history --source -- '*/.env*'
   ```

5. **必要に応じてリポジトリを削除して再作成**

---

## ✅ 最終確認

すべてのチェック項目に☑️が入ったら、デプロイ準備完了です！

```bash
# 最終確認コマンド
echo "=== .gitignore チェック ==="
cat .gitignore | grep .env

echo "\n=== Gitステータス ==="
git status

echo "\n=== ステージング内容 ==="
git diff --cached --name-only

echo "\n=== APIキースキャン ==="
git diff --cached | grep -i "api.*key" || echo "✅ APIキーは含まれていません"
```

すべて問題なければ：

```bash
git commit -m "Initial commit: Lyrics Explainer"
git push
```

---

**デプロイ準備完了！** 🎉
