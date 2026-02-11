# 🚀 Lyrics Explainer デプロイガイド（初心者向け）

このガイドに従えば、誰でも簡単にアプリをインターネット上に公開できます！

---

## 📋 準備するもの

1. ✅ GitHubアカウント（無料）
2. ✅ Vercelアカウント（無料）
3. ✅ このアプリのコード（既にあります）

---

## ステップ1: GitHubアカウントを作成（5分）

### 1-1. GitHubにアクセス
ブラウザで以下にアクセス：
```
https://github.com
```

### 1-2. アカウント作成
- 右上の「Sign up」をクリック
- メールアドレス、パスワード、ユーザー名を入力
- メール認証を完了

**完了！** GitHubアカウントができました。

---

## ステップ2: コードをGitHubにアップロード（10分）

### 2-1. ターミナルを開く

**Macの場合：**
- Spotlight検索（Command + Space）で「ターミナル」と入力
- Enterキーを押す

**Windowsの場合：**
- スタートメニューから「Git Bash」を開く

### 2-2. プロジェクトディレクトリに移動

```bash
cd ~/claude-practice
```

### 2-3. Gitの初期設定（初回のみ）

```bash
# あなたの名前を設定（GitHubのユーザー名でOK）
git config --global user.name "あなたの名前"

# あなたのメールアドレスを設定（GitHubに登録したメール）
git config --global user.email "your-email@example.com"
```

### 2-4. Gitリポジトリを初期化

```bash
# Gitを初期化
git init

# すべてのファイルを追加
git add .

# コミット（保存）
git commit -m "Initial commit: Lyrics Explainer"
```

### 2-5. GitHubにリポジトリを作成

1. **ブラウザでGitHubを開く**: https://github.com
2. **右上の「+」マーク → 「New repository」をクリック**
3. **リポジトリ名を入力**: `lyrics-explainer`
4. **「Public」を選択**（無料プランの場合）
5. **「Create repository」をクリック**

### 2-6. GitHubにプッシュ

**GitHubの画面に表示されているコマンドをコピーして実行:**

```bash
# リモートリポジトリを追加（YOUR_USERNAMEは自分のGitHubユーザー名）
git remote add origin https://github.com/YOUR_USERNAME/lyrics-explainer.git

# メインブランチに変更
git branch -M main

# プッシュ
git push -u origin main
```

**ユーザー名とパスワードを聞かれたら:**
- ユーザー名: GitHubのユーザー名
- パスワード: **Personal Access Token**（下記参照）

#### Personal Access Tokenの作成（初回のみ）

1. GitHub → 右上のアイコン → Settings
2. 左下の「Developer settings」
3. 「Personal access tokens」→「Tokens (classic)」
4. 「Generate new token (classic)」
5. Noteに「Vercel Deploy」と入力
6. 「repo」にチェック
7. 「Generate token」をクリック
8. **トークンをコピー**（二度と表示されないので保存！）

**完了！** コードがGitHubにアップロードされました。

---

## ステップ3: Vercelアカウントを作成（3分）

### 3-1. Vercelにアクセス
```
https://vercel.com
```

### 3-2. GitHubでサインアップ
- 「Sign Up」をクリック
- 「Continue with GitHub」を選択
- GitHubの認証を許可

**完了！** Vercelアカウントができました。

---

## ステップ4: Vercelにデプロイ（10分）

### 4-1. 新しいプロジェクトを作成

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで `lyrics-explainer` を探す
3. 「Import」をクリック

### 4-2. プロジェクトの設定

以下のように設定：

| 項目 | 値 |
|------|-----|
| Project Name | `lyrics-explainer`（そのまま） |
| Framework Preset | `Other` |
| Root Directory | `./`（そのまま） |
| Build Command | `npm run build`（自動入力される） |
| Output Directory | `frontend/dist`（自動入力される） |

### 4-3. 環境変数を設定（重要！）

**「Environment Variables」セクションを開く**

以下の2つを追加：

#### 1つ目: GENIUS_API_KEY

```
Name: GENIUS_API_KEY
Value: [あなたのGenius APIキー]
```

**Genius APIキーの取得方法：**
1. https://genius.com/api-clients にアクセス
2. 「New API Client」をクリック
3. App名を入力（例：Lyrics Explainer）
4. App Website URLは空欄でOK
5. 「Save」をクリック
6. 「Generate Access Token」をクリック
7. **トークンをコピー** → Vercelの「Value」に貼り付け

#### 2つ目: ANTHROPIC_API_KEY

```
Name: ANTHROPIC_API_KEY
Value: [あなたのAnthropic APIキー]
```

**Anthropic APIキーの取得方法：**
1. https://console.anthropic.com にアクセス
2. アカウントを作成（まだの場合）
3. 「API Keys」をクリック
4. 「Create Key」をクリック
5. 名前を入力（例：Lyrics Explainer）
6. **キーをコピー** → Vercelの「Value」に貼り付け

**注意**: 両方とも、すべての環境（Production, Preview, Development）にチェックを入れる

### 4-4. デプロイ開始

「Deploy」ボタンをクリック！

**デプロイ中の画面が表示されます（2-3分かかります）**

---

## ステップ5: 完成！アプリを確認（1分）

### 5-1. デプロイ完了

「Congratulations!」と表示されたら成功です！

### 5-2. URLを確認

画面に表示されているURLをクリック：
```
https://lyrics-explainer-xxxxx.vercel.app
```

### 5-3. 動作確認

1. 曲名とアーティスト名を入力（例：Bohemian Rhapsody / Queen）
2. 「検索」をクリック
3. 歌詞と日本語訳が表示されれば **成功！** 🎉

---

## 🎉 おめでとうございます！

あなたのLyrics Explainerがインターネット上に公開されました！

### あなたのアプリのURL:
```
https://lyrics-explainer-xxxxx.vercel.app
```

このURLを友達にシェアすれば、誰でもアクセスできます！

---

## 📝 よくある質問（Q&A）

### Q1: デプロイに失敗しました
**A:** Vercelのログを確認してください：
1. Vercelダッシュボード → プロジェクト
2. 「Deployments」タブ
3. 失敗したデプロイをクリック
4. エラーメッセージを確認

よくある原因：
- 環境変数が設定されていない
- APIキーが間違っている

### Q2: 「API key is invalid」と表示される
**A:** Vercelの環境変数を再確認：
1. Settings → Environment Variables
2. GENIUS_API_KEY と ANTHROPIC_API_KEY が正しく設定されているか確認

### Q3: コードを更新したい
**A:** ローカルで変更してGitHubにプッシュすれば、自動的に再デプロイされます：
```bash
git add .
git commit -m "Update: 変更内容"
git push
```

### Q4: お金はかかりますか？
**A:**
- **Vercel**: 無料プランで十分です
- **Anthropic API**: 使用量に応じて課金（月$5程度）
- **Genius API**: 完全無料

---

## 🆘 困ったときは

### エラーが出た場合
1. まず、このガイドを最初から読み直す
2. Vercelのログを確認
3. 環境変数が正しく設定されているか確認

### それでも解決しない場合
- GitHubのIssueを作成
- Vercelのサポートに問い合わせ

---

## 🎯 次のステップ

アプリが動いたら、以下を試してみましょう：

1. **カスタムドメインを設定**
   - Vercel Settings → Domains

2. **アプリを改善**
   - デザインを変更
   - 新しい機能を追加

3. **友達にシェア**
   - SNSでURLをシェア

---

**あなたはもう立派な開発者です！** 🚀
