'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Navigation } from '@/app/components/Navigation';
import { PomodoroTimer } from '@/app/components/PomodoroTimer';
import { CornellNote } from '@/app/components/CornellNote';
import { FeynmanOutput } from '@/app/components/FeynmanOutput';
import { MarkdownExport } from '@/app/components/MarkdownExport';
import { CalendarView } from '@/app/components/views/CalendarView';
import { StatsView } from '@/app/components/views/StatsView';
import { TimelineView } from '@/app/components/views/TimelineView';
import { KnowledgeMapView } from '@/app/components/views/KnowledgeMapView';
import { NotesWallView } from '@/app/components/views/NotesWallView';
import { ReviewQueueView } from '@/app/components/views/ReviewQueueView';
import { useStudyStore } from '@/app/hooks/useStudyStore';
import type { ViewType, CornellNote as CornellNoteType, StudySession } from '@/app/types';
import { Check, ChevronRight, Target, Clock, BookOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type StudyStep = 'pomodoro' | 'note' | 'feynman' | 'complete';

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('calendar');
  const [showStudyPanel, setShowStudyPanel] = useState(false);
  
  // 学习流程状态
  const [studyStep, setStudyStep] = useState<StudyStep>('pomodoro');
  const [cornellNote, setCornellNote] = useState<CornellNoteType>({ cues: '', notes: '', summary: '' });
  const [feynmanText, setFeynmanText] = useState('');
  const [lastCompletedSession, setLastCompletedSession] = useState<StudySession | null>(null);
  
  const { 
    store, 
    isLoaded,
    addSession,
    completeReview,
    updatePomodoro,
    completePomodoro,
    setCurrentTopic,
    updateTopicStatus,
    importStudyPath,
  } = useStudyStore();

  // 选择主题并开始学习
  const handleSelectTopic = useCallback((subject: string, topic: string) => {
    setCurrentTopic(subject, topic);
    // 重置学习状态
    setStudyStep('pomodoro');
    setCornellNote({ cues: '', notes: '', summary: '' });
    setFeynmanText('');
    // 重置番茄钟
    updatePomodoro({ 
      isRunning: false, 
      isBreak: false, 
      timeLeft: 25 * 60,
      completedToday: store.pomodoro.completedToday || 0
    });
    setShowStudyPanel(true);
  }, [setCurrentTopic, updatePomodoro, store.pomodoro.completedToday]);

  // 完成学习
  const handleCompleteStudy = useCallback(() => {
    if (feynmanText.length < 30) {
      alert('费曼输出至少需要30个字，请用自己的话详细解释学习内容');
      return;
    }

    if (!store.currentTopic || !store.currentSubject) {
      alert('请先选择学习主题');
      return;
    }

    const session: StudySession = {
      id: `session-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      topic: store.currentTopic,
      subject: store.currentSubject,
      pomodoros: store.pomodoro.completedToday || 0,
      duration: (store.pomodoro.completedToday || 0) * 25,
      cornellNote,
      feynmanOutput: feynmanText,
      createdAt: Date.now(),
      completedAt: Date.now(),
    };

    addSession(session);
    setLastCompletedSession(session);
    
    // 更新主题状态为已完成
    const subject = store.studyPath.subjects.find(s => s.name === store.currentSubject);
    if (subject) {
      const topic = subject.topics.find(t => t.name === store.currentTopic);
      if (topic) {
        updateTopicStatus(subject.id, topic.id, 'completed');
      }
    }

    setStudyStep('complete');
  }, [store, cornellNote, feynmanText, addSession, updateTopicStatus]);

  // 开始新的学习
  const handleNewStudy = useCallback(() => {
    setCurrentTopic('', '');
    setStudyStep('pomodoro');
    setCornellNote({ cues: '', notes: '', summary: '' });
    setFeynmanText('');
    setShowStudyPanel(false);
    updatePomodoro({ 
      isRunning: false, 
      isBreak: false, 
      timeLeft: 25 * 60,
    });
    // 切换到地图视图
    setCurrentView('map');
  }, [setCurrentTopic, updatePomodoro]);

  // 继续学习（从顶部按钮）
  const handleContinueStudy = useCallback(() => {
    setShowStudyPanel(true);
  }, []);

  // 渲染对应视图
  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView sessions={store.sessions} reviewPlans={store.reviewPlans} />;
      case 'stats':
        return <StatsView sessions={store.sessions} simon={store.simon} />;
      case 'timeline':
        return <TimelineView sessions={store.sessions} simon={store.simon} />;
      case 'map':
        return (
          <KnowledgeMapView 
            studyPath={store.studyPath}
            onUpdateTopic={updateTopicStatus}
            onSelectTopic={handleSelectTopic}
            onImportPath={importStudyPath}
            currentTopic={store.currentTopic}
          />
        );
      case 'notes':
        return <NotesWallView sessions={store.sessions} />;
      case 'review':
        return (
          <ReviewQueueView 
            reviewPlans={store.reviewPlans}
            sessions={store.sessions}
            onCompleteReview={completeReview}
          />
        );
      default:
        return null;
    }
  };

  // 获取步骤标题
  const getStepTitle = () => {
    switch (studyStep) {
      case 'pomodoro': return '番茄工作法';
      case 'note': return '康奈尔笔记';
      case 'feynman': return '费曼技巧';
      case 'complete': return '学习完成';
      default: return '';
    }
  };

  // 计算步骤顺序
  const getStepIndex = (step: StudyStep) => {
    const steps: StudyStep[] = ['pomodoro', 'note', 'feynman', 'complete'];
    return steps.indexOf(step);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-500 font-medium">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-orange-50/30">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* 顶部状态栏 */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap items-center justify-between gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6">
            {/* 西蒙学习法状态 */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">今日目标</p>
                <p className="font-semibold text-sm">
                  {store.simon.todayCompletedMinutes || 0}/{store.simon.todayGoalMinutes || 120}分钟
                </p>
              </div>
            </div>

            {/* 番茄钟完成数 */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">今日番茄</p>
                <p className="font-semibold text-sm">{store.pomodoro.completedToday || 0}个</p>
              </div>
            </div>

            {/* 连胜天数 */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <span className="text-lg">🔥</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">连胜天数</p>
                <p className="font-semibold text-sm">{store.simon.streakDays || 0}天</p>
              </div>
            </div>
          </div>

          {/* 当前学习主题 */}
          <div className="flex items-center gap-4">
            {store.currentTopic ? (
              <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 rounded-xl border border-orange-200">
                <BookOpen className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-xs text-orange-600">当前学习</p>
                  <p className="font-semibold text-sm text-orange-800">{store.currentTopic}</p>
                </div>
                <button
                  onClick={handleContinueStudy}
                  className="ml-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-md"
                >
                  {studyStep === 'complete' ? '查看' : '继续'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('map')}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                <span>👈</span>
                <span>去地图选择主题开始学习</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* 主内容区 */}
        {renderView()}
      </div>

      {/* 学习面板弹窗 */}
      <AnimatePresence>
        {showStudyPanel && store.currentTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget && studyStep !== 'pomodoro') {
                // 不允许关闭正在学习的面板
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* 面板头部 */}
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-xl text-white">
                    {getStepTitle()}
                  </h2>
                  <p className="text-sm text-white/80">{store.currentSubject} · {store.currentTopic}</p>
                </div>
                {studyStep !== 'pomodoro' && (
                  <button
                    onClick={() => setShowStudyPanel(false)}
                    className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="p-6 max-h-[calc(90vh-100px)] overflow-y-auto">
                {/* 步骤指示器 */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {(['pomodoro', 'note', 'feynman', 'complete'] as StudyStep[]).map((step, idx) => {
                    const currentIdx = getStepIndex(studyStep);
                    const isCurrent = studyStep === step;
                    const isPast = idx < currentIdx;
                    const isFuture = idx > currentIdx;
                    
                    return (
                      <div key={step} className="flex items-center">
                        <motion.div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                            isCurrent 
                              ? 'bg-white text-orange-500 shadow-lg scale-110' 
                              : isPast
                                ? 'bg-green-400 text-white'
                                : 'bg-gray-200 text-gray-400'
                          }`}
                          whileHover={{ scale: isFuture ? 1.05 : 1 }}
                        >
                          {isPast ? '✓' : idx + 1}
                        </motion.div>
                        {idx < 3 && (
                          <div className={`w-12 h-0.5 mx-1 ${
                            isPast ? 'bg-green-400' : 'bg-gray-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 步骤内容 */}
                {studyStep === 'pomodoro' && (
                  <div className="space-y-6">
                    <PomodoroTimer 
                      state={store.pomodoro}
                      onUpdate={updatePomodoro}
                      onComplete={completePomodoro}
                    />
                    <div className="text-center space-y-4">
                      <p className="text-gray-500">
                        完成番茄钟后，记录学习笔记
                      </p>
                      <button
                        onClick={() => setStudyStep('note')}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                      >
                        完成，进入笔记
                      </button>
                    </div>
                  </div>
                )}

                {studyStep === 'note' && (
                  <div className="space-y-6">
                    <CornellNote 
                      note={cornellNote}
                      onChange={setCornellNote}
                    />
                    <div className="flex justify-between">
                      <button
                        onClick={() => setStudyStep('pomodoro')}
                        className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        返回番茄钟
                      </button>
                      <button
                        onClick={() => setStudyStep('feynman')}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                      >
                        完成，进入费曼输出
                      </button>
                    </div>
                  </div>
                )}

                {studyStep === 'feynman' && (
                  <div className="space-y-6">
                    <FeynmanOutput 
                      value={feynmanText}
                      onChange={setFeynmanText}
                    />
                    <div className="flex justify-between">
                      <button
                        onClick={() => setStudyStep('note')}
                        className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        返回笔记
                      </button>
                      <button
                        onClick={handleCompleteStudy}
                        disabled={feynmanText.length < 30}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {feynmanText.length < 30 ? `还需${30 - feynmanText.length}字` : '完成学习'}
                      </button>
                    </div>
                  </div>
                )}

                {studyStep === 'complete' && (
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl"
                      >
                        <Check className="w-12 h-12 text-white" />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="absolute -top-2 -right-2"
                      >
                        <Sparkles className="w-8 h-8 text-yellow-400 animate-bounce" />
                      </motion.div>
                    </div>
                    
                    <div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-display font-bold text-gray-800"
                      >
                        🎉 恭喜完成学习！
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-500 mt-2"
                      >
                        艾宾浩斯复习计划已自动生成，记得按时复习！
                      </motion.p>
                    </div>

                    {/* 学习统计 */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex justify-center gap-6"
                    >
                      <div className="bg-orange-50 rounded-xl px-4 py-2">
                        <p className="text-2xl font-bold text-orange-600">{store.pomodoro.completedToday || 0}</p>
                        <p className="text-xs text-orange-500">番茄钟</p>
                      </div>
                      <div className="bg-green-50 rounded-xl px-4 py-2">
                        <p className="text-2xl font-bold text-green-600">{(store.pomodoro.completedToday || 0) * 25}</p>
                        <p className="text-xs text-green-500">分钟</p>
                      </div>
                    </motion.div>

                    {/* 导出 Markdown */}
                    {lastCompletedSession && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-left"
                      >
                        <MarkdownExport 
                          session={lastCompletedSession}
                          reviewPlan={store.reviewPlans[store.reviewPlans.length - 1]}
                        />
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex justify-center gap-4"
                    >
                      <button
                        onClick={handleNewStudy}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
                      >
                        开始新的学习
                      </button>
                      <button
                        onClick={() => {
                          setShowStudyPanel(false);
                          setCurrentView('review');
                        }}
                        className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        查看复习计划
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
