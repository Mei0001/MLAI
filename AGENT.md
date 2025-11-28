# エージェント構造設計書

## プロジェクト概要

このプロジェクトは、Limitless AI Pendantの機能を基にした、AIセクレタリーシステムのMVPです。@mei0001_のX投稿で提案された以下の機能を実装します：

- **Secretary AIによるタスク分解**: 録音された会話からタスクを自動抽出・分解
- **デバイス間連携**: Pendantで録音されたデータをWebアプリで管理
- **日次スケジューリングの最適化**: 実際の起床/就寝時間を基にしたスケジュール調整
- **実行フィードバック**: タスクの進捗と完了状態の追跡
- **ジョブハンティング支援**: キャリア関連のタスクとアクティビティの管理
- **動的ウィッシュリスト**: 目標と願望の追跡・優先順位付け

## アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                    Limitless AI Pendant                      │
│                   (音声録音・初期処理)                         │
└────────────────────┬────────────────────────────────────────┘
                     │ API経由でデータ送信
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Limitless AI API Layer                      │
│            (文字起こし、要約、タスク抽出)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Backend                           │
│                  (API Routes & Server)                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Agent Orchestrator                          │   │
│  │    (エージェント間の調整・タスク振り分け)              │   │
│  └───┬─────────────┬──────────────┬────────────────────┘   │
│      │             │              │                         │
│  ┌───▼────┐  ┌────▼────┐  ┌─────▼─────┐  ┌──────────┐   │
│  │Task    │  │Schedule │  │Feedback   │  │Wishlist  │   │
│  │Decomp  │  │Optimizer│  │Tracker    │  │Manager   │   │
│  │Agent   │  │Agent    │  │Agent      │  │Agent     │   │
│  └────────┘  └─────────┘  └───────────┘  └──────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            Data Layer (Prisma + DB)                 │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│              (React Components & UI)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Recording │  │Task      │  │Schedule  │  │Wishlist  │   │
│  │Dashboard │  │Manager   │  │Calendar  │  │Board     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## エージェント詳細

### 1. Agent Orchestrator（エージェント調整役）

**役割**: 各専門エージェントを調整し、データフローを管理

**責任**:
- Limitless APIからの録音データを受信
- 各エージェントにタスクを振り分け
- エージェント間の依存関係を管理
- エラーハンドリングとリトライロジック

**実装ファイル**:
- `lib/agents/orchestrator.ts`

**主要メソッド**:
```typescript
async function processRecording(recordingId: string): Promise<ProcessingResult>
async function coordinateAgents(data: RecordingData): Promise<void>
async function handleAgentFailure(agentId: string, error: Error): Promise<void>
```

**依存関係**:
- Limitless API Client
- すべての専門エージェント
- Database Layer

---

### 2. Task Decomposition Agent（タスク分解エージェント）

**役割**: 録音から抽出されたタスクを細分化し、実行可能なサブタスクに分解

**責任**:
- Limitless APIから取得したタスクの分析
- 大きなタスクを小さな実行可能ステップに分解
- タスクの優先順位付け
- 必要なリソースと推定時間の算出
- 依存関係の特定

**実装ファイル**:
- `lib/agents/task-decomposition.ts`
- `lib/agents/task-analyzer.ts`

**主要メソッド**:
```typescript
async function decomposeTask(task: Task): Promise<SubTask[]>
async function analyzeDependencies(tasks: Task[]): Promise<TaskGraph>
async function estimateEffort(task: Task): Promise<EffortEstimate>
async function prioritizeTasks(tasks: Task[]): Promise<Task[]>
```

**データモデル**:
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  recordingId: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  dependencies: string[]; // 他のタスクID
  subtasks: SubTask[];
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assignedTime?: Date;
  completedAt?: Date;
}

interface SubTask {
  id: string;
  parentId: string;
  title: string;
  completed: boolean;
  order: number;
}
```

**依存関係**:
- Limitless API（タスク抽出エンドポイント）
- Schedule Optimizer Agent（タスクのスケジューリング）
- Feedback Tracker Agent（進捗追跡）

---

### 3. Schedule Optimizer Agent（スケジュール最適化エージェント）

**役割**: ユーザーの実際の生活パターンに基づいて、タスクを最適なタイミングでスケジュール

**責任**:
- 起床・就寝時間の学習と予測
- タスクの優先度とデッドラインに基づくスケジューリング
- エネルギーレベルに応じたタスク配置（朝は重要タスク、夜はルーチン作業など）
- カレンダーの空き時間の検出
- スケジュールの動的調整

**実装ファイル**:
- `lib/agents/schedule-optimizer.ts`
- `lib/agents/pattern-learner.ts`

**主要メソッド**:
```typescript
async function optimizeSchedule(tasks: Task[], constraints: ScheduleConstraints): Promise<Schedule>
async function learnUserPatterns(userId: string): Promise<UserPattern>
async function suggestTaskTime(task: Task, userPattern: UserPattern): Promise<TimeSlot>
async function rebalanceSchedule(schedule: Schedule, newTask: Task): Promise<Schedule>
async function detectEnergyPeaks(userId: string): Promise<EnergyPattern>
```

**データモデル**:
```typescript
interface UserPattern {
  userId: string;
  avgWakeTime: string; // "07:30"
  avgSleepTime: string; // "23:00"
  energyPeaks: TimeRange[]; // 高エネルギー時間帯
  preferredWorkHours: TimeRange[];
  breakPreferences: BreakPattern;
  historicalData: {
    date: Date;
    wakeTime: Date;
    sleepTime: Date;
    productiveHours: TimeRange[];
  }[];
}

interface Schedule {
  id: string;
  userId: string;
  date: Date;
  timeSlots: TimeSlot[];
  flexibility: 'rigid' | 'flexible';
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  taskId?: string;
  type: 'task' | 'break' | 'free' | 'meeting';
  isOptimal: boolean; // エネルギーレベルとタスク難易度が一致
}
```

**依存関係**:
- Task Decomposition Agent（タスクリスト）
- Feedback Tracker Agent（過去のパフォーマンスデータ）
- Database Layer（ユーザーパターン保存）

---

### 4. Feedback Tracker Agent（フィードバック追跡エージェント）

**役割**: タスクの実行状況を追跡し、ユーザーのパフォーマンスを分析

**責任**:
- タスクの開始・完了時刻の記録
- 実際の所要時間 vs 推定時間の比較
- 完了率とパターンの分析
- ボトルネックの特定
- 改善提案の生成

**実装ファイル**:
- `lib/agents/feedback-tracker.ts`
- `lib/agents/performance-analyzer.ts`

**主要メソッド**:
```typescript
async function trackTaskCompletion(taskId: string, actualTime: number): Promise<void>
async function analyzePerformance(userId: string, timeRange: TimeRange): Promise<PerformanceReport>
async function identifyBottlenecks(userId: string): Promise<Bottleneck[]>
async function generateInsights(userId: string): Promise<Insight[]>
async function suggestImprovements(userId: string): Promise<Suggestion[]>
```

**データモデル**:
```typescript
interface TaskExecution {
  taskId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  estimatedMinutes: number;
  actualMinutes?: number;
  wasPostponed: boolean;
  postponeCount: number;
  completionQuality?: 'excellent' | 'good' | 'acceptable' | 'poor';
}

interface PerformanceReport {
  userId: string;
  period: TimeRange;
  metrics: {
    tasksCompleted: number;
    tasksPostponed: number;
    avgCompletionRate: number; // 0-1
    accuracyOfEstimates: number; // 0-1
    mostProductiveHours: TimeRange[];
    leastProductiveHours: TimeRange[];
  };
  insights: Insight[];
  suggestions: Suggestion[];
}

interface Insight {
  type: 'pattern' | 'warning' | 'achievement';
  title: string;
  description: string;
  data: any;
}
```

**依存関係**:
- Task Decomposition Agent（タスクデータ）
- Schedule Optimizer Agent（スケジュール調整のフィードバック）
- Database Layer（実行履歴保存）

---

### 5. Wishlist Manager Agent（ウィッシュリスト管理エージェント）

**役割**: ユーザーの目標・願望を管理し、実行可能なタスクに変換

**責任**:
- 長期目標の管理
- 目標の優先順位付け
- 目標を具体的なタスクに分解
- 進捗の可視化
- 目標達成のためのマイルストーン設定

**実装ファイル**:
- `lib/agents/wishlist-manager.ts`
- `lib/agents/goal-converter.ts`

**主要メソッド**:
```typescript
async function addWish(wish: Wish): Promise<Wish>
async function convertWishToTasks(wishId: string): Promise<Task[]>
async function trackWishProgress(wishId: string): Promise<WishProgress>
async function reprioritizeWishes(userId: string): Promise<Wish[]>
async function suggestNextSteps(wishId: string): Promise<Action[]>
```

**データモデル**:
```typescript
interface Wish {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'career' | 'personal' | 'health' | 'learning' | 'other';
  priority: number; // 1-10
  targetDate?: Date;
  status: 'active' | 'in_progress' | 'achieved' | 'abandoned';
  milestones: Milestone[];
  relatedTasks: string[]; // タスクID
  progressPercentage: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  wishId: string;
  title: string;
  targetDate?: Date;
  completed: boolean;
  completedAt?: Date;
}

interface WishProgress {
  wishId: string;
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  estimatedCompletion?: Date;
  blockers: string[];
}
```

**依存関係**:
- Task Decomposition Agent（目標からタスクへの変換）
- Schedule Optimizer Agent（目標関連タスクのスケジューリング）
- Feedback Tracker Agent（進捗追跡）

---

## データフロー

### 1. 録音からタスク生成まで

```
1. ユーザーがPendantで会話を録音
2. Limitless API が文字起こし・要約・タスク抽出を実行
3. Agent Orchestrator が新しい録音を検知
4. Task Decomposition Agent がタスクを分解・分析
5. Schedule Optimizer Agent がタスクをスケジュールに配置
6. ユーザーにダッシュボードで通知
```

### 2. タスク実行とフィードバック

```
1. ユーザーがタスクを開始（UIでマーク）
2. Feedback Tracker Agent が開始時刻を記録
3. ユーザーがタスクを完了
4. Feedback Tracker Agent が完了時刻と実際の所要時間を記録
5. Performance Analyzer がデータを分析
6. Schedule Optimizer Agent が今後の推定を調整
7. ユーザーにインサイトを表示
```

### 3. 目標からアクションへ

```
1. ユーザーがWishlistに新しい目標を追加
2. Wishlist Manager Agent が目標を分析
3. Goal Converter が目標を具体的なマイルストーンに分解
4. Task Decomposition Agent がマイルストーンをタスクに変換
5. Schedule Optimizer Agent がタスクを適切なタイミングに配置
6. 定期的に進捗をレビュー・調整
```

## MVP実装フロー

### Phase 1: 基盤構築（Week 1-2）

1. **Next.js プロジェクトセットアップ**
   - App Router構成
   - TypeScript設定
   - Tailwind CSS導入
   - 基本レイアウト作成

2. **Limitless API統合**
   - API Client実装
   - 認証フロー
   - エラーハンドリング
   - レート制限対応

3. **データベース設計**
   - Prisma セットアップ
   - スキーマ定義（Users, Tasks, Recordings, Schedules, Wishes）
   - マイグレーション

### Phase 2: コアエージェント実装（Week 3-4）

1. **Agent Orchestrator**
   - 基本フレームワーク
   - エージェント登録・管理
   - イベント駆動システム

2. **Task Decomposition Agent**
   - タスク分解ロジック
   - 依存関係グラフ
   - 優先度アルゴリズム

3. **Schedule Optimizer Agent**
   - 基本スケジューリング
   - ユーザーパターン学習（簡易版）
   - タイムスロット管理

### Phase 3: UI実装（Week 5-6）

1. **ダッシュボード**
   - 録音一覧
   - タスク概要
   - 今日のスケジュール
   - 進捗グラフ

2. **タスク管理画面**
   - タスク一覧・詳細
   - サブタスク表示
   - 完了マーク
   - タイムトラッキング

3. **スケジュールカレンダー**
   - 週表示・日表示
   - ドラッグ&ドロップ
   - タスク割り当て

4. **Wishlistボード**
   - 目標一覧
   - 進捗バー
   - マイルストーン表示

### Phase 4: 拡張機能（Week 7-8）

1. **Feedback Tracker Agent**
   - パフォーマンス分析
   - インサイト生成
   - 改善提案

2. **Wishlist Manager Agent**
   - 目標管理
   - タスク変換
   - 進捗追跡

3. **リアルタイム通知**
   - タスクリマインダー
   - スケジュール変更通知
   - 達成通知

## 技術スタック

### フロントエンド
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### バックエンド
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod

### インフラ
- **Hosting**: Vercel
- **Database**: Vercel Postgres / Supabase
- **External API**: Limitless AI API
- **Monitoring**: Vercel Analytics

### 開発ツール
- **Package Manager**: npm / pnpm
- **Linting**: ESLint
- **Formatting**: Prettier
- **Testing**: Jest + Playwright
- **Type Checking**: TypeScript

## API エンドポイント設計

### 録音関連
- `GET /api/recordings` - 録音一覧取得
- `GET /api/recordings/[id]` - 録音詳細取得
- `GET /api/recordings/[id]/transcript` - 文字起こし取得
- `GET /api/recordings/[id]/summary` - 要約取得
- `POST /api/recordings/sync` - Limitless APIから同期

### タスク関連
- `GET /api/tasks` - タスク一覧取得
- `GET /api/tasks/[id]` - タスク詳細取得
- `POST /api/tasks` - 新規タスク作成
- `PATCH /api/tasks/[id]` - タスク更新
- `DELETE /api/tasks/[id]` - タスク削除
- `POST /api/tasks/[id]/complete` - タスク完了マーク
- `POST /api/tasks/decompose` - タスク分解実行

### スケジュール関連
- `GET /api/schedule` - スケジュール取得
- `POST /api/schedule/optimize` - スケジュール最適化実行
- `PATCH /api/schedule/slots/[id]` - タイムスロット更新
- `GET /api/schedule/patterns` - ユーザーパターン取得

### フィードバック関連
- `GET /api/feedback/performance` - パフォーマンスレポート取得
- `GET /api/feedback/insights` - インサイト取得
- `POST /api/feedback/track` - タスク実行記録

### Wishlist関連
- `GET /api/wishes` - 目標一覧取得
- `GET /api/wishes/[id]` - 目標詳細取得
- `POST /api/wishes` - 新規目標作成
- `PATCH /api/wishes/[id]` - 目標更新
- `DELETE /api/wishes/[id]` - 目標削除
- `POST /api/wishes/[id]/convert` - 目標をタスクに変換
- `GET /api/wishes/[id]/progress` - 進捗取得

## セキュリティ考慮事項

1. **認証・認可**
   - NextAuth.jsによるセッション管理
   - JWTトークン
   - Role-based access control

2. **API保護**
   - Limitless APIキーの環境変数管理
   - サーバーサイドでのみAPI呼び出し
   - レート制限実装

3. **データ保護**
   - 個人情報の暗号化
   - SQLインジェクション対策（Prisma）
   - CSRF対策

4. **監視・ログ**
   - エラー追跡（Sentry）
   - API使用状況モニタリング
   - パフォーマンスメトリクス

## 今後の拡張性

### 追加予定機能
- **音声コマンド**: ブラウザでの音声入力
- **モバイルアプリ**: React Native版
- **チーム機能**: 複数ユーザー間でのタスク共有
- **AI Chat Interface**: タスク・スケジュールに関する対話
- **カレンダー統合**: Google Calendar, Outlook連携
- **通知システム**: Email, Push通知

### スケーラビリティ
- **マイクロサービス化**: エージェントを独立したサービスに分離
- **キャッシング**: Redis導入
- **バックグラウンドジョブ**: Bull Queue
- **リアルタイム通信**: WebSocket / Server-Sent Events

## まとめ

このエージェント構造により、Limitless AI Pendantの録音データから自動的にタスクを抽出・分解し、ユーザーの生活パターンに最適化されたスケジュールを提供する統合システムを構築します。各エージェントは独立して動作しながら、Agent Orchestratorを通じて協調し、ユーザーに最高の生産性体験を提供します。
