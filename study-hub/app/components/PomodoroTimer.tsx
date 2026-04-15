'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PomodoroState } from '@/app/types';

interface PomodoroTimerProps {
  state: PomodoroState;
  onUpdate: (updates: Partial<PomodoroState>) => void;
  onComplete: () => void;
}

export function PomodoroTimer({ state, onUpdate, onComplete }: PomodoroTimerProps) {
  // 使用本地状态来避免闭包问题
  const [timeLeft, setTimeLeft] = useState(state.timeLeft);
  const [isRunning, setIsRunning] = useState(state.isRunning);
  const [isBreak, setIsBreak] = useState(state.isBreak);
  const [completedToday, setCompletedToday] = useState(state.completedToday || 0);
  
  // 同步 props 到本地状态
  useEffect(() => {
    setTimeLeft(state.timeLeft);
    setIsRunning(state.isRunning);
    setIsBreak(state.isBreak);
    setCompletedToday(state.completedToday || 0);
  }, [state.timeLeft, state.isRunning, state.isBreak, state.completedToday]);

  // 计时器
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // 时间到
          setIsRunning(false);
          setIsBreak(b => !b);
          setCompletedToday(c => c + 1);
          setTimeLeft(isBreak ? 25 * 60 : 5 * 60);
          onComplete();
          return isBreak ? 25 * 60 : 5 * 60;
        }
        // 同步到父组件
        onUpdate({ timeLeft: newTime });
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, onComplete, onUpdate, isBreak]);

  // 切换计时器
  const toggleTimer = useCallback(() => {
    setIsRunning(prev => {
      const newValue = !prev;
      onUpdate({ isRunning: newValue });
      return newValue;
    });
  }, [onUpdate]);

  // 重置计时器
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    onUpdate({ 
      isRunning: false, 
      timeLeft: isBreak ? 5 * 60 : 25 * 60 
    });
  }, [isBreak, onUpdate]);

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算进度
  const progress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  const gradientColor = isBreak 
    ? { from: '#22c55e', to: '#16a34a', name: 'mint' }
    : { from: '#f97316', to: '#ea580c', name: 'orange' };

  return (
    <motion.div 
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 外圈装饰 */}
      <div className="relative w-56 h-56">
        {/* 背景光晕 */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${gradientColor.from}30 0%, transparent 70%)`,
          }}
          animate={isRunning ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
        />

        {/* 进度环 SVG */}
        <svg className="w-full h-full progress-ring" viewBox="0 0 200 200">
          {/* 背景圆 */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="10"
          />
          
          {/* 进度圆 */}
          <circle
            cx="100"
            cy="100"
            r="85"
            fill="none"
            stroke={`url(#gradient-${gradientColor.name})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={534}
            strokeDashoffset={534 - (534 * progress) / 100}
            style={{ 
              filter: `drop-shadow(0 0 8px ${gradientColor.from}50)`,
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
          
          {/* 渐变定义 */}
          <defs>
            <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="gradient-mint" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>
        </svg>

        {/* 时间显示 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-display font-bold number-roll ${
            isBreak ? 'text-green-500' : 'text-orange-500'
          }`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-500 mt-2 font-medium">
            {isBreak ? '休息时间' : '专注时间'}
          </span>
        </div>

        {/* 装饰性粒子 */}
        {isRunning && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-400"
                initial={{
                  x: 100,
                  y: 100,
                  opacity: 1,
                }}
                animate={{
                  x: 100 + Math.cos((i * 60 * Math.PI) / 180) * 120,
                  y: 100 + Math.sin((i * 60 * Math.PI) / 180) * 120,
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* 控制按钮 */}
      <motion.div 
        className="flex items-center gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={resetTimer}
          className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-6 h-6" />
        </motion.button>
        
        <motion.button
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
            isBreak 
              ? 'bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-green-500/30' 
              : 'bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 shadow-orange-500/30'
          }`}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={isRunning ? {
            boxShadow: isBreak 
              ? ['0 0 20px rgba(34, 197, 94, 0.4)', '0 0 40px rgba(34, 197, 94, 0.6)', '0 0 20px rgba(34, 197, 94, 0.4)']
              : ['0 0 20px rgba(249, 115, 22, 0.4)', '0 0 40px rgba(249, 115, 22, 0.6)', '0 0 20px rgba(249, 115, 22, 0.4)'],
          } : {}}
          transition={{ duration: 1.5, repeat: isRunning ? Infinity : 0 }}
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </motion.button>
        
        <div className="w-14 h-14" /> {/* 占位 */}
      </motion.div>

      {/* 状态提示 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isBreak ? 'break' : 'focus'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-6"
        >
          {isBreak ? (
            <motion.div 
              className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Coffee className="w-5 h-5" />
              <span className="text-sm font-medium">休息一下，喝杯咖啡~</span>
            </motion.div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                今日已完成 
                <span className="font-bold text-orange-500 mx-1">{completedToday}</span> 
                个番茄钟
              </p>
              {completedToday === 0 && !isRunning && (
                <p className="text-xs text-gray-400 mt-1">开始你的第一个番茄钟吧！</p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 装饰图标 */}
      <motion.div 
        className="absolute -top-4 -right-4"
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="w-8 h-8 text-yellow-400" />
      </motion.div>
    </motion.div>
  );
}
