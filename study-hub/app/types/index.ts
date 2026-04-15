// 学习记录类型
export interface StudySession {
  id: string;
  date: string;
  topic: string;
  subject: string;
  pomodoros: number;
  duration: number; // 分钟
  cornellNote: CornellNote;
  feynmanOutput: string;
  createdAt: number;
  completedAt?: number;
}

// 康奈尔笔记
export interface CornellNote {
  cues: string;      // 线索栏（关键词、问题）
  notes: string;     // 笔记栏（详细内容）
  summary: string;   // 总结栏
}

// 复习计划
export interface ReviewPlan {
  id: string;
  sessionId: string;
  topic: string;
  reviewDates: ReviewDate[];
}

export interface ReviewDate {
  date: string;
  day: number; // 第几天复习 (1, 2, 4, 7, 15, 30)
  completed: boolean;
}

// 学习路径
export interface StudyPath {
  id: string;
  name: string;
  description: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  status: 'locked' | 'available' | 'learning' | 'completed';
  estimatedMinutes: number;
}

// 番茄钟状态
export interface PomodoroState {
  isRunning: boolean;
  isBreak: boolean;
  timeLeft: number; // 秒
  currentSession: number;
  completedToday: number;
}

// 西蒙学习法状态
export interface SimonState {
  streakDays: number;
  todayGoalMinutes: number;
  todayCompletedMinutes: number;
  lastStudyDate: string;
}

// 视图类型
export type ViewType = 'calendar' | 'stats' | 'timeline' | 'map' | 'notes' | 'review';

// 统计数据
export interface StatsData {
  totalStudyTime: number;
  totalPomodoros: number;
  currentStreak: number;
  longestStreak: number;
  knowledgeNodes: number;
  dailyData: DailyData[];
}

export interface DailyData {
  date: string;
  studyTime: number;
  pomodoros: number;
}
