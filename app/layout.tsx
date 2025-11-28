import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Limitless AI Secretary',
    template: '%s | Limitless AI Secretary',
  },
  description: 'AI-powered secretary for task management, scheduling optimization, and goal tracking',
  keywords: ['AI', 'task management', 'secretary', 'Limitless', 'productivity', 'scheduling'],
  authors: [{ name: 'Limitless AI Team' }],
  openGraph: {
    title: 'Limitless AI Secretary',
    description: 'AI-powered secretary for task management, scheduling optimization, and goal tracking',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <div className="min-h-screen">
          {/* ヘッダー */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-blue-600">
                    Limitless AI Secretary
                  </h1>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    ダッシュボード
                  </a>
                  <a href="/recordings" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    録音
                  </a>
                  <a href="/tasks" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    タスク
                  </a>
                  <a href="/schedule" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    スケジュール
                  </a>
                  <a href="/wishlist" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                    目標
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* フッター */}
          <footer className="bg-white border-t border-gray-200 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-gray-500 text-sm">
                © 2025 Limitless AI Secretary. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
