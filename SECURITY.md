# 🔐 セキュリティガイド - API キー漏洩対策

## ✅ 現在の対策状況

### 1. .gitignore による保護 ✅
以下のファイルがGitにコミットされないよう設定済み：
- `.env`
- `.env.backup`
- `.env.local`
- `.env.*.local`

### 2. Vercel環境変数 ✅
- APIキーはVercelのダッシュボードで管理
- コードには直接書かない
- `process.env.GENIUS_API_KEY`
- `process.env.ANTHROPIC_API_KEY`

---

## 🚨 重要な確認事項

### デプロイ前に必ずチェック！

```bash
# 1. .envファイルがGitに追加されていないか確認
git status

# 2. 過去のコミット履歴にAPIキーがないか確認
git log --all --full-history --source -- '*/.env*'

# 3. リモートにプッシュする前に再確認
git diff origin/main
```

---

## ⚠️ もしAPIキーが漏洩したら

### 即座に実行すべきこと：

1. **APIキーを無効化**
   - Genius: https://genius.com/api-clients
   - Anthropic: https://console.anthropic.com/settings/keys

2. **新しいAPIキーを発行**

3. **Vercelの環境変数を更新**
   - Settings → Environment Variables
   - 古いキーを削除し、新しいキーを追加

4. **再デプロイ**
   ```bash
   git commit --allow-empty -m "Trigger redeploy with new API keys"
   git push
   ```

---

## 🛡️ 追加のセキュリティ対策

### 1. GitHub Secretsのスキャン

GitHubは自動的にAPIキーをスキャンします。もし検出されると：
- GitHubから通知が来る
- 該当のプッシュがブロックされる可能性がある

### 2. ローカル環境での注意点

```bash
# ❌ 危険：環境変数をターミナルで直接設定
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# ✅ 安全：.envファイルを使用
# .envファイルに記載し、dotenvで読み込む
```

### 3. コードレビュー時のチェックポイント

- [ ] APIキーがハードコードされていないか
- [ ] `.env.example`にはダミー値のみが含まれているか
- [ ] コンソールログにAPIキーが出力されていないか
- [ ] エラーメッセージにAPIキーが含まれていないか

---

## 📋 .env.example ファイルの作成

チーム開発のために、APIキーの形式だけを示すファイルを作成：

```bash
# .env.example
GENIUS_API_KEY=your_genius_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
USE_MOCK=false
```

**重要**: 実際のAPIキーは含めない！

---

## 🔍 定期的なセキュリティチェック

### 毎月実行すべきこと：

1. **APIキーのローテーション**
   - 定期的に新しいキーに更新

2. **アクセスログの確認**
   - Vercelのログで不審なアクセスがないか確認
   - Anthropicのダッシュボードで使用量を確認

3. **依存関係の更新**
   ```bash
   npm audit
   npm update
   ```

---

## 💡 ベストプラクティス

### DO ✅
- 環境変数を使用する
- .gitignoreを正しく設定する
- Vercelの環境変数で管理する
- 定期的にAPIキーをローテーションする

### DON'T ❌
- APIキーをコードに直接書かない
- `.env`ファイルをGitにコミットしない
- APIキーをSlack/Discord等で共有しない
- スクリーンショットにAPIキーを含めない
- 公開リポジトリに秘密情報を含めない

---

## 🚀 安全なデプロイフロー

```bash
# 1. デプロイ前の最終チェック
git status
git diff

# 2. .envファイルが含まれていないことを確認
git ls-files | grep .env

# 3. 問題なければコミット
git add .
git commit -m "Your message"

# 4. プッシュ前に再確認
git log -1

# 5. プッシュ
git push
```

---

## 📞 緊急連絡先

- **Anthropic サポート**: https://support.anthropic.com
- **Genius サポート**: https://genius.com/contact
- **Vercel サポート**: https://vercel.com/support

---

## 🔐 現在のセキュリティレベル: 高

すべての主要な対策が実施されています。このガイドに従って定期的なチェックを行ってください。
