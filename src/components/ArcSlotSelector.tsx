'use client';

import { useState } from 'react';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, TouchSensor, MouseSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Card } from '@/types';
import { DraggableCard } from './DraggableCard';
import { Check } from 'lucide-react';

type ZoneColor = 'green' | 'slate' | 'red' | 'teal' | 'emerald' | 'lime' | 'yellow' | 'amber' | 'orange';

/** 档位配置 */
const SLOT_CONFIG: Record<number, {
  label: string;
  shortLabel: string;
  color: ZoneColor;
  gradient: string;
}> = {
  4: { label: '最像我', shortLabel: '+4', color: 'teal', gradient: 'bg-gradient-to-br from-teal-400 to-teal-600' },
  3: { label: '', shortLabel: '+3', color: 'emerald', gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600' },
  2: { label: '', shortLabel: '+2', color: 'green', gradient: 'bg-gradient-to-br from-green-400 to-green-600' },
  1: { label: '', shortLabel: '+1', color: 'lime', gradient: 'bg-gradient-to-br from-lime-400 to-lime-600' },
  0: { label: '中性', shortLabel: '0', color: 'slate', gradient: 'bg-gradient-to-br from-slate-400 to-slate-500' },
  [-1]: { label: '', shortLabel: '-1', color: 'yellow', gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600' },
  [-2]: { label: '', shortLabel: '-2', color: 'amber', gradient: 'bg-gradient-to-br from-amber-400 to-amber-600' },
  [-3]: { label: '', shortLabel: '-3', color: 'orange', gradient: 'bg-gradient-to-br from-orange-400 to-orange-600' },
  [-4]: { label: '最不像我', shortLabel: '-4', color: 'red', gradient: 'bg-gradient-to-br from-red-400 to-red-600' },
};

// 档位排列顺序：+4, +3, +2, +1, 0, -1, -2, -3, -4
const SLOTS = [4, 3, 2, 1, 0, -1, -2, -3, -4];

interface SlotSelectorProps {
  distribution: Record<number, number>;
  slotCards: Record<number, Card[]>;
  currentCard?: Card;
  currentSlot?: number;
  onPlace: (slot: number) => void;
  disabledSlots?: Set<number>;
}

/**
 * 档位选择器 - 横向线性布局
 * 9 个档位从 +4 到 -4 横向排列，颜色从绿到红渐变
 */
export function SlotSelector({
  distribution,
  slotCards,
  currentCard,
  currentSlot,
  onPlace,
  disabledSlots = new Set(),
}: SlotSelectorProps) {
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* 档位区域 */}
      <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 backdrop-blur-sm">
        {/* 高分端标签 */}
        <div className="text-center mb-2">
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">← 更像我</span>
        </div>

        {/* 档位按钮 - 横向排列 */}
        <div className="flex justify-center items-end gap-1.5 sm:gap-2">
          {SLOTS.map((slot) => {
            const config = SLOT_CONFIG[slot];
            const capacity = distribution[slot];
            const count = slotCards[slot]?.length || 0;
            const isFull = count >= capacity;
            const isDisabled = disabledSlots.has(slot);
            const isCurrentSlot = slot === currentSlot;

            // 根据档位高度调整按钮大小（两端大，中间小）
            const sizeClass = Math.abs(slot) === 4
              ? 'w-12 h-12 sm:w-14 sm:h-14'
              : Math.abs(slot) === 3
                ? 'w-11 h-11 sm:w-12 sm:h-12'
                : Math.abs(slot) === 2
                  ? 'w-10 h-10 sm:w-11 sm:h-11'
                  : Math.abs(slot) === 1
                    ? 'w-9 h-9 sm:w-10 sm:h-10'
                    : 'w-10 h-10 sm:w-11 sm:h-11';

            return (
              <button
                key={slot}
                onClick={() => !isDisabled && onPlace(slot)}
                disabled={isDisabled}
                className={`
                  flex flex-col items-center
                  transition-all duration-200 ease-out
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* 档位按钮 */}
                <div
                  className={`
                    ${sizeClass} rounded-xl
                    ${config.gradient}
                    flex items-center justify-center
                    shadow-md
                    transition-all duration-200
                    ${isFull ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-800' : ''}
                    ${isCurrentSlot ? 'ring-4 ring-white ring-offset-2 ring-offset-primary-500 scale-110' : ''}
                    ${!isDisabled && !isFull ? 'hover:scale-110 hover:shadow-lg' : ''}
                  `}
                >
                  <span className={`font-bold text-white ${Math.abs(slot) === 4 ? 'text-lg' : 'text-base'}`}>
                    {config.shortLabel}
                  </span>

                  {/* 已满标记 */}
                  {isFull && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>

                {/* 数量指示 */}
                <span className={`
                  mt-1 text-xs font-medium
                  ${isFull ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'}
                `}>
                  {count}/{capacity}
                </span>

                {/* 档位标签（仅两端显示） */}
                {(slot === 4 || slot === -4 || slot === 0) && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {config.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 低分端标签 */}
        <div className="text-center mt-2">
          <span className="text-xs text-red-600 dark:text-red-400 font-medium">更不像我 →</span>
        </div>
      </div>

      {/* 当前卡片 */}
      {currentCard && (
        <div className="mt-6">
          <DraggableCard
            card={currentCard}
            currentSlot={currentSlot}
          />
        </div>
      )}
    </div>
  );
}

/**
 * 包含完整拖拽逻辑的选择器包装组件
 */
export function SlotSelectorWithDnd({
  distribution,
  slotCards,
  currentCard,
  currentSlot,
  onPlace,
  disabledSlots = new Set(),
}: SlotSelectorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // 配置传感器
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && currentCard) {
      // 解析槽位 ID
      const slotId = over.id.toString();
      if (slotId.startsWith('slot-')) {
        const slot = parseInt(slotId.replace('slot-', ''), 10);
        if (!disabledSlots.has(slot)) {
          onPlace(slot);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SlotSelector
        distribution={distribution}
        slotCards={slotCards}
        currentCard={currentCard}
        currentSlot={currentSlot}
        onPlace={onPlace}
        disabledSlots={disabledSlots}
      />

      {/* 拖拽时的覆盖层 */}
      <DragOverlay>
        {activeId && currentCard && (
          <div className="opacity-80 scale-105">
            <DraggableCard card={currentCard} currentSlot={currentSlot} isActive={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// 保持旧名称的兼容性导出
export const ArcSlotSelector = SlotSelector;
export const ArcSlotSelectorWithDnd = SlotSelectorWithDnd;

export default SlotSelector;
