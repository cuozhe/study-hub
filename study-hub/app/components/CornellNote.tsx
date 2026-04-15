'use client';

import { motion } from 'framer-motion';
import type { CornellNote as CornellNoteType } from '@/app/types';

interface CornellNoteProps {
  note: CornellNoteType;
  onChange: (note: CornellNoteType) => void;
  readOnly?: boolean;
}

export function CornellNote({ note, onChange, readOnly = false }: CornellNoteProps) {
  return (
    <motion.div 
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* 头部 */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-5">
          {/* 装饰背景 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white transform translate-x-10 -translate-y-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-10 translate-y-10" />
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-2xl">📑</span>
            </div>
            <div>
              <h3 className="text-white font-display font-bold text-xl">康奈尔笔记法</h3>
              <p className="text-white/80 text-sm">边学边记，构建知识框架</p>
            </div>
          </div>
        </div>
        
        {/* 装饰波浪 */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 30" preserveAspectRatio="none">
          <path d="M0,30 C300,0 600,0 900,30 C1050,15 1150,15 1200,30 L1200,30 L0,30 Z" fill="#fff" />
        </svg>
      </div>

      <div className="flex min-h-[420px]">
        {/* 线索栏 - 左侧 */}
        <div className="w-1/3 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50 to-transparent" />
          <div className="relative h-full p-5 border-r border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📌</span>
              <label className="text-sm font-bold text-orange-600 uppercase tracking-wider">
                线索栏
              </label>
            </div>
            <p className="text-[10px] text-gray-400 mb-3">
              记录关键词、问题和概念
            </p>
            <textarea
              value={note.cues}
              onChange={(e) => onChange({ ...note, cues: e.target.value })}
              disabled={readOnly}
              placeholder="• TCP三次握手&#10;• 四次挥手&#10;• 可靠传输原理"
              className="w-full h-[calc(100%-4rem)] bg-transparent resize-none outline-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 disabled:text-gray-600"
            />
          </div>
          
          {/* 分隔线装饰 */}
          <div className="absolute right-0 top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange-300 via-orange-400 to-orange-300 rounded-full" />
        </div>

        {/* 笔记栏 - 右侧上半部分 */}
        <div className="w-2/3 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">
              笔记栏
            </label>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            记录详细内容、学习理解和典型例子
          </p>
          <textarea
            value={note.notes}
            onChange={(e) => onChange({ ...note, notes: e.target.value })}
            disabled={readOnly}
            placeholder="详细记录学习内容..."
            className="w-full h-[calc(100%-4rem)] resize-none outline-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 disabled:text-gray-600"
          />
        </div>
      </div>

      {/* 总结栏 - 底部 */}
      <div className="relative">
        {/* 装饰条 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-500 to-emerald-500" />
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📋</span>
            <label className="text-sm font-bold text-green-600 uppercase tracking-wider">
              总结栏
            </label>
            <span className="text-xs text-green-500 bg-green-100 px-2 py-0.5 rounded-full">
              核心要点
            </span>
          </div>
          <p className="text-[10px] text-gray-400 mb-3">
            用自己的话总结本节核心内容
          </p>
          <textarea
            value={note.summary}
            onChange={(e) => onChange({ ...note, summary: e.target.value })}
            disabled={readOnly}
            placeholder="本节的核心要点是..."
            className="w-full h-24 resize-none outline-none text-sm leading-relaxed text-gray-700 placeholder:text-gray-300 disabled:text-gray-600 bg-white/60 rounded-xl p-3 border border-green-100 focus:border-green-300 focus:ring-2 focus:ring-green-100 transition-all"
          />
        </div>
      </div>
      
      {/* 底部装饰 */}
      <div className="h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500" />
    </motion.div>
  );
}
