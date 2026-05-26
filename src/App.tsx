/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LevelDashboard } from './components/LevelDashboard';
import { PracticeRoom } from './components/PracticeRoom';
import { CoachFeedback } from './components/CoachFeedback';
import { Level, PerformanceStats } from './types';
import { LEVELS } from './data';
import { auth, db, loginWithGoogle, logout, updateUserXP, logPageView, logUserIdentity, logCustomEvent } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { LogIn, LogOut, User as UserIcon, Camera, RotateCcw } from 'lucide-react';

import { SheetMusicCoach } from './components/SheetMusicCoach';
import { StarryBackground } from './components/StarryBackground';
import { DeveloperHub } from './components/DeveloperHub';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'practice' | 'feedback'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<'practice' | 'songs' | 'leaderboard'>('practice');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [xp, setXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoginReminder, setShowLoginReminder] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [isMemoryModeActive, setIsMemoryModeActive] = useState(false);
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);

  // Track initial page view and view changes
  useEffect(() => {
    let pageName = 'Dashboard';
    if (currentView === 'practice') pageName = 'Practice Room';
    if (currentView === 'feedback') pageName = 'Coach Feedback';
    
    if (currentView === 'dashboard') {
      if (selectedCategory === 'songs') pageName = 'Dashboard - Songs';
      if (selectedCategory === 'leaderboard') pageName = 'Dashboard - Leaderboard';
    }

    logPageView(pageName);
  }, [currentView, selectedCategory]);

  useEffect(() => {
    const checkOrientation = () => {
      // Basic mobile detection
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 1024);
      
      const isPortrait = window.innerHeight > window.innerWidth;
      
      setIsPortraitMobile(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      logUserIdentity(u ? u.uid : null);
      setLoading(false);
      if (!u) {
        setXp(0);
        // Show reminder after a short delay on initial load
        setTimeout(() => setShowLoginReminder(true), 2000);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
        if (doc.exists()) {
          setXp(doc.data().xp || 0);
        }
      });
      return unsubscribe;
    }
  }, [user]);

  const handleSelectLevel = (level: Level, memoryMode: boolean = false) => {
    if (level.lessons.length === 0) {
      return;
    }
    
    logCustomEvent('level_start', {
      level_id: level.id,
      level_title: level.title,
      memory_mode: memoryMode
    });

    setSelectedLevel(level);
    setIsMemoryModeActive(memoryMode);
    // If it's a direct song select from the dashboard grid
    if (level.lessons.length === 1) {
      setCurrentView('practice');
    }
  };

  const handlePracticeComplete = async (stats: PerformanceStats) => {
    setPerformanceStats(stats);
    const xpEarned = Math.floor(stats.score / 10);
    if (user) {
      await updateUserXP(user.uid, xpEarned);
    } else {
      setXp(prev => prev + xpEarned);
    }
    setCurrentView('feedback');
  };

  const handleFeedbackContinue = () => {
    setCurrentView('dashboard');
    // We keep selectedLevel so we stay "inside" that level view
    setPerformanceStats(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen text-slate-50 selection:bg-cyan-500/30 flex flex-col ${isPortraitMobile ? 'blur-md pointer-events-none overflow-hidden' : ''}`}>
        {/* Top Navigation Bar */}
        {currentView === 'dashboard' && (
          <nav className="h-16 border-b border-white/5 glass flex items-center justify-between px-8 shrink-0 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center transform rotate-45 shadow-[0_0_15px_#00f2ff]">
                <div className="transform -rotate-45 font-black text-slate-950 text-xs">P</div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {[
                { id: 'practice', label: 'Practice' },
                { id: 'songs', label: 'Songs' },
                { id: 'leaderboard', label: 'Leaderboard' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    setSelectedLevel(null);
                  }}
                  className={`relative px-4 py-2 text-[10px] uppercase font-bold tracking-[0.3em] transition-all ${
                    selectedCategory === cat.id ? 'text-cyan-400' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {cat.label}
                  {selectedCategory === cat.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_#00f2ff]" 
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowCoach(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all text-cyan-400 group"
              >
                <Camera size={14} className="group-hover:scale-110 transition-transform" />
                AI Coach
              </button>
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{user.displayName}</p>
                    <p className="text-[9px] text-cyan-400 font-mono">{xp} XP</p>
                  </div>
                  {user.photoURL ? (
                    <img src={user.photoURL} className="w-8 h-8 rounded-full border border-white/10" alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <UserIcon size={14} className="text-white/40" />
                    </div>
                  )}
                  <button onClick={logout} className="p-2 text-white/40 hover:text-red-400 transition-colors">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  <LogIn size={14} />
                  Sign In
                </button>
              )}
            </div>
          </nav>
        )}

        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence>
            {showCoach && (
              <SheetMusicCoach onClose={() => setShowCoach(false)} />
            )}
          </AnimatePresence>
          {currentView === 'dashboard' && (
            <LevelDashboard 
              currentLevel={1} 
              xp={xp} 
              selectedCategory={selectedCategory}
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
              onSelectLevel={handleSelectLevel} 
            />
          )}

          {/* Login Reminder Modal */}
          <AnimatePresence>
            {showLoginReminder && !user && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="glass border-white/10 p-8 rounded-3xl max-w-md w-full text-center relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <UserIcon className="text-cyan-400" size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-tight">Sync Your Progress</h2>
                  <p className="text-white/50 mb-8 leading-relaxed">
                    Join the quest. Login with your Google account to save your XP, unlock advanced levels, and appear on the global leaderboard.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        loginWithGoogle();
                        setShowLoginReminder(false);
                      }}
                      className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-sm transition-all uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(0,242,255,0.3)] flex items-center justify-center gap-2"
                    >
                      <LogIn size={16} /> Sign In with Google
                    </button>
                    <button 
                      onClick={() => setShowLoginReminder(false)}
                      className="w-full py-4 text-white/40 hover:text-white transition-colors text-[10px] uppercase font-bold tracking-[0.2em]"
                    >
                      I'll play as a guest for now
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {currentView === 'practice' && selectedLevel && selectedLevel.lessons[0] && (
            <PracticeRoom 
              song={selectedLevel.lessons[0]} 
              isMemoryMode={isMemoryModeActive}
              onExit={() => {
                setCurrentView('dashboard');
                setIsMemoryModeActive(false);
              }}
              onComplete={handlePracticeComplete}
            />
          )}

          {currentView === 'feedback' && performanceStats && (
            <CoachFeedback 
              stats={performanceStats} 
              onContinue={handleFeedbackContinue}
            />
          )}
        </div>

        {/* Background Decor */}
        <StarryBackground />
      </div>

      {/* Direct One-Click Exporter & GitHub Autopush Hub */}
      <DeveloperHub />

      {/* Portrait Orientation Guard (Mobile Only) - Outside blurred container */}
      {isPortraitMobile && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-slate-950/20 transition-all duration-500">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
              <RotateCcw size={48} className="text-cyan-400 rotate-90" />
            </div>
            <h2 className="text-4xl font-light text-white mb-4 uppercase tracking-[0.2em]">Shift to <span className="text-cyan-400 font-bold italic">Landscape</span></h2>
            <p className="text-white/40 text-sm font-mono max-w-xs mx-auto leading-relaxed uppercase tracking-widest">
              The seeker's path requires a wider perspective. Please rotate your device to begin the session.
            </p>
          </motion.div>
        </div>
      )}
    </>
  );
}

