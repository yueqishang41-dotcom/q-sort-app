/**
 * Q-sort 核心分析算法
 * 包含所有数据校验、分析和对比功能
 */

import {
  Card,
  Theme,
  SortSession,
  FinalPlacement,
  DistributionTemplate,
  ValidationResult,
  DistributionValidation,
  AnalysisResult,
  TagDistribution,
  TensionPair,
  ComparisonResult,
  CardChange,
  CardTag,
} from '@/types';

// ============ 校验函数 ============

/**
 * 校验最终放置是否符合强制分布
 */
export function validateDistribution(
  placement: FinalPlacement,
  template: DistributionTemplate
): DistributionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingCards: string[] = [];
  const duplicateCards: string[] = [];
  const invalidPlacements: Array<{ cardId: string; slot: number; reason: string }> = [];
  const slotOverflow: Array<{ slot: number; expected: number; actual: number }> = [];

  // 统计每个槽位的卡片数量
  const slotCounts: Record<number, string[]> = {};
  for (let i = template.range[0]; i <= template.range[1]; i++) {
    slotCounts[i] = [];
  }

  // 收集所有已放置的卡片
  const placedCards = new Set<string>();

  for (const [cardId, slot] of Object.entries(placement)) {
    // 检查槽位是否有效
    if (slot < template.range[0] || slot > template.range[1]) {
      invalidPlacements.push({
        cardId,
        slot,
        reason: `槽位 ${slot} 超出范围 [${template.range[0]}, ${template.range[1]}]`,
      });
      continue;
    }

    // 检查重复放置
    if (placedCards.has(cardId)) {
      duplicateCards.push(cardId);
      continue;
    }

    placedCards.add(cardId);
    slotCounts[slot].push(cardId);
  }

  // 检查每个槽位是否超出容量
  for (const [slotStr, cards] of Object.entries(slotCounts)) {
    const slot = parseInt(slotStr);
    const expected = template.distribution[slot] || 0;
    const actual = cards.length;

    if (actual > expected) {
      slotOverflow.push({ slot, expected, actual });
    }
  }

  // 检查是否所有卡片都已放置
  // 注意：这里需要传入完整的卡片ID列表
  // 在实际使用中，应该从主题获取卡片列表

  const isValid =
    invalidPlacements.length === 0 &&
    duplicateCards.length === 0 &&
    slotOverflow.length === 0;

  return {
    isComplete: missingCards.length === 0 && isValid,
    missingCards,
    duplicateCards,
    invalidPlacements,
    slotOverflow,
  };
}

/**
 * 校验会话数据完整性
 */
export function validateSession(session: SortSession, theme: Theme): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 检查卡片覆盖
  const placedCards = new Set(Object.keys(session.finalPlacement));
  const allCards = new Set(theme.cards.map(c => c.id));

  const missing = [...allCards].filter(id => !placedCards.has(id));
  const extra = [...placedCards].filter(id => !allCards.has(id));

  if (missing.length > 0) {
    errors.push(`缺少 ${missing.length} 张卡片的放置`);
  }
  if (extra.length > 0) {
    errors.push(`发现 ${extra.length} 张无效卡片ID`);
  }

  // 检查分布
  const distributionValidation = validateDistribution(
    session.finalPlacement,
    theme.recommendedDistribution
  );

  if (distributionValidation.slotOverflow.length > 0) {
    errors.push('槽位容量超出限制');
  }

  if (distributionValidation.duplicateCards.length > 0) {
    errors.push('存在重复放置的卡片');
  }

  // 检查预分堆数据
  if (session.preSort) {
    const preSortCards = [
      ...session.preSort.pileA,
      ...session.preSort.pileB,
      ...session.preSort.pileC,
    ];
    const preSortSet = new Set(preSortCards);

    if (preSortCards.length !== allCards.size) {
      warnings.push('预分堆卡片数量不完整');
    }

    if (preSortSet.size !== preSortCards.length) {
      warnings.push('预分堆中存在重复卡片');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============ 分析函数 ============

/**
 * 获取高分端和低分端的卡片
 */
export function computeTopBottomCards(
  placement: FinalPlacement,
  cards: Card[],
  topThreshold = 2,
  bottomThreshold = -2
): {
  topCards: Array<{ card: Card; score: number }>;
  bottomCards: Array<{ card: Card; score: number }>;
} {
  const cardMap = new Map(cards.map(c => [c.id, c]));

  const placements = Object.entries(placement)
    .map(([cardId, score]) => ({
      card: cardMap.get(cardId)!,
      score,
    }))
    .filter(p => p.card); // 过滤无效卡片

  const topCards = placements
    .filter(p => p.score >= topThreshold)
    .sort((a, b) => b.score - a.score);

  const bottomCards = placements
    .filter(p => p.score <= bottomThreshold)
    .sort((a, b) => a.score - b.score);

  return { topCards, bottomCards };
}

/**
 * 计算标签分布统计
 */
export function computeTagProfile(
  placement: FinalPlacement,
  cards: Card[]
): TagDistribution[] {
  const cardMap = new Map(cards.map(c => [c.id, c]));

  // 收集所有标签
  const allTags = new Set<CardTag>();
  cards.forEach(c => c.tags.forEach(t => allTags.add(t)));

  const tagStats: Map<CardTag, {
    scores: number[];
    highCount: number;
    lowCount: number;
  }> = new Map();

  // 初始化
  allTags.forEach(tag => {
    tagStats.set(tag, { scores: [], highCount: 0, lowCount: 0 });
  });

  // 统计
  for (const [cardId, score] of Object.entries(placement)) {
    const card = cardMap.get(cardId);
    if (!card) continue;

    card.tags.forEach(tag => {
      const stats = tagStats.get(tag)!;
      stats.scores.push(score);

      if (score >= 2) stats.highCount++;
      if (score <= -2) stats.lowCount++;
    });
  }

  // 计算结果
  const results: TagDistribution[] = [];

  tagStats.forEach((stats, tag) => {
    const averageScore = stats.scores.length > 0
      ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
      : 0;

    let trend: 'high' | 'low' | 'balanced' = 'balanced';
    if (averageScore >= 1) trend = 'high';
    else if (averageScore <= -1) trend = 'low';

    results.push({
      tag,
      averageScore,
      count: stats.scores.length,
      highCount: stats.highCount,
      lowCount: stats.lowCount,
      trend,
    });
  });

  // 按平均分排序
  return results.sort((a, b) => b.averageScore - a.averageScore);
}

/**
 * 计算张力对（冲突结构）
 */
export function computeTensionPairs(
  placement: FinalPlacement,
  cards: Card[],
  tagProfile: TagDistribution[]
): TensionPair[] {
  const cardMap = new Map(cards.map(c => [c.id, c]));
  const tensionPairs: TensionPair[] = [];

  // 获取每个标签的平均分
  const tagScores = new Map(tagProfile.map(t => [t.tag, t.averageScore]));

  // 获取高分端和低分端的标签
  const highTags = tagProfile.filter(t => t.averageScore >= 1).map(t => t.tag);
  const lowTags = tagProfile.filter(t => t.averageScore <= -1).map(t => t.tag);

  // 计算每个标签在极端位置的卡片数量
  const getTagExtremes = (tag: CardTag, isHigh: boolean) => {
    let count = 0;
    for (const [cardId, score] of Object.entries(placement)) {
      const card = cardMap.get(cardId);
      if (card && card.tags.includes(tag)) {
        if (isHigh && score >= 2) count++;
        if (!isHigh && score <= -2) count++;
      }
    }
    return count;
  };

  // 定义张力规则
  const tensionRules = [
    {
      name: '独立与依赖的矛盾',
      check: () => {
        const autonomyScore = tagScores.get('autonomy') || 0;
        const fearScore = tagScores.get('fear') || 0;
        const lossScore = tagScores.get('loss') || 0;

        if (autonomyScore >= 1 && (fearScore >= 1 || lossScore >= 1)) {
          return {
            name: '独立与依赖的矛盾',
            description: '你既渴望独立自主，又担心失去重要的关系。这种拉扯是很多人都会经历的心路历程。',
            highTags: ['autonomy'] as CardTag[],
            lowTags: ['fear', 'loss'] as CardTag[],
            suggestion: '独立和依赖并不矛盾。试着在关系中找到"安全的独立"——保持自我，同时也允许自己被支持。',
            severity: Math.abs(autonomyScore) + Math.abs(fearScore) > 4 ? 'strong' : 'moderate',
          };
        }
        return null;
      },
    },
    {
      name: '付出与获得的失衡',
      check: () => {
        const pleasingScore = tagScores.get('pleasing') || 0;
        const worthScore = tagScores.get('worth') || 0;

        if (pleasingScore >= 1 && worthScore <= -1) {
          return {
            name: '付出与获得的失衡',
            description: '你习惯付出和照顾他人，但可能忽略了自己的价值。长此以往，容易感到疲惫和委屈。',
            highTags: ['pleasing'] as CardTag[],
            lowTags: ['worth'] as CardTag[],
            suggestion: '你的付出是有价值的。试着每天对自己说：我值得被好好对待，不需要通过付出来证明。',
            severity: pleasingScore >= 2 ? 'strong' : 'moderate',
          };
        }
        return null;
      },
    },
    {
      name: '边界与愧疚的困境',
      check: () => {
        const boundaryScore = tagScores.get('boundary') || 0;
        const guiltScore = tagScores.get('guilt') || 0;

        if (boundaryScore <= -1 && guiltScore >= 1) {
          return {
            name: '边界与愧疚的困境',
            description: '设立边界时会感到强烈的愧疚，这可能让你在很多事情上难以说"不"。',
            highTags: ['guilt'] as CardTag[],
            lowTags: ['boundary'] as CardTag[],
            suggestion: '愧疚不等于做错了。设立边界是在保护关系，而不是伤害它。试着从小事开始练习。',
            severity: guiltScore >= 2 ? 'strong' : 'moderate',
          };
        }
        return null;
      },
    },
    {
      name: '亲密与恐惧的拉扯',
      check: () => {
        const intimacyScore = tagScores.get('intimacy') || 0;
        const trustScore = tagScores.get('trust') || 0;
        const lossScore = tagScores.get('loss') || 0;

        if (intimacyScore >= 0 && trustScore <= -1 && lossScore >= 1) {
          return {
            name: '亲密与恐惧的拉扯',
            description: '你可能渴望亲密关系，但同时又害怕被伤害或失去。这种矛盾让你在关系中犹豫不决。',
            highTags: ['loss'] as CardTag[],
            lowTags: ['trust'] as CardTag[],
            suggestion: '你的恐惧是合理的，是保护自己的方式。试着慢慢建立信任，让关系有成长的空间。',
            severity: 'moderate',
          };
        }
        return null;
      },
    },
    {
      name: '表达与压抑的循环',
      check: () => {
        const expressionScore = tagScores.get('expression') || 0;
        const conflictScore = tagScores.get('conflict') || 0;

        if (expressionScore <= -1 && conflictScore <= -1) {
          return {
            name: '表达与压抑的循环',
            description: '你可能习惯压抑自己的需求和不满，担心表达会带来冲突或破坏关系。',
            highTags: [] as CardTag[],
            lowTags: ['expression', 'conflict'] as CardTag[],
            suggestion: '真实的表达不会破坏关系，反而会让关系更深入。试着用"我感到..."句式表达自己。',
            severity: 'mild',
          };
        }
        return null;
      },
    },
  ];

  // 应用规则
  for (const rule of tensionRules) {
    const result = rule.check();
    if (result) {
      tensionPairs.push(result as TensionPair);
    }
  }

  return tensionPairs;
}

/**
 * 生成核心发现
 */
export function generateCoreFinding(
  topCards: Array<{ card: Card; score: number }>,
  bottomCards: Array<{ card: Card; score: number }>,
  tagProfile: TagDistribution[],
  tensionPairs: TensionPair[]
): { headline: string; description: string } {
  // 获取最突出的标签
  const topTags = tagProfile.filter(t => t.averageScore >= 1).slice(0, 3);
  const bottomTags = tagProfile.filter(t => t.averageScore <= -1).slice(0, 3);

  // 根据张力对生成核心发现
  if (tensionPairs.length > 0) {
    const mainTension = tensionPairs[0];
    return {
      headline: mainTension.name,
      description: mainTension.description,
    };
  }

  // 如果没有明显的张力对，根据标签生成
  if (topTags.length > 0) {
    const mainTag = topTags[0];
    const tagNames: Record<CardTag, string> = {
      boundary: '边界意识',
      pleasing: '对他人关注',
      fear: '担忧',
      autonomy: '独立性',
      conflict: '冲突应对',
      guilt: '愧疚感',
      worth: '自我价值感',
      intimacy: '亲密关系',
      control: '控制感',
      loss: '对失去的恐惧',
      expression: '自我表达',
      trust: '信任能力',
      perfection: '完美主义',
      responsibility: '责任感',
    };

    return {
      headline: `你的${tagNames[mainTag.tag] || mainTag.tag}较突出`,
      description: `在这次排序中，与"${tagNames[mainTag.tag]}"相关的卡片较多地出现在你认同的位置。这只是当下的一个切面，会随着时间和经历而变化。`,
    };
  }

  // 默认
  return {
    headline: '正在探索关系中的自己',
    description: '你的排序呈现出一个独特的模式。建议回顾高分和低分的卡片，看看它们反映了什么。',
  };
}

/**
 * 生成建议
 */
export function generateSuggestions(
  tagProfile: TagDistribution[],
  tensionPairs: TensionPair[]
): string[] {
  const suggestions: string[] = [];

  // 从张力对提取建议
  tensionPairs.forEach(tension => {
    suggestions.push(tension.suggestion);
  });

  // 根据标签生成补充建议
  const lowTags = tagProfile.filter(t => t.averageScore <= -1);

  lowTags.forEach(tag => {
    const tagSuggestions: Partial<Record<CardTag, string>> = {
      boundary: '设立边界是一种爱自己和他人的方式。从小事开始练习。',
      worth: '你的价值不需要证明。试着每天对自己说一件自己做得好的事。',
      expression: '你的需求和感受同样重要。找一个信任的人练习表达。',
      trust: '信任需要时间慢慢建立。不必急于信任所有人，可以从小事开始。',
      autonomy: '独立是一种能力，但不必独自承担一切。允许自己偶尔依赖他人。',
    };

    if (tagSuggestions[tag.tag]) {
      suggestions.push(tagSuggestions[tag.tag]!);
    }
  });

  // 去重
  return [...new Set(suggestions)].slice(0, 3);
}

/**
 * 完整分析
 */
export function analyzeSession(session: SortSession, theme: Theme): AnalysisResult {
  const { topCards, bottomCards } = computeTopBottomCards(
    session.finalPlacement,
    theme.cards
  );

  const tagProfile = computeTagProfile(session.finalPlacement, theme.cards);

  const tensionPairs = computeTensionPairs(
    session.finalPlacement,
    theme.cards,
    tagProfile
  );

  const coreFinding = generateCoreFinding(topCards, bottomCards, tagProfile, tensionPairs);

  const suggestions = generateSuggestions(tagProfile, tensionPairs);

  return {
    sessionId: session.sessionId,
    themeId: theme.id,
    topCards: topCards.slice(0, 5),
    bottomCards: bottomCards.slice(-5),
    tagProfile,
    tensionPairs,
    coreFinding,
    suggestions,
    analyzedAt: Date.now(),
    duration: session.duration,
  };
}

// ============ 对比函数 ============

/**
 * 对比两次会话
 */
export function compareSessions(
  previousSession: SortSession,
  currentSession: SortSession,
  theme: Theme
): ComparisonResult {
  const cardMap = new Map(theme.cards.map(c => [c.id, c]));

  // 计算每张卡片的变化
  const changes: CardChange[] = [];

  for (const card of theme.cards) {
    const prevScore = previousSession.finalPlacement[card.id] ?? 0;
    const currScore = currentSession.finalPlacement[card.id] ?? 0;

    if (prevScore !== currScore) {
      changes.push({
        card,
        previousScore: prevScore,
        currentScore: currScore,
        change: currScore - prevScore,
      });
    }
  }

  // 按变化幅度排序
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // 计算标签趋势
  const prevTagProfile = computeTagProfile(previousSession.finalPlacement, theme.cards);
  const currTagProfile = computeTagProfile(currentSession.finalPlacement, theme.cards);

  const tagTrends = prevTagProfile.map(prev => {
    const curr = currTagProfile.find(t => t.tag === prev.tag)!;
    return {
      tag: prev.tag,
      previousAvg: prev.averageScore,
      currentAvg: curr.averageScore,
      change: curr.averageScore - prev.averageScore,
    };
  }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  // 计算整体相似度
  let totalDiff = 0;
  for (const card of theme.cards) {
    const prevScore = previousSession.finalPlacement[card.id] ?? 0;
    const currScore = currentSession.finalPlacement[card.id] ?? 0;
    totalDiff += Math.abs(prevScore - currScore);
  }

  const maxDiff = theme.cards.length * 8; // 最大可能差异
  const similarity = 1 - (totalDiff / maxDiff);

  // 生成变化描述
  const biggestChange = changes[0];
  let changeSummary = '两次测评结果相似度较高。';

  if (changes.length > 0 && biggestChange) {
    const direction = biggestChange.change > 0 ? '上升' : '下降';
    const tagNames: Record<CardTag, string> = {
      boundary: '边界意识',
      pleasing: '对他人关注',
      fear: '担忧',
      autonomy: '独立性',
      conflict: '冲突应对',
      guilt: '愧疚感',
      worth: '自我价值感',
      intimacy: '亲密关系',
      control: '控制感',
      loss: '对失去的恐惧',
      expression: '自我表达',
      trust: '信任能力',
      perfection: '完美主义',
      responsibility: '责任感',
    };

    changeSummary = `变化最大的是"${biggestChange.card.shortText || biggestChange.card.text.slice(0, 20)}"，从${biggestChange.previousScore}${direction}到${biggestChange.currentScore}。`;

    if (tagTrends.length > 0 && Math.abs(tagTrends[0].change) >= 0.5) {
      const mainTrend = tagTrends[0];
      const trendDir = mainTrend.change > 0 ? '增强' : '减弱';
      changeSummary += ` ${tagNames[mainTrend.tag] || mainTrend.tag}整体呈${trendDir}趋势。`;
    }
  }

  return {
    previousSession: previousSession.sessionId,
    currentSession: currentSession.sessionId,
    comparedAt: Date.now(),
    biggestChanges: changes.slice(0, 5),
    tagTrends,
    similarity,
    changeSummary,
  };
}

// ============ 辅助函数 ============

/**
 * 获取设备类型
 */
export function getDeviceInfo(): {
  type: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
} {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      type: 'desktop',
      userAgent: 'server',
      screenWidth: 1920,
      screenHeight: 1080,
      language: 'zh-CN',
    };
  }

  const userAgent = navigator.userAgent;
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const language = navigator.language;

  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  if (/mobile/i.test(userAgent)) {
    type = 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    type = 'tablet';
  } else if (screenWidth < 768) {
    type = 'mobile';
  } else if (screenWidth < 1024) {
    type = 'tablet';
  }

  return {
    type,
    userAgent,
    screenWidth,
    screenHeight,
    language,
  };
}

/**
 * 格式化时长
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}分钟`;
  }
  return `${minutes}分${remainingSeconds}秒`;
}

/**
 * 获取标签中文名
 */
export function getTagName(tag: CardTag): string {
  const names: Record<CardTag, string> = {
    boundary: '边界感',
    pleasing: '讨好倾向',
    fear: '恐惧担忧',
    autonomy: '自主独立',
    conflict: '冲突回避',
    guilt: '愧疚感',
    worth: '自我价值',
    intimacy: '亲密关系',
    control: '控制感',
    loss: '失去恐惧',
    expression: '需求表达',
    trust: '信任能力',
    perfection: '完美主义',
    responsibility: '责任感',
  };
  return names[tag] || tag;
}