'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, TouchSensor, MouseSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useQSortStore } from '@/store';
import { Card, FinalPlacement } from '@/types';
import { DraggableCard } from '@/components/DraggableCard';
import { ArcSlotSelector } from '@/components/ArcSlotSelector';
import {
  ArrowLeft,
  HelpCircle,
  Undo2,
  Redo2,
  Wand2,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

/** 档位配置 */
const SLOTS = [4, 3, 2, 1, 0, -1, -2, -3, -4] as const;

const SLOT_CONFIG: Record<number, { label: string; shortLabel: string; bgClass: string }> = {
  4: { label: '+4 最像我', shortLabel: '+4', bgClass: 'bg-gradient-to-br from-teal-400 to-teal-600' },
  3: { label: '+3', shortLabel: '+3', bgClass: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
  2: { label: '+2', shortLabel: '+2', bgClass: 'bg-gradient-to-br from-green-400 to-green-600' },
  1: { label: '+1', shortLabel: '+1', bgClass: 'bg-gradient-to-br from-lime-400 to-lime-600' },
  0: { label: '0 中性', shortLabel: '0', bgClass: 'bg-gradient-to-br from-slate-400 to-slate-500' },
  [-1]: { label: '-1', shortLabel: '-1', bgClass: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
  [-2]: { label: '-2', shortLabel: '-2', bgClass: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  [-3]: { label: '-3', shortLabel: '-3', bgClass: 'bg-gradient-to-br from-orange-400 to-orange-600' },
  [-4]: { label: '-4 最不像我', shortLabel: '-4', bgClass: 'bg-gradient-to-br from-red-400 to-red-600' },
};

/** 进度条 */
function ProgressIndicator({
  placed,
  total,
  distributionValid,
}: {
  placed: number;
  total: number;
  distributionValid: boolean;
}) {
  const progress = (placed / total) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-200 dark:text-slate-700"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 36}
            strokeDashoffset={2 * Math.PI * 36 - (progress / 100) * 2 * Math.PI * 36}
            strokeLinecap="round"
            className={`${distributionValid ? 'text-green-500' : 'text-primary-500'} transition-all duration-500`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-slate-900 dark:text-white">{placed}</span>
        </div>
      </div>
      <div className="text-right">
        <span className={`text-sm font-medium ${distributionValid ? 'text-green-500' : 'text-slate-600 dark:text-slate-400'}`}>
          {distributionValid ? '✓ 分布正确' : `${total - placed} 张待放`}
        </span>
      </div>
    </div>
  );
}

export default function SortingPage() {
  const router = useRouter();
  const {
    currentTheme,
    currentSession,
    placeCard,
    removeCard,
    autoFill,
    undo,
    redo,
    undoStack,
    redoStack,
    completeSession,
    incrementDrag,
  } = useQSortStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showAutoFill, setShowAutoFill] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [label, setLabel] = useState('');
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

  const distribution = currentTheme.recommendedDistribution;
  const cards = currentTheme.cards;
  const cardMap = new Map(cards.map(c => [c.id, c]));

  // 当前卡片
  const currentCard = cards[currentIndex];

  // 计算槽位卡片
  const slotCards = useMemo(() => {
    const result: Record<number, Card[]> = {};
    for (let i = distribution.range[0]; i <= distribution.range[1]; i++) {
      result[i] = [];
    }
    for (const [cardId, slot] of Object.entries(currentSession.finalPlacement)) {
      const card = cardMap.get(cardId);
      if (card && result[slot]) {
        result[slot].push(card);
      }
    }
    return result;
  }, [currentSession.finalPlacement, distribution]);

  // 已放置卡片
  const placedCardIds = new Set(Object.keys(currentSession.finalPlacement));
  const placedCount = placedCardIds.size;

  // 当前卡片所在槽位
  const currentSlot = currentSession.finalPlacement[currentCard?.id];

  // 分布是否正确
  const distributionValid = useMemo(() => {
    for (let i = distribution.range[0]; i <= distribution.range[1]; i++) {
      if ((slotCards[i]?.length || 0) !== distribution.distribution[i]) return false;
    }
    return true;
  }, [slotCards, distribution]);

  // 已满的槽位
  const fullSlots = useMemo(() => {
    const full = new Set<number>();
    for (let i = distribution.range[0]; i <= distribution.range[1]; i++) {
      if ((slotCards[i]?.length || 0) >= distribution.distribution[i]) {
        full.add(i);
      }
    }
    return full;
  }, [slotCards, distribution]);

  // 未放置卡片索引
  const unplacedIndices = useMemo(() => {
    return cards
      .map((c, idx) => (!placedCardIds.has(c.id) ? idx : -1))
      .filter(idx => idx !== -1);
  }, [cards, placedCardIds]);

  // 放置卡片
  const handlePlace = useCallback((slot: number) => {
    if (!currentCard) return;
    placeCard(currentCard.id, slot);

    // 触觉反馈
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    setDirection('right');

    // 自动跳转到下一张未放置卡片
    setTimeout(() => {
      const nextUnplaced = unplacedIndices.find(idx => idx > currentIndex);
      if (nextUnplaced !== undefined) {
        setCurrentIndex(nextUnplaced);
      } else if (unplacedIndices.length > 0) {
        setCurrentIndex(unplacedIndices[0]);
      } else if (placedCount + 1 >= cards.length && distributionValid) {
        setShowComplete(true);
      }
      setDirection(null);
    }, 200);
  }, [currentCard, currentIndex, unplacedIndices, placedCount, distributionValid]);

  // 导航
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

  // 自动填充
  const handleAutoFill = () => {
    autoFill();
    setShowAutoFill(false);
    setShowComplete(true);
  };

  // 完成
  const handleComplete = () => {
    if (!distributionValid) return;
    completeSession(label || undefined);
    // 先进入提交页提交数据到后端，成功后再查看结果
    router.push('/submit');
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
      const slotId = over.id.toString();
      if (slotId.startsWith('slot-')) {
        const slot = parseInt(slotId.replace('slot-', ''), 10);
        handlePlace(slot);
      }
    }
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      // 数字键放置
      const num = parseInt(e.key);
      if (num >= 0 && num <= 4 && !fullSlots.has(num)) handlePlace(num);
      if (e.key === '-' && !fullSlots.has(-1)) handlePlace(-1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, fullSlots, handlePlace]);

  // 完成弹窗
  if (showComplete) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          {!distributionValid && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">分布尚未完成</span>
              </div>
              <p className="text-sm text-amber-500 dark:text-amber-300 mt-2">
                每个档位的卡片数量需要符合要求
              </p>
            </div>
          )}

          {distributionValid && (
            <>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                强制分布完成！
              </h2>

              {/* 分布预览 */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[-4, 0, 4].map((slot) => (
                  <div key={slot} className={`${SLOT_CONFIG[slot].bgClass} rounded-xl p-3 text-white`}>
                    <div className="text-lg font-bold">{slot > 0 ? '+' : ''}{slot}</div>
                    <div className="text-xs">{slotCards[slot]?.length || 0} 张</div>
                  </div>
                ))}
              </div>

              {/* 标签输入 */}
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="添加标签（如：第一次测评）"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 mb-6"
              />
            </>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowComplete(false)}
              className="flex-1 py-4 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400"
            >
              继续调整
            </button>
            {distributionValid && (
              <button
                onClick={handleComplete}
                className="flex-1 py-4 rounded-xl bg-primary-500 text-white font-semibold"
              >
                查看结果
              </button>
            )}
          </div>
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
              onClick={() => router.push('/presort')}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">返回</span>
            </button>

            <ProgressIndicator
              placed={placedCount}
              total={cards.length}
              distributionValid={distributionValid}
            />

            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <Undo2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <Redo2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <HelpCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* 卡片索引 */}
          <div className="max-w-md mx-auto px-4 pb-2">
            <div className="flex justify-center gap-1 overflow-x-auto scrollbar-thin">
              {cards.map((card, idx) => (
                <button
                  key={card.id}
                  onClick={() => {
                    setDirection(null);
                    setCurrentIndex(idx);
                  }}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all flex-shrink-0 ${
                    idx === currentIndex
                      ? 'w-6 bg-primary-500'
                      : placedCardIds.has(card.id)
                        ? currentSession.finalPlacement[card.id] >= 2
                          ? 'bg-green-400'
                          : currentSession.finalPlacement[card.id] <= -2
                            ? 'bg-red-400'
                            : 'bg-slate-400'
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
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">精细排序指南</h3>
              </div>

              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <p>将每张卡片放入对应的档位，每个档位容量有限：</p>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">+4</span>
                      最像我（仅2张）
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-bold">0</span>
                      中性（最多8张）
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-bold">-4</span>
                      最不像我（仅2张）
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  💡 可以<strong>拖拽卡片</strong>到弧形档位，或点击档位按钮快速放置
                </p>
                <p className="text-xs text-slate-500">
                  ⌨️ 键盘快捷键：数字键 0-4 放置，←/→ 切换卡片
                </p>
              </div>

              <button
                onClick={() => setShowHelp(false)}
                className="w-full mt-4 py-3 rounded-xl bg-primary-500 text-white font-medium"
              >
                开始排序
              </button>
            </div>
          </div>
        )}

        {/* 自动填充弹窗 */}
        {showAutoFill && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <div className="flex items-center justify-center mb-4">
                <Wand2 className="w-12 h-12 text-primary-500" />
              </div>
              <h3 className="font-semibold text-lg mb-3 text-center text-slate-900 dark:text-white">
                自动填充剩余卡片？
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 text-center">
                系统会根据预分堆结果，将 {cards.length - placedCount} 张未放置卡片分配到可用槽位
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAutoFill(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                >
                  取消
                </button>
                <button
                  onClick={handleAutoFill}
                  className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-medium"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col items-center justify-center pt-28 pb-24 px-4">
          {/* 弧形档位选择器 + 当前卡片 */}
          <div className={`transition-all duration-300 ${
            direction === 'left' ? '-translate-x-4 opacity-50' :
            direction === 'right' ? 'translate-x-4 opacity-50' :
            ''
          }`}>
            <ArcSlotSelector
              distribution={distribution.distribution}
              slotCards={slotCards}
              currentCard={currentCard}
              currentSlot={currentSlot}
              onPlace={handlePlace}
              disabledSlots={new Set()}
            />
          </div>
        </div>

        {/* 底部导航 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-t border-slate-200/50 dark:border-slate-700/50 safe-bottom">
          <div className="max-w-md mx-auto px-4 py-3">
            {/* 导航按钮 */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">上一张</span>
              </button>

              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {currentIndex + 1} / {cards.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
              >
                <span className="text-sm">下一张</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {unplacedIndices.length > 0 && (
                <button
                  onClick={() => setShowAutoFill(true)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  自动填充 ({unplacedIndices.length})
                </button>
              )}
              <button
                onClick={() => setShowComplete(true)}
                disabled={!distributionValid}
                className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  distributionValid
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {distributionValid ? (
                  <>
                    <Check className="w-5 h-5" />
                    查看结果
                  </>
                ) : (
                  `还需调整`
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 拖拽覆盖层 */}
      <DragOverlay>
        {activeCard && (
          <div className="opacity-80 scale-105">
            <DraggableCard card={activeCard} currentSlot={currentSession.finalPlacement[activeCard.id]} isActive={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}