'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  StudySession, 
  ReviewPlan, 
  StudyPath, 
  PomodoroState, 
  SimonState,
  Topic
} from '@/app/types';

// 本地存储 key
const STORAGE_KEY = 'study-hub-data';

// 默认学习路径 - 软考中级网络工程师
const DEFAULT_STUDY_PATH: StudyPath = {
  id: 'network-engineer-mid',
  name: '网络工程师（中级）',
  description: '软考中级网络工程师学习路径',
  subjects: [
    {
      id: 'computer-basics',
      name: '计算机系统知识',
      topics: [
        { id: 'hardware', name: '计算机硬件基础', status: 'available', estimatedMinutes: 90 },
        { id: 'os', name: '操作系统基础', status: 'available', estimatedMinutes: 120 },
        { id: 'data-structure', name: '数据结构与算法', status: 'available', estimatedMinutes: 90 },
      ]
    },
    {
      id: 'network-basics',
      name: '网络基础知识',
      topics: [
        { id: 'osi', name: 'OSI参考模型', status: 'available', estimatedMinutes: 60 },
        { id: 'tcp-ip', name: 'TCP/IP协议组', status: 'available', estimatedMinutes: 150 },
        { id: 'ip-address', name: 'IP地址规划', status: 'available', estimatedMinutes: 90 },
      ]
    },
    {
      id: 'network-tech',
      name: '网络技术与安全',
      topics: [
        { id: 'lan', name: '局域网技术', status: 'available', estimatedMinutes: 120 },
        { id: 'routing', name: '路由交换技术', status: 'available', estimatedMinutes: 180 },
        { id: 'security', name: '网络安全', status: 'available', estimatedMinutes: 150 },
      ]
    },
  ]
};

// 默认番茄钟状态
const DEFAULT_POMODORO: PomodoroState = {
  isRunning: false,
  isBreak: false,
  timeLeft: 25 * 60,
  currentSession: 0,
  completedToday: 0,
};

// 默认西蒙状态
const DEFAULT_SIMON: SimonState = {
  streakDays: 0,
  todayGoalMinutes: 120,
  todayCompletedMinutes: 0,
  lastStudyDate: '',
};

interface StudyStore {
  sessions: StudySession[];
  reviewPlans: ReviewPlan[];
  studyPath: StudyPath;
  pomodoro: PomodoroState;
  simon: SimonState;
  currentTopic: string;
  currentSubject: string;
}

const DEFAULT_STORE: StudyStore = {
  sessions: [],
  reviewPlans: [],
  studyPath: DEFAULT_STUDY_PATH,
  pomodoro: DEFAULT_POMODORO,
  simon: DEFAULT_SIMON,
  currentTopic: '',
  currentSubject: '',
};

export function useStudyStore() {
  const [store, setStore] = useState<StudyStore>(DEFAULT_STORE);
  const [isLoaded, setIsLoaded] = useState(false);
  const isInitializedRef = useRef(false);

  // 加载本地数据
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setStore({
          ...DEFAULT_STORE,
          ...parsed,
          pomodoro: { ...DEFAULT_POMODORO, ...parsed.pomodoro },
          simon: { ...DEFAULT_SIMON, ...parsed.simon },
        });
      }
    } catch (e) {
      console.error('Failed to load study data:', e);
    }
    setIsLoaded(true);
  }, []);

  // 保存数据到本地
  const saveToStorage = useCallback((newStore: StudyStore) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
    } catch (e) {
      console.error('Failed to save study data:', e);
    }
  }, []);

  // 添加学习记录
  const addSession = useCallback((session: StudySession) => {
    setStore(prev => {
      const today = new Date().toISOString().split('T')[0];
      
      // 创建艾宾浩斯复习计划
      const reviewPlan: ReviewPlan = {
        id: `review-${session.id}`,
        sessionId: session.id,
        topic: session.topic,
        reviewDates: [1, 2, 4, 7, 15, 30].map(dayOffset => {
          const date = new Date(session.date);
          date.setDate(date.getDate() + dayOffset);
          return {
            date: date.toISOString().split('T')[0],
            day: dayOffset,
            completed: false,
          };
        }),
      };
      
      // 更新西蒙状态
      let newSimon = { ...prev.simon };
      const lastDate = prev.simon.lastStudyDate;
      
      if (lastDate !== today) {
        if (lastDate) {
          const last = new Date(lastDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newSimon.streakDays = (prev.simon.streakDays || 0) + 1;
          } else if (diffDays > 1) {
            newSimon.streakDays = 1;
          }
        } else {
          newSimon.streakDays = 1;
        }
        newSimon.lastStudyDate = today;
        newSimon.todayCompletedMinutes = session.duration;
      } else {
        newSimon.todayCompletedMinutes = (prev.simon.todayCompletedMinutes || 0) + session.duration;
      }
      
      const newStore = {
        ...prev,
        sessions: [...prev.sessions, session],
        reviewPlans: [...prev.reviewPlans, reviewPlan],
        simon: newSimon,
        currentTopic: '',
        currentSubject: '',
      };
      
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 更新复习状态
  const completeReview = useCallback((planId: string, dateIndex: number) => {
    setStore(prev => {
      const newStore = {
        ...prev,
        reviewPlans: prev.reviewPlans.map(plan => 
          plan.id === planId 
            ? {
                ...plan,
                reviewDates: plan.reviewDates.map((rd, idx) => 
                  idx === dateIndex ? { ...rd, completed: true } : rd
                ),
              }
            : plan
        ),
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 更新番茄钟状态
  const updatePomodoro = useCallback((updates: Partial<PomodoroState>) => {
    setStore(prev => {
      const newStore = {
        ...prev,
        pomodoro: { ...prev.pomodoro, ...updates },
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 完成一个番茄钟
  const completePomodoro = useCallback(() => {
    setStore(prev => {
      const newStore = {
        ...prev,
        pomodoro: {
          ...prev.pomodoro,
          completedToday: (prev.pomodoro.completedToday || 0) + 1,
          isRunning: false,
          isBreak: !prev.pomodoro.isBreak,
          timeLeft: prev.pomodoro.isBreak ? 25 * 60 : 5 * 60,
        },
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 设置当前学习主题
  const setCurrentTopic = useCallback((subject: string, topic: string) => {
    setStore(prev => {
      const newStore = {
        ...prev,
        currentSubject: subject,
        currentTopic: topic,
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 更新学习路径中主题的状态
  const updateTopicStatus = useCallback((subjectId: string, topicId: string, status: Topic['status']) => {
    setStore(prev => {
      const newStore = {
        ...prev,
        studyPath: {
          ...prev.studyPath,
          subjects: prev.studyPath.subjects.map(subject => 
            subject.id === subjectId 
              ? {
                  ...subject,
                  topics: subject.topics.map(topic => 
                    topic.id === topicId ? { ...topic, status } : topic
                  ),
                }
              : subject
          ),
        },
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 设置学习目标
  const setTodayGoal = useCallback((minutes: number) => {
    setStore(prev => {
      const newStore = {
        ...prev,
        simon: { ...prev.simon, todayGoalMinutes: minutes },
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 导入学习路径
  const importStudyPath = useCallback((path: StudyPath) => {
    setStore(prev => {
      const newStore = {
        ...prev,
        studyPath: path,
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 重置今日番茄钟计数
  const resetTodayPomodoro = useCallback(() => {
    setStore(prev => {
      const newStore = {
        ...prev,
        pomodoro: {
          ...DEFAULT_POMODORO,
          completedToday: 0,
        },
      };
      saveToStorage(newStore);
      return newStore;
    });
  }, [saveToStorage]);

  // 清除所有数据
  const clearAllData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStore(DEFAULT_STORE);
  }, []);

  return {
    store,
    isLoaded,
    addSession,
    completeReview,
    updatePomodoro,
    completePomodoro,
    setCurrentTopic,
    updateTopicStatus,
    setTodayGoal,
    importStudyPath,
    resetTodayPomodoro,
    clearAllData,
  };
}
