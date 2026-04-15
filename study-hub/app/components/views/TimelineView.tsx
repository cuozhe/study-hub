'use client';

import { useMemo } from 'react';
import { Clock, BookOpen, Target, Flame, Star, Award } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { StudySession, SimonState } from '@/app/types';

interface TimelineViewProps {
  sessions: StudySession[];
  simon: SimonState;
}

export function TimelineView({ sessions, simon }: TimelineViewProps) {
  // 按日期分组并排序
  const timelineData = useMemo(() => {
    const grouped = sessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(session);
      return acc;
    }, {} as Record<string, StudySession[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, daySessions]) => ({
        date,
        sessions: daySessions,
        totalTime: daySessions.reduce((acc, s) => acc + (s.duration || 0), 0),
        pomodoros: daySessions.reduce((acc, s) => acc + (s.pomodoros || 0), 0),
      }));
  }, [sessions]);

  // 成就徽章
  const badges = useMemo(() => [
    { days: 3, icon: '🔥', title: '周专注达人', gradient: 'from-orange-400 to-red-500', unlocked: (simon.streakDays || 0) >= 3 },
    { days: 7, icon: '🏆', title: '坚持不懈', gradient: 'from-amber-400 to-yellow-500', unlocked: (simon.streakDays || 0) >= 7 },
    { days: 30, icon: '👑', title: '学习大师', gradient: 'from-purple-400 to-pink-500', unlocked: (simon.streakDays || 0) >= 30 },
  ], [simon.streakDays]);

  // 格式化时长
  const formatDuration = (minutes: number) => {
    if (!minutes) return '0分钟';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}分钟`;
    return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* 成就徽章 */}
      <motion.div 
        className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 rounded-3xl p-6 border border-amber-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-amber-500" />
          <h3 className="font-display font-bold text-lg text-gray-800">学习成就</h3>
          {(simon.streakDays || 0) > 0 && (
            <span className="ml-auto text-sm text-amber-600 font-medium">
              🔥 {simon.streakDays}天连续学习
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <motion.div 
              key={badge.days}
              className={`rounded-2xl p-4 text-center transition-all ${
                badge.unlocked 
                  ? `bg-gradient-to-br ${badge.gradient} shadow-lg` 
                  : 'bg-gray-100'
              }`}
              whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
            >
              <div className={`text-4xl mb-2 ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
                {badge.icon}
              </div>
              <p className={`text-sm font-semibold ${badge.unlocked ? 'text-white' : 'text-gray-500'}`}>
                {badge.title}
              </p>
              <p className={`text-xs ${badge.unlocked ? 'text-white/80' : 'text-gray-400'}`}>
                连续学习{badge.days}天
              </p>
              {badge.unlocked && (
                <span className="inline-block mt-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                  ✓ 已解锁
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 时间线 */}
      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-purple-500" />
          <h3 className="font-display font-bold text-xl text-gray-800">学习历程</h3>
          <span className="ml-auto text-sm text-gray-500">
            共 {sessions.length} 条记录
          </span>
        </div>

        {timelineData.length === 0 ? (
          <div className="text-center py-16">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <BookOpen className="w-12 h-12 text-gray-400" />
            </motion.div>
            <h3 className="font-display font-bold text-xl text-gray-700 mb-2">还没有学习记录</h3>
            <p className="text-gray-500">去地图选择主题，开始你的学习之旅吧！</p>
          </div>
        ) : (
          <div className="relative pl-8">
            {/* 时间线中轴 */}
            <div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-300 via-pink-300 to-orange-300 rounded-full" />

            <div className="space-y-8">
              {timelineData.map((day, dayIndex) => {
                const today = isToday(parseISO(day.date));
                return (
                  <motion.div 
                    key={day.date} 
                    className="relative"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dayIndex * 0.1 }}
                  >
                    {/* 日期节点 */}
                    <div className={`absolute -left-5 w-4 h-4 rounded-full border-4 ${
                      today 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-200 shadow-lg shadow-purple-500/50' 
                        : 'bg-white border-purple-300'
                    }`}>
                      {today && (
                        <motion.div 
                          className="absolute inset-0 rounded-full bg-purple-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* 日期标题 */}
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="font-display font-bold text-lg text-gray-800 flex items-center gap-2">
                        {format(parseISO(day.date), 'M月d日', { locale: zhCN })}
                        {today && (
                          <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full">
                            今天
                          </span>
                        )}
                      </h4>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <span className="text-lg">🍅</span>
                        {day.pomodoros}个 · {formatDuration(day.totalTime)}
                      </span>
                    </div>

                    {/* 当天学习记录 */}
                    <div className="space-y-3 pl-4">
                      {day.sessions.map((session) => (
                        <motion.div 
                          key={session.id}
                          className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-5 border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                          whileHover={{ x: 4 }}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors">
                                {session.topic}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{session.subject}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                              <Target className="w-4 h-4" />
                              {session.pomodoros || 0}
                            </div>
                          </div>
                          
                          {/* 简要展示 */}
                          {session.cornellNote?.cues && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2 bg-white/80 rounded-xl p-3 border border-gray-100">
                              <span className="font-medium text-purple-600">📌</span> {session.cornellNote.cues}
                            </p>
                          )}
                          
                          {session.feynmanOutput && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic">
                              <span className="font-medium text-orange-600">🎓</span> {session.feynmanOutput}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
