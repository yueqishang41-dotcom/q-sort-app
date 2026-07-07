'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';
import { Check, Minus, X, LucideIcon } from 'lucide-react';

type ZoneColor = 'green' | 'slate' | 'red' | 'teal' | 'emerald' | 'lime' | 'yellow' | 'amber' | 'orange';

interface DropZoneProps {
  id: string;
  label: string;
  shortLabel?: string;
  color: ZoneColor;
  count?: number;
  capacity?: number;
  icon?: LucideIcon;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  children?: ReactNode;
}

/** 颜色配置 */
const COLOR_CONFIG: Record<ZoneColor, {
  gradient: string;
  ring: string;
  glow: string;
  text: string;
  textDark: string;
}> = {
  green: {
    gradient: 'bg-gradient-to-br from-green-400 to-green-600',
    ring: 'ring-green-300',
    glow: 'shadow-[0_0_30px_rgba(74,222,128,0.5)]',
    text: 'text-green-600',
    textDark: 'dark:text-green-400',
  },
  slate: {
    gradient: 'bg-gradient-to-br from-slate-300 to-slate-500',
    ring: 'ring-slate-300',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.5)]',
    text: 'text-slate-600',
    textDark: 'dark:text-slate-400',
  },
  red: {
    gradient: 'bg-gradient-to-br from-red-400 to-red-600',
    ring: 'ring-red-300',
    glow: 'shadow-[0_0_30px_rgba(248,113,113,0.5)]',
    text: 'text-red-600',
    textDark: 'dark:text-red-400',
  },
  teal: {
    gradient: 'bg-gradient-to-br from-teal-400 to-teal-600',
    ring: 'ring-teal-300',
    glow: 'shadow-[0_0_30px_rgba(45,212,191,0.5)]',
    text: 'text-teal-600',
    textDark: 'dark:text-teal-400',
  },
  emerald: {
    gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    ring: 'ring-emerald-300',
    glow: 'shadow-[0_0_30px_rgba(52,211,153,0.5)]',
    text: 'text-emerald-600',
    textDark: 'dark:text-emerald-400',
  },
  lime: {
    gradient: 'bg-gradient-to-br from-lime-400 to-lime-600',
    ring: 'ring-lime-300',
    glow: 'shadow-[0_0_30px_rgba(163,230,53,0.5)]',
    text: 'text-lime-600',
    textDark: 'dark:text-lime-400',
  },
  yellow: {
    gradient: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
    ring: 'ring-yellow-300',
    glow: 'shadow-[0_0_30px_rgba(250,204,21,0.5)]',
    text: 'text-yellow-600',
    textDark: 'dark:text-yellow-400',
  },
  amber: {
    gradient: 'bg-gradient-to-br from-amber-400 to-amber-600',
    ring: 'ring-amber-300',
    glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]',
    text: 'text-amber-600',
    textDark: 'dark:text-amber-400',
  },
  orange: {
    gradient: 'bg-gradient-to-br from-orange-400 to-orange-600',
    ring: 'ring-orange-300',
    glow: 'shadow-[0_0_30px_rgba(251,146,60,0.5)]',
    text: 'text-orange-600',
    textDark: 'dark:text-orange-400',
  },
};

/** 尺寸配置 */
const SIZE_CONFIG: Record<'small' | 'medium' | 'large', {
  container: string;
  circle: string;
  icon: string;
  label: string;
  count: string;
}> = {
  small: {
    container: 'w-20 h-24',
    circle: 'w-12 h-12',
    icon: 'w-6 h-6',
    label: 'text-xs',
    count: 'text-xs',
  },
  medium: {
    container: 'w-28 h-32',
    circle: 'w-16 h-16',
    icon: 'w-8 h-8',
    label: 'text-sm',
    count: 'text-xs',
  },
  large: {
    container: 'w-36 h-40',
    circle: 'w-20 h-20',
    icon: 'w-10 h-10',
    label: 'text-base',
    count: 'text-sm',
  },
};

/**
 * 通用拖放目标组件
 * 用于预分堆的三堆区域和排序的档位区域
 */
export function DropZone({
  id,
  label,
  shortLabel,
  color,
  count = 0,
  capacity,
  icon,
  size = 'medium',
  showCount = true,
  children,
}: DropZoneProps) {
  const { setNodeRef, isOver, active } = useDroppable({ id });

  const colorConfig = COLOR_CONFIG[color];
  const sizeConfig = SIZE_CONFIG[size];
  const IconComponent = icon;
  const isFull = capacity !== undefined && count >= capacity;
  const hasActiveDrag = active !== null;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col items-center
        ${sizeConfig.container}
        transition-all duration-300 ease-out
        ${isOver ? 'scale-110' : hasActiveDrag ? 'scale-105' : ''}
      `}
    >
      {/* 主圆形区域 */}
      <div
        className={`
          relative ${sizeConfig.circle} rounded-2xl
          ${colorConfig.gradient}
          flex items-center justify-center
          shadow-lg
          transition-all duration-300 ease-out
          ${isOver ? `${colorConfig.glow} ring-4 ${colorConfig.ring}` : ''}
          ${isFull && !isOver ? 'opacity-50' : ''}
        `}
      >
        {/* 图标 */}
        {IconComponent && (
          <IconComponent className={`${sizeConfig.icon} text-white`} />
        )}

        {/* 短标签（档位数字） */}
        {shortLabel && !IconComponent && (
          <span className={`${sizeConfig.icon.includes('w-6') ? 'text-lg' : 'text-xl'} font-bold text-white`}>
            {shortLabel}
          </span>
        )}

        {/* 悬停时的光晕效果 */}
        {isOver && (
          <div className={`
            absolute inset-0 rounded-2xl
            ${colorConfig.gradient}
            animate-pulse opacity-50
          `} />
        )}

        {/* 已满标记 */}
        {isFull && !isOver && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* 标签 */}
      <span className={`
        mt-2 font-medium ${sizeConfig.label}
        ${colorConfig.text} ${colorConfig.textDark}
        transition-all duration-200
        ${isOver ? 'font-semibold' : ''}
      `}>
        {label}
      </span>

      {/* 数量显示 */}
      {showCount && (
        <span className={`
          ${sizeConfig.count} text-slate-400 dark:text-slate-500
          transition-all duration-200
        `}>
          {capacity !== undefined ? `${count}/${capacity}` : `${count}张`}
        </span>
      )}

      {/* 子内容 */}
      {children}

      {/* 悬停时的指示箭头 */}
      {isOver && (
        <div className={`
          absolute -top-4 left-1/2 -translate-x-1/2
          animate-bounce
        `}>
          <div className={`
            w-0 h-0
            border-l-8 border-r-8 border-b-8
            border-l-transparent border-r-transparent
            border-b-${color === 'green' ? 'green-400' : color === 'red' ? 'red-400' : 'slate-400'}
          `} />
        </div>
      )}
    </div>
  );
}

/** 预分堆专用的大型 DropZone */
export function PreSortDropZone({
  pile,
  label,
  count,
}: {
  pile: 'A' | 'B' | 'C';
  label: string;
  count: number;
}) {
  const config = {
    A: { color: 'green' as ZoneColor, icon: Check },
    B: { color: 'slate' as ZoneColor, icon: Minus },
    C: { color: 'red' as ZoneColor, icon: X },
  };

  return (
    <DropZone
      id={pile}
      label={label}
      color={config[pile].color}
      icon={config[pile].icon}
      count={count}
      size="large"
    />
  );
}

/** 排序档位专用的 DropZone */
export function SlotDropZone({
  slot,
  count,
  capacity,
}: {
  slot: number;
  count: number;
  capacity: number;
}) {
  const colorMap: Record<number, ZoneColor> = {
    4: 'teal',
    3: 'emerald',
    2: 'green',
    1: 'lime',
    0: 'slate',
    [-1]: 'yellow',
    [-2]: 'amber',
    [-3]: 'orange',
    [-4]: 'red',
  };

  const shortLabels: Record<number, string> = {
    4: '+4',
    3: '+3',
    2: '+2',
    1: '+1',
    0: '0',
    [-1]: '-1',
    [-2]: '-2',
    [-3]: '-3',
    [-4]: '-4',
  };

  const labels: Record<number, string> = {
    4: '最像我',
    3: '+3',
    2: '+2',
    1: '+1',
    0: '中性',
    [-1]: '-1',
    [-2]: '-2',
    [-3]: '-3',
    [-4]: '最不像我',
  };

  return (
    <DropZone
      id={`slot-${slot}`}
      label={labels[slot]}
      shortLabel={shortLabels[slot]}
      color={colorMap[slot]}
      count={count}
      capacity={capacity}
      size="small"
    />
  );
}

export default DropZone;