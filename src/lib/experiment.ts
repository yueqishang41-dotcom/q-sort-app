/**
 * 实验设计配置：1×2 被试间设计
 * 研究问题：引导语框架效应对 Q 分类结果的影响
 *
 * 自变量（2 个水平）：
 *   - control       对照组：中性引导语
 *   - experimental  实验组：带社会赞许性暗示的引导语
 *
 * 因变量：
 *   - 积极描述词被放置的平均位置
 *   - 完成排序所用总时间（秒）
 *   - 排序过程中的调整 / 移动次数
 */

import { Card, FinalPlacement, SortSession } from '@/types';

// ============ 条件类型 ============

export type ExperimentCondition = 'control' | 'experimental';

/** 两组引导语文字（页面布局完全一致，仅文字内容不同） */
export const INSTRUCTIONS: Record<
  ExperimentCondition,
  {
    heading: string;
    paragraphs: string[];
  }
> = {
  control: {
    heading: '实验说明',
    paragraphs: [
      '请根据你的真实感受，将这些描述按照从“最不符合”到“最符合”的顺序排列。',
      '每个档位的卡片数量是固定的，需要在取舍中做出选择。没有对错之分，请凭第一直觉完成。',
    ],
  },
  experimental: {
    heading: '实验说明',
    paragraphs: [
      '研究表明，心理健康水平高的人倾向于认同积极的自我描述。请根据你的真实感受，将这些描述排列。',
      '每个档位的卡片数量是固定的，需要在取舍中做出选择。没有对错之分，请凭第一直觉完成。',
    ],
  },
};

/**
 * 随机分配实验条件（50% control / 50% experimental）。
 * 在每次 startSession 时调用一次，同一被试整个流程内条件保持不变。
 */
export function assignCondition(): ExperimentCondition {
  return Math.random() < 0.5 ? 'control' : 'experimental';
}

// ============ 实验数据打包 ============

/** 打包后的实验数据 JSON 结构 */
export interface ExperimentJSON {
  condition: ExperimentCondition;                // 条件类型
  sortStartTime: number | null;                  // 开始排序的时间戳
  sortEndTime: number | null;                    // 结束排序的时间戳
  durationSeconds: number | null;                // 总用时（秒）
  finalPlacement: FinalPlacement;                // 每张卡片的最终位置 (cardId -> 档位 -4..+4)
  moveCount: number;                             // 排序过程中卡片被移动的总次数
  positiveWordAvgPosition: number | null;        // 因变量①：积极描述词的平均位置
  positiveWords: Array<{ cardId: string; text: string; slot: number }>;
}

/**
 * 把一次完成的排序会话打包成实验数据 JSON。
 * 在排序完成后调用（结果页 / 提交后端时）。
 */
export function buildExperimentJSON(
  session: SortSession,
  cards: Card[]
): ExperimentJSON {
  const start = session.sortStartTime ?? session.startTime;
  const end = session.sortEndTime ?? Date.now();
  const durationSeconds = end > start ? Math.round((end - start) / 1000) : null;

  // 提取所有被放置到档位上的积极描述词
  const positiveWords = cards
    .filter((c) => c.polarity === 'positive' && session.finalPlacement[c.id] !== undefined)
    .map((c) => ({
      cardId: c.id,
      text: c.text,
      slot: session.finalPlacement[c.id],
    }));

  // 因变量①：积极描述词被放置的平均档位位置
  const positiveWordAvgPosition =
    positiveWords.length > 0
      ? positiveWords.reduce((sum, w) => sum + w.slot, 0) / positiveWords.length
      : null;

  return {
    condition: session.experimentCondition,
    sortStartTime: start,
    sortEndTime: end,
    durationSeconds,
    finalPlacement: { ...session.finalPlacement },
    moveCount: session.moveCount,
    positiveWordAvgPosition,
    positiveWords,
  };
}

// ============ 提交到后端 ============

/**
 * Django 后端接口地址。
 * 本地开发默认后端跑在 8000 端口（127.0.0.1）；部署到 Netlify 时改成你的后端域名。
 */
export const API_ENDPOINT = 'http://127.0.0.1:8000/api/submit/';

// ============ 提交到后端（完整字段版） ============

/** 被试填写的基本信息 */
export interface SubjectDemographics {
  subjectName: string;
  age: number | null;
  gender: string;
}

/** 提交给后端的完整 payload（对应 qsort_backend submit_result 接收的字段） */
export interface SubmitPayload {
  subject_name: string;
  age: number | null;
  gender: string;
  condition: ExperimentCondition;
  sort_data: FinalPlacement;   // cardId -> 档位分数
  duration_seconds: number | null;
  move_count: number;
  user_agent: string;
}

/**
 * 组装提交到 Django 的 payload。
 * 所有实验数据都从已完成的 SortSession 里取。
 */
export function buildSubmitPayload(
  session: SortSession,
  demo: SubjectDemographics
): SubmitPayload {
  const start = session.sortStartTime ?? session.startTime;
  const end = session.sortEndTime ?? session.endTime ?? Date.now();
  const durationSeconds =
    session.duration ?? (end > start ? Math.round((end - start) / 1000) : null);

  return {
    subject_name: demo.subjectName,
    age: demo.age,
    gender: demo.gender,
    condition: session.experimentCondition,
    sort_data: { ...session.finalPlacement },
    duration_seconds: durationSeconds,
    move_count: session.moveCount,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  };
}

/**
 * 用 fetch 把 payload 以 application/json 发送到 POST /api/submit/。
 * 跨域 CSRF 由后端 @csrf_exempt 处理（无需前端额外操作）。
 * 成功返回；失败抛异常，由调用方决定如何提示。
 */
export async function submitToBackend(payload: SubmitPayload): Promise<void> {
  const res = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`提交失败 (${res.status}): ${errText}`);
  }
}
