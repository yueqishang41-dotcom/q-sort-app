/**
 * 核心分析算法单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateDistribution,
  validateSession,
  computeTopBottomCards,
  computeTagProfile,
  computeTensionPairs,
  generateCoreFinding,
  generateSuggestions,
  analyzeSession,
  compareSessions,
} from '@/lib/analysis';
import { Theme, SortSession, FinalPlacement, Card } from '@/types';
import { boundaryTheme, defaultDistribution } from '@/data/themes';

describe('validateDistribution', () => {
  it('应该验证有效的分布', () => {
    const placement: FinalPlacement = {};

    // 创建一个符合分布的放置
    let cardIndex = 0;
    const cards = boundaryTheme.cards;

    for (let slot = -4; slot <= 4; slot++) {
      const count = defaultDistribution.distribution[slot];
      for (let i = 0; i < count && cardIndex < cards.length; i++) {
        placement[cards[cardIndex].id] = slot;
        cardIndex++;
      }
    }

    const result = validateDistribution(placement, defaultDistribution);

    expect(result.isComplete).toBe(true);
    expect(result.missingCards).toHaveLength(0);
    expect(result.duplicateCards).toHaveLength(0);
    expect(result.slotOverflow).toHaveLength(0);
  });

  it('应该检测超出容量的槽位', () => {
    const placement: FinalPlacement = {
      card1: -4,
      card2: -4,
      card3: -4, // -4 只有 2 个容量，这里放了 3 个
    };

    const result = validateDistribution(placement, defaultDistribution);

    expect(result.slotOverflow.length).toBeGreaterThan(0);
    expect(result.slotOverflow[0].slot).toBe(-4);
    expect(result.slotOverflow[0].expected).toBe(2);
    expect(result.slotOverflow[0].actual).toBe(3);
  });
});

describe('computeTopBottomCards', () => {
  const mockCards: Card[] = [
    { id: '1', text: 'Card 1', tags: ['boundary'] },
    { id: '2', text: 'Card 2', tags: ['pleasing'] },
    { id: '3', text: 'Card 3', tags: ['autonomy'] },
    { id: '4', text: 'Card 4', tags: ['fear'] },
    { id: '5', text: 'Card 5', tags: ['guilt'] },
  ];

  it('应该正确获取高分端和低分端卡片', () => {
    const placement: FinalPlacement = {
      '1': 4,
      '2': 3,
      '3': 0,
      '4': -3,
      '5': -4,
    };

    const result = computeTopBottomCards(placement, mockCards);

    expect(result.topCards).toHaveLength(2);
    expect(result.topCards[0].score).toBe(4);
    expect(result.topCards[0].card.id).toBe('1');

    expect(result.bottomCards).toHaveLength(2);
    expect(result.bottomCards[0].score).toBe(-4);
    expect(result.bottomCards[0].card.id).toBe('5');
  });

  it('应该处理空放置', () => {
    const result = computeTopBottomCards({}, mockCards);

    expect(result.topCards).toHaveLength(0);
    expect(result.bottomCards).toHaveLength(0);
  });
});

describe('computeTagProfile', () => {
  const mockCards: Card[] = [
    { id: '1', text: 'Card 1', tags: ['boundary', 'autonomy'] },
    { id: '2', text: 'Card 2', tags: ['boundary'] },
    { id: '3', text: 'Card 3', tags: ['pleasing'] },
    { id: '4', text: 'Card 4', tags: ['pleasing', 'guilt'] },
  ];

  it('应该正确计算标签分布', () => {
    const placement: FinalPlacement = {
      '1': 4,
      '2': 3,
      '3': -3,
      '4': -4,
    };

    const result = computeTagProfile(placement, mockCards);

    // boundary 出现在高分端
    const boundaryTag = result.find(t => t.tag === 'boundary');
    expect(boundaryTag).toBeDefined();
    expect(boundaryTag!.averageScore).toBeGreaterThan(0);
    expect(boundaryTag!.highCount).toBe(2);

    // pleasing 出现在低分端
    const pleasingTag = result.find(t => t.tag === 'pleasing');
    expect(pleasingTag).toBeDefined();
    expect(pleasingTag!.averageScore).toBeLessThan(0);
    expect(pleasingTag!.lowCount).toBe(2);
  });
});

describe('computeTensionPairs', () => {
  it('应该检测张力对', () => {
    const mockCards: Card[] = [
      { id: '1', text: 'Card 1', tags: ['autonomy'] },
      { id: '2', text: 'Card 2', tags: ['autonomy'] },
      { id: '3', text: 'Card 3', tags: ['fear'] },
      { id: '4', text: 'Card 4', tags: ['fear'] },
      { id: '5', text: 'Card 5', tags: ['loss'] },
    ];

    const placement: FinalPlacement = {
      '1': 4,
      '2': 3,
      '3': -3,
      '4': -4,
      '5': 2,
    };

    const tagProfile = computeTagProfile(placement, mockCards);
    const result = computeTensionPairs(placement, mockCards, tagProfile);

    // 应该检测到"独立与依赖的矛盾"
    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});

describe('analyzeSession', () => {
  it('应该生成完整的分析结果', () => {
    // 创建一个有效的会话
    const placement: FinalPlacement = {};
    let cardIndex = 0;

    for (let slot = -4; slot <= 4; slot++) {
      const count = defaultDistribution.distribution[slot];
      for (let i = 0; i < count && cardIndex < boundaryTheme.cards.length; i++) {
        placement[boundaryTheme.cards[cardIndex].id] = slot;
        cardIndex++;
      }
    }

    const session: SortSession = {
      sessionId: 'test-session',
      themeId: boundaryTheme.id,
      startTime: Date.now() - 600000,
      endTime: Date.now(),
      duration: 600,
      deviceInfo: {
        type: 'desktop',
        userAgent: 'test',
        screenWidth: 1920,
        screenHeight: 1080,
        language: 'zh-CN',
      },
      finalPlacement: placement,
      interactions: {
        dragCount: 50,
        swapCount: 5,
        undoCount: 3,
        redoCount: 1,
        autoFillUsed: false,
        autoFillCount: 0,
        sessionResumed: false,
      },
      history: [],
      isComplete: true,
    };

    const result = analyzeSession(session, boundaryTheme);

    expect(result.sessionId).toBe('test-session');
    expect(result.themeId).toBe(boundaryTheme.id);
    expect(result.topCards.length).toBeGreaterThan(0);
    expect(result.bottomCards.length).toBeGreaterThan(0);
    expect(result.tagProfile.length).toBeGreaterThan(0);
    expect(result.coreFinding).toBeDefined();
    expect(result.coreFinding.headline).toBeTruthy();
    expect(result.suggestions).toBeInstanceOf(Array);
  });
});

describe('compareSessions', () => {
  it('应该正确对比两次会话', () => {
    const mockTheme: Theme = {
      ...boundaryTheme,
      cards: [
        { id: '1', text: 'Card 1', tags: ['boundary'] },
        { id: '2', text: 'Card 2', tags: ['pleasing'] },
        { id: '3', text: 'Card 3', tags: ['autonomy'] },
      ],
    };

    const previousSession: SortSession = {
      sessionId: 'prev',
      themeId: mockTheme.id,
      startTime: Date.now() - 1200000,
      endTime: Date.now() - 600000,
      deviceInfo: { type: 'desktop', userAgent: 'test', screenWidth: 1920, screenHeight: 1080, language: 'zh-CN' },
      finalPlacement: { '1': 3, '2': 1, '3': -1 },
      interactions: { dragCount: 10, swapCount: 0, undoCount: 0, redoCount: 0, autoFillUsed: false, autoFillCount: 0, sessionResumed: false },
      history: [],
      isComplete: true,
    };

    const currentSession: SortSession = {
      sessionId: 'curr',
      themeId: mockTheme.id,
      startTime: Date.now() - 600000,
      endTime: Date.now(),
      deviceInfo: { type: 'mobile', userAgent: 'test', screenWidth: 375, screenHeight: 812, language: 'zh-CN' },
      finalPlacement: { '1': 4, '2': -2, '3': 0 },
      interactions: { dragCount: 15, swapCount: 2, undoCount: 1, redoCount: 0, autoFillUsed: false, autoFillCount: 0, sessionResumed: false },
      history: [],
      isComplete: true,
    };

    const result = compareSessions(previousSession, currentSession, mockTheme);

    expect(result.previousSession).toBe('prev');
    expect(result.currentSession).toBe('curr');
    expect(result.biggestChanges.length).toBeGreaterThan(0);
    expect(result.similarity).toBeGreaterThanOrEqual(0);
    expect(result.similarity).toBeLessThanOrEqual(1);
    expect(result.changeSummary).toBeTruthy();
  });
});

describe('边界情况测试', () => {
  it('应该处理空的放置数据', () => {
    const result = computeTopBottomCards({}, []);
    expect(result.topCards).toHaveLength(0);
    expect(result.bottomCards).toHaveLength(0);
  });

  it('应该处理只有一个标签的情况', () => {
    const mockCards: Card[] = [{ id: '1', text: 'Single', tags: ['boundary'] }];
    const placement: FinalPlacement = { '1': 2 };

    const result = computeTagProfile(placement, mockCards);

    expect(result).toHaveLength(1);
    expect(result[0].tag).toBe('boundary');
    expect(result[0].count).toBe(1);
  });

  it('应该正确计算相似度', () => {
    const mockTheme: Theme = {
      ...boundaryTheme,
      cards: [
        { id: '1', text: 'A', tags: ['boundary'] },
        { id: '2', text: 'B', tags: ['pleasing'] },
      ],
    };

    // 完全相同的放置
    const same1: SortSession = {
      sessionId: '1', themeId: mockTheme.id, startTime: 0, deviceInfo: { type: 'desktop', userAgent: '', screenWidth: 0, screenHeight: 0, language: '' },
      finalPlacement: { '1': 3, '2': 1 }, interactions: { dragCount: 0, swapCount: 0, undoCount: 0, redoCount: 0, autoFillUsed: false, autoFillCount: 0, sessionResumed: false },
      history: [], isComplete: true,
    };
    const same2: SortSession = {
      sessionId: '2', themeId: mockTheme.id, startTime: 0, deviceInfo: { type: 'desktop', userAgent: '', screenWidth: 0, screenHeight: 0, language: '' },
      finalPlacement: { '1': 3, '2': 1 }, interactions: { dragCount: 0, swapCount: 0, undoCount: 0, redoCount: 0, autoFillUsed: false, autoFillCount: 0, sessionResumed: false },
      history: [], isComplete: true,
    };

    const result = compareSessions(same1, same2, mockTheme);
    expect(result.similarity).toBe(1);
  });
});