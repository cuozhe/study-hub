'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, Check, BookOpen, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyPath } from '@/app/types';

interface ImportStudyPathProps {
  onImport: (path: StudyPath) => void;
  onCancel: () => void;
}

export function ImportStudyPath({ onImport, onCancel }: ImportStudyPathProps) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // 解析 JSON
  const handleParse = useCallback(() => {
    setError(null);
    try {
      const data = JSON.parse(jsonText);
      
      // 验证数据结构
      if (!data.name || !data.subjects || !Array.isArray(data.subjects)) {
        throw new Error('缺少必要字段：name 或 subjects');
      }

      // 验证每个科目
      data.subjects.forEach((subject: any, idx: number) => {
        if (!subject.id || !subject.name || !Array.isArray(subject.topics)) {
          throw new Error(`科目 ${idx + 1} 缺少必要字段`);
        }
        subject.topics.forEach((topic: any, tIdx: number) => {
          if (!topic.id || !topic.name) {
            throw new Error(`科目 "${subject.name}" 的主题 ${tIdx + 1} 缺少必要字段`);
          }
          // 设置默认值
          if (!topic.status) topic.status = 'available';
          if (!topic.estimatedMinutes) topic.estimatedMinutes = 60;
        });
      });

      // 添加 id
      data.id = data.id || `custom-${Date.now()}`;
      data.description = data.description || '自定义学习路径';

      onImport(data as StudyPath);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'JSON 解析失败');
    }
  }, [jsonText, onImport]);

  // 模板示例
  const template = JSON.stringify({
    name: "我的学习路径",
    description: "自定义课程表",
    subjects: [
      {
        id: "subject-1",
        name: "科目一",
        topics: [
          {
            id: "topic-1",
            name: "第一章：基础知识",
            status: "available",
            estimatedMinutes: 90
          },
          {
            id: "topic-2", 
            name: "第二章：核心概念",
            status: "available",
            estimatedMinutes: 120
          }
        ]
      }
    ]
  }, null, 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">导入自定义学习路径</h2>
              <p className="text-sm text-white/80">从 JSON 格式导入课程表</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-80px)] overflow-y-auto space-y-6">
          {/* 说明 */}
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">导入格式说明</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 使用标准 JSON 格式</li>
                  <li>• 必须包含 name（路径名称）和 subjects（科目列表）</li>
                  <li>• 每个科目需要 id、name 和 topics</li>
                  <li>• 每个主题需要 id、name</li>
                </ul>
              </div>
            </div>
          </div>

          {/* JSON 输入框 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              JSON 内容
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="粘贴你的 JSON 数据..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 flex items-center gap-1"
              >
                ❌ {error}
              </motion.p>
            )}
          </div>

          {/* 模板按钮 */}
          <div>
            <button
              onClick={() => setJsonText(template)}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              📋 查看 JSON 模板
            </button>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleParse}
              disabled={!jsonText.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              导入学习路径
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 导出学习路径组件
interface ExportStudyPathProps {
  studyPath: StudyPath;
  onCancel: () => void;
}

export function ExportStudyPath({ studyPath, onCancel }: ExportStudyPathProps) {
  const jsonText = JSON.stringify(studyPath, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyPath.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">导出学习路径</h2>
              <p className="text-sm text-white/80">{studyPath.name}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(85vh-80px)] overflow-y-auto space-y-6">
          {/* JSON 预览 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FileText className="w-4 h-4" />
                JSON 数据
              </label>
              <button
                onClick={handleCopy}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                复制
              </button>
            </div>
            <textarea
              value={jsonText}
              readOnly
              className="w-full h-64 p-4 border border-gray-200 rounded-xl font-mono text-sm resize-none bg-gray-50"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              关闭
            </button>
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center gap-2"
            >
              ⬇️ 下载 JSON
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
