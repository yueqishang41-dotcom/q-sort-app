/**
 * Q-sort 全局状态管理
 * 使用 Zustand 管理应用状态
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
  SortPhase,
  Theme,
  SortSession,
  FinalPlacement,
  PreSortData,
  DeviceInfo,
  InteractionStats,
  PreSortPile,
} from '@/types';
import { getDeviceInfo } from '@/lib/analysis';
import { assignCondition } from '@/lib/experiment';

interface QSortStore {
  // 状态
  currentPhase: SortPhase;
  currentTheme: Theme | null;
  currentSession: SortSession | null;
  allSessions: SortSession[];
  isDarkMode: boolean;
  hasAgreedToDisclaimer: boolean;

  // 撤销/重做栈
  undoStack: FinalPlacement[];
  redoStack: FinalPlacement[];

  // 动作 - 阶段控制
  setPhase: (phase: SortPhase) => void;

  // 动作 - 主题
  setTheme: (theme: Theme) => void;

  // 动作 - 免责声明
  agreeToDisclaimer: () => void;

  // 动作 - 会话
  startSession: (theme: Theme) => void;
  setSortStartTime: (timestamp: number) => void;
  updatePreSort: (pile: PreSortPile, cardIds: string[]) => void;
  moveCardInPreSort: (cardId: string, fromPile: PreSortPile, toPile: PreSortPile) => void;
  completePreSort: () => void;

  // 动作 - 强制分布
  placeCard: (cardId: string, slot: number) => void;
  swapCards: (cardId1: string, cardId2: string) => void;
  removeCard: (cardId: string) => void;
  autoFill: () => void;
  undo: () => void;
  redo: () => void;

  // 动作 - 完成
  completeSession: (label?: string) => void;

  // 动作 - 历史记录
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  clearAllData: () => void;

  // 动作 - 主题
  toggleDarkMode: () => void;

  // 动作 - 交互统计
  incrementDrag: () => void;
  incrementSwap: () => void;
}

export const useQSortStore = create<QSortStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      currentPhase: 'intro',
      currentTheme: null,
      currentSession: null,
      allSessions: [],
      isDarkMode: false,
      hasAgreedToDisclaimer: false,
      undoStack: [],
      redoStack: [],

      // 阶段控制
      setPhase: (phase) => set({ currentPhase: phase }),

      // 主题设置
      setTheme: (theme) => set({ currentTheme: theme }),

      // 免责声明同意
      agreeToDisclaimer: () => set({ hasAgreedToDisclaimer: true }),

      // 开始新会话
      startSession: (theme) => {
        const deviceInfo = getDeviceInfo();
        const sessionId = uuidv4();

        const newSession: SortSession = {
          sessionId,
          themeId: theme.id,
          // 进入实验时随机分配条件：50% control / 50% experimental
          experimentCondition: assignCondition(),
          startTime: Date.now(),
          moveCount: 0,
          deviceInfo,
          finalPlacement: {},
          interactions: {
            dragCount: 0,
            swapCount: 0,
            undoCount: 0,
            redoCount: 0,
            autoFillUsed: false,
            autoFillCount: 0,
            sessionResumed: false,
          },
          history: [],
          isComplete: false,
        };

        set({
          currentTheme: theme,
          currentSession: newSession,
          currentPhase: 'pre-sort',
          undoStack: [],
          redoStack: [],
        });
      },

      // 更新预分堆
      updatePreSort: (pile, cardIds) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const preSort = currentSession.preSort || {
          pileA: [],
          pileB: [],
          pileC: [],
        };

        const newPreSort = { ...preSort };

        // 从所有堆中移除这些卡片
        const cardSet = new Set(cardIds);
        newPreSort.pileA = newPreSort.pileA.filter(id => !cardSet.has(id));
        newPreSort.pileB = newPreSort.pileB.filter(id => !cardSet.has(id));
        newPreSort.pileC = newPreSort.pileC.filter(id => !cardSet.has(id));

        // 添加到目标堆
        if (pile === 'A') newPreSort.pileA = [...newPreSort.pileA, ...cardIds];
        else if (pile === 'B') newPreSort.pileB = [...newPreSort.pileB, ...cardIds];
        else if (pile === 'C') newPreSort.pileC = [...newPreSort.pileC, ...cardIds];

        set({
          currentSession: {
            ...currentSession,
            preSort: newPreSort,
          },
        });
      },

      // 在预分堆中移动卡片
      moveCardInPreSort: (cardId, fromPile, toPile) => {
        const { currentSession } = get();
        if (!currentSession || !currentSession.preSort) return;

        const preSort = { ...currentSession.preSort };

        // 从源堆移除
        if (fromPile === 'A') preSort.pileA = preSort.pileA.filter(id => id !== cardId);
        else if (fromPile === 'B') preSort.pileB = preSort.pileB.filter(id => id !== cardId);
        else if (fromPile === 'C') preSort.pileC = preSort.pileC.filter(id => id !== cardId);

        // 添加到目标堆
        if (toPile === 'A') preSort.pileA = [...preSort.pileA, cardId];
        else if (toPile === 'B') preSort.pileB = [...preSort.pileB, cardId];
        else if (toPile === 'C') preSort.pileC = [...preSort.pileC, cardId];

        set({
          currentSession: {
            ...currentSession,
            preSort,
          },
        });
      },

      // 完成预分堆
      completePreSort: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            preSort: {
              ...currentSession.preSort!,
              completedAt: Date.now(),
            },
          },
          currentPhase: 'sorting',
        });
      },

      // 记录开始排序的时间戳（指导语页点击"开始排序"时调用）
      setSortStartTime: (timestamp) => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            sortStartTime: timestamp,
          },
        });
      },

      // 放置卡片
      placeCard: (cardId, slot) => {
        const { currentSession, undoStack } = get();
        if (!currentSession) return;

        // 保存当前状态到撤销栈
        const newUndoStack = [...undoStack, { ...currentSession.finalPlacement }];

        // 更新放置
        const newPlacement = { ...currentSession.finalPlacement };

        // 如果卡片之前有位置，先移除
        delete newPlacement[cardId];

        // 检查目标槽位是否有其他卡片（需要交换）
        const existingCardId = Object.entries(newPlacement)
          .find(([_, s]) => s === slot)?.[0];

        if (existingCardId) {
          // 交换位置：找到当前卡片的位置
          const currentSlot = currentSession.finalPlacement[cardId];
          if (currentSlot !== undefined) {
            newPlacement[existingCardId] = currentSlot;
          }
        }

        newPlacement[cardId] = slot;

        // 添加历史记录
        const history = [
          ...currentSession.history,
          {
            slot,
            timestamp: Date.now(),
            cardId,
            action: 'place' as const,
          },
        ];

        set({
          currentSession: {
            ...currentSession,
            finalPlacement: newPlacement,
            history,
            moveCount: currentSession.moveCount + 1,
          },
          undoStack: newUndoStack.slice(-50), // 保留最近50步
          redoStack: [], // 清空重做栈
        });
      },

      // 交换卡片
      swapCards: (cardId1, cardId2) => {
        const { currentSession, undoStack } = get();
        if (!currentSession) return;

        const slot1 = currentSession.finalPlacement[cardId1];
        const slot2 = currentSession.finalPlacement[cardId2];

        if (slot1 === undefined || slot2 === undefined) return;

        const newUndoStack = [...undoStack, { ...currentSession.finalPlacement }];

        const newPlacement = { ...currentSession.finalPlacement };
        newPlacement[cardId1] = slot2;
        newPlacement[cardId2] = slot1;

        set({
          currentSession: {
            ...currentSession,
            finalPlacement: newPlacement,
            moveCount: currentSession.moveCount + 1,
            interactions: {
              ...currentSession.interactions,
              swapCount: currentSession.interactions.swapCount + 1,
            },
          },
          undoStack: newUndoStack.slice(-50),
          redoStack: [],
        });
      },

      // 移除卡片
      removeCard: (cardId) => {
        const { currentSession, undoStack } = get();
        if (!currentSession) return;

        const newUndoStack = [...undoStack, { ...currentSession.finalPlacement }];

        const newPlacement = { ...currentSession.finalPlacement };
        delete newPlacement[cardId];

        set({
          currentSession: {
            ...currentSession,
            finalPlacement: newPlacement,
          },
          undoStack: newUndoStack.slice(-50),
          redoStack: [],
        });
      },

      // 自动填充
      autoFill: () => {
        const { currentSession, currentTheme, undoStack } = get();
        if (!currentSession || !currentTheme) return;

        const newUndoStack = [...undoStack, { ...currentSession.finalPlacement }];
        const newPlacement = { ...currentSession.finalPlacement };
        const distribution = currentTheme.recommendedDistribution;

        // 找出未放置的卡片
        const placedCards = new Set(Object.keys(newPlacement));
        const unplacedCards = currentTheme.cards.filter(c => !placedCards.has(c.id));

        // 找出每个槽位的剩余容量
        const slotCounts: Record<number, number> = {};
        for (let i = distribution.range[0]; i <= distribution.range[1]; i++) {
          slotCounts[i] = 0;
        }
        for (const slot of Object.values(newPlacement)) {
          slotCounts[slot]++;
        }

        // 获取预分堆信息（如果有）
        const preSort = currentSession.preSort;

        // 按预分堆倾向排序未放置的卡片
        const sortedUnplaced = [...unplacedCards].sort((a, b) => {
          // 如果有预分堆，优先放置A堆到高分，C堆到低分
          if (preSort) {
            const aInA = preSort.pileA.includes(a.id);
            const aInC = preSort.pileC.includes(a.id);
            const bInA = preSort.pileB.includes(b.id);
            const bInC = preSort.pileC.includes(b.id);

            if (aInA && !bInA) return -1;
            if (!aInA && bInA) return 1;
            if (aInC && !bInC) return 1;
            if (!aInC && bInC) return -1;
          }
          return 0;
        });

        // 从两端向中间填充
        const slots = [];
        for (let i = distribution.range[1]; i >= distribution.range[0]; i--) {
          if (i !== 0) slots.push(i); // 先正数（从大到小）
        }
        for (let i = distribution.range[0]; i <= distribution.range[1]; i++) {
          if (i !== 0 && !slots.includes(i)) slots.push(i); // 再负数（从小到大）
        }
        slots.push(0); // 最后是0

        let cardIndex = 0;
        for (const slot of slots) {
          const capacity = distribution.distribution[slot];
          const current = slotCounts[slot];
          const remaining = capacity - current;

          for (let i = 0; i < remaining && cardIndex < sortedUnplaced.length; i++) {
            const card = sortedUnplaced[cardIndex];
            newPlacement[card.id] = slot;
            cardIndex++;
          }
        }

        set({
          currentSession: {
            ...currentSession,
            finalPlacement: newPlacement,
            interactions: {
              ...currentSession.interactions,
              autoFillUsed: true,
              autoFillCount: currentSession.interactions.autoFillCount + 1,
            },
            history: [
              ...currentSession.history,
              {
                slot: 0,
                timestamp: Date.now(),
                action: 'auto_fill' as const,
              },
            ],
          },
          undoStack: newUndoStack.slice(-50),
          redoStack: [],
        });
      },

      // 撤销
      undo: () => {
        const { currentSession, undoStack, redoStack } = get();
        if (!currentSession || undoStack.length === 0) return;

        const newRedoStack = [...redoStack, { ...currentSession.finalPlacement }];
        const previousPlacement = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);

        set({
          currentSession: {
            ...currentSession,
            finalPlacement: previousPlacement,
            moveCount: currentSession.moveCount + 1,
            interactions: {
              ...currentSession.interactions,
              undoCount: currentSession.interactions.undoCount + 1,
            },
          },
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        });
      },

      // 重做
      redo: () => {
        const { currentSession, undoStack, redoStack } = get();
        if (!currentSession || redoStack.length === 0) return;

        const newUndoStack = [...undoStack, { ...currentSession.finalPlacement }];
        const nextPlacement = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);

        set({
          currentSession: {
            ...currentSession,
            finalPlacement: nextPlacement,
            moveCount: currentSession.moveCount + 1,
            interactions: {
              ...currentSession.interactions,
              redoCount: currentSession.interactions.redoCount + 1,
            },
          },
          undoStack: newUndoStack,
          redoStack: newRedoStack,
        });
      },

      // 完成会话
      completeSession: (label) => {
        const { currentSession, allSessions } = get();
        if (!currentSession) return;

        const now = Date.now();
        // 总用时 = 结束排序时刻 - 开始排序时刻（从指导语页"开始排序"算起）
        const sortStart = currentSession.sortStartTime ?? currentSession.startTime;

        const completedSession: SortSession = {
          ...currentSession,
          endTime: now,
          sortEndTime: now,
          duration: Math.max(0, Math.round((now - sortStart) / 1000)),
          anonymousLabel: label,
          isComplete: true,
          completedAt: now,
        };

        set({
          currentSession: completedSession,
          allSessions: [...allSessions, completedSession],
          currentPhase: 'result',
        });
      },

      // 加载历史会话
      loadSession: (sessionId) => {
        const { allSessions, currentTheme } = get();
        const session = allSessions.find(s => s.sessionId === sessionId);
        if (!session) return;

        set({
          currentSession: {
            ...session,
            interactions: {
              ...session.interactions,
              sessionResumed: true,
            },
          },
          currentPhase: 'result',
        });
      },

      // 删除会话
      deleteSession: (sessionId) => {
        const { allSessions } = get();
        set({
          allSessions: allSessions.filter(s => s.sessionId !== sessionId),
        });
      },

      // 清除所有数据
      clearAllData: () => {
        set({
          currentPhase: 'intro',
          currentTheme: null,
          currentSession: null,
          allSessions: [],
          undoStack: [],
          redoStack: [],
          hasAgreedToDisclaimer: false,
        });
      },

      // 切换深色模式
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      // 增加拖拽计数
      incrementDrag: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            interactions: {
              ...currentSession.interactions,
              dragCount: currentSession.interactions.dragCount + 1,
            },
          },
        });
      },

      // 增加交换计数
      incrementSwap: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        set({
          currentSession: {
            ...currentSession,
            interactions: {
              ...currentSession.interactions,
              swapCount: currentSession.interactions.swapCount + 1,
            },
          },
        });
      },
    }),
    {
      name: 'q-sort-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        allSessions: state.allSessions,
        isDarkMode: state.isDarkMode,
        hasAgreedToDisclaimer: state.hasAgreedToDisclaimer,
      }),
    }
  )
);

// 导出类型
export type { QSortStore };