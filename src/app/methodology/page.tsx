'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  Target,
  RefreshCw,
  Heart,
  AlertTriangle,
} from 'lucide-react';

export default function MethodologyPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-8">
      {/* 顶部导航 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="font-semibold text-slate-900 dark:text-white">
            方法说明
          </h1>
          <div className="w-12" />
        </div>
      </nav>

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <BookOpen className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Q-sort 是什么？
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            了解这个研究方法的核心思想和正确使用方式
          </p>
        </div>

        {/* 核心思想 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              核心思想
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              Q-sort（Q 分类）是一种来自心理学研究的方法，让参与者通过卡片排序来表达"我是什么样的人"。
            </p>
            <p>
              与传统问卷不同，Q-sort 要求你<strong className="text-slate-900 dark:text-white">在有限的选项中做出取舍</strong>，
              这能帮助你发现自己的核心特质，而不是简单地"全选"或"都不选"。
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm italic">
                "它不是问你'你是否具有这个特质'，而是让你在众多特质中选出'最像你'和'最不像你'的那几个。"
              </p>
            </div>
          </div>
        </div>

        {/* 为什么强制分布 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Layers className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              为什么是"强制分布"？
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              在传统问卷中，我们经常遇到一个问题：<strong className="text-slate-900 dark:text-white">全选倾向</strong>。
              "我觉得每条都像我"或"每条都不像我"——这样的回答很难反映真实的特质优先级。
            </p>
            <p>
              强制分布就像生活中真实的取舍：我们确实有各种特质，但<strong className="text-slate-900 dark:text-white">某些特质比其他更重要、更核心</strong>。
              通过限制每个档位的卡片数量，Q-sort 帮助我们发现那些最核心的部分。
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">-4</p>
                <p className="text-xs text-red-500 dark:text-red-400">最不像我</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">仅2张</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400">0</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">中性</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">最多8张</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">+4</p>
                <p className="text-xs text-green-500 dark:text-green-400">最像我</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">仅2张</p>
              </div>
            </div>
          </div>
        </div>

        {/* 不是诊断 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h2 className="text-lg font-semibold text-amber-800 dark:text-amber-200">
              这不是诊断
            </h2>
          </div>
          <div className="space-y-3 text-amber-700 dark:text-amber-300">
            <p>
              Q-sort 是一种<strong>自我观察和表达的工具</strong>，不是临床诊断工具。
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>它不给你贴标签、下结论</li>
              <li>它不判定你"正常"或"不正常"</li>
              <li>它只是帮你看见当下的自我认知状态</li>
            </ul>
            <p className="text-sm">
              如果你正在经历心理困扰，建议寻求专业心理咨询师或医生的帮助。
              本工具不能替代专业评估和治疗。
            </p>
          </div>
        </div>

        {/* 复测与情境 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              复测与情境影响
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <p>
              你的 Q-sort 结果会受到<strong className="text-slate-900 dark:text-white">当下情境</strong>的影响：
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">情绪</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">当下心情状态</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">睡眠</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">休息是否充足</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">环境</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">测评时的场所</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">经历</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">近期发生的事</p>
              </div>
            </div>
            <p>
              这不是缺点——<strong className="text-slate-900 dark:text-white">这正是 Q-sort 的价值所在</strong>。
              它捕捉的是你"此刻"的自我认知，而不是一个固定的"人格类型"。
            </p>
            <p className="text-sm">
              建议在<strong className="text-slate-900 dark:text-white">相似的状态下</strong>（如每天晚上睡前）进行测评，
              这样两次结果的变化更能反映真实的心理变化，而不是情境波动。
            </p>
          </div>
        </div>

        {/* 正确使用 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              如何正确使用？
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  1
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    自我反思
                  </p>
                  <p className="text-sm">
                    认真阅读每张卡片，思考它是否反映了你的真实情况，而不是"应该"的情况。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  2
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    接受冲突
                  </p>
                  <p className="text-sm">
                    如果你在某些特质上有矛盾（比如既想独立又害怕失去），这正是值得探索的地方。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  3
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    温和解读
                  </p>
                  <p className="text-sm">
                    不要把高分卡片当作"优点"、低分卡片当作"问题"。它们只是当下状态的描述。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  4
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    与人分享
                  </p>
                  <p className="text-sm">
                    可以和信任的人分享你的结果，讨论彼此的看法。Q-sort 也可以用于关系沟通。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-medium text-primary-600 dark:text-primary-400">
                  5
                </span>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white mb-1">
                    定期复测
                  </p>
                  <p className="text-sm">
                    一周或一个月后复测，观察变化。变化本身就是有价值的发现。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 学术背景 */}
        <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            学术背景
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Q-methodology 由心理学家 William Stephenson 于 1935 年提出，广泛应用于人格心理学、
            社会心理学、政治心理学等领域。它强调研究主体的主观性（subjectivity），
            认为每个人的观点结构都是独特且有意义的。
          </p>
        </div>

        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/')}
          className="w-full py-3 rounded-xl font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          开始测评
        </button>
      </div>
    </main>
  );
}