export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">
          AIセクレタリーへようこそ
        </h1>
        <p className="text-xl mb-6 text-blue-100">
          Limitless AI Pendantで録音した会話から、自動的にタスクを抽出・分解し、
          最適なスケジュールを提案します。
        </p>
        <div className="flex gap-4">
          <a
            href="/recordings"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            録音を見る
          </a>
          <a
            href="/tasks"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition border-2 border-white"
          >
            タスクを確認
          </a>
        </div>
      </div>

      {/* 機能カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* タスク分解 */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">タスク自動分解</h3>
          <p className="text-gray-600">
            録音された会話から、AIが自動的にタスクを抽出し、実行可能なサブタスクに分解します。
          </p>
        </div>

        {/* スケジュール最適化 */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">スケジュール最適化</h3>
          <p className="text-gray-600">
            あなたの起床・就寝時間、エネルギーレベルに基づいて、最適なタイミングでタスクを配置します。
          </p>
        </div>

        {/* 実行フィードバック */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">実行フィードバック</h3>
          <p className="text-gray-600">
            タスクの実行状況を追跡し、パフォーマンスを分析。改善提案を自動生成します。
          </p>
        </div>

        {/* デバイス間連携 */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">デバイス間連携</h3>
          <p className="text-gray-600">
            Limitless AI Pendantで録音したデータを、Webアプリでシームレスに管理できます。
          </p>
        </div>

        {/* ジョブハンティング支援 */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">キャリア支援</h3>
          <p className="text-gray-600">
            就職活動やキャリア開発に関連するタスクを特別にサポートします。
          </p>
        </div>

        {/* 動的ウィッシュリスト */}
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">目標管理</h3>
          <p className="text-gray-600">
            長期的な目標を設定し、自動的に実行可能なタスクに分解。進捗を可視化します。
          </p>
        </div>
      </div>

      {/* 統計情報（サンプル） */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">今週の活動</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">12</div>
            <div className="text-gray-600">録音数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">48</div>
            <div className="text-gray-600">抽出タスク</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">32</div>
            <div className="text-gray-600">完了タスク</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">67%</div>
            <div className="text-gray-600">達成率</div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            新しい録音を同期
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            今日のスケジュールを最適化
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            パフォーマンスレポートを表示
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
            新しい目標を追加
          </button>
        </div>
      </div>
    </div>
  );
}
