import { Theme, DistributionTemplate, TensionRule } from '@/types';

/**
 * 默认强制分布模板
 * 9档分布：-4到+4，共36张卡片
 */
export const defaultDistribution: DistributionTemplate = {
  slots: 9,
  range: [-4, 4],
  distribution: {
    [-4]: 2,
    [-3]: 3,
    [-2]: 4,
    [-1]: 5,
    0: 8,
    1: 5,
    2: 4,
    3: 3,
    4: 2,
  },
  totalCards: 36,
};

/**
 * 张力规则库
 * 用于发现用户内心的冲突结构
 */
export const tensionRules: TensionRule[] = [
  {
    id: 'autonomy-vs-fear',
    name: '独立与恐惧的拉扯',
    description: '渴望独立自主，但内心充满对关系破裂的恐惧',
    condition: {
      highTags: ['autonomy'],
      lowTags: ['fear'],
      minScore: 2,
    },
    suggestion: '您可能在追求独立与维护关系之间感到矛盾。这很常见——试着从小事开始练习"温和而坚定"的边界表达。',
  },
  {
    id: 'pleasing-vs-worth',
    name: '讨好与自我价值的挣扎',
    description: '习惯性满足他人，却在内心质疑自己的价值',
    condition: {
      highTags: ['pleasing'],
      lowTags: ['worth'],
      minScore: 2,
    },
    suggestion: '您的付出值得被看见。试着每天记录一件"为自己做的事"，慢慢重建自我价值感。',
  },
  {
    id: 'boundary-vs-guilt',
    name: '边界与愧疚的困境',
    description: '想要设立边界，却总是被愧疚感阻止',
    condition: {
      highTags: ['boundary'],
      lowTags: ['guilt'],
      minScore: 2,
    },
    suggestion: '设立边界不等于伤害他人。从小事开始练习说"不"，每次成功都是对自己的温柔。',
  },
  {
    id: 'intimacy-vs-loss',
    name: '亲密与害怕失去的矛盾',
    description: '渴望深度连接，却因害怕失去而退缩',
    condition: {
      highTags: ['intimacy'],
      lowTags: ['loss'],
      minScore: 2,
    },
    suggestion: '对失去的恐惧说明您珍视这段关系。试着与信任的人分享这种恐惧，脆弱本身也是一种连接。',
  },
  {
    id: 'expression-vs-conflict',
    name: '表达与回避冲突的困境',
    description: '有需求却不敢表达，害怕引发冲突',
    condition: {
      highTags: ['expression'],
      lowTags: ['conflict'],
      minScore: 2,
    },
    suggestion: '表达需求不必然引发冲突。试着用"我感到...我希望..."的句式，让沟通更加温和清晰。',
  },
  {
    id: 'control-vs-trust',
    name: '控制与信任的张力',
    description: '通过控制来获得安全感，但难以信任他人',
    condition: {
      highTags: ['control'],
      lowTags: ['trust'],
      minScore: 2,
    },
    suggestion: '控制是一种自我保护的方式。试着在小事上让渡一点控制权，体验"被支持"的感觉。',
  },
  {
    id: 'perfection-vs-worth',
    name: '完美主义与自我价值',
    description: '只有做得完美才觉得自己有价值',
    condition: {
      highTags: ['perfection'],
      lowTags: ['worth'],
      minScore: 2,
    },
    suggestion: '您的价值不取决于完美。试着接纳"足够好"，每一次不完美的尝试都是成长。',
  },
  {
    id: 'responsibility-overload',
    name: '过度承担的责任',
    description: '总是觉得自己要为一切负责',
    condition: {
      highTags: ['responsibility'],
      lowTags: ['boundary'],
      minScore: 2,
    },
    suggestion: '您很有责任感，但不必为所有事负责。试着区分"我的责任"和"他人的课题"。',
  },
];

/**
 * 主题1：边界感与讨好
 * 当前默认主题，适合小红书传播讨论
 */
export const boundaryTheme: Theme = {
  id: 'boundary-pleasing',
  name: '边界感与讨好：关系中的自我位置',
  description: '探索你在人际关系中的边界感和讨好倾向，了解自己如何在关系里定位。',
  longDescription: `
这个测评帮助你观察自己在关系中的位置感。通过36张卡片，你可以看到：

• 你如何在关系中定义"我"和"他人"的边界
• 你是否习惯性地把他人需求放在自己之前
• 你在表达需求和设立边界时的舒适程度
• 那些可能让你感到矛盾或纠结的关系模式

这不是诊断工具，而是一面镜子——让你有机会看见并表达自己的关系体验。
  `.trim(),
  estimatedTime: '6-10 分钟',
  disclaimer: '本测评仅供自我反思与科普参考，不构成任何临床诊断或医疗建议。结果会受到你当前的情绪、睡眠、环境等因素影响。',
  cards: [
    // === 自我价值类 ===
    {
      id: 'card-001',
      text: '我觉得只有当我对别人有用时，我才有价值',
      shortText: '有用才有价值',
      tags: ['worth', 'pleasing'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-002',
      text: '我经常担心自己做得不够好，让别人失望',
      shortText: '担心让他人失望',
      tags: ['worth', 'perfection', 'guilt'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-003',
      text: '我认为自己的需求和他人的需求同样重要',
      shortText: '需求平等重要',
      tags: ['worth', 'boundary'],
      polarity: 'positive',
      sensitivityLevel: 'low',
    },
    {
      id: 'card-004',
      text: '当别人夸奖我时，我会觉得不自在或怀疑他们的真诚',
      shortText: '夸奖让我不安',
      tags: ['worth', 'trust'],
      polarity: 'negative',
      sensitivityLevel: 'medium',
    },

    // === 冲突回避类 ===
    {
      id: 'card-005',
      text: '我宁愿妥协也不愿意让关系出现紧张',
      shortText: '宁可妥协',
      tags: ['conflict', 'pleasing', 'boundary'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-006',
      text: '我觉得冲突是可以接受的沟通方式',
      shortText: '冲突可接受',
      tags: ['conflict'],
      polarity: 'positive',
      sensitivityLevel: 'low',
    },
    {
      id: 'card-007',
      text: '我害怕冲突会破坏关系，所以尽量避免',
      shortText: '害怕冲突破坏关系',
      tags: ['conflict', 'fear', 'loss'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-008',
      text: '在冲突中，我能够坚持自己的立场',
      shortText: '冲突中坚持立场',
      tags: ['conflict', 'autonomy', 'boundary'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },

    // === 需求表达类 ===
    {
      id: 'card-009',
      text: '我能够清晰地表达自己的需求和想法',
      shortText: '清晰表达需求',
      tags: ['expression', 'autonomy'],
      polarity: 'positive',
      sensitivityLevel: 'low',
    },
    {
      id: 'card-010',
      text: '我觉得表达自己的需求会给别人添麻烦',
      shortText: '表达需求是麻烦',
      tags: ['expression', 'guilt', 'pleasing'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-011',
      text: '我经常先问别人想吃什么，而不是说自己的想法',
      shortText: '先问别人想法',
      tags: ['expression', 'pleasing'],
      polarity: 'negative',
      sensitivityLevel: 'low',
    },
    {
      id: 'card-012',
      text: '当我有不满时，我会选择合适的时机表达出来',
      shortText: '合适时机表达不满',
      tags: ['expression', 'conflict', 'boundary'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },

    // === 愧疚感类 ===
    {
      id: 'card-013',
      text: '拒绝别人的请求时，我会感到强烈的愧疚',
      shortText: '拒绝会愧疚',
      tags: ['guilt', 'boundary', 'pleasing'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-014',
      text: '我能够接受自己偶尔让别人失望',
      shortText: '接受让人失望',
      tags: ['guilt', 'worth', 'boundary'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-015',
      text: '当别人不开心时，我会觉得是不是自己做错了什么',
      shortText: '担心自己做错',
      tags: ['guilt', 'responsibility', 'pleasing'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-016',
      text: '我正在学习区分哪些愧疚是我的，哪些是别人的',
      shortText: '学习区分愧疚',
      tags: ['guilt', 'boundary', 'autonomy'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },

    // === 拒绝能力类 ===
    {
      id: 'card-017',
      text: '我能够直接说"不"，而不需要找借口',
      shortText: '直接说不',
      tags: ['boundary', 'autonomy'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-018',
      text: '即使我不想，我也很难拒绝别人的邀请或请求',
      shortText: '很难拒绝',
      tags: ['boundary', 'pleasing', 'guilt'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-019',
      text: '我会在心里反复想已经答应的事情是不是应该拒绝',
      shortText: '反复想是否该拒',
      tags: ['boundary', 'guilt', 'expression'],
      polarity: 'negative',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-020',
      text: '我正在练习更从容地面对被拒绝的感受',
      shortText: '练习面对被拒绝',
      tags: ['boundary', 'fear', 'worth'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },

    // === 亲密-独立类 ===
    {
      id: 'card-021',
      text: '我在亲密关系中能够保持自己的独立空间和爱好',
      shortText: '保持独立空间',
      tags: ['autonomy', 'intimacy', 'boundary'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-022',
      text: '我害怕如果展现真实的自己，对方会离开我',
      shortText: '害怕真实自己',
      tags: ['intimacy', 'fear', 'loss'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-023',
      text: '我觉得在关系中失去一部分自我是正常的',
      shortText: '失去自我正常',
      tags: ['autonomy', 'intimacy', 'boundary'],
      polarity: 'negative',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-024',
      text: '我享受亲密关系，同时也在意自己的个人边界',
      shortText: '亲密也有边界',
      tags: ['intimacy', 'boundary', 'autonomy'],
      polarity: 'positive',
      sensitivityLevel: 'low',
    },

    // === 责任感类 ===
    {
      id: 'card-025',
      text: '我经常觉得别人情绪不好是我的责任',
      shortText: '他人情绪是我的责',
      tags: ['responsibility', 'guilt', 'control'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-026',
      text: '我能够区分哪些是我的责任，哪些是别人的选择',
      shortText: '区分责任边界',
      tags: ['responsibility', 'boundary'],
      polarity: 'positive',
      sensitivityLevel: 'low',
    },
    {
      id: 'card-027',
      text: '我总是第一个注意到别人需要帮助的人',
      shortText: '最先发现需求',
      tags: ['responsibility', 'pleasing', 'expression'],
      polarity: 'neutral',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-028',
      text: '我正在学习放下"拯救者"的角色',
      shortText: '放下拯救者',
      tags: ['responsibility', 'boundary', 'autonomy'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },

    // === 控制感类 ===
    {
      id: 'card-029',
      text: '我会提前计划很多事情，因为担心失控',
      shortText: '担心失控',
      tags: ['control', 'fear'],
      polarity: 'negative',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-030',
      text: '我能够接受事情不按照我的预期发展',
      shortText: '接受不如预期',
      tags: ['control', 'trust'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-031',
      text: '让别人帮我做事会让我感到不安',
      shortText: '求助让我不安',
      tags: ['control', 'trust', 'autonomy'],
      polarity: 'negative',
      sensitivityLevel: 'medium',
    },
    {
      id: 'card-032',
      text: '我正在学习信任他人的能力',
      shortText: '学习信任他人',
      tags: ['control', 'trust', 'intimacy'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },

    // === 害怕失去类 ===
    {
      id: 'card-033',
      text: '我害怕如果我设立边界，重要的人会离开我',
      shortText: '边界让人离开',
      tags: ['fear', 'loss', 'boundary'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-034',
      text: '我经常担心失去重要的人',
      shortText: '担心失去重要人',
      tags: ['fear', 'loss', 'intimacy'],
      polarity: 'negative',
      sensitivityLevel: 'high',
    },
    {
      id: 'card-035',
      text: '我相信真正的关系可以承受边界和分歧',
      shortText: '关系能承受分歧',
      tags: ['trust', 'boundary', 'intimacy'],
      polarity: 'positive',
      sensitivityLevel: 'low',
    },
    {
      id: 'card-036',
      text: '我能够接受关系中的不确定性',
      shortText: '接受关系不确定',
      tags: ['trust', 'fear', 'autonomy'],
      polarity: 'positive',
      sensitivityLevel: 'medium',
    },
  ],
  recommendedDistribution: defaultDistribution,
  tensionRules,
  reportingRules: [
    {
      id: 'high-pleasing',
      tagPattern: ['pleasing'],
      scoreRange: [2, 4],
      title: '高度关注他人',
      description: '你似乎很在意他人的感受和需求，这体现了你的关怀能力。',
      suggestion: '试着问问自己：此刻我的需求是什么？把对他人的关注也分一点给自己。',
    },
    {
      id: 'low-boundary',
      tagPattern: ['boundary'],
      scoreRange: [-4, -1],
      title: '边界感需要滋养',
      description: '设立边界可能对你来说是挑战，这并不罕见。',
      suggestion: '从小事开始练习说"我需要考虑一下"，给自己留出空间。',
    },
    {
      id: 'high-autonomy',
      tagPattern: ['autonomy'],
      scoreRange: [2, 4],
      title: '独立自主意识强',
      description: '你有较强的自我意识，能够在关系中保持独立性。',
      suggestion: '在保持独立的同时，也可以尝试让信任的人更靠近一点。',
    },
    {
      id: 'high-guilt',
      tagPattern: ['guilt'],
      scoreRange: [2, 4],
      title: '愧疚感活跃',
      description: '你可能会为很多事情感到愧疚，即使那不完全是你需要承担的。',
      suggestion: '愧疚感提醒你在意他人，但不一定是行动的指令。试着停下来问问：这真的是我的责任吗？',
    },
  ],
};

/**
 * 所有可用主题
 * 目前只有一个主题，但结构支持扩展
 */
export const themes: Theme[] = [
  boundaryTheme,
  // 未来可以添加更多主题
  // {
  //   id: 'work-life-balance',
  //   name: '工作与生活：你的平衡点在哪里',
  //   ...
  // },
];

/**
 * 获取主题
 */
export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id);
}

/**
 * 获取默认主题
 */
export function getDefaultTheme(): Theme {
  return boundaryTheme;
}
