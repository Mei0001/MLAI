# MLAI - My Limitless AI Assistant

AI駆動のパーソナル生産性アシスタント。タスク分解、スケジューリング、レジュメ作成、ウィッシュリスト管理機能を備えたCursor風Webアプリケーション。

## 🚀 機能

### 1. タスク分解 (Secretary AI風)
- ユーザー入力のタスクをAIが自動でサブタスクに分解
- 各サブタスクの見積時間を算出
- 優先度を自動判定（高/中/低）
- OpenAI API統合（APIキーがない場合はローカルルールベースで動作）

### 2. 日次スケジューラー
- 未完了タスクから日次スケジュールを自動生成
- 優先度とデッドラインに基づく最適化
- 作業時間・休憩時間の設定
- 完了チェックとフィードバック機能

### 3. ジョブハンティング支援
- レジュメビルダー（基本情報、職歴、学歴、スキル）
- ターゲット職種に合わせたレジュメ自動生成
- Markdown形式での出力
- ローカルストレージへの保存

### 4. 動的ウィッシュリスト
- アイテムの熱意レベル（1-10）と価格を入力
- 予算に基づく優先度スコアを自動計算
- 優先度/価格/熱意順でソート
- 購入済みアイテムの追跡

### 5. デバイス連携模擬
- ローカルストレージを使用したデータ永続化
- すべてのデータはブラウザに保存

## 🛠 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データ管理**: LocalStorage
- **AI統合**: OpenAI API (プレースホルダー / オプション)

## 📁 プロジェクト構造

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/decompose/     # タスク分解API
│   │   ├── schedule/optimize/   # スケジュール最適化API
│   │   ├── resume/generate/     # レジュメ生成API
│   │   └── wishlist/priority/   # ウィッシュリスト優先度API
│   ├── globals.css              # グローバルスタイル
│   ├── layout.tsx               # ルートレイアウト
│   └── page.tsx                 # メインダッシュボード
├── components/
│   ├── TaskDecomposer.tsx       # タスク分解コンポーネント
│   ├── TaskList.tsx             # タスク一覧コンポーネント
│   ├── Scheduler.tsx            # スケジューラーコンポーネント
│   ├── ResumeBuilder.tsx        # レジュメビルダーコンポーネント
│   └── Wishlist.tsx             # ウィッシュリストコンポーネント
├── lib/
│   ├── ai.ts                    # AI統合モジュール
│   └── storage.ts               # ローカルストレージ管理
└── types/
    └── index.ts                 # TypeScript型定義
```

## 🚀 セットアップ

### 必要条件
- Node.js 18+
- npm または yarn

### インストール

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 本番サーバーの起動
npm run start
```

### 環境変数（オプション）

OpenAI APIを使用する場合は、`.env.local`ファイルを作成：

```env
OPENAI_API_KEY=your-api-key-here
```

## 🎨 UI/UX

- ダークモードベースのモダンなUI
- Cursor/VS Code風のデザイン
- グラデーションアクセントとグローエフェクト
- レスポンシブデザイン
- スムーズなアニメーション

## 📝 APIエンドポイント

### POST /api/tasks/decompose
タスクをサブタスクに分解

**リクエスト:**
```json
{
  "task": "プレゼン資料を作成する",
  "context": "来週の会議用"
}
```

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "originalTask": "プレゼン資料を作成する",
    "subtasks": [...],
    "estimatedTotalTime": 180,
    "suggestedPriority": "high"
  }
}
```

### POST /api/schedule/optimize
タスクからスケジュールを生成

### POST /api/resume/generate
レジュメコンテンツを生成

### POST /api/wishlist/priority
ウィッシュリストの優先度を計算

## 📄 ライセンス

MIT License

---

Built with ♥ using Next.js, TypeScript, and Tailwind CSS
