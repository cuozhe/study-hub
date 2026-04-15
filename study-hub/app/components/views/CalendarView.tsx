'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Target } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import type { StudySession, ReviewPlan } from '@/app/types';

interface CalendarViewProps {
  sessions: StudySession[];
  reviewPlans: ReviewPlan[];
}

export function CalendarView({ sessions, reviewPlans }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 获取当前月的日期
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // 获取某天的学习记录
  const getSessionsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return sessions.filter(s => s.date === dateStr);
  };

  // 获取某天的复习任务
  const getReviewsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reviewPlans.flatMap(plan => 
      plan.reviewDates.filter(rd => rd.date === dateStr)
    );
  };

  // 计算热量（用于日历颜色深度）
  const getHeatLevel = (date: Date) => {
    const daySessions = getSessionsForDate(date);
    if (daySessions.length === 0) return 0;
    const totalMinutes = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    return Math.min(4, Math.floor(totalMinutes / 30)); // 0-4 级热度
  };

  // 计算某天的复习完成率
  const getReviewCompletionRate = (date: Date) => {
    const reviews = getReviewsForDate(date);
    if (reviews.length === 0) return null;
    const completed = reviews.filter(r => r.completed).length;
    return Math.round((completed / reviews.length) * 100);
  };

  // 导航到上个月
  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  // 导航到下个月
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // 导航到今天
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // 选中某天
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // 获取选中日期的记录
  const selectedDateSessions = selectedDate ? getSessionsForDate(selectedDate) : [];
  const selectedDateReviews = selectedDate ? getReviewsForDate(selectedDate) : [];

  // 热度颜色
  const heatColors = [
    'bg-gray-50',
    'bg-orange-100',
    'bg-orange-200',
    'bg-orange-300',
    'bg-orange-400',
  ];

  return (
    <div className="space-y-6">
      {/* 日历头部 */}
      <motion.div 
        className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPrevMonth}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-display font-bold text-xl text-gray-800">
              {format(currentDate, 'yyyy年 MMMM', { locale: zhCN })}
            </h2>
            <button
              onClick={goToNextMonth}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
            >
              今天
            </button>
          </div>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
            <div 
              key={day} 
              className={`text-center text-sm font-medium py-2 ${
                index >= 5 ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-2">
          {monthDays.map((date, index) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const heatLevel = getHeatLevel(date);
            const reviewRate = getReviewCompletionRate(date);
            const daySessions = getSessionsForDate(date);
            const hasReviews = getReviewsForDate(date).length > 0;

            return (
              <motion.button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                className={`
                  relative aspect-square rounded-2xl flex flex-col items-center justify-center
                  transition-all relative overflow-hidden
                  ${!isCurrentMonth ? 'opacity-30' : ''}
                  ${heatLevel > 0 ? heatColors[heatLevel] : 'hover:bg-gray-50'}
                  ${isToday ? 'ring-2 ring-orange-500 ring-offset-2' : ''}
                  ${isSelected ? 'bg-gradient-to-br from-orange-100 to-amber-100 ring-2 ring-orange-400' : ''}
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
              >
                <span className={`
                  text-sm font-medium
                  ${isToday ? 'text-orange-600 font-bold' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
                `}>
                  {format(date, 'd')}
                </span>
                
                {/* 学习记录指示 */}
                {daySessions.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    {daySessions.length > 1 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    )}
                  </div>
                )}

                {/* 复习状态指示 */}
                {hasReviews && (
                  <div className="absolute top-1 right-1">
                    {reviewRate === 100 ? (
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    ) : reviewRate !== null && reviewRate > 0 ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* 图例 */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100" />
            <span className="text-xs text-gray-500">少量学习</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-300" />
            <span className="text-xs text-gray-500">较多学习</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span className="text-xs text-gray-500">复习完成</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400" />
            <span className="text-xs text-gray-500">复习待完成</span>
          </div>
        </div>
      </motion.div>

      {/* 选中日期详情 */}
      <AnimatePresence mode="wait">
        {selectedDate && (
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-4">
              <CalendarIcon className="w-6 h-6 text-orange-500" />
              <h3 className="font-display font-bold text-lg text-gray-800">
                {format(selectedDate, 'yyyy年M月d日', { locale: zhCN })}
                {isSameDay(selectedDate, new Date()) && (
                  <span className="ml-2 text-sm text-orange-500">今天</span>
                )}
              </h3>
            </div>

            {selectedDateSessions.length === 0 && selectedDateReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>这天没有学习记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 学习记录 */}
                {selectedDateSessions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      学习记录 ({selectedDateSessions.length}次)
                    </h4>
                    <div className="space-y-2">
                      {selectedDateSessions.map(session => (
                        <div 
                          key={session.id}
                          className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-800">{session.topic}</p>
                              <p className="text-sm text-gray-500">{session.subject}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-orange-600">
                                {session.pomodoros || 0} 🍅
                              </p>
                              <p className="text-sm text-gray-500">
                                {session.duration || 0}分钟
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 复习任务 */}
                {selectedDateReviews.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      📚 复习任务 ({selectedDateReviews.filter(r => r.completed).length}/{selectedDateReviews.length})
                    </h4>
                    <div className="space-y-2">
                      {selectedDateReviews.map((review, index) => (
                        <div 
                          key={index}
                          className={`rounded-xl p-3 border ${
                            review.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">
                              第{review.day}天复习
                            </span>
                            {review.completed ? (
                              <span className="text-green-600 text-sm flex items-center gap-1">
                                ✓ 已完成
                              </span>
                            ) : (
                              <span className="text-yellow-600 text-sm">
                                ⏳ 待复习
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 月度统计 */}
      <motion.div
        className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-3xl p-6 border border-purple-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-display font-bold text-lg text-gray-800 mb-4">本月统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(() => {
            const monthSessions = sessions.filter(s => 
              isSameMonth(parseISO(s.date), currentDate)
            );
            const studyDays = new Set(monthSessions.map(s => s.date)).size;
            const totalMinutes = monthSessions.reduce((acc, s) => acc + (s.duration || 0), 0);
            const totalPomodoros = monthSessions.reduce((acc, s) => acc + (s.pomodoros || 0), 0);
            const avgMinutes = studyDays > 0 ? Math.round(totalMinutes / studyDays) : 0;
            
            return [
              { label: '学习天数', value: studyDays, icon: '📅' },
              { label: '总时长', value: `${Math.floor(totalMinutes / 60)}h${totalMinutes % 60}m`, icon: '⏱️' },
              { label: '番茄钟', value: totalPomodoros, icon: '🍅' },
              { label: '日均时长', value: `${avgMinutes}分钟`, icon: '📊' },
            ];
          })().map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-display font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
