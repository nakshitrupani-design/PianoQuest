/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, RotateCcw, Mic, MicOff, CheckCircle2, AlertCircle, Sparkles, Brain } from 'lucide-react';
import { PianoVisualizer } from './PianoVisualizer';
import { MusicStaff } from './MusicStaff';
import { Song, PerformanceStats, Note as NoteType } from '../types';
import { useAudioEngine } from '../hooks/useAudioEngine';
import confetti from 'canvas-confetti';

interface PracticeRoomProps {
  song: Song;
  isMemoryMode?: boolean;
  onExit: () => void;
  onComplete: (stats: PerformanceStats) => void;
}

export const PracticeRoom: React.FC<PracticeRoomProps> = ({ song, isMemoryMode, onExit, onComplete }) => {
  const { isMicrophoneReady, detectedNote, startMicrophone, stopMicrophone, playNote } = useAudioEngine();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(4);
  const [currentTime, setCurrentTime] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string, type: 'good' | 'bad' | 'perfect' } | null>(null);
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMusicHidden, setIsMusicHidden] = useState(isMemoryMode || false);
  
  const startTimeRef = useRef<number | null>(null);
  const processedNotesRef = useRef<Set<number>>(new Set());
  const guideNotesPlayedRef = useRef<Set<number>>(new Set());
  const missedNotesRef = useRef<number[]>([]);
  const incorrectNotesRef = useRef<number[]>([]);
  const totalNotes = song.notes.length;

  const handleEnd = useCallback(() => {
    setIsPlaying(false);
    setIsLessonComplete(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f2ff', '#0066ff', '#ffffff']
    });

    const accuracy = Math.round(( (totalNotes - missedNotesRef.current.length) / totalNotes) * 100);
    
    onComplete({
      accuracy,
      timing: 95,
      combo,
      maxCombo,
      score,
      missedNotes: missedNotesRef.current,
      incorrectNotes: incorrectNotesRef.current
    });
  }, [totalNotes, combo, maxCombo, score, onComplete]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = performance.now();
      const elapsed = ((now - (startTimeRef.current || now)) / 1000) * playbackSpeed;
      setCurrentTime(elapsed);

      // Play Guide Notes
      song.notes.forEach((note, index) => {
        if (!guideNotesPlayedRef.current.has(index)) {
          if (elapsed >= note.time) {
            playNote(note.midi, note.duration);
            guideNotesPlayedRef.current.add(index);
          }
        }
      });

      song.notes.forEach((note, index) => {
        if (processedNotesRef.current.has(index)) return;

        const windowStart = note.time;
        const windowEnd = note.time + note.duration;

        if (elapsed >= windowStart && elapsed <= windowEnd) {
          if (detectedNote === note.midi) {
            setScore(s => s + 100);
            setCombo(c => {
              const newCombo = c + 1;
              if (newCombo > maxCombo) setMaxCombo(newCombo);
              return newCombo;
            });
            setFeedback({ text: 'Perfect!', type: 'perfect' });
            processedNotesRef.current.add(index);
          }
        } else if (elapsed > windowEnd) {
          setCombo(0);
          setFeedback({ text: 'Miss', type: 'bad' });
          missedNotesRef.current.push(note.midi);
          processedNotesRef.current.add(index);
        }
      });

      if (elapsed > song.notes[song.notes.length - 1].time + 2) {
        handleEnd();
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, detectedNote, song, maxCombo, playbackSpeed, handleEnd]);

  const togglePlay = () => {
    if (!isMicrophoneReady) {
      startMicrophone();
      return;
    }
    
    if (!isPlaying) {
      setIsLessonComplete(false);
      processedNotesRef.current.clear();
      guideNotesPlayedRef.current.clear();
      missedNotesRef.current = [];
      setIsCountingDown(true);
      setCountdown(4);
      // Wait for countdown to finish before fully "playing"
      let count = 4;
      const beatInterval = (60 / song.bpm) * 1000;
      
      const timer = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdown(count);
          // Optional: Add sound click here
        } else {
          clearInterval(timer);
          setIsCountingDown(false);
          setIsPlaying(true);
          startTimeRef.current = performance.now();
        }
      }, beatInterval);
    } else {
      setIsPlaying(false);
      setIsCountingDown(false);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setIsLessonComplete(false);
    setCurrentTime(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    processedNotesRef.current.clear();
    guideNotesPlayedRef.current.clear();
    missedNotesRef.current = [];
    incorrectNotesRef.current = [];
    startTimeRef.current = null;
  };

  return (
    <div className="fixed inset-0 bg-[#050507] flex flex-col z-40 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 glass shrink-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={onExit} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-cyan-400">Piano Quest</h1>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
            {[0.5, 0.75, 1.0].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-3 py-1 rounded text-[10px] font-mono transition-all ${playbackSpeed === speed ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-white/40 hover:text-white'}`}
              >
                {speed === 1.0 ? 'NORMAL' : `${speed * 100}%`}
              </button>
            ))}
          </div>
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Session Pulse</p>
            <p className="text-xs mono text-cyan-300">00:42:15</p>
          </div>
          <div className="h-8 w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Global Sync</p>
            <p className="text-xs font-bold font-mono">#1,204</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-cyan-500/50 p-0.5">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="rounded-full" alt="User" />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content: Piano Area */}
        <main className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
          {/* Song Info Overlay */}
          <div className="absolute top-8 left-8 z-10 flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-light tracking-tight text-white">{song.title}</h2>
              <button 
                onClick={() => setIsMusicHidden(!isMusicHidden)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest transition-all ${
                  isMusicHidden 
                    ? 'bg-purple-500 border-purple-400 text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.5)]' 
                    : 'glass border-white/10 text-white/40 hover:border-purple-500/50 hover:text-purple-400'
                }`}
              >
                <Brain size={12} /> {isMusicHidden ? 'Memory Active' : 'Memory'}
              </button>
            </div>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">{song.artist} • Tempo: {song.bpm} BPM</p>
          </div>

          {/* Score Counter Overlay */}
          <div className="absolute top-8 right-8 text-right z-10">
            <div className="mono text-4xl font-bold text-cyan-400 tracking-tighter drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
              {score.toLocaleString().padStart(7, '0')}
            </div>
            <div className="text-[10px] font-mono text-cyan-400/70 tracking-widest uppercase mt-1 flex items-center justify-end gap-2">
              <Sparkles size={10} /> Combo x{combo}
            </div>
          </div>

          <div className="flex-1 relative flex flex-col pt-20 px-6">
            <div className={`flex-1 mb-8 relative group transition-all duration-500 min-h-[400px] ${isMusicHidden ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <MusicStaff 
                songNotes={song.notes}
                currentTime={currentTime}
                detectedNote={detectedNote}
              />
              
              {!isPlaying && !isCountingDown && !isLessonComplete && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] rounded-2xl">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={togglePlay}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div className="w-20 h-20 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-[0_0_40px_rgba(0,242,255,0.6)] group-hover:bg-cyan-400 transition-colors">
                      <Play size={40} fill="currentColor" className="ml-2" />
                    </div>
                    <span className="text-white text-xs font-mono uppercase tracking-[0.4em] font-bold">Start Practice</span>
                  </motion.button>
                </div>
              )}
              
              {isLessonComplete && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-2xl border border-cyan-500/20">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/40">
                      <CheckCircle2 size={32} className="text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase">Lesson Complete!</h2>
                    <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto">You've mastered this song. Review your bio-metrics on the right.</p>
                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={() => {
                          reset();
                          setIsMusicHidden(false);
                        }}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs font-bold uppercase tracking-widest transition-all"
                      >
                        Try Again
                      </button>
                      <button 
                        onClick={onExit}
                        className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-slate-950 text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}

              {isCountingDown && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="text-[12rem] font-black text-cyan-400/80 italic drop-shadow-[0_0_30px_rgba(0,242,255,0.4)]"
                  >
                    {countdown}
                  </motion.div>
                </div>
              )}
            </div>
            
            {isMusicHidden && isPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                 <div className="w-32 h-32 bg-cyan-500/5 rounded-full flex items-center justify-center mb-4 border border-cyan-500/10 animate-pulse">
                    <Brain className="text-cyan-500/20" size={48} />
                 </div>
                 <p className="text-cyan-500/20 font-mono text-[10px] uppercase tracking-[0.5em]">Memory Link Active</p>
              </div>
            )}

            <div className={`h-48 shrink-0 transition-opacity duration-500 ${isMusicHidden ? 'opacity-0' : 'opacity-100'}`}>
              <PianoVisualizer 
                currentNotes={song.notes} 
                currentTime={currentTime} 
                detectedNote={detectedNote} 
              />
            </div>
            
            {/* Play/Pause Float UI */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
              <button 
                onClick={() => {
                  reset();
                  setIsMusicHidden(false);
                }}
                className="p-3 glass rounded-full text-white/40 hover:text-white transition-all hover:scale-110 active:scale-90"
              >
                <RotateCcw size={20} />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-16 h-16 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full flex items-center justify-center transition-all neo-glow hover:scale-110 active:scale-95"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
              </button>
            </div>
          </div>

          {/* Feedback Overlay */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 0 }}
                animate={{ scale: 1, opacity: 1, y: -20 }}
                exit={{ scale: 1.1, opacity: 0 }}
                key={feedback.text + Date.now()}
                className={`absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl uppercase tracking-[0.3em] z-30 pointer-events-none ${
                  feedback.type === 'perfect' ? 'text-cyan-400' : 'text-rose-500'
                }`}
              >
                {feedback.text}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Right Panel: AI Coach & Metrics (Only show when lesson is complete) */}
        <AnimatePresence>
          {isLessonComplete && (
            <motion.aside 
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 border-l border-white/10 glass flex flex-col p-6 shrink-0 space-y-8 z-50"
            >
              <div>
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 px-1">Audio Spectral Analysis</h3>
                <div className="h-28 bg-[#000]/40 border border-white/5 rounded-xl p-4 flex flex-col justify-end overflow-hidden relative">
                  <div className="flex items-end space-x-1 h-12 w-full">
                    {[...Array(12)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: isPlaying ? [10, 40, 20, 50, 15][i % 5] + Math.random() * 20 : 5 }}
                        className={`flex-1 rounded-t-sm transition-all duration-300 ${i % 3 === 0 ? 'bg-purple-500' : 'bg-cyan-500'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-[11px] mono text-cyan-400">441 Hz</span>
                    <span className="text-[11px] mono text-white/40 flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${isMicrophoneReady ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
                      {isMicrophoneReady ? 'SYNCED' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,rgba(255,255,255,0.02)_11px)]" />
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6 px-1">How you're doing</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.05]">
                    <p className="text-[10px] text-white/40 uppercase mb-2 tracking-wide font-mono">Notes Hit</p>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold mono text-white">
                        {Math.round((processedNotesRef.current.size - missedNotesRef.current.length) / (processedNotesRef.current.size || 1) * 100)}%
                      </span>
                      <span className="text-[9px] font-bold text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded tracking-tighter">GREAT</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.05]">
                    <p className="text-[10px] text-white/40 uppercase mb-2 tracking-wide font-mono">Timing</p>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold mono text-yellow-400">Steady</span>
                      <span className="text-[9px] font-bold text-yellow-400/70 border border-yellow-400/20 px-2 py-0.5 rounded tracking-tighter">ON TIME</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.05]">
                    <p className="text-[10px] text-white/40 uppercase mb-2 tracking-wide font-mono">Feeling</p>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-bold mono text-purple-400">Smooth</span>
                      <span className="text-[9px] font-bold text-purple-400/70 border border-purple-400/20 px-2 py-0.5 rounded tracking-tighter">GOOD FLOW</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-3 pt-4 border-t border-white/5">
                <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all rounded font-bold uppercase tracking-widest text-[10px] text-white flex items-center justify-center gap-2">
                  <RotateCcw size={12} /> Full Calibration
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Status Bar */}
      <footer className="h-10 glass border-t border-white/10 flex items-center justify-between px-6 text-[9px] tracking-[0.2em] uppercase text-white/40 shrink-0 select-none">
        <div className="flex space-x-8">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">OS Configuration</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Buffer Settings</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Sheet Registry</span>
        </div>
        <div className="flex items-center space-x-5">
          <div className="flex space-x-2.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-500 active-glow' : 'bg-white/20'}`}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
          </div>
          <span className="font-mono">Process: performance_stream.exe</span>
        </div>
      </footer>

      {/* Onboarding Overlay */}
      {!isMicrophoneReady && (
        <div className="absolute inset-0 z-[100] bg-[#050507]/90 backdrop-blur-2xl flex items-center justify-center p-6 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="bg-cyan-500/10 border border-cyan-500/30 p-8 rounded-full w-32 h-32 mx-auto mb-10 flex items-center justify-center neo-glow">
              <Mic size={54} className="text-cyan-400" />
            </div>
            <h1 className="text-5xl font-light tracking-tighter text-white mb-6">Initialize Audio Context</h1>
            <p className="text-white/40 max-w-md mx-auto mb-12 text-sm leading-relaxed tracking-wide">To map your bio-rhythmic keystrokes to the digital grid, we require access to your localized audio input stream.</p>
            <button 
              onClick={startMicrophone}
              className="bg-cyan-500 text-slate-950 font-black px-12 py-5 rounded-sm hover:bg-cyan-400 transition-all flex items-center gap-4 mx-auto tracking-[0.2em] text-xs shadow-[0_0_30px_rgba(0,242,255,0.4)]"
            >
              ENABLE INPUT HANDLER <Mic size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
