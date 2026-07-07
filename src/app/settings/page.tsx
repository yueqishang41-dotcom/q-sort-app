'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQSortStore } from '@/store';
import {
  ArrowLeft,
  Moon,
  Sun,
  Download,
  Trash2,
  AlertTriangle,
  FileText,
  Shield,
  Database,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { isDarkMode, toggleDarkMode, allSessions, clearAllData } = useQSortStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  // 导出数据
  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      sessions: allSessions,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `q-sort-data-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);

    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 2000);
  };

  // 清除数据
  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    router.push('/');
  };

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
          <h1 className="font-semibold text-slate-900 dark:text-white">设置</h1>
          <div className="w-12" />
        </div>
      </nav>

      <div className="pt-20 px-4 max-w-2xl mx-auto">
        {/* 外观设置 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              外观
            </h2>
          </div>
          <button
            onClick={toggleDarkMode}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Sun className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
              <span className="text-slate-900 dark:text-white">深色模式</span>
            </div>
            <div
              className={`w-12 h-6 rounded-full transition-colors ${
                isDarkMode ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                } mt-0.5`}
              />
            </div>
          </button>
        </div>

        {/* 数据管理 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              数据管理
            </h2>
          </div>

          {/* 数据说明 */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  你的数据仅保存在本地浏览器中，不会上传到任何服务器。
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  清除浏览器数据可能导致记录丢失，建议定期导出备份。
                </p>
              </div>
            </div>
          </div>

          {/* 统计 */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                测评记录
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {allSessions.filter(s => s.isComplete).length} 次
              </span>
            </div>
          </div>

          {/* 导出数据 */}
          <button
            onClick={handleExportData}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700"
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-900 dark:text-white">导出数据</span>
            </div>
            <span className="text-sm text-slate-400 dark:text-slate-500">
              {showExportSuccess ? '✓ 已导出' : 'JSON 格式'}
            </span>
          </button>

          {/* 清除数据 */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span className="text-red-600 dark:text-red-400">清除所有数据</span>
            </div>
            <span className="text-sm text-slate-400 dark:text-slate-500">
              不可恢复
            </span>
          </button>
        </div>

        {/* 隐私与合规 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              隐私与合规
            </h2>
          </div>

          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  本工具不收集任何个人数据，所有数据存储在你的本地浏览器中。
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => router.push('/methodology')}
            className="w-full px-4 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="text-slate-900 dark:text-white">方法说明</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* 免责声明 */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              <p className="font-medium mb-2">重要声明</p>
              <ul className="text-xs space-y-1">
                <li>• 本测评仅供自我反思与科普参考</li>
                <li>• 不构成任何临床诊断或医疗建议</li>
                <li>• 结果受当前情绪、睡眠、环境等因素影响</li>
                <li>• 如有心理困扰，请寻求专业帮助</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 关于 */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-500">
          <p>Q-sort 测评工具 v1.0.0</p>
          <p className="mt-1">
            基于 Q-methodology 研究方法构建
          </p>
        </div>
      </div>

      {/* 清除确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-center mb-2">确认清除所有数据？</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-4">
              这将删除所有测评记录和设置，此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}