'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQSortStore } from '@/store';
import { getDefaultTheme } from '@/data/themes';
import { CheckCircle, ChevronRight, Clock, Shield, AlertTriangle } from 'lucide-react';

export default function IntroPage() {
  const router = useRouter();
  const { setTheme, startSession, hasAgreedToDisclaimer, agreeToDisclaimer } = useQSortStore();
  const [isStarting, setIsStarting] = useState(false);

  const theme = getDefaultTheme();

  const handleStart = () => {
    setIsStarting(true);
    setTheme(theme);
    startSession(theme);
    // 先进入引导语页（按随机分配的条件显示不同引导语），再开始预分堆
    router.push('/instruction');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold text-slate-900 dark:text-white">Q-sort 测评</span>
          <a
            href="/methodology"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
          >
            方法说明
          </a>
        </div>
      </nav>

      <div className="pt-20 pb-8 px-4 max-w-2xl mx-auto">
        {/* 主标题区 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {theme.name}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {theme.description}
          </p>
        </div>

        {/* 测评说明卡片 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            这是什么测评？
          </h2>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              Q-sort 是心理学研究中常用的方法，帮助你通过卡片排序来表达"我是什么样的人"。
            </p>
            <p>
              你会看到 36 张描述句卡片，任务是按"有多像我"将它们分配到 9 个位置。
              这不是选择题——需要取舍，因为每个位置的卡片数量有限。
            </p>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">预计用时：{theme.estimatedTime}</span>
            </div>
          </div>
        </div>

        {/* 为什么强制分布 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            为什么要"强制分布"？
          </h2>
          <div className="space-y-3 text-slate-600 dark:text-slate-400 text-sm">
            <p>
              生活中，我们经常"全选"——觉得每条描述都像我、或都不像我。
              强制分布让我们真正做出选择，发现自己最核心的特征。
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-sm font-medium text-red-600 dark:text-red-400">
                  -4
                </div>
                <span className="text-xs">最不像我（2张）</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-sm font-medium">
                  0
                </div>
                <span className="text-xs">中性/不确定（8张）</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-medium text-green-600 dark:text-green-400">
                  +4
                </div>
                <span className="text-xs">最像我（2张）</span>
              </div>
            </div>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                重要说明
              </h3>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1.5">
                <li>• 本测评仅供自我反思与科普参考</li>
                <li>• 不构成任何临床诊断或医疗建议</li>
                <li>• 结果会受到你当前的情绪、睡眠、环境等因素影响</li>
                <li>• 建议一周后在相似状态下复测对比</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 同意复选框 */}
        <label className="flex items-start gap-3 mb-6 cursor-pointer group">
          <div
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              hasAgreedToDisclaimer
                ? 'bg-primary-500 border-primary-500'
                : 'border-slate-300 dark:border-slate-600 group-hover:border-primary-400'
            }`}
            onClick={agreeToDisclaimer}
          >
            {hasAgreedToDisclaimer && (
              <CheckCircle className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            我已阅读并理解上述说明，了解本测评仅供参考，非诊断工具
          </span>
        </label>

        {/* 开始按钮 */}
        <button
          onClick={handleStart}
          disabled={!hasAgreedToDisclaimer || isStarting}
          className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
            hasAgreedToDisclaimer
              ? 'bg-primary-500 hover:bg-primary-600 active:scale-[0.98] shadow-lg shadow-primary-500/25'
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
          }`}
        >
          {isStarting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              准备中...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              开始测评
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </button>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>数据仅保存在本地，不会上传到服务器</p>
          <p className="mt-1">支持在设置中导出或清除数据</p>
        </div>
      </div>
    </main>
  );
}