# Resendメール通知セットアップガイド

フィードバックをメールで受信するための設定手順です。

## 1. Resendアカウント作成

1. https://resend.com/ にアクセス
2. 「Sign Up」をクリックして無料アカウント作成
3. メールアドレスを確認

## 2. API Key取得

1. Resendダッシュボードにログイン
2. 左メニューの「API Keys」をクリック
3. 「Create API Key」をクリック
4. 名前を入力（例: "Lyrics Explainer Feedback"）
5. Permission: "Sending access"を選択
6. 「Add」をクリック
7. 表示されたAPI Keyをコピー（⚠️ 一度しか表示されないので注意）

## 3. 環境変数設定

### ローカル環境
`backend/.env` ファイルに以下を追加：

```bash
# Resend API設定
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
FEEDBACK_EMAIL=your-email@example.com
```

### Vercel環境
1. Vercelダッシュボードを開く
2. プロジェクトを選択
3. 「Settings」→「Environment Variables」
4. 以下の変数を追加：
   - `RESEND_API_KEY`: コピーしたAPI Key
   - `FEEDBACK_EMAIL`: フィードバックを受信したいメールアドレス
5. 「Save」をクリック
6. 再デプロイ（または自動デプロイを待つ）

## 4. 動作確認

1. サイトにアクセス
2. フィードバックボタンをクリック
3. テストメッセージを送信
4. 設定したメールアドレスにフィードバックが届くか確認

## 注意事項

- 無料プラン: 3,000メール/月
- 送信元アドレスは `onboarding@resend.dev` （独自ドメインを設定するとカスタマイズ可能）
- メールが届かない場合は迷惑メールフォルダを確認

## トラブルシューティング

### メールが届かない
- API Keyが正しく設定されているか確認
- Vercelの環境変数が保存されているか確認
- 迷惑メールフォルダを確認
- Resendダッシュボードで送信ログを確認

### API Keyエラー
- Vercelで環境変数を設定後、再デプロイが必要
- API Keyの権限が "Sending access" になっているか確認
