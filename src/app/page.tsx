'use client';

import { useState, useCallback } from 'react';
import TaskDecomposer from '@/components/TaskDecomposer';
import TaskList from '@/components/TaskList';
import Scheduler from '@/components/Scheduler';
import ResumeBuilder from '@/components/ResumeBuilder';
import Wishlist from '@/components/Wishlist';

type TabId = 'decompose' | 'tasks' | 'schedule' | 'resume' | 'wishlist';

const tabs: { id: TabId; label: string; icon: React.ReactNode; gradient: string }[] = [
  {
    id: 'decompose',
    label: 'タスク分解',
    gradient: 'from-cyan-500 to-blue-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'タスク一覧',
    gradient: 'from-emerald-500 to-teal-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'スケジューラー',
    gradient: 'from-violet-500 to-purple-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'resume',
    label: 'レジュメ',
    gradient: 'from-rose-500 to-pink-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'wishlist',
    label: 'ウィッシュリスト',
    gradient: 'from-indigo-500 to-purple-500',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('decompose');
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);

  const handleTaskCreated = useCallback(() => {
    setTaskRefreshTrigger(prev => prev + 1);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'decompose':
        return <TaskDecomposer onTaskCreated={handleTaskCreated} />;
      case 'tasks':
        return <TaskList refreshTrigger={taskRefreshTrigger} />;
      case 'schedule':
        return <Scheduler />;
      case 'resume':
        return <ResumeBuilder />;
      case 'wishlist':
        return <Wishlist />;
      default:
        return null;
    }
  };

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-violet-500 to-rose-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">MLAI</h1>
                <p className="text-xs text-slate-500">My Limitless AI</p>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-glow" />
              <span className="text-xs text-emerald-400 font-medium">オンライン</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Tab Navigation */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-700/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-6 animate-in">
          {/* Tab Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${activeTabData?.gradient} flex items-center justify-center text-white`}>
              {activeTabData?.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">{activeTabData?.label}</h2>
              <p className="text-sm text-slate-500">
                {activeTab === 'decompose' && 'タスクをAIが自動でサブタスクに分解します'}
                {activeTab === 'tasks' && '作成したタスクを管理・追跡します'}
                {activeTab === 'schedule' && '日次スケジュールを最適化します'}
                {activeTab === 'resume' && 'ターゲット職種に合わせたレジュメを生成します'}
                {activeTab === 'wishlist' && '熱意と予算に基づいて優先順位を付けます'}
              </p>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-200">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <p>© 2024 MLAI - Powered by Next.js & AI</p>
            <div className="flex items-center gap-4">
              <span>Built with ♥ for productivity</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
