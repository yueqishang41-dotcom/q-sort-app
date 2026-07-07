'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/types';
import { GripVertical } from 'lucide-react';

/** 档位配置 */
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

interface DraggableCardProps {
  card: Card;
  currentSlot?: number;
  isActive?: boolean;
  showTags?: boolean;
  children?: ReactNode;
}

/**
 * 可拖拽的单卡片组件
 * 支持长按激活拖拽、拖拽时的视觉反馈
 */
export function DraggableCard({
  card,
  currentSlot,
  isActive = true,
  showTags = true,
  children,
}: DraggableCardProps) {
  const [isLongPress, setIsLongPress] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id,
    data: { card, currentSlot },
    disabled: !isActive,
  });

  // 长按检测（移动端优化）
  useEffect(() => {
    const handleTouchStart = () => {
      longPressTimer.current = setTimeout(() => {
        setIsLongPress(true);
        // 触觉反馈
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 300);
    };

    const handleTouchEnd = () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
      setIsLongPress(false);
    };

    const node = cardRef.current;
    if (node && isActive) {
      node.addEventListener('touchstart', handleTouchStart, { passive: true });
      node.addEventListener('touchend', handleTouchEnd);
      node.addEventListener('touchcancel', handleTouchEnd);
    }

    return () => {
      if (node) {
        node.removeEventListener('touchstart', handleTouchStart);
        node.removeEventListener('touchend', handleTouchEnd);
        node.removeEventListener('touchcancel', handleTouchEnd);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [isActive]);

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1000 : 'auto',
      }
    : undefined;

  const slotConfig = currentSlot !== undefined ? SLOT_CONFIG[currentSlot] : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative w-full max-w-md mx-auto
        transition-all duration-200 ease-out
        ${isDragging ? 'opacity-90 scale-105 z-50' : ''}
        ${isLongPress && !isDragging ? 'scale-[1.02]' : ''}
      `}
      {...attributes}
      {...listeners}
    >
      {/* 当前位置指示器 */}
      {currentSlot !== undefined && slotConfig && (
        <div
          className={`
            absolute -top-3 left-1/2 -translate-x-1/2
            px-4 py-1.5 rounded-full text-white text-sm font-semibold
            ${slotConfig.bgClass} shadow-lg
            transition-all duration-200
            ${isDragging ? 'opacity-0' : ''}
          `}
        >
          {slotConfig.label}
        </div>
      )}

      {/* 卡片主体 */}
      <div
        ref={cardRef}
        className={`
          relative bg-white dark:bg-slate-800
          rounded-3xl overflow-hidden
          transition-all duration-300 ease-out
          ${isDragging
            ? 'shadow-[0_20px_60px_rgba(0,0,0,0.3)] ring-4 ring-primary-400/50'
            : 'shadow-[0_10px_40px_rgba(0,0,0,0.12)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.18)]'
          }
          ${isLongPress && !isDragging ? 'shadow-[0_15px_50px_rgba(0,0,0,0.2)] ring-2 ring-primary-300/50' : ''}
          ${isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}
        `}
      >
        {/* 拖拽手柄指示器 */}
        {isActive && (
          <div className={`
            absolute top-3 left-1/2 -translate-x-1/2
            flex items-center gap-1 text-slate-300 dark:text-slate-600
            transition-opacity duration-200
            ${isDragging ? 'opacity-0' : 'opacity-100'}
          `}>
            <GripVertical className="w-4 h-4" />
            <span className="text-xs">长按拖拽</span>
          </div>
        )}

        {/* 卡片内容 */}
        <div className="p-8 pt-10">
          <p className={`
            text-xl sm:text-2xl text-slate-800 dark:text-slate-200
            leading-relaxed text-center font-medium
            transition-all duration-200
            ${isDragging ? 'scale-[1.02]' : ''}
          `}>
            {card.text}
          </p>

          {/* 标签 */}
          {showTags && card.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {card.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    bg-gradient-to-r from-slate-100 to-slate-200
                    dark:from-slate-700 dark:to-slate-600
                    text-slate-600 dark:text-slate-300
                    transition-all duration-200
                    ${isDragging ? 'scale-95 opacity-80' : ''}
                  `}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 子内容 */}
          {children}
        </div>

        {/* 卡片底部装饰线 */}
        <div className={`
          absolute bottom-0 left-0 right-0 h-1
          ${currentSlot !== undefined && slotConfig
            ? slotConfig.bgClass
            : 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400'
          }
        `} />
      </div>

      {/* 拖拽时的光晕效果 */}
      {isDragging && (
        <div className="
          absolute inset-0 -z-10
          bg-gradient-radial from-primary-400/20 to-transparent
          blur-xl scale-150
        " />
      )}
    </div>
  );
}

export default DraggableCard;
