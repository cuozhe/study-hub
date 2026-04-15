'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Clock, X, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudySession } from '@/app/types';

interface NotesWallViewProps {
  sessions: StudySession[];
}

export function NotesWallView({ sessions }: NotesWallViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<StudySession | null>(null);

  // 获取所有科目
  const subjects = useMemo(() => {
    const unique = new Set(sessions.map(s => s.subject));
    return Array.from(unique);
  }, [sessions]);

  // 筛选笔记
  const filteredNotes = useMemo(() => {
    return sessions
      .filter(session => {
        const matchesSearch = 
          searchQuery === '' ||
          session.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.cornellNote.cues.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.cornellNote.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.cornellNote.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.feynmanOutput.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSubject = 
          selectedSubject === 'all' ||
          session.subject === selectedSubject;
        
        return matchesSearch && matchesSubject;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [sessions, searchQuery, selectedSubject]);

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索笔记内容..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all text-sm"
            />
          </div>
          
          {/* 科目筛选 */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="pl-12 pr-8 py-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all appearance-none bg-white min-w-[160px]"
            >
              <option value="all">所有科目</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 统计 */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-500">
            共找到 <span className="font-bold text-purple-600">{filteredNotes.length}</span> 条笔记
          </span>
          {(searchQuery || selectedSubject !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedSubject('all'); }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              清除筛选
            </button>
          )}
        </div>
      </motion.div>

      {/* 笔记网格 */}
      {filteredNotes.length === 0 ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <BookOpen className="w-12 h-12 text-gray-400" />
          </motion.div>
          <h3 className="font-display font-bold text-xl text-gray-700 mb-2">没有找到匹配的笔记</h3>
          <p className="text-gray-500">尝试调整搜索条件或开始新的学习</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((session, index) => (
            <motion.div
              key={session.id}
              onClick={() => setSelectedNote(session)}
              className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 card-hover cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8 }}
            >
              {/* 卡片头部 */}
              <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-5 py-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white transform translate-x-8 -translate-y-8" />
                </div>
                <div className="relative z-10">
                  <p className="font-semibold text-white truncate">{session.topic}</p>
                  <p className="text-xs text-white/80 mt-1">{session.subject}</p>
                </div>
              </div>

              {/* 简要内容 */}
              <div className="p-5 space-y-3">
                {/* 线索 */}
                {session.cornellNote.cues && (
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      线索
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {session.cornellNote.cues}
                    </p>
                  </div>
                )}

                {/* 总结 */}
                {session.cornellNote.summary && (
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-green-600 mb-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      总结
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {session.cornellNote.summary}
                    </p>
                  </div>
                )}

                {/* 费曼输出预览 */}
                {session.feynmanOutput && (
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="text-xs font-bold text-purple-600 mb-1">🎓 费曼输出</p>
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {session.feynmanOutput}
                    </p>
                  </div>
                )}

                {/* 元信息 */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(session.date).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-lg">🍅</span>
                    {session.pomodoros}个
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedNote(null)}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 px-6 py-5 flex items-center justify-between z-10">
                <div>
                  <h3 className="font-display font-bold text-xl text-white">{selectedNote.topic}</h3>
                  <p className="text-sm text-white/80">{selectedNote.subject}</p>
                </div>
                <button
                  onClick={() => setSelectedNote(null)}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* 康奈尔笔记 */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                    <p className="text-sm font-bold text-orange-600 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      📌 线索栏
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedNote.cornellNote.cues || '暂无内容'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <p className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
                      📝 笔记栏
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedNote.cornellNote.notes || '暂无内容'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <p className="text-sm font-bold text-green-600 mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      📋 总结栏
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedNote.cornellNote.summary || '暂无内容'}
                    </p>
                  </div>
                </div>

                {/* 费曼输出 */}
                {selectedNote.feynmanOutput && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <p className="text-sm font-bold text-purple-600 mb-3 flex items-center gap-2">
                      🎓 费曼输出
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed italic">
                      "{selectedNote.feynmanOutput}"
                    </p>
                  </div>
                )}

                {/* 元信息 */}
                <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100 bg-gray-50 -mx-6 px-6 py-4">
                  <span>📅 {new Date(selectedNote.date).toLocaleDateString('zh-CN')}</span>
                  <span>🍅 {selectedNote.pomodoros}个番茄钟</span>
                  <span>⏱️ {selectedNote.duration}分钟</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
