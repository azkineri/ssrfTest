import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { hash } from 'bcryptjs';

const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Starting seed...');

    // 既存のデータをクリア
    console.log('Cleaning up existing data...');
    await prisma.todo.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleanup completed.');

    // パスワードをハッシュ化
    const hashedPassword = await hash('password123', 10);

    // ユーザーを作成
    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'alice@example.com',
                name: 'Alice Johnson',
                emailVerified: true,
                createdAt: new Date('2024-01-15'),
                accounts: {
                    create: {
                        accountId: 'alice@example.com',
                        providerId: 'credential',
                        password: hashedPassword,
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'bob@example.com',
                name: 'Bob Smith',
                emailVerified: true,
                createdAt: new Date('2024-02-20'),
                accounts: {
                    create: {
                        accountId: 'bob@example.com',
                        providerId: 'credential',
                        password: hashedPassword,
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'charlie@example.com',
                name: 'Charlie Brown',
                emailVerified: true,
                createdAt: new Date('2024-03-10'),
                accounts: {
                    create: {
                        accountId: 'charlie@example.com',
                        providerId: 'credential',
                        password: hashedPassword,
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'diana@example.com',
                name: 'Diana Prince',
                emailVerified: true,
                createdAt: new Date('2024-04-05'),
                accounts: {
                    create: {
                        accountId: 'diana@example.com',
                        providerId: 'credential',
                        password: hashedPassword,
                    },
                },
            },
        }),
        prisma.user.create({
            data: {
                email: 'eve@example.com',
                name: 'Eve Wilson',
                emailVerified: true,
                createdAt: new Date('2024-05-12'),
                accounts: {
                    create: {
                        accountId: 'eve@example.com',
                        providerId: 'credential',
                        password: hashedPassword,
                    },
                },
            },
        }),
    ]);

    console.log(`Created ${users.length} users`);

    // 各ユーザーごとに異なるタスクを作成
    const userTodos = {
        'alice@example.com': [
            { title: 'プロジェクトの企画書を作成', completed: true },
            { title: 'チームミーティングの準備', completed: true },
            { title: 'クライアントへのプレゼン資料作成', completed: false },
            { title: '予算計画の見直し', completed: false },
            { title: '四半期レポートの作成', completed: true },
            { title: '新規プロジェクトのキックオフ', completed: false },
            { title: 'ステークホルダーとの打ち合わせ', completed: false },
        ],
        'bob@example.com': [
            { title: 'コードレビューを実施', completed: true },
            { title: 'バグ修正 #1234', completed: true },
            { title: 'ユニットテストの追加', completed: false },
            { title: 'リファクタリング: 認証モジュール', completed: false },
            { title: 'パフォーマンス改善の調査', completed: false },
            { title: 'APIエンドポイントの実装', completed: true },
            { title: 'コードカバレッジの向上', completed: false },
            { title: '技術的負債の解消', completed: false },
        ],
        'charlie@example.com': [
            { title: 'データベースのバックアップ', completed: true },
            { title: 'セキュリティ監査の実施', completed: true },
            { title: 'サーバーのメンテナンス', completed: false },
            { title: 'ログ監視システムの構築', completed: false },
            { title: 'CI/CDパイプラインの改善', completed: false },
            { title: 'インフラコストの最適化', completed: true },
            { title: 'バックアップ戦略の見直し', completed: false },
        ],
        'diana@example.com': [
            { title: 'UIデザインのモックアップ作成', completed: true },
            { title: 'ユーザーフィードバックの分析', completed: true },
            { title: 'ユーザビリティテストの実施', completed: false },
            { title: 'デザインシステムの更新', completed: false },
            { title: 'アクセシビリティの改善', completed: false },
            { title: 'プロトタイプの作成', completed: true },
            { title: 'カラーパレットの見直し', completed: false },
            { title: 'レスポンシブデザインの調整', completed: false },
        ],
        'eve@example.com': [
            { title: 'APIドキュメントの作成', completed: true },
            { title: 'ドキュメントの更新', completed: true },
            { title: 'ユーザーガイドの執筆', completed: false },
            { title: 'テストケースの追加', completed: false },
            { title: '新機能の設計書を書く', completed: false },
            { title: 'リリースノートの作成', completed: true },
            { title: 'オンボーディング資料の更新', completed: false },
            { title: '週次レポートを提出', completed: false },
        ],
    };

    let totalTodos = 0;

    for (const user of users) {
        const todos = userTodos[user.email as keyof typeof userTodos];

        if (!todos) {
            console.warn(`No todos defined for ${user.email}`);
            continue;
        }

        for (const template of todos) {
            await prisma.todo.create({
                data: {
                    title: template.title,
                    completed: template.completed,
                    userId: user.id,
                    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 過去30日以内
                },
            });
            totalTodos++;
        }
    }

    console.log(`Created ${totalTodos} todos`);
    console.log('Seed completed successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Email: alice@example.com, bob@example.com, charlie@example.com, diana@example.com, eve@example.com');
    console.log('Password: password123');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
