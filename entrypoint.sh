#!/bin/sh
set -e

echo "Running database migrations..."
bunx prisma migrate deploy

# 初回起動時のみseedを実行（フラグファイルで判定）
if [ ! -f /app/.seeded ]; then
    echo "First time startup detected. Running seed script..."
    bun prisma/seed.ts
    touch /app/.seeded
    echo "Seed completed."
else
    echo "Database already seeded. Skipping seed script."
fi

echo "Starting application..."
exec "$@"
