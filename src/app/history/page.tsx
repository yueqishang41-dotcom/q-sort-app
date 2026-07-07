'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQSortStore } from '@/store';
import { compareSessions, analyzeSession, getTagName } from '@/lib/analysis';
import { getThemeById } from '@/data/themes';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

/** 格式化日期 */
function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 格式化时长 */
function formatDuration(seconds: number) {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { allSessions, deleteSession, loadSession } = useQSortStore();
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  // 按主题分组会话
  const sessionsByTheme = useMemo(() => {
    const grouped: Record<string, typeof allSessions> = {};

    allSessions
      .filter(s => s.isComplete)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
      .forEach(session => {
        if (!grouped[session.themeId]) {
          grouped[session.themeId] = [];
        }
        grouped[session.themeId].push(session);
      });

    return grouped;
  }, [allSessions]);

  // 切换选择
  const toggleSelect = (sessionId: string) => {
    setSelectedSessions(prev => {
      if (prev.includes(sessionId)) {
        return prev.filter(id => id !== sessionId);
      }
      if (prev.length >= 2) {
        return [prev[1], sessionId];
      }
      return [...prev, sessionId];
    });
  };

  // 对比会话
  const handleCompare = () => {
    if (selectedSessions.length !== 2) return;

    const session1 = allSessions.find(s => s.sessionId === selectedSessions[0]);
    const session2 = allSessions.find(s => s.sessionId === selectedSessions[1]);

    if (!session1 || !session2) return;

    const theme = getThemeById(session1.themeId);
    if (!theme) return;

    const result = compareSessions(session1, session2, theme);
    setComparisonResult({
      ...result,
      session1,
      session2,
      theme,
    });
    setShowComparison(true);
  };

  // 加载会话
  const handleLoadSession = (sessionId: string) => {
    loadSession(sessionId);
    router.push('/result');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="font-semibold text-slate-900 dark:text-white">
            测评记录
          </h1>
          {selectedSessions.length === 2 ? (
            <button
              onClick={handleCompare}
              className="text-sm text-primary-500 font-medium"
            >
              对比
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </nav>

      {/* 对比弹窗 */}
      {showComparison && comparisonResult && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">对比结果</h3>
              <button
                onClick={() => {
                  setShowComparison(false);
                  setComparisonResult(null);
                }}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            {/* 相似度 */}
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary-500 mb-1">
                {Math.round(comparisonResult.similarity * 100)}%
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                结果相似度
              </p>
            </div>

            {/* 变化描述 */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {comparisonResult.changeSummary}
              </p>
            </div>

            {/* 变化最大的卡片 */}
            {comparisonResult.biggestChanges.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  变化最大的卡片
                </h4>
                <div className="space-y-2">
                  {comparisonResult.biggestChanges.slice(0, 5).map((change: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2"
                    >
                      <p className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">
                        {change.card.shortText || change.card.text.slice(0, 25)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-slate-500">{change.previousScore}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={change.change > 0 ? 'text-green-500' : 'text-red-500'}>
                          {change.currentScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 标签趋势 */}
            {comparisonResult.tagTrends.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  特质变化趋势
                </h4>
                <div className="space-y-2">
                  {comparisonResult.tagTrends
                    .filter((t: any) => Math.abs(t.change) >= 0.3)
                    .slice(0, 5)
                    .map((trend: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {getTagName(trend.tag)}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            trend.change > 0 ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {trend.change > 0 ? '+' : ''}
                          {trend.change.toFixed(1)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {allSessions.filter(s => s.isComplete).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">
              暂无测评记录
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
              完成一次测评后，记录会保存在这里
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 rounded-lg bg-primary-500 text-white font-medium"
            >
              开始测评
            </button>
          </div>
        ) : (
          <>
            {/* 提示 */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 mb-6">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 选择两次测评进行对比，查看你的变化趋势
              </p>
            </div>

            {/* 会话列表 */}
            {Object.entries(sessionsByTheme).map(([themeId, sessions]) => {
              const theme = getThemeById(themeId);
              if (!theme) return null;

              return (
                <div key={themeId} className="mb-8">
                  <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    {theme.name}
                  </h2>
                  <div className="space-y-3">
                    {sessions.map(session => {
                      const isSelected = selectedSessions.includes(session.sessionId);
                      const analysis = analyzeSession(session, theme);

                      return (
                        <div
                          key={session.sessionId}
                          className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                          onClick={() => toggleSelect(session.sessionId)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  {session.anonymousLabel || '我的测评'}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  {formatDate(session.completedAt || session.startTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDuration(session.duration || 0)}
                                </span>
                                <span>
                                  {session.deviceInfo.type === 'mobile'
                                    ? '📱'
                                    : session.deviceInfo.type === 'tablet'
                                    ? '📱'
                                    : '💻'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="text-xs text-primary-500 font-medium">
                                  已选择
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLoadSession(session.sessionId);
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                <ChevronRight className="w-5 h-5 text-slate-400" />
                              </button>
                            </div>
                          </div>

                          {/* 核心发现 */}
                          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {analysis.coreFinding.headline}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* 免责声明 */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-300">
                  <p>
                    测评结果会受当时情绪、睡眠、环境等影响，建议间隔一周后复测对比。
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}