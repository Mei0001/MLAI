'use client';

import { useState, useEffect } from 'react';
import { Task, DailySchedule, ScheduleBlock } from '@/types';
import { taskStorage, scheduleStorage } from '@/lib/storage';

interface SchedulerProps {
  onScheduleUpdated?: (schedule: DailySchedule) => void;
}

export default function Scheduler({ onScheduleUpdated }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedule, setSchedule] = useState<DailySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workHoursStart, setWorkHoursStart] = useState('09:00');
  const [workHoursEnd, setWorkHoursEnd] = useState('18:00');

  useEffect(() => {
    // Load tasks from storage
    const storedTasks = taskStorage.getAll();
    setTasks(storedTasks);

    // Load existing schedule for selected date
    const existingSchedule = scheduleStorage.getByDate(selectedDate);
    if (existingSchedule) {
      setSchedule(existingSchedule);
    } else {
      setSchedule(null);
    }
  }, [selectedDate]);

  const handleOptimize = async () => {
    const pendingTasks = tasks.filter(t => t.status !== 'completed');
    
    if (pendingTasks.length === 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/schedule/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: pendingTasks,
          date: selectedDate,
          workHoursStart,
          workHoursEnd,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newSchedule: DailySchedule = {
          date: selectedDate,
          blocks: data.data,
        };
        
        scheduleStorage.save(newSchedule);
        setSchedule(newSchedule);
        onScheduleUpdated?.(newSchedule);
      }
    } catch (error) {
      console.error('Schedule optimization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockComplete = (blockId: string, completed: boolean) => {
    if (!schedule) return;

    const updatedBlocks = schedule.blocks.map(block =>
      block.id === blockId ? { ...block, completed } : block
    );

    const updatedSchedule = { ...schedule, blocks: updatedBlocks };
    scheduleStorage.save(updatedSchedule);
    setSchedule(updatedSchedule);

    // Also update task status if applicable
    const block = schedule.blocks.find(b => b.id === blockId);
    if (block?.taskId) {
      const task = taskStorage.getById(block.taskId);
      if (task && completed) {
        task.status = 'completed';
        taskStorage.save(task);
        setTasks(taskStorage.getAll());
      }
    }
  };

  const handleFeedback = (rating: number) => {
    if (!schedule) return;

    const completedBlocks = schedule.blocks.filter(b => b.completed && b.type === 'task').length;
    const totalTasks = schedule.blocks.filter(b => b.type === 'task').length;

    const feedback = {
      rating,
      completedTasks: completedBlocks,
      totalTasks,
    };

    scheduleStorage.addFeedback(selectedDate, feedback);
    setSchedule({ ...schedule, feedback });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBlockColor = (type: ScheduleBlock['type'], completed: boolean) => {
    if (completed) return 'bg-emerald-500/20 border-emerald-500/30';
    
    switch (type) {
      case 'task': return 'bg-cyan-500/10 border-cyan-500/30';
      case 'break': return 'bg-amber-500/10 border-amber-500/30';
      case 'meeting': return 'bg-violet-500/10 border-violet-500/30';
      default: return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  const getBlockIcon = (type: ScheduleBlock['type']) => {
    switch (type) {
      case 'task':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'break':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Date & Time Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">日付</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">開始時間</label>
          <input
            type="time"
            value={workHoursStart}
            onChange={(e) => setWorkHoursStart(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">終了時間</label>
          <input
            type="time"
            value={workHoursEnd}
            onChange={(e) => setWorkHoursEnd(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Pending Tasks Summary */}
      <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-300">未完了タスク</h3>
          <span className="text-xs text-slate-500">{tasks.filter(t => t.status !== 'completed').length} 件</span>
        </div>
        
        {tasks.filter(t => t.status !== 'completed').length === 0 ? (
          <p className="text-sm text-slate-500">未完了のタスクはありません</p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full ${
                  task.priority === 'high' ? 'bg-rose-400' :
                  task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className="text-slate-400 truncate">{task.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={handleOptimize}
        disabled={isLoading || tasks.filter(t => t.status !== 'completed').length === 0}
        className="w-full px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-400 hover:to-purple-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>最適化中...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>スケジュールを最適化</span>
          </>
        )}
      </button>

      {/* Schedule Display */}
      {schedule && schedule.blocks.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="text-lg font-semibold text-slate-100">今日のスケジュール</h3>
          
          <div className="space-y-2">
            {schedule.blocks.map((block) => (
              <div
                key={block.id}
                className={`p-4 border rounded-xl transition-all duration-200 ${getBlockColor(block.type, block.completed)}`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleBlockComplete(block.id, !block.completed)}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
                      block.completed
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-500 hover:border-cyan-500'
                    }`}
                  >
                    {block.completed && (
                      <svg className="w-full h-full text-white p-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`${block.type === 'break' ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {getBlockIcon(block.type)}
                      </span>
                      <span className={`font-medium ${block.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                        {block.title}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTime(block.startTime)} - {formatTime(block.endTime)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback Section */}
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <h4 className="text-sm font-medium text-slate-300 mb-3">今日の振り返り</h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleFeedback(star)}
                  className={`p-2 transition-all ${
                    schedule.feedback && schedule.feedback.rating >= star
                      ? 'text-amber-400'
                      : 'text-slate-600 hover:text-amber-400/50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              {schedule.feedback && (
                <span className="ml-2 text-sm text-slate-400">
                  {schedule.feedback.completedTasks}/{schedule.feedback.totalTasks} タスク完了
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
