'use client';

import { useRouter } from 'next/navigation';
import { useQSortStore } from '@/store';
import { INSTRUCTIONS } from '@/lib/experiment';
import { ArrowLeft, Play, Clock } from 'lucide-react';

/**
 * 引导语页面。
 * 进入页面时 session 已随机分配好条件（control / experimental）。
 * 两组布局与样式完全一致，只有引导语文字不同（见 src/lib/experiment.ts 的 INSTRUCTIONS）。
 * 点击"开始排序"记录开始时间戳 sortStartTime，然后进入预分堆阶段。
 */
export default function InstructionPage() {
  const router = useRouter();
  const { currentSession, currentTheme, setSortStartTime } = useQSortStore();

  // 无有效会话时回到首页
  if (!currentTheme || !currentSession) {
    router.push('/');
    return null;
  }

  const condition = currentSession.experimentCondition;
  const instruction = INSTRUCTIONS[condition];

  const handleStart = () => {
    // 记录开始排序的时间戳（总用时从此刻起算）
    setSortStartTime(Date.now());
    router.push('/presort');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* 标题区（布局固定） */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {instruction.heading}
          </h2>
        </div>

        {/* 引导语内容：布局完全一致，仅文字随条件变化 */}
        <div className="space-y-3 mb-6">
          {instruction.paragraphs.map((text, idx) => (
            <p
              key={idx}
              className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4"
            >
              {text}
            </p>
          ))}
        </div>

        {/* 计时提示 */}
        <div className="flex items-center justify-center gap-2 mb-6 text-xs text-slate-400 dark:text-slate-500">
          <Clock className="w-4 h-4" />
          <span>点击「开始排序」后计时开始，请一次性连续完成。</span>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl bg-primary-500 text-white font-semibold text-lg hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/25"
        >
          开始排序
        </button>

        {/* 返回（供测试用，正式施测时可删除） */}
        <button
          onClick={() => router.push('/')}
          className="w-full mt-3 py-2 rounded-xl text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>
      </div>
    </main>
  );
}
