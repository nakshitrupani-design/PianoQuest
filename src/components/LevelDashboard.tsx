/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Lock, Star, Trophy, Music, Brain, ArrowLeft, Users, Medal, Menu, ChevronRight, Search, ListMusic } from 'lucide-react';
import { Level, Song } from '../types';
import { LEVELS, SONG_LIBRARY } from '../data';
import { getLeaderboard, auth } from '../services/firebase';

interface LevelDashboardProps {
  currentLevel: number;
  xp: number;
  selectedCategory: 'practice' | 'songs' | 'leaderboard';
  selectedLevel: Level | null;
  setSelectedLevel: (level: Level | null) => void;
  onSelectLevel: (level: Level, memoryMode?: boolean) => void;
}

export const LevelDashboard: React.FC<LevelDashboardProps> = ({ 
  currentLevel, 
  xp, 
  selectedCategory, 
  selectedLevel,
  setSelectedLevel,
  onSelectLevel 
}) => {

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [songTab, setSongTab] = useState<string>('classical');
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSidebarHover = () => {
    if (hoverTimer.current) return;
    hoverTimer.current = setTimeout(() => {
      setIsSidebarOpen(true);
    }, 750);
  };

  const handleSidebarLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (selectedCategory === 'leaderboard') {
      const unsubscribe = getLeaderboard(setLeaderboard);
      return unsubscribe;
    }
  }, [selectedCategory]);

  const handleLessonSelect = (level: Level, song: Song, memoryMode: boolean = false) => {
    onSelectLevel({ ...level, lessons: [song] }, memoryMode);
  };

  const renderMainContent = () => {
    if (selectedCategory === 'leaderboard') {
      const currentUserRank = leaderboard.findIndex(u => u.uid === auth.currentUser?.uid);
      const isUserInTop10 = currentUserRank !== -1;

      return (
        <div className="max-w-4xl mx-auto pb-20">
          <header className="mb-12">
            <h2 className="text-4xl font-light tracking-tight text-white mb-2">Global <span className="text-cyan-400 font-bold uppercase italic">Leaderboard</span></h2>
            <p className="text-white/40 text-sm tracking-wide uppercase font-mono">The world's most disciplined piano seekers</p>
          </header>

          <div className="glass rounded-3xl border border-white/5 overflow-hidden mb-8">
            <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 bg-white/[0.02] text-[10px] uppercase font-bold tracking-widest text-white/40">
              <div className="col-span-1">Rank</div>
              <div className="col-span-8">User</div>
              <div className="col-span-3 text-right">Experience</div>
            </div>
            <div className="divide-y divide-white/5">
              {leaderboard.length > 0 ? leaderboard.map((u, idx) => {
                const isMe = u.uid === auth.currentUser?.uid;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={u.uid} 
                    className={`grid grid-cols-12 gap-4 px-8 py-6 items-center transition-colors group ${isMe ? 'bg-cyan-500/10 border-y border-cyan-500/20' : 'hover:bg-white/[0.02]'}`}
                  >
                    <div className="col-span-1 flex items-center gap-2">
                      {idx < 3 ? (
                        <Medal size={18} className={idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-300" : "text-amber-600"} />
                      ) : (
                        <span className={`font-mono font-bold text-lg ${isMe ? 'text-cyan-400' : 'text-white/20'}`}>{(idx + 1).toString().padStart(2, '0')}</span>
                      )}
                    </div>
                    <div className="col-span-8 flex items-center gap-4">
                      {u.photoURL ? (
                        <img src={u.photoURL} className={`w-10 h-10 rounded-full border ${isMe ? 'border-cyan-500' : 'border-white/10'}`} alt="" referrerPolicy="no-referrer" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isMe ? 'bg-cyan-500/20 border-cyan-500' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                          <Users size={16} className={isMe ? 'text-cyan-400' : 'text-cyan-400/60'} />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`font-bold text-lg transition-colors uppercase tracking-tight ${isMe ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'}`}>{u.displayName || 'Guest'}</p>
                          {isMe && <span className="bg-cyan-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">YOU</span>}
                        </div>
                        <p className="text-[10px] text-white/30 truncate max-w-xs">{u.uid}</p>
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className={`text-2xl font-black tracking-tighter ${isMe ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.4)]' : 'text-cyan-400'}`}>{(u.xp || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-cyan-400/40 ml-1 font-bold">XP</span>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="p-20 text-center text-white/20 uppercase tracking-[0.4em] font-bold text-sm">
                  Synchronizing records...
                </div>
              )}
            </div>
          </div>

          {!isUserInTop10 && auth.currentUser && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl border border-cyan-500/30 bg-cyan-500/10 flex flex-col md:flex-row items-center justify-between gap-6 neo-glow"
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_20px_rgba(0,242,255,0.5)]">
                  #??
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">Your Progress</h3>
                  <p className="text-white/50 text-xs italic tracking-wide">Continue your quest to enter the top 10 rankings.</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-cyan-400 tracking-tighter">{(xp || 0).toLocaleString()} <span className="text-xs uppercase ml-1">Total XP</span></div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Status: {auth.currentUser?.displayName || 'Guest'}</div>
              </div>
            </motion.div>
          )}

          {!auth.currentUser && (
            <div className="text-center p-8 glass rounded-3xl border border-white/5">
              <p className="text-white/40 text-xs uppercase tracking-widest">Sign in to see where you rank in the world</p>
            </div>
          )}
        </div>
      );
    }

    if (selectedCategory === 'songs') {
      return (
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-light tracking-tight text-white mb-2">Song <span className="text-cyan-400 font-bold uppercase italic">Library</span></h2>
              <p className="text-white/40 text-sm tracking-wide uppercase font-mono">Master pieces from every era</p>
            </div>
            <div className="flex gap-2">
              {Object.keys(SONG_LIBRARY).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSongTab(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                    songTab === cat 
                      ? 'bg-cyan-500 text-slate-950 border-cyan-500' 
                      : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </header>

          <div className="flex flex-col gap-4">
            {SONG_LIBRARY[songTab].map((song) => (
              <motion.div
                key={song.id}
                whileHover={{ x: 10 }}
                className="glass p-6 rounded-2xl border border-white/5 hover:border-cyan-500/50 cursor-pointer group flex items-center gap-8"
                onClick={() => onSelectLevel({ id: 0, title: song.title, description: song.artist, requiredXp: 0, category: 'song', lessons: [song] })}
              >
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white/40 group-hover:text-cyan-400 transition-colors shrink-0">
                  <ListMusic size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{song.title}</h4>
                    <div className="flex gap-1.5 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-1.5 h-4 rounded-full ${i < song.difficulty / 2 ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,242,255,0.5)]' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/40 text-sm font-mono italic">{song.artist}</p>
                </div>
                <div className="flex flex-col items-end gap-3 px-8 border-l border-white/5">
                  <span className="text-xs font-mono text-cyan-400/60 uppercase tracking-widest">{song.bpm} BPM</span>
                  <div className="flex gap-2">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLevel({ id: 0, title: song.title, description: song.artist, requiredXp: 0, category: 'song', lessons: [song] }, true);
                      }}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 hover:bg-purple-500 hover:text-slate-950 transition-all shadow-xl group/btn"
                      title="Play from Memory"
                    >
                      <Brain size={18} />
                    </div>
                    <div 
                      onClick={() => onSelectLevel({ id: 0, title: song.title, description: song.artist, requiredXp: 0, category: 'song', lessons: [song] })}
                      className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all shadow-xl"
                      title="Play"
                    >
                      <Play size={18} fill="currentColor" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedLevel) {
      return (
        <div>
          <button 
            onClick={() => setSelectedLevel(null)}
            className="mb-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] font-mono tracking-[0.3em]"
          >
            <ArrowLeft size={16} /> Back to Learning Modules
          </button>
          <div className="mb-12">
            <h2 className="text-4xl font-light tracking-tight text-white mb-2">{selectedLevel.title} <span className="text-cyan-400 font-bold uppercase italic">Stream</span></h2>
            <p className="text-white/40 text-sm tracking-wide uppercase font-mono">{selectedLevel.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedLevel.lessons.map((song, idx) => (
              <motion.div
                key={song.id}
                whileHover={{ scale: 1.02 }}
                className="glass p-8 rounded-2xl border border-white/5 cursor-pointer hover:border-cyan-500/50 group flex items-center justify-between neo-glow"
                onClick={() => handleLessonSelect(selectedLevel, song)}
              >
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all font-mono text-xl font-bold">
                    {(idx + 1).toString().padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="font-bold text-2xl group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{song.title}</h4>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] font-mono mt-1">{song.artist} • Difficulty Node {song.difficulty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLessonSelect(selectedLevel, song, true);
                    }}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:text-purple-400 hover:border-purple-500/50 transition-all"
                    title="Play from Memory"
                  >
                    <Brain size={20} />
                  </div>
                  <div 
                    onClick={() => handleLessonSelect(selectedLevel, song)}
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:text-cyan-400 group-hover:border-cyan-500/50 transition-all"
                    title="Play"
                  >
                    <Play size={24} fill="currentColor" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-full">
        <header className="mb-10 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-4xl font-light tracking-tight text-white mb-2">Welcome Back, <span className="text-cyan-400 font-medium italic">{auth.currentUser?.displayName || 'Guest'}</span></h2>
            <p className="text-white/40 text-sm tracking-wide uppercase font-mono">Select a level from the quest path below</p>
          </div>
          <div className="text-right">
            <div className="mono text-4xl font-bold text-cyan-400 tracking-tighter mb-1">{xp.toLocaleString()} XP</div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">Global Rank: #1,204</div>
          </div>
        </header>

        {/* Path of Levels */}
        <div className="flex-1 relative min-h-[600px]">
          <div className="absolute inset-0 overflow-x-auto no-scrollbar pb-16 flex items-center">
            <div className="flex gap-32 px-32 items-center min-w-max relative py-32">
              {/* The Path Line (SVG) with Glow */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minWidth: LEVELS.length * 528 + 800 }}>
                <defs>
                  <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur1" />
                    <feGaussianBlur stdDeviation="8" result="blur2" />
                    <feMerge>
                      <feMergeNode in="blur2" />
                      <feMergeNode in="blur1" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00f2ff" stopOpacity="0.3" />
                    <stop offset="10%" stopColor="#00f2ff" stopOpacity="1" />
                    <stop offset="90%" stopColor="#00f2ff" stopOpacity="1" />
                    <stop offset="100%" stopColor="#00f2ff" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                
                {/* Secondary Broad Glow Path */}
                <path
                  d={(() => {
                    let pathString = "";
                    const yPos = 300;
                    const cardWidth = 400;
                    const gap = 128;
                    const padding = 128;
                    
                    LEVELS.forEach((_, idx) => {
                      const xCenter = padding + (cardWidth / 2) + (idx * (cardWidth + gap));
                      const xStart = xCenter + (cardWidth / 2);
                      
                      if (idx === 0) {
                        pathString += `M 0 ${yPos} L ${xCenter - (cardWidth / 2)} ${yPos} `;
                      }
                      
                      if (idx < LEVELS.length - 1) {
                        const nextXCenter = padding + (cardWidth / 2) + ((idx + 1) * (cardWidth + gap));
                        const nextXStartOfCard = nextXCenter - (cardWidth / 2);
                        pathString += ` M ${xStart} ${yPos} L ${nextXStartOfCard} ${yPos}`;
                      } else {
                        pathString += ` M ${xStart} ${yPos} L ${xStart + 800} ${yPos}`;
                      }
                    });
                    return pathString;
                  })()}
                  fill="none"
                  stroke="rgba(0, 242, 255, 0.25)"
                  strokeWidth="10"
                  filter="blur(15px)"
                  className="transition-all duration-1000"
                />

                {/* Primary Animated Dashed Path */}
                <path
                  d={(() => {
                    let pathString = "";
                    const yPos = 300;
                    const cardWidth = 400;
                    const gap = 128;
                    const padding = 128;
                    
                    LEVELS.forEach((_, idx) => {
                      const xCenter = padding + (cardWidth / 2) + (idx * (cardWidth + gap));
                      const xStart = xCenter + (cardWidth / 2);
                      
                      if (idx === 0) {
                        pathString += `M 0 ${yPos} L ${xCenter - (cardWidth / 2)} ${yPos} `;
                      }
                      
                      if (idx < LEVELS.length - 1) {
                        const nextXCenter = padding + (cardWidth / 2) + ((idx + 1) * (cardWidth + gap));
                        const nextXStartOfCard = nextXCenter - (cardWidth / 2);
                        pathString += ` M ${xStart} ${yPos} L ${nextXStartOfCard} ${yPos}`;
                      } else {
                        pathString += ` M ${xStart} ${yPos} L ${xStart + 800} ${yPos}`;
                      }
                    });
                    return pathString;
                  })()}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="4"
                  strokeDasharray="15 20"
                  filter="url(#path-glow)"
                  className="path-animation transition-all duration-1000"
                />
              </svg>

              {LEVELS.map((level, idx) => {
                const isLocked = xp < level.requiredXp;
                const isNext = !isLocked && (idx === 0 || xp >= LEVELS[idx-1].requiredXp);
                
                return (
                  <div 
                    key={level.id} 
                    className="relative flex flex-col items-center group transition-transform duration-1000"
                  >
                    <motion.div
                      whileHover={!isLocked ? { scale: 1.02, y: -5 } : {}}
                      onClick={() => !isLocked && setSelectedLevel(level)}
                      className={`relative z-10 w-[400px] h-56 p-6 rounded-[32px] border-2 transition-all duration-500 flex items-center gap-8 text-left ${
                        isLocked 
                          ? 'bg-cyan-500/[0.08] border-cyan-500/30 opacity-90 cursor-not-allowed shadow-[0_0_50px_rgba(0,242,255,0.15)]' 
                          : 'glass border-cyan-500/20 hover:border-cyan-400 cursor-pointer neo-glow shadow-[0_20px_60px_rgba(0,0,0,0.6)]'
                      } ${isNext ? 'border-cyan-400/80 ring-12 ring-cyan-500/10 scale-105' : ''}`}
                    >
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${
                        isLocked ? 'bg-cyan-500/20 text-cyan-400/60 shadow-[0_0_20px_rgba(0,242,255,0.2)]' : 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(0,242,255,0.4)]'
                      }`}>
                        {isLocked ? <Lock size={32} /> : <Trophy size={32} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={`text-[10px] font-mono uppercase tracking-[0.4em] mb-1 font-black transition-colors ${isLocked ? 'text-cyan-400/40' : 'text-cyan-400/80'}`}>Gate {level.id.toString().padStart(2, '0')}</div>
                        <h3 className={`text-2xl font-black leading-tight uppercase tracking-tight transition-colors duration-300 mb-2 truncate ${isLocked ? 'text-white/70' : 'text-white group-hover:text-cyan-400'}`}>
                          {level.title}
                        </h3>

                        {!isLocked && (
                          <div className="space-y-4">
                            <p className="text-white/50 text-[11px] leading-relaxed line-clamp-2">
                              {level.description}
                            </p>
                            <div className="flex items-center gap-6 pt-3 border-t border-white/5 w-full">
                              <div className="flex flex-col">
                                <span className="text-cyan-400 text-lg font-bold leading-none">{level.lessons.length}</span>
                                <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Lessons</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-cyan-400 text-lg font-bold leading-none">{Math.round(level.requiredXp / 100)}</span>
                                <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold">Difficulty</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {isLocked && (
                          <div className="mt-8">
                            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-white/40">
                              {level.requiredXp} XP REQ
                            </span>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-2">
                               <div className="h-full bg-cyan-400/20 w-1/4" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-6 right-6">
                        {!isLocked ? (
                          <div className="flex flex-col gap-1.5 items-center">
                            {[...Array(3)].map((_, i) => (
                              <Star key={i} size={12} className="text-yellow-500 fill-yellow-500/30" />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 opacity-30 items-center">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="w-2 h-2 rounded-full bg-white/40" />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Power Aura for Next Level */}
                      {isNext && (
                        <motion.div 
                          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          className="absolute inset-0 rounded-[48px] bg-cyan-400/20 pointer-events-none -z-10 blur-2xl"
                        />
                      )}
                    </motion.div>

                    {/* Meta-Status Indicator */}
                    <div className={`mt-8 px-4 py-1.5 rounded-full border border-white/5 text-[9px] font-mono text-white/40 tracking-widest bg-white/[0.02] flex items-center gap-2 transition-opacity duration-300 ${isLocked ? 'opacity-0' : 'opacity-100'}`}>
                      <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                      STATUS: {Math.floor(Math.random() * 40 + 60)}% SYNC
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );

  };

  return (
    <div className="flex h-full overflow-hidden font-sans relative">
      {/* Hover Trigger (3 Dashes) */}
      {!isSidebarOpen && (
        <div 
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] p-4 cursor-pointer group"
          onMouseEnter={handleSidebarHover}
          onClick={() => setIsSidebarOpen(true)}
          onMouseLeave={() => {
            if (hoverTimer.current) {
              clearTimeout(hoverTimer.current);
              hoverTimer.current = null;
            }
          }}
        >
          <div className="w-10 h-10 glass border-white/10 rounded-full flex flex-col items-center justify-center gap-1 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] transition-all">
            <div className="w-4 h-0.5 bg-white/40 group-hover:bg-cyan-400 transition-colors" />
            <div className="w-4 h-0.5 bg-white/40 group-hover:bg-cyan-400 transition-colors" />
            <div className="w-4 h-0.5 bg-white/40 group-hover:bg-cyan-400 transition-colors" />
          </div>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 glass border-cyan-500/20 px-3 py-1 rounded text-[8px] uppercase tracking-widest text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Hold 0.75s or Tap to open
          </div>
        </div>
      )}

      {/* Sidebar: Learning Path */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop for closing */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-[2px] z-[65]"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside 
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 border-r border-white/10 glass flex flex-col p-6 shrink-0 h-full fixed left-0 top-0 z-[70] shadow-[10px_0_40px_rgba(0,0,0,0.5)]"
              onMouseLeave={handleSidebarLeave}
            >
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <div className="flex items-center space-x-3 mb-10">
                <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center transform rotate-45 shadow-[0_0_15px_rgba(0,242,255,0.5)]">
                  <div className="w-3 h-3 bg-white transform -rotate-45"></div>
                </div>
                <h1 className="text-lg font-bold tracking-widest uppercase text-cyan-400">Piano Quest</h1>
              </div>

              <h3 className="text-[10px] font-bold text-white/40 uppercase mb-6 tracking-widest flex items-center gap-2">
                <ChevronRight size={10} /> The 10 Gates of Mastery
              </h3>
              <div className="space-y-2 mb-8">
                {LEVELS.map((level) => {
                  const isLocked = xp < level.requiredXp;
                  const isActive = selectedLevel?.id === level.id;
                  
                  return (
                    <div 
                      key={level.id}
                      onClick={() => !isLocked && setSelectedLevel(level)}
                      className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer group/item ${
                        isActive 
                          ? 'bg-cyan-500/10 border border-cyan-500/30 neo-glow' 
                          : 'hover:bg-white/[0.03] border border-transparent'
                      } ${isLocked ? 'opacity-30 grayscale' : 'opacity-100'}`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${
                        isActive ? 'bg-cyan-500 text-slate-950 scale-110 shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-white/5 text-white/50 border border-white/10 group-hover/item:border-cyan-500/30 group-hover/item:text-cyan-400'
                      }`}>
                        {level.id.toString().padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[14px] font-bold truncate ${isActive ? 'text-white' : 'text-white/60 group-hover/item:text-white'}`}>{level.title}</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-mono italic">
                          {isLocked ? `${level.requiredXp} XP` : 'Unlocked'}
                        </p>
                      </div>
                      {!isLocked && isActive && (
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_5px_#00f2ff]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-auto p-5 bg-purple-500/10 border border-purple-500/30 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
              <p className="text-[10px] uppercase text-purple-400 font-bold mb-2 tracking-widest flex items-center gap-2">
                <Trophy size={10} /> Mastery Tip
              </p>
              <p className="text-[11px] leading-relaxed text-white/80 italic">
                "Relax your wrists during transitions to maintain bio-rhythm synchronization with the grid."
              </p>
              <div className="mt-4 pt-4 border-t border-purple-500/20">
                <div className="flex items-center justify-between text-[8px] uppercase tracking-[0.2em] text-purple-400/50">
                  <span>Soul Sync</span>
                  <span>94.2%</span>
                </div>
                <div className="w-full h-0.5 bg-purple-500/10 mt-1 rounded-full overflow-hidden">
                  <div className="w-[94.2%] h-full bg-purple-500/40" />
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>

      {/* Main Content: Level Grid */}
      <main className={`flex-1 overflow-y-auto p-12 bg-[radial-gradient(circle_at_top_right,#00f2ff05,transparent_50%)] transition-all duration-500 ${isSidebarOpen ? 'ml-72 opacity-50 pointer-events-none' : 'ml-0'}`}>
        {renderMainContent()}

      </main>
    </div>
  );
};
