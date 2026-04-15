'use client';

import { useState, useCallback } from 'react';
import { Lock, Unlock, CheckCircle2, Circle, BookOpen, Clock, ChevronRight, Sparkles, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudyPath, Topic, CornellNote } from '@/app/types';

interface KnowledgeMapViewProps {
  studyPath: StudyPath;
  onUpdateTopic: (subjectId: string, topicId: string, status: Topic['status']) => void;
  onSelectTopic: (subject: string, topic: string) => void;
  onImportPath: (path: StudyPath) => void;
  currentTopic?: string;
}

export function KnowledgeMapView({ 
  studyPath, 
  onUpdateTopic, 
  onSelectTopic,
  onImportPath,
  currentTopic 
}: KnowledgeMapViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // 计算科目的完成进度
  const getSubjectProgress = (subjectId: string) => {
    const subject = studyPath.subjects.find(s => s.id === subjectId);
    if (!subject) return { completed: 0, total: 0 };
    const completed = subject.topics.filter(t => t.status === 'completed').length;
    return { completed, total: subject.topics.length };
  };

  // 获取状态图标
  const getStatusIcon = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'learning':
        return <Circle className="w-5 h-5 text-orange-500 fill-orange-500" />;
      case 'available':
        return <Unlock className="w-5 h-5 text-blue-500" />;
      case 'locked':
        return <Lock className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: Topic['status']) => {
    switch (status) {
      case 'completed':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'learning':
        return 'from-orange-50 to-amber-50 border-orange-200';
      case 'available':
        return 'from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300';
      case 'locked':
        return 'from-gray-50 to-gray-100 border-gray-200 opacity-60';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  // 处理主题选择
  const handleTopicClick = (subject: string, topic: Topic) => {
    if (topic.status === 'locked') return;
    onSelectTopic(subject, topic.name);
  };

  // 处理导入
  const handleImport = () => {
    setImportError(null);
    try {
      const data = JSON.parse(jsonText);
      
      if (!data.name || !data.subjects || !Array.isArray(data.subjects)) {
        throw new Error('缺少必要字段：name 或 subjects');
      }

      data.subjects.forEach((subject: any, idx: number) => {
        if (!subject.id || !subject.name || !Array.isArray(subject.topics)) {
          throw new Error(`科目 ${idx + 1} 缺少必要字段`);
        }
        subject.topics.forEach((topic: any, tIdx: number) => {
          if (!topic.id || !topic.name) {
            throw new Error(`科目 "${subject.name}" 的主题 ${tIdx + 1} 缺少必要字段`);
          }
          if (!topic.status) topic.status = 'available';
          if (!topic.estimatedMinutes) topic.estimatedMinutes = 60;
        });
      });

      data.id = data.id || `custom-${Date.now()}`;
      data.description = data.description || '自定义学习路径';

      onImportPath(data as StudyPath);
      setShowImportModal(false);
      setJsonText('');
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'JSON 解析失败');
    }
  };

  // 导出 JSON
  const handleExport = () => {
    const json = JSON.stringify(studyPath, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studyPath.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 计算总体进度
  const totalTopics = studyPath.subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = studyPath.subjects.reduce(
    (acc, s) => acc + s.topics.filter(t => t.status === 'completed').length, 0
  );
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 总体进度 */}
      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-gray-800">
                {studyPath.name}
              </h2>
              <p className="text-sm text-gray-500">{studyPath.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-display font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                {progressPercent}%
              </p>
              <p className="text-sm text-gray-500">
                {completedTopics}/{totalTopics} 主题
              </p>
            </div>
            
            {/* 导入/导出按钮 */}
            <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                导入
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          {progressPercent === 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </motion.div>

      {/* 科目列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {studyPath.subjects.map((subject, subjectIndex) => {
          const progress = getSubjectProgress(subject.id);
          const isSelected = selectedSubject === subject.id;
          const isComplete = progress.completed === progress.total;

          return (
            <motion.div
              key={subject.id}
              className={`bg-gradient-to-br ${isComplete ? 'from-green-50 to-emerald-50' : 'from-gray-50 to-white'} 
                rounded-3xl border border-gray-200 overflow-hidden transition-all cursor-pointer
                ${isSelected ? 'ring-2 ring-purple-400 shadow-xl' : 'hover:shadow-lg hover:border-purple-200'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: subjectIndex * 0.1 }}
              onClick={() => setSelectedSubject(isSelected ? null : subject.id)}
            >
              {/* 科目头部 */}
              <div className={`p-5 border-b border-gray-100 ${
                isComplete ? 'bg-gradient-to-r from-green-100 to-emerald-100' : ''
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-lg text-gray-800">
                    {subject.name}
                  </h3>
                  {isComplete && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </div>
                
                {/* 科目进度 */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                      transition={{ duration: 0.5, delay: subjectIndex * 0.1 }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {progress.completed}/{progress.total}
                  </span>
                </div>
              </div>

              {/* 主题列表 */}
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {subject.topics.map((topic, topicIndex) => {
                  const isCurrent = currentTopic === topic.name;
                  const isHovered = hoveredTopic === topic.id;

                  return (
                    <motion.button
                      key={topic.id}
                      className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        getStatusColor(topic.status)
                      } ${isCurrent ? 'ring-2 ring-orange-400' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicClick(subject.name, topic);
                      }}
                      onMouseEnter={() => setHoveredTopic(topic.id)}
                      onMouseLeave={() => setHoveredTopic(null)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (subjectIndex * 0.1) + (topicIndex * 0.05) }}
                      whileHover={{ scale: topic.status !== 'locked' ? 1.02 : 1 }}
                      whileTap={{ scale: topic.status !== 'locked' ? 0.98 : 1 }}
                    >
                      {/* 状态图标 */}
                      <div className="shrink-0">
                        {getStatusIcon(topic.status)}
                      </div>

                      {/* 主题信息 */}
                      <div className="flex-1 text-left min-w-0">
                        <p className={`font-medium truncate ${
                          topic.status === 'locked' ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                          {topic.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>约{topic.estimatedMinutes}分钟</span>
                        </div>
                      </div>

                      {/* 学习按钮 */}
                      {topic.status !== 'locked' && topic.status !== 'completed' && (
                        <motion.div
                          className="shrink-0"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: isHovered || isCurrent ? 1 : 0, scale: isHovered || isCurrent ? 1 : 0 }}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            topic.status === 'learning' 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-purple-500 text-white'
                          }`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </motion.div>
                      )}

                      {/* 当前学习标记 */}
                      {isCurrent && (
                        <motion.div
                          className="shrink-0"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 底部提示 */}
      <motion.div
        className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-gray-600">
            <strong>💡 学习提示：</strong>
            点击任意未锁定的主题开始学习，完成后将自动生成艾宾浩斯复习计划！
          </p>
        </div>
      </motion.div>

      {/* 导入弹窗 */}
      <AnimatePresence>
        {showImportModal && (
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
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* 头部 */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-white">导入自定义学习路径</h2>
                    <p className="text-sm text-white/80">粘贴 JSON 数据</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setJsonText('');
                    setImportError(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[calc(80vh-80px)] overflow-y-auto space-y-4">
                {/* 说明 */}
                <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">📋 格式要求：</p>
                  <ul className="text-xs space-y-0.5 opacity-80">
                    <li>• name：路径名称</li>
                    <li>• description：描述（可选）</li>
                    <li>• subjects：科目数组，每个科目需要 id、name、topics</li>
                    <li>• topics：主题数组，每个主题需要 id、name</li>
                  </ul>
                </div>

                {/* JSON 输入 */}
                <div>
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder='{"name": "我的学习路径", "subjects": [...]}'
                    className="w-full h-48 p-3 border border-gray-200 rounded-xl font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {importError && (
                    <p className="mt-2 text-sm text-red-600">❌ {importError}</p>
                  )}
                </div>

                {/* 模板按钮 */}
                <button
                  onClick={() => setJsonText(JSON.stringify({
                    name: "我的学习路径",
                    description: "自定义课程表",
                    subjects: [
                      {
                        id: "subject-1",
                        name: "科目一",
                        topics: [
                          { id: "topic-1", name: "第一章：基础知识", status: "available", estimatedMinutes: 90 },
                          { id: "topic-2", name: "第二章：核心概念", status: "available", estimatedMinutes: 120 }
                        ]
                      }
                    ]
                  }, null, 2))}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  📋 查看完整模板
                </button>

                {/* 操作 */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setJsonText('');
                      setImportError(null);
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!jsonText.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    确认导入
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
