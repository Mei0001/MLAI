'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';
import { taskStorage } from '@/lib/storage';

interface TaskListProps {
  onTasksUpdated?: () => void;
  refreshTrigger?: number;
}

export default function TaskList({ onTasksUpdated, refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, [refreshTrigger]);

  const loadTasks = () => {
    setTasks(taskStorage.getAll());
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string, completed: boolean) => {
    taskStorage.updateSubtask(taskId, subtaskId, completed);
    loadTasks();
    onTasksUpdated?.();
  };

  const handleDeleteTask = (taskId: string) => {
    taskStorage.delete(taskId);
    loadTasks();
    onTasksUpdated?.();
  };

  const handleStatusChange = (taskId: string, status: Task['status']) => {
    const task = taskStorage.getById(taskId);
    if (task) {
      task.status = status;
      taskStorage.save(task);
      loadTasks();
      onTasksUpdated?.();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400';
      case 'in_progress': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '完了';
      case 'in_progress': return '進行中';
      default: return '未着手';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by status (pending first, then in_progress, then completed)
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>タスクがありません</p>
        <p className="text-sm mt-1">「タスク分解」タブで新しいタスクを作成しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTasks.map((task) => {
        const completedSubtasks = task.subtasks.filter(st => st.completed).length;
        const progress = task.subtasks.length > 0 
          ? Math.round((completedSubtasks / task.subtasks.length) * 100) 
          : 0;

        return (
          <div
            key={task.id}
            className={`p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl transition-all ${
              task.status === 'completed' ? 'opacity-60' : ''
            }`}
          >
            {/* Task Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className={`font-medium ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {task.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  {task.estimatedTime && (
                    <span className="text-xs text-slate-500">
                      {task.estimatedTime}分
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {task.status !== 'completed' && (
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                    className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="pending">未着手</option>
                    <option value="in_progress">進行中</option>
                    <option value="completed">完了</option>
                  </select>
                )}
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            {task.subtasks.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>進捗</span>
                  <span>{completedSubtasks}/{task.subtasks.length} ({progress}%)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-lg group"
                  >
                    <button
                      onClick={() => handleSubtaskToggle(task.id, subtask.id, !subtask.completed)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all ${
                        subtask.completed
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 hover:border-cyan-500'
                      }`}
                    >
                      {subtask.completed && (
                        <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${
                      subtask.completed ? 'text-slate-500 line-through' : 'text-slate-300'
                    }`}>
                      {subtask.title}
                    </span>
                    {subtask.estimatedTime && (
                      <span className="text-xs text-slate-600">
                        {subtask.estimatedTime}分
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
