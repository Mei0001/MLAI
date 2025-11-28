'use client';

import { useState } from 'react';
import { Task, SubTask, TaskDecomposeResponse } from '@/types';
import { taskStorage } from '@/lib/storage';

interface TaskDecomposerProps {
  onTaskCreated?: (task: Task) => void;
}

export default function TaskDecomposer({ onTaskCreated }: TaskDecomposerProps) {
  const [taskInput, setTaskInput] = useState('');
  const [context, setContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [decomposedTask, setDecomposedTask] = useState<TaskDecomposeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const handleDecompose = async () => {
    if (!taskInput.trim()) {
      setError('タスクを入力してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tasks/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskInput, context }),
      });

      const data = await response.json();

      if (data.success) {
        setDecomposedTask(data.data);
      } else {
        setError(data.error || 'タスクの分解に失敗しました');
      }
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTask = () => {
    if (!decomposedTask) return;

    const newTask: Task = {
      id: generateId(),
      title: decomposedTask.originalTask,
      subtasks: decomposedTask.subtasks,
      priority: decomposedTask.suggestedPriority,
      estimatedTime: decomposedTask.estimatedTotalTime,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    taskStorage.save(newTask);
    onTaskCreated?.(newTask);
    
    // Reset form
    setTaskInput('');
    setContext('');
    setDecomposedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return priority;
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            タスク
          </label>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="例: プレゼン資料を作成する"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            コンテキスト（任意）
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="追加情報や制約条件があれば入力"
            rows={2}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleDecompose}
          disabled={isLoading || !taskInput.trim()}
          className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>分析中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>タスクを分解</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {decomposedTask && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">分解結果</h3>
            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(decomposedTask.suggestedPriority)}`}>
              優先度: {getPriorityLabel(decomposedTask.suggestedPriority)}
            </span>
          </div>

          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <p className="text-slate-300 font-medium mb-3">{decomposedTask.originalTask}</p>
            
            <div className="space-y-2">
              {decomposedTask.subtasks.map((subtask, index) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg group hover:bg-slate-900/70 transition-colors"
                >
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-slate-300">{subtask.title}</span>
                  {subtask.estimatedTime && (
                    <span className="text-xs text-slate-500">
                      {subtask.estimatedTime}分
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                合計見積時間: <span className="text-cyan-400 font-medium">{decomposedTask.estimatedTotalTime}分</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveTask}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>タスクを保存</span>
          </button>
        </div>
      )}
    </div>
  );
}
