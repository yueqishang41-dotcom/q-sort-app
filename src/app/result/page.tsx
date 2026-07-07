'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQSortStore } from '@/store';
import { analyzeSession, getTagName, formatDuration } from '@/lib/analysis';
import { toPng } from 'html-to-image';
import {
  ArrowLeft,
  Download,
  Copy,
  Clock,
  RefreshCw,
  History,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Settings,
  Sparkles,
  Target,
  Heart,
  Lightbulb,
  Users,
} from 'lucide-react';

/** 标签中文名映射 */
const TAG_NAMES: Record<string, string> = {
  boundary: '边界感',
  pleasing: '讨好倾向',
  fear: '担忧',
  autonomy: '独立性',
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

/** 标签解读文案 */
const TAG_INSIGHTS: Record<string, { insight: string; tip: string }> = {
  boundary: {
    insight: '边界感决定了你在关系中如何保护自己的空间和需求',
    tip: '试着在小事上练习说"我需要考虑一下"，给自己留出选择的空间',
  },
  pleasing: {
    insight: '讨好倾向反映了你对他人认可的渴望，但过度讨好会让你忽略自己的感受',
    tip: '下次想说"好的"时，先在心里问自己："我真的想要这样做吗？"',
  },
  autonomy: {
    insight: '独立性让你能够在关系中保持自我，但也要注意不要过度孤立',
    tip: '独立和依赖都是正常的需求，关键是找到让你舒适的平衡点',
  },
  guilt: {
    insight: '愧疚感往往来自"我应该做得更好"的自我期待',
    tip: '试着区分"我做的事"和"我是谁"——做错事不代表你是个错的人',
  },
  worth: {
    insight: '自我价值感决定了你是否相信"我本身就值得被好好对待"',
    tip: '每天记录一件你为自己做的事，慢慢重建对自己的关注',
  },
  conflict: {
    insight: '回避冲突可以保护关系表面的和平，但可能积累未表达的感受',
    tip: '冲突不等于伤害，试着用"我感到..."开头表达你的感受',
  },
  expression: {
    insight: '需求表达的能力影响你是否能让他人了解你的真实感受',
    tip: '从小事开始练习：点餐时说出你想吃的，而不是说"随便"',
  },
  trust: {
    insight: '信任能力决定了你是否能允许他人靠近并依赖他们',
    tip: '信任需要时间，可以从让朋友帮你做一件小事开始练习',
  },
};

/** 海报组件 - 小红书友好的竖版海报 */
function Poster({
  session,
  analysis,
  theme,
}: {
  session: any;
  analysis: any;
  theme: any;
}) {
  const topCards = analysis.topCards.slice(0, 3);
  const bottomCards = analysis.bottomCards.slice(-3).reverse();
  const mainTension = analysis.tensionPairs[0];
  const topTags = analysis.tagProfile.filter((t: any) => t.averageScore >= 1).slice(0, 3);
  const bottomTags = analysis.tagProfile.filter((t: any) => t.averageScore <= -1).slice(0, 3);

  return (
    <div
      className="w-[375px] h-[667px] relative overflow-hidden"
      style={{
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      }}
    >
      {/* 装饰背景 */}
      <div className="absolute inset-0">
        <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-white/10" />
        <div className="absolute bottom-[100px] left-[-80px] w-[200px] h-[200px] rounded-full bg-white/10" />
        <div className="absolute bottom-[-50px] right-[-50px] w-[150px] h-[150px] rounded-full bg-white/5" />
      </div>

      {/* 内容区域 */}
      <div className="relative z-10 h-full flex flex-col p-5">
        {/* 顶部标题区 */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1 bg-white/20 rounded-full backdrop-blur-sm mb-2">
            <span className="text-white text-xs font-medium tracking-wider">Q-SORT 自我探索</span>
          </div>
          <h1 className="text-white text-xl font-bold mb-1 drop-shadow-lg">
            {analysis.coreFinding.headline}
          </h1>
          <p className="text-white/80 text-xs">
            {theme.name}
          </p>
        </div>

        {/* 核心发现卡片 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 mb-3 shadow-xl">
          <p className="text-slate-700 text-xs leading-relaxed">
            {analysis.coreFinding.description}
          </p>
        </div>

        {/* 我的特质画像 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white/90 text-xs font-semibold">✨ 我的特质画像</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map((tag: any) => (
              <span
                key={tag.tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-400/90 rounded-full text-white text-xs font-medium"
              >
                <span>✓</span>
                {TAG_NAMES[tag.tag] || tag.tag}
              </span>
            ))}
            {bottomTags.map((tag: any) => (
              <span
                key={tag.tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-400/90 rounded-full text-white text-xs font-medium"
              >
                <span>○</span>
                {TAG_NAMES[tag.tag] || tag.tag}
              </span>
            ))}
          </div>
        </div>

        {/* 最像我 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">✓</span>
            <span className="text-white font-semibold text-xs">最像我</span>
          </div>
          <div className="space-y-1">
            {topCards.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-md"
              >
                <p className="text-slate-700 text-xs font-medium leading-relaxed">
                  {item.card.shortText || item.card.text.slice(0, 40)}
                  {(item.card.shortText || item.card.text.length > 40) && '...'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 最不像我 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-r from-red-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">✗</span>
            <span className="text-white font-semibold text-xs">最不像我</span>
          </div>
          <div className="space-y-1">
            {bottomCards.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-md"
              >
                <p className="text-slate-700 text-xs font-medium leading-relaxed">
                  {item.card.shortText || item.card.text.slice(0, 40)}
                  {(item.card.shortText || item.card.text.length > 40) && '...'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 内心张力 */}
        {mainTension && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-amber-300 text-xs">⚡</span>
              <span className="text-white font-semibold text-xs">内心的小矛盾</span>
            </div>
            <div className="bg-amber-400/90 backdrop-blur-sm rounded-lg px-2.5 py-2 shadow-md">
              <p className="text-white text-xs font-medium leading-relaxed">
                {mainTension.name}：{mainTension.description.slice(0, 50)}...
              </p>
            </div>
          </div>
        )}

        {/* 小建议 */}
        {analysis.suggestions[0] && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 mb-3">
            <p className="text-white text-xs leading-relaxed">
              💡 {analysis.suggestions[0].slice(0, 70)}
              {analysis.suggestions[0].length > 70 && '...'}
            </p>
          </div>
        )}

        {/* 底部信息 */}
        <div className="mt-auto text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="text-white/70 text-[10px]">
              {new Date(session.completedAt || Date.now()).toLocaleDateString('zh-CN')}
              {session.anonymousLabel && ` · ${session.anonymousLabel}`}
            </span>
          </div>
          <p className="text-white/50 text-[10px]">
            仅供自我反思参考 · 非临床诊断 · 受情境影响
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const {
    currentTheme,
    currentSession,
  } = useQSortStore();

  const posterRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showDataDetails, setShowDataDetails] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // 检查是否有有效会话
  if (!currentTheme || !currentSession) {
    router.push('/');
    return null;
  }

  // 分析结果
  const analysis = useMemo(
    () => analyzeSession(currentSession, currentTheme),
    [currentSession, currentTheme]
  );

  // 提取高/低分标签
  const topTags = useMemo(
    () => analysis.tagProfile.filter(t => t.averageScore >= 1).slice(0, 5),
    [analysis]
  );
  const bottomTags = useMemo(
    () => analysis.tagProfile.filter(t => t.averageScore <= -1).slice(0, 5),
    [analysis]
  );

  // 生成小红书文案
  const xiaohongshuText = useMemo(() => {
    const topCards = analysis.topCards.slice(0, 3);
    const bottomCards = analysis.bottomCards.slice(-3).reverse();
    const mainTension = analysis.tensionPairs[0];

    let text = `✨ ${analysis.coreFinding.headline}\n\n`;
    text += `做了一个很有意思的自我探索测评，结果让我对自己有了新的认识～\n\n`;

    // 特质画像
    text += `🌈 我的特质画像：\n`;
    text += `比较突出的：`;
    text += topTags.map(t => TAG_NAMES[t.tag]).join('、');
    text += `\n相对较弱：`;
    text += bottomTags.map(t => TAG_NAMES[t.tag]).join('、');
    text += `\n\n`;

    // 最认同
    text += `💚 最认同的特质：\n`;
    topCards.forEach((item: any, idx: number) => {
      text += `${idx + 1}. ${item.card.shortText || item.card.text.slice(0, 25)}\n`;
    });

    // 最不认同
    text += `\n💔 最不认同的特质：\n`;
    bottomCards.forEach((item: any, idx: number) => {
      text += `${idx + 1}. ${item.card.shortText || item.card.text.slice(0, 25)}\n`;
    });

    // 内心张力
    if (mainTension) {
      text += `\n⚡ 发现内心有个小矛盾：\n`;
      text += `「${mainTension.name}」\n`;
      text += `${mainTension.description.slice(0, 60)}\n\n`;
    }

    // 核心建议
    if (topTags[0] && TAG_INSIGHTS[topTags[0].tag]) {
      const insight = TAG_INSIGHTS[topTags[0].tag];
      text += `💭 关于「${TAG_NAMES[topTags[0].tag]}」的小启发：\n`;
      text += `${insight.insight}\n`;
      text += `💡 小建议：${insight.tip}\n\n`;
    }

    text += `📍 Q-sort是一种心理学研究方法，通过卡片排序帮你发现最核心的自我特征。\n`;
    text += `想试试？可以一周后复测对比，观察自己的变化～\n\n`;

    text += `——\n`;
    text += `⚠️ 声明：本测评仅供自我反思参考，非临床诊断。结果受当下情绪、睡眠、环境等影响。`;

    return text;
  }, [analysis, topTags, bottomTags]);

  // 导出海报
  const handleExportPoster = async () => {
    if (!posterRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `q-sort-result-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 复制文案
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(xiaohongshuText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 格式化时间
  const formatTime = () => {
    if (!currentSession.completedAt) return '';
    const date = new Date(currentSession.completedAt);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回首页</span>
          </button>
          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
          >
            <History className="w-4 h-4" />
            历史记录
          </button>
        </div>
      </nav>

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {/* 核心发现卡片 */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium opacity-90">核心发现</span>
          </div>
          <h1 className="text-2xl font-bold mb-3">
            {analysis.coreFinding.headline}
          </h1>
          <p className="text-white/90 leading-relaxed">
            {analysis.coreFinding.description}
          </p>
        </div>

        {/* 我的特质画像 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              我的特质画像
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            根据你的排序结果，以下特质在你的自我认知中较为突出：
          </p>

          {/* 高分特质 */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">✓</span>
              比较突出的特质
            </h3>
            <div className="flex flex-wrap gap-2">
              {topTags.map((tag) => (
                <div
                  key={tag.tag}
                  className="bg-green-50 dark:bg-green-900/20 rounded-xl px-4 py-3 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-green-700 dark:text-green-300">
                      {TAG_NAMES[tag.tag] || tag.tag}
                    </span>
                    <span className="text-xs text-green-500 dark:text-green-400">
                      +{tag.averageScore.toFixed(1)}
                    </span>
                  </div>
                  {TAG_INSIGHTS[tag.tag] && (
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">
                      {TAG_INSIGHTS[tag.tag].insight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 低分特质 */}
          <div>
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">○</span>
              相对不突出的特质
            </h3>
            <div className="flex flex-wrap gap-2">
              {bottomTags.map((tag) => (
                <div
                  key={tag.tag}
                  className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {TAG_NAMES[tag.tag] || tag.tag}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {tag.averageScore.toFixed(1)}
                    </span>
                  </div>
                  {TAG_INSIGHTS[tag.tag] && (
                    <p className="text-xs text-slate-500/80 dark:text-slate-400/80">
                      {TAG_INSIGHTS[tag.tag].insight}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 具体表现 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              具体表现
            </h2>
          </div>

          {/* Top 卡片 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3">
              ✓ 最像我（+4/+3）—— 这些特质最符合我的自我认知
            </h3>
            <div className="space-y-2">
              {analysis.topCards.slice(0, 5).map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-green-800 dark:text-green-200 flex-1">
                      {item.card.text}
                    </p>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400 ml-2">
                      +{item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 卡片 */}
          <div>
            <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
              ✗ 最不像我（-4/-3）—— 这些特质与我的自我认知差异较大
            </h3>
            <div className="space-y-2">
              {analysis.bottomCards.slice(-5).reverse().map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-red-800 dark:text-red-200 flex-1">
                      {item.card.text}
                    </p>
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 ml-2">
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 内心张力 */}
        {analysis.tensionPairs.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                内心的小矛盾
              </h2>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              根据你的排序，系统发现了一些可能存在的内在张力——这些矛盾不是问题，而是值得观察和理解的自我模式。
            </p>

            <div className="space-y-4">
              {analysis.tensionPairs.map((tension, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-500">⚡</span>
                    <p className="text-base font-semibold text-amber-800 dark:text-amber-200">
                      {tension.name}
                    </p>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-3 leading-relaxed">
                    {tension.description}
                  </p>
                  <div className="bg-amber-100/50 dark:bg-amber-800/30 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>💡 小建议：</strong>
                      <span className="ml-1">{tension.suggestion}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 自我观察建议 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              自我观察建议
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            以下建议基于你的排序结果，帮助你更好地观察和理解自己。这不是改变的要求，只是温和的邀请。
          </p>

          <div className="space-y-3">
            {analysis.suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3"
              >
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500 text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {suggestion}
                </p>
              </div>
            ))}
          </div>

          {/* 针对高分特质的个性化建议 */}
          {topTags[0] && TAG_INSIGHTS[topTags[0].tag] && (
            <div className="mt-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 border border-primary-200 dark:border-primary-800">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
                关于「{TAG_NAMES[topTags[0].tag]}」的深入理解
              </p>
              <p className="text-xs text-primary-600 dark:text-primary-400 mb-3">
                {TAG_INSIGHTS[topTags[0].tag].insight}
              </p>
              <p className="text-xs text-primary-700 dark:text-primary-300 italic">
                💡 {TAG_INSIGHTS[topTags[0].tag].tip}
              </p>
            </div>
          )}
        </div>

        {/* 特质分布图 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              特质分布详情
            </h2>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            每个特质在 -4 到 +4 的范围内，数值越高表示你越认同该特质描述。
          </p>

          <div className="space-y-3">
            {analysis.tagProfile.map((tag: any) => (
              <div key={tag.tag} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 dark:text-slate-400 w-24 flex-shrink-0">
                  {TAG_NAMES[tag.tag] || tag.tag}
                </span>
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                  {/* 中心线 */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 dark:bg-slate-600" />
                  {/* 值条 */}
                  <div
                    className={`absolute h-full rounded-full transition-all ${
                      tag.averageScore > 0
                        ? 'bg-gradient-to-r from-green-400 to-green-500'
                        : tag.averageScore < 0
                        ? 'bg-gradient-to-r from-red-400 to-red-500'
                        : 'bg-slate-400'
                    }`}
                    style={{
                      width: `${Math.min(50, Math.abs(tag.averageScore) * 12.5)}%`,
                      left: tag.averageScore >= 0 ? '50%' : `${50 - Math.min(50, Math.abs(tag.averageScore) * 12.5)}%`,
                    }}
                  />
                </div>
                <span className={`text-xs font-medium w-8 text-right ${
                  tag.averageScore > 0 ? 'text-green-600 dark:text-green-400' :
                  tag.averageScore < 0 ? 'text-red-600 dark:text-red-400' :
                  'text-slate-500'
                }`}>
                  {tag.averageScore > 0 ? '+' : ''}{tag.averageScore.toFixed(1)}
                </span>
              </div>
            ))}
          </div>

          {/* 分布说明 */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded bg-gradient-to-r from-green-400 to-green-500" />
              <span>较突出</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded bg-slate-400" />
              <span>中性</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-2 rounded bg-gradient-to-r from-red-400 to-red-500" />
              <span>不突出</span>
            </div>
          </div>
        </div>

        {/* 海报导出区域（隐藏） */}
        <div className="fixed -left-[9999px] top-0">
          <div ref={posterRef}>
            <Poster
              session={currentSession}
              analysis={analysis}
              theme={currentTheme}
            />
          </div>
        </div>

        {/* 分享操作 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              分享与导出
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handleExportPoster}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-all"
            >
              <Download className="w-5 h-5" />
              {isExporting ? '导出中...' : '下载海报'}
            </button>
            <button
              onClick={handleCopyText}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              <Copy className="w-5 h-5" />
              {copiedText ? '已复制' : '复制文案'}
            </button>
          </div>

          {/* 小红书文案预览 */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              小红书分享文案预览
            </p>
            <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
              {xiaohongshuText.slice(0, 300)}...
            </pre>
          </div>
        </div>

        {/* 数据透明区 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden mb-6">
          <button
            onClick={() => setShowDataDetails(!showDataDetails)}
            className="w-full px-6 py-4 flex items-center justify-between text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <span className="text-sm font-semibold">📋 数据透明区</span>
            {showDataDetails ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showDataDetails && (
            <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                    测评时间
                  </p>
                  <p>{formatTime()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                    用时
                  </p>
                  <p>{formatDuration(currentSession.duration || 0)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                    设备类型
                  </p>
                  <p>
                    {currentSession.deviceInfo.type === 'mobile'
                      ? '移动端'
                      : currentSession.deviceInfo.type === 'tablet'
                      ? '平板'
                      : '桌面端'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">
                    是否使用自动填充
                  </p>
                  <p>{currentSession.interactions.autoFillUsed ? '是' : '否'}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  交互统计
                </p>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {currentSession.interactions.dragCount}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500">拖拽</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {currentSession.interactions.swapCount}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500">交换</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {currentSession.interactions.undoCount}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500">撤销</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      {currentSession.interactions.redoCount}
                    </p>
                    <p className="text-slate-400 dark:text-slate-500">重做</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>强制分布说明：</strong>
                  本次测评采用 9 档分布（-4 到 +4），共 36 张卡片，每档卡片数量固定。
                  这要求你在取舍中发现核心特质，避免"全选"倾向。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 免责声明 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-1">重要提醒</p>
              <ul className="text-xs space-y-1">
                <li>• 本测评仅供自我反思与科普参考，非临床诊断</li>
                <li>• 结果受你当前的情绪、睡眠、环境等因素影响</li>
                <li>• 建议一周后在相似状态下复测对比</li>
                <li>• 如有心理困扰，请寻求专业帮助</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 rounded-xl font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            再测一次
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="w-full py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-5 h-5" />
            设置与隐私
          </button>
        </div>
      </div>
    </main>
  );
}