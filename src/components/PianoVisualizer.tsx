/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Note } from '../types';

interface PianoVisualizerProps {
  currentNotes: Note[];
  currentTime: number;
  detectedNote: number | null;
  height?: number;
}

const PIANO_HEIGHT = 150;
const KEY_WIDTH = 40;
const VISIBLE_KEYS = 24; // Two octaves starting from C3
const START_MIDI = 48; // C3

export const PianoVisualizer: React.FC<PianoVisualizerProps> = ({ 
  currentNotes, 
  currentTime, 
  detectedNote 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawKeyboard = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= VISIBLE_KEYS; i++) {
      const x = i * KEY_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const keyboardY = height - PIANO_HEIGHT;

    // Draw keyboard
    for (let i = 0; i < VISIBLE_KEYS; i++) {
      const midi = START_MIDI + i;
      const x = i * KEY_WIDTH;
      const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
      const isActive = detectedNote === midi;

      if (!isBlack) {
        if (isActive) {
          const activeGradient = ctx.createLinearGradient(x, keyboardY, x, keyboardY + PIANO_HEIGHT);
          activeGradient.addColorStop(0, '#00f2ff');
          activeGradient.addColorStop(1, '#bc13fe');
          ctx.fillStyle = activeGradient;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(0, 242, 255, 0.6)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        }
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x + 1, keyboardY, KEY_WIDTH - 2, PIANO_HEIGHT, [0, 0, 4, 4]);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw black keys
    for (let i = 0; i < VISIBLE_KEYS; i++) {
      const midi = START_MIDI + i;
      const x = i * KEY_WIDTH;
      const isBlack = [1, 3, 6, 8, 10].includes(midi % 12);
      const isActive = detectedNote === midi;

      if (isBlack) {
        ctx.fillStyle = isActive ? '#bc13fe' : '#1a1a20';
        ctx.beginPath();
        ctx.roundRect(x - KEY_WIDTH * 0.3, keyboardY, KEY_WIDTH * 0.6, PIANO_HEIGHT * 0.6, [0, 0, 2, 2]);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.stroke();
      }
    }

    // Hologram line at top of keyboard
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.4)';
    const holoGradient = ctx.createLinearGradient(0, 0, width, 0);
    holoGradient.addColorStop(0, 'transparent');
    holoGradient.addColorStop(0.5, 'rgba(0, 242, 255, 0.5)');
    holoGradient.addColorStop(1, 'transparent');
    ctx.strokeStyle = holoGradient;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, keyboardY);
    ctx.lineTo(width, keyboardY);
    ctx.stroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      drawKeyboard(ctx, canvas.width, canvas.height);
      requestAnimationFrame(render);
    };

    render();
  }, [currentNotes, currentTime, detectedNote]);

  return (
    <div className="w-full h-full bg-transparent overflow-hidden relative border-y border-white/10">
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${detectedNote ? 'bg-cyan-400 animate-pulse active-glow' : 'bg-white/20'}`} />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.2em] font-bold">
              {detectedNote ? 'Frequency Synced' : 'Awaiting Input'}
            </span>
          </div>
        </div>
      </div>
      <canvas 
        ref={canvasRef} 
        width={VISIBLE_KEYS * KEY_WIDTH} 
        height={600} 
        className="w-full h-full opacity-90"
      />
    </div>
  );
};
