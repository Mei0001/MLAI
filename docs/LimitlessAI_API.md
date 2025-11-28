# Limitless AI API ドキュメント

## 概要

Limitless AIは、Pendantデバイスで録音された会話やミーティングをAIで処理し、文字起こし、要約、洞察抽出などを行うプラットフォームです。このドキュメントでは、Limitless AI APIの使用方法をまとめています。

公式ドキュメント: https://help.limitless.ai/en/articles/11106060-limitless-api
GitHubサンプル: https://github.com/limitless-ai-inc/limitless-api-examples

## 認証方法

Limitless APIはAPIキーベースの認証を使用します。

### APIキーの取得

1. Limitlessアカウントにログイン
2. Settings → API Keys セクションに移動
3. 新しいAPIキーを生成

### 認証ヘッダー

```bash
Authorization: Bearer YOUR_API_KEY
```

すべてのAPIリクエストには、このAuthorizationヘッダーを含める必要があります。

## 主要エンドポイント

### 1. Pendant録音の取得

録音されたミーティングや会話のリストを取得します。

**エンドポイント:**
```
GET https://api.limitless.ai/v1/recordings
```

**パラメータ:**
- `limit` (optional): 取得する録音の最大数（デフォルト: 20）
- `offset` (optional): ページネーション用のオフセット（デフォルト: 0）
- `start_date` (optional): 開始日時（ISO 8601形式）
- `end_date` (optional): 終了日時（ISO 8601形式）

**レスポンス例:**
```json
{
  "recordings": [
    {
      "id": "rec_abc123",
      "title": "Team Standup Meeting",
      "start_time": "2025-11-28T09:00:00Z",
      "end_time": "2025-11-28T09:30:00Z",
      "duration_seconds": 1800,
      "status": "completed",
      "transcript_available": true,
      "summary_available": true
    }
  ],
  "total": 42,
  "has_more": true
}
```

### 2. 録音の詳細取得

特定の録音の詳細情報を取得します。

**エンドポイント:**
```
GET https://api.limitless.ai/v1/recordings/{recording_id}
```

**レスポンス例:**
```json
{
  "id": "rec_abc123",
  "title": "Team Standup Meeting",
  "start_time": "2025-11-28T09:00:00Z",
  "end_time": "2025-11-28T09:30:00Z",
  "duration_seconds": 1800,
  "status": "completed",
  "participants": ["Alice", "Bob", "Charlie"],
  "location": "Office",
  "tags": ["meeting", "standup"],
  "transcript_url": "https://api.limitless.ai/v1/recordings/rec_abc123/transcript",
  "summary_url": "https://api.limitless.ai/v1/recordings/rec_abc123/summary"
}
```

### 3. 文字起こしの取得

録音の完全な文字起こしを取得します。

**エンドポイント:**
```
GET https://api.limitless.ai/v1/recordings/{recording_id}/transcript
```

**レスポンス例:**
```json
{
  "recording_id": "rec_abc123",
  "transcript": [
    {
      "speaker": "Alice",
      "start_time": 0.5,
      "end_time": 3.2,
      "text": "Good morning everyone. Let's start our standup."
    },
    {
      "speaker": "Bob",
      "start_time": 3.5,
      "end_time": 8.1,
      "text": "Yesterday I completed the user authentication feature."
    }
  ],
  "language": "en"
}
```

### 4. 要約の取得

録音のAI生成要約を取得します。

**エンドポイント:**
```
GET https://api.limitless.ai/v1/recordings/{recording_id}/summary
```

**レスポンス例:**
```json
{
  "recording_id": "rec_abc123",
  "summary": {
    "overview": "Team discussed progress on current sprint...",
    "key_points": [
      "User authentication feature completed",
      "Database migration scheduled for next week",
      "Design review needed for new dashboard"
    ],
    "action_items": [
      {
        "task": "Schedule design review meeting",
        "assignee": "Alice",
        "due_date": "2025-12-01"
      },
      {
        "task": "Complete database migration script",
        "assignee": "Bob",
        "due_date": "2025-11-30"
      }
    ],
    "topics": ["sprint planning", "technical debt", "design"]
  }
}
```

### 5. タスク抽出

録音から自動的にタスクを抽出します。

**エンドポイント:**
```
GET https://api.limitless.ai/v1/recordings/{recording_id}/tasks
```

**レスポンス例:**
```json
{
  "recording_id": "rec_abc123",
  "tasks": [
    {
      "id": "task_xyz789",
      "title": "Schedule design review meeting",
      "description": "Organize a meeting to review the new dashboard design",
      "assignee": "Alice",
      "priority": "high",
      "due_date": "2025-12-01",
      "status": "pending",
      "context": "Mentioned at 5:23 in the recording"
    }
  ]
}
```

## レートリミット

Limitless APIには以下のレートリミットが適用されます：

- **標準プラン**: 60 requests/minute, 1,000 requests/day
- **プロプラン**: 300 requests/minute, 10,000 requests/day
- **エンタープライズプラン**: カスタムリミット

レートリミットに達した場合、以下のレスポンスが返されます：

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please try again later.",
    "retry_after": 60
  }
}
```

HTTPステータスコード: `429 Too Many Requests`

## エラーハンドリング

### エラーレスポンス形式

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### 主要なエラーコード

- `400 Bad Request`: 不正なリクエストパラメータ
- `401 Unauthorized`: 認証失敗（無効なAPIキー）
- `403 Forbidden`: アクセス権限なし
- `404 Not Found`: リソースが見つからない
- `429 Too Many Requests`: レートリミット超過
- `500 Internal Server Error`: サーバーエラー
- `503 Service Unavailable`: サービス一時停止中

## 実装例

### Node.js / TypeScript

```typescript
import axios from 'axios';

const LIMITLESS_API_KEY = process.env.LIMITLESS_API_KEY;
const BASE_URL = 'https://api.limitless.ai/v1';

// APIクライアントの設定
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${LIMITLESS_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// 録音リストの取得
async function getRecordings(limit: number = 20, offset: number = 0) {
  try {
    const response = await client.get('/recordings', {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      throw new Error(error.response?.data?.error?.message || 'API request failed');
    }
    throw error;
  }
}

// 特定の録音の詳細取得
async function getRecordingDetails(recordingId: string) {
  try {
    const response = await client.get(`/recordings/${recordingId}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      throw new Error(error.response?.data?.error?.message || 'API request failed');
    }
    throw error;
  }
}

// 文字起こしの取得
async function getTranscript(recordingId: string) {
  try {
    const response = await client.get(`/recordings/${recordingId}/transcript`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      throw new Error(error.response?.data?.error?.message || 'API request failed');
    }
    throw error;
  }
}

// 要約の取得
async function getSummary(recordingId: string) {
  try {
    const response = await client.get(`/recordings/${recordingId}/summary`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      throw new Error(error.response?.data?.error?.message || 'API request failed');
    }
    throw error;
  }
}

// タスク抽出
async function extractTasks(recordingId: string) {
  try {
    const response = await client.get(`/recordings/${recordingId}/tasks`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data);
      throw new Error(error.response?.data?.error?.message || 'API request failed');
    }
    throw error;
  }
}

// レートリミット対応のリトライロジック
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = error.response.data?.error?.retry_after || retryDelay;
        console.log(`Rate limit hit. Retrying after ${retryAfter}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      } else if (i === maxRetries - 1) {
        throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  throw new Error('Max retries exceeded');
}

// 使用例
async function main() {
  try {
    // 録音リストを取得
    const recordings = await withRetry(() => getRecordings(10));
    console.log('Recordings:', recordings);

    if (recordings.recordings.length > 0) {
      const firstRecording = recordings.recordings[0];
      
      // 詳細を取得
      const details = await withRetry(() => getRecordingDetails(firstRecording.id));
      console.log('Recording details:', details);
      
      // 要約を取得
      const summary = await withRetry(() => getSummary(firstRecording.id));
      console.log('Summary:', summary);
      
      // タスクを抽出
      const tasks = await withRetry(() => extractTasks(firstRecording.id));
      console.log('Extracted tasks:', tasks);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

export {
  getRecordings,
  getRecordingDetails,
  getTranscript,
  getSummary,
  extractTasks,
  withRetry,
};
```

### Next.js APIルート例

```typescript
// app/api/recordings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRecordings } from '@/lib/limitless-api';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const data = await getRecordings(limit, offset);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch recordings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}
```

## セキュリティベストプラクティス

1. **APIキーの保護**: 
   - APIキーを環境変数に保存（`.env.local`）
   - フロントエンドコードにAPIキーを含めない
   - APIキーをGitにコミットしない

2. **サーバーサイドでのAPI呼び出し**:
   - Next.jsのAPI Routeやサーバーコンポーネントを使用
   - クライアントサイドから直接APIを呼び出さない

3. **レート制限の実装**:
   - アプリケーション側でもレート制限を実装
   - リトライロジックとバックオフ戦略を使用

4. **エラーハンドリング**:
   - 適切なエラーメッセージをユーザーに表示
   - 詳細なエラー情報をログに記録

## Webhooks（将来的な機能）

Limitless APIは今後、以下のイベントに対するWebhookサポートを追加予定：

- `recording.completed`: 録音処理完了時
- `transcript.ready`: 文字起こし完了時
- `summary.generated`: 要約生成完了時
- `tasks.extracted`: タスク抽出完了時

Webhookの設定方法は公式ドキュメントで随時更新されます。

## まとめ

Limitless AI APIを使用することで、Pendant録音から以下の機能を実現できます：

- 録音の一覧取得と管理
- リアルタイム文字起こし
- AI生成の要約と洞察
- 自動タスク抽出
- コンテキストに基づくアクション項目の特定

このAPIを活用して、secretary AIによるタスク分解、日次スケジューリングの最適化、実行フィードバックなどの機能を実装できます。
