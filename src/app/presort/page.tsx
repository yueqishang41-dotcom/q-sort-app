'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, TouchSensor, MouseSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useQSortStore } from '@/store';
import { Card, PreSortPile } from '@/types';
import { DraggableCard } from '@/components/DraggableCard';
import {
  ArrowLeft,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
} from 'lucide-react';

/** 进度环组件 */
function ProgressRing({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = (current / total) * 100;
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        {/* 背景环 */}
        <circle
          cx="48"
          cy="48"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* 进度环 */}
        <circle
          cx="48"
          cy="48"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary-500 transition-all duration-500"
        />
      </svg>
      {/* 中心数字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {current}
        </span>
      </div>
    </div>
  );
}

/** 快速选择按钮组件 */
function QuickSelectButtons({
  onMoveToPile,
  pileCounts,
  currentCardPile,
}: {
  onMoveToPile: (pile: PreSortPile) => void;
  pileCounts: { A: number; B: number; C: number };
  currentCardPile: PreSortPile | null;
}) {
  return (
    <div className="flex justify-center gap-4 mt-8">
      {/* 更像我 */}
      <button
        onClick={() => onMoveToPile('A')}
        className={`group relative flex flex-col items-center transition-all ${
          currentCardPile === 'A' ? 'scale-110' : ''
        }`}
      >
        <div className={`
          w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
          bg-gradient-to-br from-green-400 to-green-600
          shadow-lg flex items-center justify-center
          transition-all group-hover:scale-110 group-active:scale-95
          ${currentCardPile === 'A' ? 'ring-4 ring-green-300 shadow-green-200' : ''}
        `}>
          <Check className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          {currentCardPile === 'A' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <Check className="w-3 h-3 text-green-500" />
            </div>
          )}
        </div>
        <span className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">更像我</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{pileCounts.A} 张</span>
      </button>

      {/* 不确定 */}
      <button
        onClick={() => onMoveToPile('B')}
        className={`group relative flex flex-col items-center transition-all ${
          currentCardPile === 'B' ? 'scale-110' : ''
        }`}
      >
        <div className={`
          w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
          bg-gradient-to-br from-slate-300 to-slate-500
          dark:from-slate-500 dark:to-slate-700
          shadow-lg flex items-center justify-center
          transition-all group-hover:scale-110 group-active:scale-95
          ${currentCardPile === 'B' ? 'ring-4 ring-slate-300 shadow-slate-200' : ''}
        `}>
          <Minus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          {currentCardPile === 'B' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <Check className="w-3 h-3 text-slate-500" />
            </div>
          )}
        </div>
        <span className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">不确定</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{pileCounts.B} 张</span>
      </button>

      {/* 更不像我 */}
      <button
        onClick={() => onMoveToPile('C')}
        className={`group relative flex flex-col items-center transition-all ${
          currentCardPile === 'C' ? 'scale-110' : ''
        }`}
      >
        <div className={`
          w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
          bg-gradient-to-br from-red-400 to-red-600
          shadow-lg flex items-center justify-center
          transition-all group-hover:scale-110 group-active:scale-95
          ${currentCardPile === 'C' ? 'ring-4 ring-red-300 shadow-red-200' : ''}
        `}>
          <X className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          {currentCardPile === 'C' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <Check className="w-3 h-3 text-red-500" />
            </div>
          )}
        </div>
        <span className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">更不像我</span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{pileCounts.C} 张</span>
      </button>
    </div>
  );
}

export default function PreSortPage() {
  const router = useRouter();
  const {
    currentTheme,
    currentSession,
    updatePreSort,
    moveCardInPreSort,
    completePreSort,
    incrementDrag,
  } = useQSortStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // 配置拖拽传感器
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 8,
      },
    }),
  );

  // 检查是否有有效会话
  if (!currentTheme || !currentSession) {
    router.push('/');
    return null;
  }

  // 获取预分堆数据
  const preSort = currentSession.preSort || {
    pileA: [],
    pileB: [],
    pileC: [],
  };

  // 获取当前卡片
  const cards = currentTheme.cards;
  const currentCard = cards[currentIndex];

  // 计算分类情况
  const pileCounts = useMemo(() => ({
    A: preSort.pileA.length,
    B: preSort.pileB.length,
    C: preSort.pileC.length,
  }), [preSort]);

  const sortedCount = pileCounts.A + pileCounts.B + pileCounts.C;
  const totalCount = cards.length;

  // 获取当前卡片所在的堆
  const currentCardPile = useMemo(() => {
    if (preSort.pileA.includes(currentCard?.id)) return 'A';
    if (preSort.pileB.includes(currentCard?.id)) return 'B';
    if (preSort.pileC.includes(currentCard?.id)) return 'C';
    return null;
  }, [preSort, currentCard]);

  // 移动卡片到指定堆
  const handleMoveToPile = useCallback((pile: PreSortPile) => {
    if (!currentCard) return;

    // 如果已经在某个堆中，先移除
    if (currentCardPile) {
      moveCardInPreSort(currentCard.id, currentCardPile, pile);
    } else {
      updatePreSort(pile, [currentCard.id]);
    }

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // 自动跳转到下一张未分类卡片
    setDirection('right');
    setTimeout(() => {
      const nextIndex = findNextUnsortedIndex(currentIndex);
      if (nextIndex !== -1 && nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
      } else if (sortedCount + 1 >= totalCount) {
        setShowComplete(true);
      }
      setDirection(null);
    }, 200);
  }, [currentCard, currentCardPile, currentIndex, sortedCount, totalCount]);

  // 找到下一张未分类卡片
  const findNextUnsortedIndex = (fromIndex: number) => {
    const sortedIds = new Set([...preSort.pileA, ...preSort.pileB, ...preSort.pileC]);

    // 从当前位置往后找
    for (let i = fromIndex + 1; i < cards.length; i++) {
      if (!sortedIds.has(cards[i].id)) return i;
    }
    // 如果后面没有，从头找
    for (let i = 0; i < fromIndex; i++) {
      if (!sortedIds.has(cards[i].id)) return i;
    }
    return -1;
  };

  // 导航到上一张/下一张
  const handlePrev = () => {
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : cards.length - 1);
      setDirection(null);
    }, 200);
  };

  const handleNext = () => {
    setDirection('right');
    setTimeout(() => {
      setCurrentIndex(currentIndex < cards.length - 1 ? currentIndex + 1 : 0);
      setDirection(null);
    }, 200);
  };

  // 完成预分堆
  const handleComplete = () => {
    completePreSort();
    router.push('/sorting');
  };

  // 拖拽开始
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = cards.find(c => c.id === active.id);
    setActiveCard(card || null);
    incrementDrag();
  };

  // 拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (over && currentCard) {
      const pileId = over.id.toString();
      if (['A', 'B', 'C'].includes(pileId)) {
        const pile = pileId as PreSortPile;
        handleMoveToPile(pile);
      }
    }
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'a' || e.key === 'A') handleMoveToPile('A');
      if (e.key === 'b' || e.key === 'B') handleMoveToPile('B');
      if (e.key === 'c' || e.key === 'C') handleMoveToPile('C');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleMoveToPile]);

  // 完成弹窗
  if (showComplete) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            预分堆完成！
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            你已完成所有 {totalCount} 张卡片的初步分类
          </p>

          {/* 分类统计 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{pileCounts.A}</div>
              <div className="text-sm text-green-500 dark:text-green-300">更像我</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4">
              <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">{pileCounts.B}</div>
              <div className="text-sm text-slate-500 dark:text-slate-300">不确定</div>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{pileCounts.C}</div>
              <div className="text-sm text-red-500 dark:text-red-300">更不像我</div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-xl bg-primary-500 text-white font-semibold text-lg hover:bg-primary-600 transition-colors"
          >
            进入精细排序
          </button>
        </div>
      </main>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col">
        {/* 顶部导航 */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </button>

            {/* 进度 */}
            <div className="flex items-center gap-3">
              <ProgressRing current={sortedCount} total={totalCount} />
            </div>

            <button
              onClick={() => setShowHelp(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* 卡片索引指示 */}
          <div className="max-w-md mx-auto px-4 pb-2">
            <div className="flex justify-center gap-1 overflow-x-auto scrollbar-thin">
              {cards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setDirection(null);
                    setCurrentIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${
                    idx === currentIndex
                      ? 'w-6 bg-primary-500'
                      : preSort.pileA.includes(card.id)
                        ? 'bg-green-400'
                        : preSort.pileB.includes(card.id)
                          ? 'bg-slate-400'
                          : preSort.pileC.includes(card.id)
                            ? 'bg-red-400'
                            : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </nav>

        {/* 帮助弹窗 */}
        {showHelp && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">快速分类指南</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <p>每次显示一张卡片，快速判断它"更像你"还是"更不像你"。</p>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span><strong>更像我</strong> - 明显符合我的情况</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-400 flex items-center justify-center">
                      <Minus className="w-4 h-4 text-white" />
                    </div>
                    <span><strong>不确定</strong> - 犹豫或需要再想</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
                      <X className="w-4 h-4 text-white" />
                    </div>
                    <span><strong>更不像我</strong> - 明显不符合</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-500">
                  💡 可以<strong>拖拽卡片</strong>到目标区域，或点击下方按钮快速分类
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  ⌨️ 键盘快捷键：A/B/C 快速分类，←/→ 切换卡片
                </p>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-4 py-3 rounded-xl bg-primary-500 text-white font-medium"
              >
                开始分类
              </button>
            </div>
          </div>
        )}

        {/* 主内容区 - 单卡片展示 */}
        <div className="flex-1 flex flex-col items-center pt-28 pb-24 px-4">
          {/* 卡片展示区 */}
          <div className={`flex-1 flex items-center justify-center transition-all duration-300 ${
            direction === 'left' ? '-translate-x-4 opacity-50' :
            direction === 'right' ? 'translate-x-4 opacity-50' :
            'translate-x-0 opacity-100'
          }`}>
            {currentCard && (
              <DraggableCard card={currentCard} />
            )}
          </div>

          {/* 快速选择按钮 */}
          <div className="w-full max-w-md mt-4">
            <QuickSelectButtons
              onMoveToPile={handleMoveToPile}
              pileCounts={pileCounts}
              currentCardPile={currentCardPile}
            />
          </div>
        </div>

        {/* 底部导航 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-700/50 safe-bottom">
          <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
            {/* 上一张 */}
            <button
              onClick={handlePrev}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="text-sm">上一张</span>
            </button>

            {/* 当前状态 */}
            <div className="text-center">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {currentIndex + 1} / {totalCount}
              </span>
              {currentCardPile && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                  currentCardPile === 'A' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                  currentCardPile === 'B' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                  'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {currentCardPile === 'A' ? '更像我' : currentCardPile === 'B' ? '不确定' : '更不像我'}
                </span>
              )}
            </div>

            {/* 下一张 */}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="text-sm">下一张</span>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>

      {/* 拖拽覆盖层 */}
      <DragOverlay>
        {activeCard && (
          <div className="opacity-80 scale-105">
            <DraggableCard card={activeCard} isActive={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
