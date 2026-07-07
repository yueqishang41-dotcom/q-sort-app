/**
 * Q-sort 核心类型定义
 * 这些类型定义了整个应用的数据结构基础
 */

// ============ 卡片相关类型 ============

/** 卡片标签类型 - 用于分类和统计分析 */
export type CardTag =
  | 'boundary'    // 边界感
  | 'pleasing'    // 讨好
  | 'fear'        // 恐惧/害怕
  | 'autonomy'    // 自主性
  | 'conflict'    // 冲突回避
  | 'guilt'       // 愧疚感
  | 'worth'       // 自我价值
  | 'intimacy'    // 亲密关系
  | 'control'     // 控制感
  | 'loss'        // 害怕失去
  | 'expression'  // 需求表达
  | 'trust'       // 信任
  | 'perfection'  // 完美主义
  | 'responsibility'; // 责任感

/** 卡片极性倾向（可选，用于辅助分析） */
export type CardPolarity = 'positive' | 'negative' | 'neutral';

/** 卡片敏感度级别 */
export type SensitivityLevel = 'low' | 'medium' | 'high';

/** 单张卡片定义 */
export interface Card {
  id: string;
  text: string;           // 完整文本
  shortText?: string;     // 缩略文本（用于海报等）
  tags: CardTag[];        // 标签数组
  polarity?: CardPolarity;
  sensitivityLevel?: SensitivityLevel;
}

// ============ 主题相关类型 ============

/** 强制分布模板 */
export interface DistributionTemplate {
  slots: number;                    // 档位数量（如 9 档）
  range: [number, number];          // 档位范围（如 [-4, 4]）
  distribution: Record<number, number>; // 每个档位的卡片数量
  totalCards: number;
}

/** 张力规则 - 用于发现冲突结构 */
export interface TensionRule {
  id: string;
  name: string;
  description: string;
  condition: {
    highTags?: CardTag[];    // 高分端出现的标签
    lowTags?: CardTag[];     // 低分端出现的标签
    minScore?: number;       // 高分最低阈值
    maxScore?: number;       // 低分最高阈值
  };
  suggestion: string;        // 建议文案
}

/** 报告规则 */
export interface ReportingRule {
  id: string;
  tagPattern: CardTag[];
  scoreRange: [number, number];
  title: string;
  description: string;
  suggestion: string;
}

/** 主题定义 */
export interface Theme {
  id: string;
  name: string;
  description: string;
  longDescription?: string;    // 详细说明（用于介绍页）
  estimatedTime?: string;      // 预计用时
  cards: Card[];
  recommendedDistribution: DistributionTemplate;
  tensionRules: TensionRule[];
  reportingRules: ReportingRule[];
  disclaimer?: string;         // 特殊免责声明
}

// ============ 会话相关类型 ============

/** 设备信息 */
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
}

/** 预分堆阶段数据 */
export interface PreSortData {
  pileA: string[];    // "更像我"的卡片ID
  pileB: string[];    // "中性/不确定"的卡片ID
  pileC: string[];    // "更不像我"的卡片ID
  completedAt?: number;
}

/** 交互统计 */
export interface InteractionStats {
  dragCount: number;      // 拖拽次数
  swapCount: number;      // 交换次数
  undoCount: number;      // 撤销次数
  redoCount: number;      // 重做次数
  autoFillUsed: boolean;  // 是否使用自动填充
  autoFillCount: number;  // 自动填充次数
  sessionResumed: boolean; // 是否中途恢复
}

/** 历史记录项 */
export interface HistoryEntry {
  slot: number;
  timestamp: number;
  cardId?: string;
  action: 'place' | 'swap' | 'remove' | 'auto_fill';
}

/** 最终放置结果 */
export interface FinalPlacement {
  [cardId: string]: number; // cardId -> slotValue (-4..+4)
}

/** 完整的排序会话 */
export interface SortSession {
  sessionId: string;
  themeId: string;
  startTime: number;
  endTime?: number;
  duration?: number;          // 总用时（秒）
  deviceInfo: DeviceInfo;

  // 阶段数据
  preSort?: PreSortData;
  finalPlacement: FinalPlacement;

  // 交互数据
  interactions: InteractionStats;
  history: HistoryEntry[];

  // 用户标签
  anonymousLabel?: string;    // 匿名标签（如"我的第一次测验"）

  // 完成状态
  isComplete: boolean;
  completedAt?: number;
}

// ============ 分析结果类型 ============

/** 标签分布统计 */
export interface TagDistribution {
  tag: CardTag;
  averageScore: number;
  count: number;
  highCount: number;   // 高分端数量
  lowCount: number;    // 低分端数量
  trend: 'high' | 'low' | 'balanced';
}

/** 张力对 */
export interface TensionPair {
  name: string;
  description: string;
  highTags: CardTag[];
  lowTags: CardTag[];
  suggestion: string;
  severity: 'mild' | 'moderate' | 'strong';
}

/** 分析结果 */
export interface AnalysisResult {
  sessionId: string;
  themeId: string;

  // Top/Bottom 卡片
  topCards: Array<{ card: Card; score: number }>;
  bottomCards: Array<{ card: Card; score: number }>;

  // 标签分析
  tagProfile: TagDistribution[];

  // 张力对
  tensionPairs: TensionPair[];

  // 核心发现
  coreFinding: {
    headline: string;       // 一句话概括
    description: string;
  };

  // 建议文案
  suggestions: string[];

  // 元数据
  analyzedAt: number;
  duration?: number;
}

// ============ 历史对比类型 ============

/** 卡片位置变化 */
export interface CardChange {
  card: Card;
  previousScore: number;
  currentScore: number;
  change: number;  // 变化值（正数表示上升）
}

/** 对比结果 */
export interface ComparisonResult {
  previousSession: string;  // sessionId
  currentSession: string;
  comparedAt: number;

  // 变化最大的卡片
  biggestChanges: CardChange[];

  // 标签趋势变化
  tagTrends: Array<{
    tag: CardTag;
    previousAvg: number;
    currentAvg: number;
    change: number;
  }>;

  // 整体相似度（0-1）
  similarity: number;

  // 变化描述
  changeSummary: string;
}

// ============ UI 状态类型 ============

/** 流程阶段 */
export type SortPhase =
  | 'intro'       // 介绍页
  | 'pre-sort'    // 预分堆
  | 'sorting'     // 强制分布排序
  | 'review'      // 复核
  | 'result'      // 结果页
  | 'history';    // 历史记录

/** 预分堆堆类型 */
export type PreSortPile = 'A' | 'B' | 'C';

/** 槽位状态 */
export interface SlotState {
  slotValue: number;
  capacity: number;
  currentCount: number;
  cardIds: string[];
}

/** 全局状态 */
export interface AppState {
  currentPhase: SortPhase;
  currentTheme: Theme | null;
  currentSession: SortSession | null;
  allSessions: SortSession[];
  isDarkMode: boolean;

  // 动作
  setPhase: (phase: SortPhase) => void;
  setTheme: (theme: Theme) => void;
  startSession: (themeId: string) => void;
  updateSession: (session: Partial<SortSession>) => void;
  completeSession: (label?: string) => void;
  loadSession: (sessionId: string) => void;
  clearAllData: () => void;
  toggleDarkMode: () => void;
}

// ============ 验证相关类型 ============

/** 验证结果 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/** 分布验证 */
export interface DistributionValidation {
  isComplete: boolean;
  missingCards: string[];
  duplicateCards: string[];
  invalidPlacements: Array<{ cardId: string; slot: number; reason: string }>;
  slotOverflow: Array<{ slot: number; expected: number; actual: number }>;
}
