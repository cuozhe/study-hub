'use client';

import { useMemo, useCallback } from 'react';
import { CheckCircle2, Clock, AlertCircle, BookOpen, Calendar } from 'lucide-react';
import { format, parseISO, isToday, isTomorrow, isPast, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { ReviewPlan, StudySession } from '@/app/types';

interface ReviewQueueViewProps {
  reviewPlans: ReviewPlan[];
  sessions: StudySession[];
  onCompleteReview: (planId: string, dateIndex: number) => void;
}

export function ReviewQueueView({ reviewPlans, sessions, onCompleteReview }: ReviewQueueViewProps) {
  // 获取今天的日期字符串
  const today = new Date().toISOString().split('T')[0];

  // 定义复习任务项类型
  type ReviewTaskItem = { 
    plan: ReviewPlan; 
    reviewDate: ReviewPlan['reviewDates'][0]; 
    index: number 
  };

  // 按优先级分组复习任务
  const groupedTasks = useMemo(() => {
    const overdue: ReviewTaskItem[] = [];
    const todayTasks: ReviewTaskItem[] = [];
    const tomorrowTasks: ReviewTaskItem[] = [];
    const futureTasks: ReviewTaskItem[] = [];
    const completedTasks: ReviewTaskItem[] = [];

    reviewPlans.forEach(plan => {
      plan.reviewDates.forEach((reviewDate, index) => {
        const task = { plan, reviewDate, index };
        
        if (reviewDate.completed) {
          completedTasks.push(task);
        } else if (reviewDate.date === today) {
          todayTasks.push(task);
        } else if (reviewDate.date === addDays(new Date(), 1).toISOString().split('T')[0]) {
          tomorrowTasks.push(task);
        } else if (isPast(parseISO(reviewDate.date))) {
          overdue.push(task);
        } else {
          futureTasks.push(task);
        }
      });
    });

    // 按日期排序
    const sortByDate = (a: ReviewTaskItem, b: ReviewTaskItem) => 
      new Date(a.reviewDate.date).getTime() - new Date(b.reviewDate.date).getTime();

    return {
      overdue: overdue.sort(sortByDate),
      today: todayTasks.sort(sortByDate),
      tomorrow: tomorrowTasks.sort(sortByDate),
      future: futureTasks.sort(sortByDate),
      completed: completedTasks.sort((a, b) => 
        new Date(b.reviewDate.date).getTime() - new Date(a.reviewDate.date).getTime()
      ).slice(0, 10), // 只显示最近10个完成的
    };
  }, [reviewPlans, today]);

  // 计算统计数据
  const stats = useMemo(() => {
    const totalReviews = reviewPlans.reduce((acc, p) => acc + p.reviewDates.length, 0);
    const completedReviews = reviewPlans.reduce((acc, p) => 
      acc + p.reviewDates.filter(rd => rd.completed).length, 0);
    const todayReviews = groupedTasks.today.length;
    const overdueCount = groupedTasks.overdue.length;
    
    return {
      totalReviews,
      completedReviews,
      todayReviews,
      overdueCount,
      completionRate: totalReviews > 0 ? Math.round((completedReviews / totalReviews) * 100) : 0,
    };
  }, [reviewPlans, groupedTasks]);

  // 处理复习完成
  const handleComplete = useCallback((planId: string, index: number) => {
    onCompleteReview(planId, index);
  }, [onCompleteReview]);

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return '今天';
    if (isTomorrow(date)) return '明天';
    return format(date, 'M月d日', { locale: zhCN });
  };

  // 获取复习阶段的标签
  const getReviewDayLabel = (day: number) => {
    const labels: Record<number, string> = {
      1: '首次复习',
      2: '二次复习',
      4: '强化记忆',
      7: '一周回顾',
      15: '半月巩固',
      30: '月度回顾',
    };
    return labels[day] || `第${day}天`;
  };

  // 渲染任务卡片
  const renderTaskCard = (item: { plan: ReviewPlan; reviewDate: typeof item.plan.reviewDates[0]; index: number }, isOverdue: boolean = false) => (
    <motion.div
      key={`${item.plan.id}-${item.index}`}
      className={`rounded-2xl p-4 border transition-all ${
        isOverdue 
          ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' 
          : 'bg-white border-gray-100 hover:shadow-md'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-800 truncate">{item.plan.topic}</h4>
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs text-red-500 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                <AlertCircle className="w-3 h-3" />
                逾期
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(item.reviewDate.date)}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs">
              {getReviewDayLabel(item.reviewDate.day)}
            </span>
          </div>
        </div>
        
        <motion.button
          onClick={() => handleComplete(item.plan.id, item.index)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            isOverdue
              ? 'bg-gradient-to-br from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white shadow-lg'
              : 'bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <CheckCircle2 className="w-6 h-6" />
        </motion.button>
      </div>
    </motion.div>
  );

  // 渲染分组标题
  const renderSection = (title: string, count: number, icon: React.ReactNode, gradient: string) => (
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
        {icon}
      </div>
      <h3 className="font-display font-bold text-lg text-gray-800">{title}</h3>
      <span className="ml-auto bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
        {count}项
      </span>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">今日待复习</span>
          </div>
          <p className="text-3xl font-display font-bold text-gray-800">{stats.todayReviews}</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">已逾期</span>
          </div>
          <p className="text-3xl font-display font-bold text-red-500">{stats.overdueCount}</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">已完成</span>
          </div>
          <p className="text-3xl font-display font-bold text-gray-800">{stats.completedReviews}</p>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-medium">完成率</span>
          </div>
          <p className="text-3xl font-display font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {stats.completionRate}%
          </p>
        </motion.div>
      </div>

      {/* 逾期任务 */}
      {groupedTasks.overdue.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {renderSection('⚠️ 逾期任务', groupedTasks.overdue.length, <AlertCircle className="w-5 h-5" />, 'from-red-400 to-orange-500')}
          <div className="space-y-3">
            {groupedTasks.overdue.map(item => renderTaskCard(item, true))}
          </div>
        </motion.section>
      )}

      {/* 今日任务 */}
      {groupedTasks.today.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {renderSection('📅 今日复习', groupedTasks.today.length, <Clock className="w-5 h-5" />, 'from-orange-400 to-amber-500')}
          <div className="space-y-3">
            {groupedTasks.today.map(item => renderTaskCard(item))}
          </div>
        </motion.section>
      )}

      {/* 明日任务 */}
      {groupedTasks.tomorrow.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {renderSection('🌙 明日预告', groupedTasks.tomorrow.length, <Calendar className="w-5 h-5" />, 'from-blue-400 to-cyan-500')}
          <div className="space-y-3">
            {groupedTasks.tomorrow.map(item => renderTaskCard(item))}
          </div>
        </motion.section>
      )}

      {/* 未来任务 */}
      {groupedTasks.future.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {renderSection('📆 未来计划', groupedTasks.future.length, <BookOpen className="w-5 h-5" />, 'from-purple-400 to-pink-500')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groupedTasks.future.slice(0, 6).map(item => renderTaskCard(item))}
          </div>
          {groupedTasks.future.length > 6 && (
            <p className="text-center text-gray-500 text-sm mt-3">
              还有 {groupedTasks.future.length - 6} 项任务...
            </p>
          )}
        </motion.section>
      )}

      {/* 最近完成 */}
      {groupedTasks.completed.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-gray-800">最近完成</h3>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-green-50 rounded-2xl p-4 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {groupedTasks.completed.map(item => (
                <div key={`${item.plan.id}-${item.index}`} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{item.plan.topic}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 空状态 */}
      {reviewPlans.length === 0 && (
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
          <h3 className="font-display font-bold text-xl text-gray-700 mb-2">暂无复习计划</h3>
          <p className="text-gray-500">完成学习后会自动生成艾宾浩斯复习计划</p>
        </motion.div>
      )}
    </div>
  );
}
