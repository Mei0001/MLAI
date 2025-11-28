# Next.js ベストプラクティス

## 概要

このドキュメントでは、Next.js 14+（App Router使用）でモダンなWebアプリケーションを構築する際のベストプラクティスをまとめています。

## 1. App Routerの使用

Next.js 13以降、App Routerが推奨されるルーティングシステムです。

### ディレクトリ構造

```
app/
├── layout.tsx          # ルートレイアウト
├── page.tsx            # ホームページ
├── loading.tsx         # ローディングUI
├── error.tsx           # エラーハンドリング
├── not-found.tsx       # 404ページ
├── api/                # APIルート
│   └── recordings/
│       └── route.ts
├── recordings/         # 録音一覧ページ
│   ├── page.tsx
│   ├── [id]/          # 動的ルート
│   │   └── page.tsx
│   └── loading.tsx
└── tasks/              # タスク管理ページ
    ├── page.tsx
    └── [id]/
        └── page.tsx
```

### ベストプラクティス

- `app/`ディレクトリを使用（`pages/`ディレクトリは使わない）
- 各ルートに`page.tsx`を配置
- 共通レイアウトは`layout.tsx`で定義
- ローディング状態は`loading.tsx`で管理
- エラーハンドリングは`error.tsx`で実装

## 2. サーバーコンポーネントとクライアントコンポーネント

### サーバーコンポーネント（デフォルト）

App Routerでは、すべてのコンポーネントがデフォルトでサーバーコンポーネントです。

**使用すべき場合:**
- データフェッチング
- バックエンドリソースへの直接アクセス
- 機密情報の処理（APIキー、アクセストークンなど）
- 大きな依存関係の使用（サーバーに留める）

```typescript
// app/recordings/page.tsx
import { getRecordings } from '@/lib/limitless-api';

// サーバーコンポーネント（デフォルト）
export default async function RecordingsPage() {
  // サーバー側でデータフェッチ
  const recordings = await getRecordings();

  return (
    <div>
      <h1>録音一覧</h1>
      <ul>
        {recordings.recordings.map((rec) => (
          <li key={rec.id}>{rec.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### クライアントコンポーネント

インタラクティブな機能にはクライアントコンポーネントを使用します。

**使用すべき場合:**
- イベントリスナー（`onClick`, `onChange`など）
- State管理（`useState`, `useReducer`）
- Effects（`useEffect`, `useLayoutEffect`）
- ブラウザAPI（localStorage, geolocation など）
- カスタムフック

```typescript
// components/TaskItem.tsx
'use client';

import { useState } from 'react';

export function TaskItem({ task }) {
  const [isCompleted, setIsCompleted] = useState(task.completed);

  const handleToggle = () => {
    setIsCompleted(!isCompleted);
    // API呼び出しなど
  };

  return (
    <div>
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
      />
      <span>{task.title}</span>
    </div>
  );
}
```

### ハイブリッドパターン

サーバーコンポーネントとクライアントコンポーネントを組み合わせます。

```typescript
// app/recordings/page.tsx (Server Component)
import { getRecordings } from '@/lib/limitless-api';
import { RecordingList } from '@/components/RecordingList';

export default async function RecordingsPage() {
  const recordings = await getRecordings();

  return (
    <div>
      <h1>録音一覧</h1>
      {/* クライアントコンポーネントにデータを渡す */}
      <RecordingList initialRecordings={recordings} />
    </div>
  );
}
```

```typescript
// components/RecordingList.tsx (Client Component)
'use client';

import { useState } from 'react';

export function RecordingList({ initialRecordings }) {
  const [filter, setFilter] = useState('all');
  const [recordings, setRecordings] = useState(initialRecordings);

  // フィルタリングロジック
  const filteredRecordings = recordings.filter(/* ... */);

  return (
    <div>
      <FilterButtons onFilterChange={setFilter} />
      <ul>
        {filteredRecordings.map((rec) => (
          <RecordingItem key={rec.id} recording={rec} />
        ))}
      </ul>
    </div>
  );
}
```

## 3. APIルートの設定

### Route Handlersの実装

```typescript
// app/api/recordings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRecordings } from '@/lib/limitless-api';

// GET /api/recordings
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

// POST /api/recordings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 録音処理
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
```

### 動的ルート

```typescript
// app/api/recordings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRecordingDetails } from '@/lib/limitless-api';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recording = await getRecordingDetails(params.id);
    return NextResponse.json(recording);
  } catch (error) {
    return NextResponse.json(
      { error: 'Recording not found' },
      { status: 404 }
    );
  }
}
```

### ミドルウェア

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 認証チェック
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/recordings')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // レート制限
  // CORS設定
  // など

  return NextResponse.next();
}

export const config = {
  matcher: ['/recordings/:path*', '/tasks/:path*', '/api/:path*'],
};
```

## 4. SEO最適化

### メタデータの設定

```typescript
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Limitless AI Secretary',
    template: '%s | Limitless AI Secretary',
  },
  description: 'AI-powered secretary for task management and scheduling',
  keywords: ['AI', 'task management', 'secretary', 'Limitless'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'Limitless AI Secretary',
    description: 'AI-powered secretary for task management and scheduling',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Limitless AI Secretary',
    description: 'AI-powered secretary for task management and scheduling',
    images: ['/twitter-image.png'],
  },
};
```

### ページごとのメタデータ

```typescript
// app/recordings/[id]/page.tsx
import type { Metadata } from 'next';
import { getRecordingDetails } from '@/lib/limitless-api';

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const recording = await getRecordingDetails(params.id);
  
  return {
    title: recording.title,
    description: `Recording from ${recording.start_time}`,
    openGraph: {
      title: recording.title,
      description: `Recording from ${recording.start_time}`,
    },
  };
}

export default async function RecordingDetailPage({ params }) {
  const recording = await getRecordingDetails(params.id);
  return <div>{/* ... */}</div>;
}
```

### 構造化データ

```typescript
// app/recordings/[id]/page.tsx
export default async function RecordingDetailPage({ params }) {
  const recording = await getRecordingDetails(params.id);
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    'name': recording.title,
    'datePublished': recording.start_time,
    'duration': `PT${recording.duration_seconds}S`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div>{/* ... */}</div>
    </>
  );
}
```

## 5. 状態管理

### React Queryの使用

データフェッチングとキャッシング管理にはReact Queryを推奨します。

```typescript
// lib/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1分
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from '@/lib/providers';

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

```typescript
// hooks/useRecordings.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useRecordings(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['recordings', limit, offset],
    queryFn: async () => {
      const res = await fetch(`/api/recordings?limit=${limit}&offset=${offset}`);
      if (!res.ok) throw new Error('Failed to fetch recordings');
      return res.json();
    },
  });
}

export function useRecordingDetails(id: string) {
  return useQuery({
    queryKey: ['recording', id],
    queryFn: async () => {
      const res = await fetch(`/api/recordings/${id}`);
      if (!res.ok) throw new Error('Failed to fetch recording');
      return res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, updates }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update task');
      return res.json();
    },
    onSuccess: () => {
      // タスクリストを再フェッチ
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

### Zustandの使用

グローバルな状態管理にはZustandを推奨します。

```typescript
// store/useTaskStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface TaskStore {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [],
      filter: 'all',
      setFilter: (filter) => set({ filter }),
      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      })),
    }),
    {
      name: 'task-storage',
    }
  )
);
```

## 6. エラーハンドリング

### Error Boundary

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // エラーログサービスに送信
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">エラーが発生しました</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        再試行
      </button>
    </div>
  );
}
```

### Not Found

```typescript
// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">ページが見つかりません</h2>
      <p className="text-gray-600 mb-4">お探しのページは存在しません。</p>
      <Link 
        href="/"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        ホームに戻る
      </Link>
    </div>
  );
}
```

### グローバルエラーハンドリング

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>アプリケーションエラー</h2>
        <button onClick={reset}>再試行</button>
      </body>
    </html>
  );
}
```

## 7. セキュリティ

### CSRF対策

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // POSTリクエストにCSRFトークンを要求
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') {
    const csrfToken = request.headers.get('x-csrf-token');
    const sessionToken = request.cookies.get('csrf-token')?.value;
    
    if (!csrfToken || csrfToken !== sessionToken) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}
```

### 環境変数の管理

```bash
# .env.local
LIMITLESS_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
```

```typescript
// lib/env.ts
const requiredEnvVars = [
  'LIMITLESS_API_KEY',
  'DATABASE_URL',
] as const;

export function validateEnv() {
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}

// サーバーサイドのみで使用
export const env = {
  limitlessApiKey: process.env.LIMITLESS_API_KEY!,
  databaseUrl: process.env.DATABASE_URL!,
};

// クライアントサイドで使用可能
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
};
```

### Content Security Policy

```typescript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 8. パフォーマンス最適化

### 画像最適化

```typescript
import Image from 'next/image';

export function RecordingThumbnail({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={300}
      height={200}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### フォント最適化

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono',
});

export default function RootLayout({ children }) {
  return (
    <html lang="ja" className={`${inter.variable} ${robotoMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### コード分割

```typescript
// 動的インポート
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // クライアントサイドのみで読み込み
});

export default function Page() {
  return (
    <div>
      <h1>Page</h1>
      <HeavyComponent />
    </div>
  );
}
```

### Streaming & Suspense

```typescript
// app/recordings/page.tsx
import { Suspense } from 'react';
import { RecordingList } from '@/components/RecordingList';
import { RecordingListSkeleton } from '@/components/RecordingListSkeleton';

export default function RecordingsPage() {
  return (
    <div>
      <h1>録音一覧</h1>
      <Suspense fallback={<RecordingListSkeleton />}>
        <RecordingList />
      </Suspense>
    </div>
  );
}
```

## 9. テスト

### ユニットテスト（Jest）

```typescript
// __tests__/lib/limitless-api.test.ts
import { getRecordings } from '@/lib/limitless-api';

describe('limitless-api', () => {
  it('should fetch recordings', async () => {
    const recordings = await getRecordings(10);
    expect(recordings).toHaveProperty('recordings');
    expect(Array.isArray(recordings.recordings)).toBe(true);
  });
});
```

### インテグレーションテスト（Playwright）

```typescript
// e2e/recordings.spec.ts
import { test, expect } from '@playwright/test';

test('should display recordings list', async ({ page }) => {
  await page.goto('/recordings');
  await expect(page.locator('h1')).toHaveText('録音一覧');
  await expect(page.locator('[data-testid="recording-item"]')).toHaveCount(10);
});
```

## 10. デプロイメント

### Vercelへのデプロイ

```bash
# Vercel CLIをインストール
npm i -g vercel

# デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

### 環境変数の設定

Vercelダッシュボードで環境変数を設定：
- `LIMITLESS_API_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`

## まとめ

Next.jsのベストプラクティスを適用することで：

- **パフォーマンス**: サーバーコンポーネント、画像最適化、コード分割
- **SEO**: メタデータ、構造化データ、SSR/SSG
- **セキュリティ**: CSRF対策、環境変数管理、CSP
- **開発体験**: TypeScript、状態管理、エラーハンドリング
- **保守性**: クリーンなディレクトリ構造、テスト、ドキュメント

これらを組み合わせることで、スケーラブルで保守しやすいアプリケーションを構築できます。
