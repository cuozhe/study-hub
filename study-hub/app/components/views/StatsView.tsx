'use client';

import { useMemo } from 'react';
import { TrendingUp, Clock, Target, Flame, BookOpen, Trophy, Calendar, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import type { StudySession, SimonState } from '@/app/types';

interface StatsViewProps {
  sessions: StudySession[];
  simon: SimonState;
}

export function StatsView({ sessions, simon }: StatsViewProps) {
  // 计算统计数据
  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalPomodoros = sessions.reduce((acc, s) => acc + (s.pomodoros || 0), 0);
    const totalSessions = sessions.length;
    const totalNotes = sessions.filter(s => s.cornellNote?.notes).length;
    const avgMinutesPerSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    // 计算本周数据
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekMinutes = sessions
      .filter(s => new Date(s.date) >= weekStart)
      .reduce((acc, s) => acc + (s.duration || 0), 0);
    
    // 计算本月数据
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthMinutes = sessions
      .filter(s => new Date(s.date) >= monthStart)
      .reduce((acc, s) => acc + (s.duration || 0), 0);

    // 计算知识点数量
    const uniqueTopics = new Set(sessions.map(s => s.topic)).size;

    return {
      totalMinutes,
      totalPomodoros,
      totalSessions,
      totalNotes,
      avgMinutesPerSession,
      weekMinutes,
      monthMinutes,
      uniqueTopics,
    };
  }, [sessions]);

  // 格式化时长
  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '0';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分钟`;
    return `${hours}小时${mins > 0 ? `${mins}分` : ''}`;
  };

  // 计算进度百分比
  const todayProgress = Math.min(100, Math.round(((simon.todayCompletedMinutes || 0) / (simon.todayGoalMinutes || 120)) * 100));
  const weekGoal = (simon.todayGoalMinutes || 120) * 7;
  const weekProgress = Math.min(100, Math.round((stats.weekMinutes / weekGoal) * 100));

  // 统计卡片数据
  const statCards = [
    {
      icon: Clock,
      label: '总学习时长',
      value: formatDuration(stats.totalMinutes),
      gradient: 'from-orange-400 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      iconBg: 'bg-orange-500',
    },
    {
      icon: Target,
      label: '完成番茄钟',
      value: `${stats.totalPomodoros}个`,
      gradient: 'from-green-400 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-500',
    },
    {
      icon: BookOpen,
      label: '学习记录',
      value: `${stats.totalSessions}次`,
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-500',
    },
    {
      icon: Brain,
      label: '掌握知识点',
      value: `${stats.uniqueTopics}个`,
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片网格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.label}
            className={`bg-gradient-to-br ${card.bgGradient} rounded-2xl p-5 border border-gray-100`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-display font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.value.split(/[0-9]/)[0] || ''}
                <span>{card.value.replace(/[^0-9]/g, '')}</span>
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{card.label}</p>
            <p className={`text-lg font-display font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* 今日进度 & 本周进度 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 今日目标 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-gray-800">今日目标</h3>
              <p className="text-sm text-gray-500">{simon.todayCompletedMinutes || 0} / {simon.todayGoalMinutes || 120} 分钟</p>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${todayProgress}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
            {todayProgress >= 100 && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <Trophy className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>{todayProgress}%</span>
            <span>{todayProgress >= 100 ? '🎉 目标达成！' : '继续加油'}</span>
          </div>

          {/* 连胜状态 */}
          {(simon.streakDays || 0) > 0 && (
            <div className="mt-4 flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl px-4 py-3">
              <Flame className="w-6 h-6 text-orange-500" />
              <span className="font-semibold text-orange-600">🔥 连续学习 {simon.streakDays} 天</span>
            </div>
          )}
        </motion.div>

        {/* 本周统计 */}
        <motion.div 
          className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-gray-800">本周进度</h3>
              <p className="text-sm text-gray-500">{formatDuration(stats.weekMinutes)} / {formatDuration(weekGoal)}</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* 本周进度条 */}
            <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${weekProgress}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* 本周明细 */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center bg-blue-50 rounded-xl py-3">
                <p className="text-2xl font-bold text-blue-600">{formatDuration(stats.weekMinutes).replace(/小时.*/, '') || '0'}</p>
                <p className="text-xs text-blue-500">本周学习</p>
              </div>
              <div className="text-center bg-purple-50 rounded-xl py-3">
                <p className="text-2xl font-bold text-purple-600">{formatDuration(stats.monthMinutes).replace(/小时.*/, '') || '0'}</p>
                <p className="text-xs text-purple-500">本月学习</p>
              </div>
              <div className="text-center bg-green-50 rounded-xl py-3">
                <p className="text-2xl font-bold text-green-600">{stats.totalNotes}</p>
                <p className="text-xs text-green-500">笔记数</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 效率分析 */}
      <motion.div 
        className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 rounded-3xl shadow-xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-purple-300" />
          <h3 className="font-display font-bold text-lg">学习效率分析</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" 
                  stroke="url(#efficiencyGradient)" 
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min(stats.avgMinutesPerSession / 60, 1))}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{Math.round((stats.avgMinutesPerSession / 60) * 100)}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-300">平均学习效率</p>
            <p className="text-xs text-gray-500">目标60分钟/次</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min(stats.totalNotes / Math.max(stats.totalSessions, 1), 1))}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">
                  {stats.totalSessions > 0 ? Math.round((stats.totalNotes / stats.totalSessions) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-300">笔记完成率</p>
            <p className="text-xs text-gray-500">有笔记的记录</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" 
                  stroke="#f59e0b" 
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min((simon.streakDays || 0) / 7, 1))}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{simon.streakDays || 0}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300">连续学习</p>
            <p className="text-xs text-gray-500">当前连胜天数</p>
          </div>

          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle 
                  cx="40" cy="40" r="35" fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - Math.min(stats.uniqueTopics / 20, 1))}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold">{stats.uniqueTopics}</span>
              </div>
            </div>
            <p className="text-sm text-gray-300">知识点</p>
            <p className="text-xs text-gray-500">已学习的主题</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
