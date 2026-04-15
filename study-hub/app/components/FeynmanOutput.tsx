'use client';

import { useState } from 'react';
import { Lightbulb, AlertCircle, Sparkles, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeynmanOutputProps {
  value: string;
  onChange: (value: string) => void;
  isRequired?: boolean;
}

export function FeynmanOutput({ value, onChange, isRequired = true }: FeynmanOutputProps) {
  const wordCount = value.trim().split(/\s+/).filter(w => w.length > 0).length;
  const minWords = 30;
  const isValid = wordCount >= minWords;
  const progress = Math.min((wordCount / minWords) * 100, 100);

  return (
    <motion.div 
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* 头部 */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-6 py-5">
          {/* 装饰背景 */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lightbulb className="w-6 h-6 text-yellow-300" />
              </motion.div>
              <div>
                <h3 className="text-white font-display font-bold text-xl">费曼技巧</h3>
                <p className="text-white/80 text-sm">用最简单的语言解释复杂概念</p>
              </div>
            </div>
            
            {/* 字数指示器 */}
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{wordCount}</div>
              <div className="text-xs text-white/70">/ {minWords} 字</div>
            </div>
          </div>
        </div>
        
        {/* 装饰波浪 */}
        <svg className="absolute bottom-0 left-0 right-0" viewBox="0 0 1200 30" preserveAspectRatio="none">
          <path d="M0,30 C200,10 400,10 600,30 C800,50 1000,50 1200,30 L1200,30 L0,30 Z" fill="#fff" />
        </svg>
      </div>

      <div className="p-6">
        {/* 提示卡片 */}
        <motion.div 
          className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 mb-6 border border-violet-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-violet-800 mb-2">💡 费曼学习法核心</p>
              <div className="grid grid-cols-2 gap-2 text-sm text-violet-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>用最简单直白的语言</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>避免专业术语</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>结合生活类比</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span>讲给"小白"听</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 输入提示 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">尝试回答这个问题：</span>
          </div>
          <p className="text-gray-500 text-sm bg-gray-50 rounded-xl p-4 italic">
            "如果要把今天学的内容教给一个完全不懂的人，你会怎么讲？"
          </p>
        </div>

        {/* 输入框 */}
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={"🌰 举个例子：&#10;&#10;TCP/IP协议就像寄快递...&#10;&#10;第一步，先建立连接，就像打电话要先拨号接通...&#10;&#10;第二步，发送数据，就像把包裹交给快递员...&#10;&#10;第三步，断开连接，就像通话结束后挂电话..."}
            className="w-full min-h-[220px] p-5 rounded-2xl border-2 border-gray-100 resize-none outline-none transition-all text-sm leading-relaxed placeholder:text-gray-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          />
          
          {/* 字数进度条 */}
          <div className="absolute bottom-3 left-5 right-5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className={isValid ? 'text-green-500' : 'text-gray-400'}>
                {isValid ? '✓ 符合要求' : `还需要 ${minWords - wordCount} 字`}
              </span>
              <span className="text-gray-400">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full rounded-full"
                style={{ 
                  width: `${progress}%`,
                  background: isValid 
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                    : 'linear-gradient(90deg, #8b5cf6, #a855f7)'
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        {/* 提示文字 */}
        <div className="flex items-start gap-2 mt-6 pt-4 border-t border-gray-100">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-600">提示：</span>
            费曼学习法的核心是"教学相长"。如果你在解释时卡住了，说明这个知识点还没完全掌握。输出越清晰，说明理解越深刻。
          </p>
        </div>
      </div>
      
      {/* 底部装饰 */}
      <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
    </motion.div>
  );
}
