'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  BarChart3, 
  Clock, 
  Map, 
  StickyNote, 
  RotateCcw,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import type { ViewType } from '@/app/types';
import { motion, AnimatePresence } from 'framer-motion';

interface NavigationProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const navItems: { id: ViewType; label: string; icon: typeof Calendar; color: string }[] = [
  { id: 'calendar', label: '日历', icon: Calendar, color: 'from-orange-400 to-red-400' },
  { id: 'stats', label: '统计', icon: BarChart3, color: 'from-blue-400 to-cyan-400' },
  { id: 'timeline', label: '时间线', icon: Clock, color: 'from-purple-400 to-pink-400' },
  { id: 'map', label: '地图', icon: Map, color: 'from-green-400 to-emerald-400' },
  { id: 'notes', label: '笔记', icon: StickyNote, color: 'from-yellow-400 to-orange-400' },
  { id: 'review', label: '复习', icon: RotateCcw, color: 'from-rose-400 to-red-400' },
];

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 via-red-400 to-purple-500 flex items-center justify-center shadow-lg shadow-orange-500/30 animate-pulse-glow">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-purple-500 rounded-2xl blur-lg opacity-30 -z-10" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl gradient-text-warm">
                StudyHub
              </span>
              <p className="text-xs text-gray-500 -mt-1">智能学习助手</p>
            </div>
          </motion.div>

          {/* 桌面导航 */}
          <motion.div 
            className="hidden lg:flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navItems.map(({ id, label, icon: Icon, color }, index) => {
              const isActive = currentView === id;
              return (
                <motion.button
                  key={id}
                  onClick={() => onViewChange(id)}
                  className={`relative px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 group ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl shadow-lg`}
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce-subtle' : ''}`} />
                    <span className="font-medium">{label}</span>
                  </span>
                  
                  {/* Hover 指示器 */}
                  {!isActive && (
                    <span className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 移动端菜单 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map(({ id, label, icon: Icon, color }) => {
                const isActive = currentView === id;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      onViewChange(id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
                      isActive 
                        ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
