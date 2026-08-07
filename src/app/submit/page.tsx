'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQSortStore } from '@/store';
import { buildSubmitPayload, submitToBackend } from '@/lib/experiment';
import {
  ArrowLeft,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Cake,
  Users,
} from 'lucide-react';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

/** 性别选项（值即发送给后端的内容，与后端 get_gender_display 展示兼容） */
const GENDER_OPTIONS = [
  { value: '男', label: '男' },
  { value: '女', label: '女' },
  { value: '其他', label: '其他' },
  { value: 'prefer_not_to_say', label: '不愿透露' },
];

/**
 * 提交结果页。
 * 流程：/sorting 完成排序 -> 跳到本页 -> 填写基本信息 -> 点击「提交结果」
 *   -> POST /api/submit/ -> 成功弹窗 -> /result；失败弹窗 -> 重试。
 */
export default function SubmitPage() {
  const router = useRouter();
  const { currentTheme, currentSession } = useQSortStore();

  const [subjectName, setSubjectName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  // 无有效会话时回首页
  if (!currentTheme || !currentSession) {
    router.push('/');
    return null;
  }

  const submitting = status === 'submitting';
  // 姓名必填 + 非提交中，才允许点击（同时是防重复提交的开关）
  const canSubmit = subjectName.trim().length > 0 && !submitting;

  // 组装数据并 POST 到 Django 后端
  const handleSubmit = async () => {
    if (!canSubmit) return; // 防重复提交
    setStatus('submitting');
    try {
      const payload = buildSubmitPayload(currentSession, {
        subjectName: subjectName.trim(),
        age: age.trim() === '' ? null : Number(age),
        gender,
      });
      await submitToBackend(payload);
      setStatus('success');
    } catch (error) {
      console.error('提交失败:', error);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* 返回排序 */}
        <button
          onClick={() => router.push('/sorting')}
          className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回排序
        </button>

        {/* 标题区 */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
            <Send className="w-7 h-7 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            提交测评结果
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            排序已完成，请填写基本信息后提交
          </p>
        </div>

        {/* 基本信息表单 */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              <User className="w-4 h-4 text-slate-400" />
              姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="请输入姓名"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              <Cake className="w-4 h-4 text-slate-400" />
              年龄
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="请输入年龄（选填）"
              min={0}
              max={120}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">
              <Users className="w-4 h-4 text-slate-400" />
              性别
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 本次数据摘要 */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-xs text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-2">
          <div>
            条件组：{currentSession.experimentCondition === 'experimental' ? '实验组' : '对照组'}
          </div>
          <div>用时：{currentSession.duration ?? '—'} 秒</div>
          <div>移动次数：{currentSession.moveCount} 次</div>
          <div>
            卡片：{Object.keys(currentSession.finalPlacement).length} / {currentTheme.cards.length} 张
          </div>
        </div>

        {/* 提交按钮：提交中显示 loading 并置灰禁用（防重复提交） */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            submitting
              ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
              : canSubmit
                ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98] shadow-lg shadow-primary-500/25'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              提交结果
            </>
          )}
        </button>
      </div>

      {/* ===== 提交成功弹窗 ===== */}
      {status === 'success' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              提交成功
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              你的数据已保存，感谢参与！
            </p>
            <button
              onClick={() => router.push('/result')}
              className="w-full py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
            >
              查看结果
            </button>
          </div>
        </div>
      )}

      {/* ===== 提交失败弹窗 ===== */}
      {status === 'error' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              提交失败
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              请检查网络连接后重试
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/')}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                返回首页
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
