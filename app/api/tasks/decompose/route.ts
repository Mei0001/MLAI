import { NextRequest, NextResponse } from 'next/server';

/**
 * タスク分解API
 * 
 * 大きなタスクを小さな実行可能なサブタスクに分解します。
 * Task Decomposition Agentの機能をエンドポイントとして提供します。
 */

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes?: number;
}

interface SubTask {
  id: string;
  parentId: string;
  title: string;
  completed: boolean;
  order: number;
  estimatedMinutes: number;
}

interface DecomposeRequest {
  task: Task;
  maxSubtasks?: number; // 最大サブタスク数（デフォルト: 5）
}

interface DecomposeResponse {
  task: Task;
  subtasks: SubTask[];
  totalEstimatedMinutes: number;
  dependencies: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: DecomposeRequest = await request.json();

    // バリデーション
    if (!body.task || !body.task.title) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    const { task, maxSubtasks = 5 } = body;

    // タスク分解ロジック（MVP版：シンプルな実装）
    // 本番環境では、ここで高度なAI分析を実行
    const subtasks: SubTask[] = await decomposeTaskLogic(task, maxSubtasks);

    // 合計推定時間を計算
    const totalEstimatedMinutes = subtasks.reduce(
      (sum, subtask) => sum + subtask.estimatedMinutes,
      0
    );

    // 依存関係の分析（MVP版では空配列）
    const dependencies: string[] = [];

    const response: DecomposeResponse = {
      task: {
        ...task,
        estimatedMinutes: totalEstimatedMinutes,
      },
      subtasks,
      totalEstimatedMinutes,
      dependencies,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Task decomposition error:', error);
    return NextResponse.json(
      { error: 'Failed to decompose task', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * タスク分解ロジック
 * 
 * MVP版では、タスクのタイトルと説明に基づいて
 * シンプルなサブタスクを生成します。
 * 
 * 本番環境では、以下の機能を追加予定：
 * - LLMを使った高度なタスク分析
 * - 過去のタスク履歴からの学習
 * - ドメイン固有の知識の適用
 */
async function decomposeTaskLogic(task: Task, maxSubtasks: number): Promise<SubTask[]> {
  const subtasks: SubTask[] = [];

  // タスクのタイトルに基づいて、一般的なサブタスクを生成
  // これはMVPのサンプル実装です

  const commonSteps = generateCommonSteps(task);
  const stepsToUse = commonSteps.slice(0, maxSubtasks);

  stepsToUse.forEach((step, index) => {
    subtasks.push({
      id: `${task.id}-sub-${index + 1}`,
      parentId: task.id,
      title: step.title,
      completed: false,
      order: index + 1,
      estimatedMinutes: step.estimatedMinutes,
    });
  });

  return subtasks;
}

/**
 * 一般的なステップを生成
 */
function generateCommonSteps(task: Task): Array<{ title: string; estimatedMinutes: number }> {
  const steps: Array<{ title: string; estimatedMinutes: number }> = [];

  // タスクの複雑さに応じて推定時間を調整
  const baseTime = task.estimatedMinutes || 60;
  const stepCount = Math.max(3, Math.min(7, Math.floor(baseTime / 15)));

  // プロジェクトタイプの検出
  const title = task.title.toLowerCase();
  const description = task.description?.toLowerCase() || '';

  if (title.includes('レポート') || title.includes('report') || title.includes('資料')) {
    // レポート作成タスク
    steps.push(
      { title: '関連情報の収集とリサーチ', estimatedMinutes: Math.floor(baseTime * 0.3) },
      { title: 'アウトラインの作成', estimatedMinutes: Math.floor(baseTime * 0.15) },
      { title: '初稿の執筆', estimatedMinutes: Math.floor(baseTime * 0.35) },
      { title: 'レビューと修正', estimatedMinutes: Math.floor(baseTime * 0.15) },
      { title: '最終チェックと提出準備', estimatedMinutes: Math.floor(baseTime * 0.05) }
    );
  } else if (title.includes('実装') || title.includes('開発') || title.includes('コード')) {
    // 開発タスク
    steps.push(
      { title: '要件の確認と設計', estimatedMinutes: Math.floor(baseTime * 0.2) },
      { title: '開発環境のセットアップ', estimatedMinutes: Math.floor(baseTime * 0.1) },
      { title: 'コア機能の実装', estimatedMinutes: Math.floor(baseTime * 0.4) },
      { title: 'テストの作成と実行', estimatedMinutes: Math.floor(baseTime * 0.2) },
      { title: 'コードレビューと修正', estimatedMinutes: Math.floor(baseTime * 0.1) }
    );
  } else if (title.includes('ミーティング') || title.includes('会議') || title.includes('打ち合わせ')) {
    // ミーティング準備タスク
    steps.push(
      { title: 'アジェンダの作成', estimatedMinutes: Math.floor(baseTime * 0.3) },
      { title: '必要な資料の準備', estimatedMinutes: Math.floor(baseTime * 0.4) },
      { title: '参加者への事前共有', estimatedMinutes: Math.floor(baseTime * 0.2) },
      { title: '最終確認', estimatedMinutes: Math.floor(baseTime * 0.1) }
    );
  } else if (title.includes('学習') || title.includes('勉強') || title.includes('習得')) {
    // 学習タスク
    steps.push(
      { title: '学習目標の明確化', estimatedMinutes: Math.floor(baseTime * 0.1) },
      { title: '基礎概念の理解', estimatedMinutes: Math.floor(baseTime * 0.3) },
      { title: '実践的な演習', estimatedMinutes: Math.floor(baseTime * 0.4) },
      { title: '復習とまとめノート作成', estimatedMinutes: Math.floor(baseTime * 0.2) }
    );
  } else {
    // 一般的なタスク
    steps.push(
      { title: 'タスクの詳細確認', estimatedMinutes: Math.floor(baseTime * 0.1) },
      { title: '必要なリソースの準備', estimatedMinutes: Math.floor(baseTime * 0.2) },
      { title: 'メイン作業の実行', estimatedMinutes: Math.floor(baseTime * 0.5) },
      { title: '品質チェック', estimatedMinutes: Math.floor(baseTime * 0.15) },
      { title: '完了確認と次のステップ', estimatedMinutes: Math.floor(baseTime * 0.05) }
    );
  }

  return steps;
}

// GET エンドポイント：APIの使用方法を説明
export async function GET() {
  const usage = {
    endpoint: '/api/tasks/decompose',
    method: 'POST',
    description: 'タスクを実行可能なサブタスクに分解します',
    requestBody: {
      task: {
        id: 'string (required)',
        title: 'string (required)',
        description: 'string (optional)',
        priority: '"high" | "medium" | "low" (optional)',
        estimatedMinutes: 'number (optional)',
      },
      maxSubtasks: 'number (optional, default: 5)',
    },
    example: {
      task: {
        id: 'task_123',
        title: 'プロジェクト報告書を作成',
        description: 'Q4の進捗をまとめた報告書を作成する',
        priority: 'high',
        estimatedMinutes: 120,
      },
      maxSubtasks: 5,
    },
    response: {
      task: 'Task (with updated estimatedMinutes)',
      subtasks: 'SubTask[]',
      totalEstimatedMinutes: 'number',
      dependencies: 'string[]',
    },
  };

  return NextResponse.json(usage, { status: 200 });
}
