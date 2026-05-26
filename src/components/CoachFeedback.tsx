/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Sparkles, Brain, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { PerformanceStats } from '../types';

interface CoachFeedbackProps {
  stats: PerformanceStats;
  onContinue: () => void;
}

export const CoachFeedback: React.FC<CoachFeedbackProps> = ({ stats, onContinue }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAIFeedback = async () => {
    setLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY not found');

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are an expert piano coach. Analyze these performance stats:
        - Accuracy: ${stats.accuracy}%
        - Timing: ${stats.timing}%
        - Max Combo: ${stats.maxCombo}
        - Missed Notes: ${stats.missedNotes.length}
        - Wrong Notes: ${stats.incorrectNotes.length}

        Based on these stats, give simple, friendly advice. 
        If accuracy is low, suggest slowing down.
        If timing is off, suggest focusing on the beat.
        If they did great, encourage them to keep going.
        Keep it very short (max 2 sentences) and use simple, encouraging words.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setFeedback(response.text || "Masterful sequence! Your bio-rhythms were perfectly synced with the data stream.");
    } catch (err) {
      console.error('Gemini error:', err);
      setFeedback("Excellent work! Your precision is evolving. Keep harmonizing with the grid.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAIFeedback();
  }, []);

  return (
    <div className="fixed inset-0 bg-[#050507]/80 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass rounded-3xl p-10 max-w-2xl w-full neo-glow relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-px hologram-line" />
        
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl">
            <Sparkles className="text-cyan-400" size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-light text-white tracking-tight">Post-Session <span className="text-cyan-400 font-bold">Analysis</span></h2>
            <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">AI Diagnostics Interface v4.0.2</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
            <div className="text-white/40 text-[10px] uppercase font-mono mb-2 tracking-widest">Accuracy</div>
            <div className="text-4xl font-bold text-white mono">{stats.accuracy}%</div>
          </div>
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/5">
            <div className="text-white/40 text-[10px] uppercase font-mono mb-2 tracking-widest">Timing</div>
            <div className="text-4xl font-bold text-cyan-400 mono">{stats.timing}%</div>
          </div>
        </div>

        <div className="bg-cyan-500/5 rounded-2xl p-8 border border-cyan-500/10 mb-10 min-h-[120px] flex items-start gap-4">
          <Brain className="text-cyan-400 mt-1 shrink-0" size={28} />
          <div>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 w-3/4 bg-white/5 animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-white/5 animate-pulse rounded" />
              </div>
            ) : (
              <p className="text-cyan-50 text-xl leading-relaxed font-light italic">"{feedback}"</p>
            )}
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-5 rounded-sm flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_40px_rgba(0,242,255,0.5)] uppercase tracking-widest text-xs"
        >
          Resume Quest Sequence <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
};
