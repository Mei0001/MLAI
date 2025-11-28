# Limitless AI Secretary

AIセクレタリーシステム - タスク管理、スケジュール最適化、目標追跡をAIで支援

## 概要

Limitless AI Pendantで録音された会話から、AIが自動的にタスクを抽出・分解し、あなたの生活パターンに最適化されたスケジュールを提案するWebアプリケーションです。

## 主要機能

- **タスク自動分解**: 録音から抽出されたタスクを実行可能なサブタスクに分解
- **スケジュール最適化**: 起床・就寝時間、エネルギーレベルに基づく最適なタイミングでのタスク配置
- **実行フィードバック**: タスクの進捗追跡とパフォーマンス分析
- **デバイス間連携**: Pendantで録音したデータをWebアプリでシームレスに管理
- **ジョブハンティング支援**: キャリア関連タスクの特別サポート
- **動的ウィッシュリスト**: 長期目標を実行可能なタスクに変換

## 技術スタック

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Query
- **API**: Limitless AI API
- **Deployment**: Vercel

## セットアップ

1. リポジトリのクローン:
```bash
git clone <repository-url>
cd limitless-ai-secretary
```

2. 依存関係のインストール:
```bash
npm install
```

3. 環境変数の設定:
```bash
cp .env.local.example .env.local
# .env.localを編集してLimitless API Keyを設定
```

4. 開発サーバーの起動:
```bash
npm run dev
```

5. ブラウザで開く: http://localhost:3000

## プロジェクト構造

```
.
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   │   └── tasks/         # タスク関連API
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホームページ
│   └── globals.css        # グローバルスタイル
├── docs/                   # ドキュメント
│   ├── LimitlessAI_API.md # Limitless API使用方法
│   └── Nextjs_BestPractices.md # Next.jsベストプラクティス
├── AGENT.md               # エージェント構造設計
├── package.json           # 依存関係
└── tsconfig.json          # TypeScript設定
```

## ドキュメント

- [Limitless AI API使用方法](./docs/LimitlessAI_API.md)
- [Next.jsベストプラクティス](./docs/Nextjs_BestPractices.md)
- [エージェント構造設計](./AGENT.md)

## 開発スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLint実行
- `npm run type-check` - TypeScriptの型チェック

## エージェント構造

このプロジェクトは、複数の専門エージェントが協調して動作します:

1. **Agent Orchestrator**: 各エージェントの調整役
2. **Task Decomposition Agent**: タスクを実行可能なサブタスクに分解
3. **Schedule Optimizer Agent**: 最適なタイミングでタスクをスケジュール
4. **Feedback Tracker Agent**: 実行状況の追跡と分析
5. **Wishlist Manager Agent**: 目標をタスクに変換

詳細は [AGENT.md](./AGENT.md) を参照してください。

## API使用例

タスク分解APIの使用例:

```bash
curl -X POST http://localhost:3000/api/tasks/decompose \
  -H "Content-Type: application/json" \
  -d '{
    "task": {
      "id": "task_123",
      "title": "プロジェクト報告書を作成",
      "description": "Q4の進捗をまとめた報告書を作成する",
      "priority": "high",
      "estimatedMinutes": 120
    },
    "maxSubtasks": 5
  }'
```

## ライセンス

MIT

## 参考資料

- [Limitless AI 公式サイト](https://limitless.ai/)
- [Limitless AI API ドキュメント](https://help.limitless.ai/en/articles/11106060-limitless-api)
- [Limitless API サンプル](https://github.com/limitless-ai-inc/limitless-api-examples)
