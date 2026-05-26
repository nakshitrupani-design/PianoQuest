/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Vex } from 'vexflow';
import { Note as NoteType } from '../types';

interface MusicStaffProps {
  songNotes: NoteType[];
  currentTime: number;
  detectedNote: number | null;
}

export const MusicStaff: React.FC<MusicStaffProps> = ({ songNotes, currentTime, detectedNote }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const midiToVex = (midi: number): { key: string, clef: string, accidental?: string } => {
    const notes = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const octave = Math.floor(midi / 12) - 1;
    let name = notes[midi % 12];
    
    let accidental = undefined;
    if (name.includes('#')) {
      accidental = '#';
    }
    
    const key = `${name}/${octave}`;
    const clef = midi >= 60 ? 'treble' : 'bass';
    return { key, clef, accidental };
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const { Renderer, Stave, StaveNote, TickContext, StaveConnector, Accidental } = Vex.Flow;

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    const width = containerRef.current.clientWidth || 1000;
    const height = 300;
    renderer.resize(width, height);
    const context = renderer.getContext();
    
    // Set futuristic styling
    context.setFillStyle('rgba(255, 255, 255, 0.9)');
    context.setStrokeStyle('rgba(0, 242, 255, 0.5)');

    // Create Treble Stave
    const trebleStave = new Stave(50, 40, width - 100);
    trebleStave.addClef('treble');
    trebleStave.setContext(context).draw();

    // Create Bass Stave
    const bassStave = new Stave(50, 160, width - 100);
    bassStave.addClef('bass');
    bassStave.setContext(context).draw();

    new StaveConnector(trebleStave, bassStave).setType(StaveConnector.type.BRACE).setContext(context).draw();

    // Time window calculation
    const windowDuration = 6;
    const playheadX = 120; // Moved slightly left to show more upcoming notes
    const notesInWindow = songNotes.filter(n => n.time >= currentTime - 1.0 && n.time < currentTime + windowDuration);

    // Helper: MIDI to staff Y
    const getMidiY = (midi: number) => {
      const isTreble = midi >= 60;
      const stave = isTreble ? trebleStave : bassStave;
      
      const midiToLine = (m: number, clef: 'treble' | 'bass'): number => {
        if (clef === 'treble') {
          if (m === 60) return 5; // Middle C
          if (m === 62) return 4.5;
          if (m === 64) return 4;
          if (m === 65) return 3.5;
          if (m === 67) return 3;
          if (m === 69) return 2.5;
          if (m === 71) return 2;
          if (m === 72) return 1.5;
          return 4 - (m - 64) / 2;
        } else {
          // Bass clef
          if (m === 60) return -1; // Middle C on Bass clef ledger
          if (m === 57) return 0;
          if (m === 55) return 0.5;
          if (m === 53) return 1;
          if (m === 52) return 1.5;
          return 4 - (m - 43) / 2;
        }
      };

      const line = midiToLine(midi, isTreble ? 'treble' : 'bass');
      return stave.getYForLine(line);
    };

    // Find current and next target notes
    const activeNote = songNotes.find(n => currentTime >= n.time && currentTime <= n.time + n.duration);
    const nextNote = songNotes.find(n => n.time > currentTime);
    
    // Target Y logic for smooth parabolic jump
    const defaultJumpDuration = 0.6; 
    let ballY = 140;
    let ballX = playheadX;
    const isStriking = songNotes.some(n => Math.abs(currentTime - n.time) < 0.04);

    const prevNote = [...songNotes].reverse().find(n => n.time <= currentTime);
    const startY = prevNote ? getMidiY(prevNote.midi) : 140;

    if (nextNote) {
      const timeToNext = nextNote.time - currentTime;
      const endY = getMidiY(nextNote.midi);
      
      // Calculate dynamic jump duration based on gap between notes
      const gap = nextNote.time - (prevNote ? prevNote.time + (prevNote.duration || 0) : 0);
      const jumpDuration = Math.min(defaultJumpDuration, Math.max(0.2, gap));

      if (timeToNext > 0 && timeToNext <= jumpDuration) {
        // We are in the jumping phase
        const t = 1 - (timeToNext / jumpDuration);
        
        // Horizontal Lunge: Ball moves forward to "meet" the note and then returns
        const nextNoteX = playheadX + (timeToNext / windowDuration) * (width - playheadX - 100);
        // Lunge out more aggressively to meet the note (up to 30% of the distance)
        const lungeAmount = (nextNoteX - playheadX) * 0.4;
        ballX = playheadX + (lungeAmount * Math.sin(Math.PI * t));

        // Parabolic arc: y = start + (end-start)*t + height*4*t*(1-t)
        const distY = Math.abs(endY - startY);
        const arcHeight = -Math.max(50, distY * 0.7 + 20); 
        
        ballY = startY + (endY - startY) * t + (arcHeight * 4 * t * (1 - t));
      } else if (activeNote) {
        // Locked on the active note, maybe slight vibrate if it's a long note
        ballY = getMidiY(activeNote.midi);
        ballX = playheadX;
      } else {
        // In the gap between notes but before jump starts
        ballY = startY;
        ballX = playheadX;
      }
    } else {
      ballY = startY;
      ballX = playheadX;
    }

    if (notesInWindow.length > 0) {
      // Group notes by time for chord detection
      const notesByTime: { [key: number]: NoteType[] } = {};
      notesInWindow.forEach(n => {
        if (!notesByTime[n.time]) notesByTime[n.time] = [];
        notesByTime[n.time].push(n);
      });

      const renderNotes = (clefType: string) => {
        notesInWindow
          .filter(n => midiToVex(n.midi).clef === clefType)
          .forEach(n => {
            const relativeTime = (n.time - currentTime) / windowDuration;
            const xPos = playheadX + relativeTime * (width - playheadX - 100);
            
            if (xPos < -50 || xPos > width + 50) return;

            const y = getMidiY(n.midi);
            const isHit = currentTime >= n.time;
            
            // Determine stem direction
            // Treble: B4(71) is middle line. Midi >= 71 -> Stem Down
            // Bass: D3(50) is middle line. Midi >= 50 -> Stem Down
            const middleMidi = clefType === 'treble' ? 71 : 50;
            const stemDown = n.midi >= middleMidi;
            const stemLength = 35;
            
            // Draw Stem
            context.beginPath();
            context.setLineWidth(1.5);
            context.setStrokeStyle(isHit ? '#22c55e' : 'rgba(255, 255, 255, 0.4)');
            const stemX = stemDown ? xPos - 5.5 : xPos + 5.5;
            const stemEndY = stemDown ? y + stemLength : y - stemLength;
            context.moveTo(stemX, y);
            context.lineTo(stemX, stemEndY);
            context.stroke();

            // Draw manual note head for smoother flowing performance
            context.beginPath();
            context.arc(xPos, y, 6, 0, Math.PI * 2, false);
            context.setFillStyle(isHit ? '#22c55e' : '#ffffff');
            context.fill();

            // Finger number
            if (n.fingering) {
              context.setFont('Inter', 10, 'bold');
              context.setFillStyle('rgba(0, 242, 255, 0.9)');
              const labelY = stemDown ? y - 12 : y + 15;
              context.fillText(n.fingering.toString(), xPos - 3, labelY);
            }

            // Chord Name (only for the highest note in the chord)
            const sameTimeNotes = notesByTime[n.time] || [];
            if (sameTimeNotes.length > 1) {
              const sortedSameTime = [...sameTimeNotes].sort((a, b) => b.midi - a.midi);
              if (n.midi === sortedSameTime[0].midi) {
                const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                const root = [...sameTimeNotes].sort((a, b) => a.midi - b.midi)[0];
                const rootName = names[root.midi % 12];
                // Simple chord suffix
                const intervals = sameTimeNotes.map(sn => (sn.midi - root.midi) % 12);
                let suffix = '';
                if (intervals.includes(3)) suffix = 'm';
                
                context.setFont('Inter', 12, 'bold');
                context.setFillStyle('#ffffff');
                context.fillText(rootName + suffix, xPos - 10, y - 45);
              }
            } else {
              // Single note name (optional, but user asked for E# etc)
              const { key } = midiToVex(n.midi);
              const noteName = key.split('/')[0].toUpperCase();
              context.setFont('Inter', 9, 'normal');
              context.setFillStyle('rgba(255,255,255,0.3)');
              // context.fillText(noteName, xPos - 5, y + 25);
            }

            // Highlight glow if about to be hit
            if (Math.abs(n.time - currentTime) < 0.1) {
              context.beginPath();
              context.arc(xPos, y, 12, 0, Math.PI * 2, false);
              context.setFillStyle('rgba(0, 242, 255, 0.2)');
              context.fill();
            }

            // Duration tail for held notes
            if (n.duration > 0.1) {
              const tailLength = (n.duration / windowDuration) * (width - playheadX - 100);
              context.beginPath();
              context.setLineWidth(4);
              context.setStrokeStyle(isHit ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.2)');
              context.moveTo(xPos + 5, y);
              context.lineTo(xPos + tailLength, y);
              context.stroke();
            }
          });
      };

      renderNotes('treble');
      renderNotes('bass');
    }

    // Impact Flash
    if (isStriking) {
      context.beginPath();
      context.arc(ballX, ballY, 20, 0, Math.PI * 2, false);
      context.setFillStyle('rgba(0, 242, 255, 0.3)');
      context.fill();
    }

    // Outer Glow
    context.beginPath();
    context.arc(ballX, ballY, 12, 0, Math.PI * 2, false);
    context.setFillStyle('rgba(0, 242, 255, 0.1)');
    context.fill();

    // Inner Ball
    context.beginPath();
    context.arc(ballX, ballY, isStriking ? 8 : 6, 0, Math.PI * 2, false);
    context.setFillStyle('#00f2ff');
    context.setShadowBlur(20);
    context.setShadowColor('#00f2ff');
    context.fill();
    context.setShadowBlur(0);
    context.setStrokeStyle('#ffffff');
    context.setLineWidth(2);
    context.stroke();

    // Playhead Vertical Line
    context.setStrokeStyle('rgba(255, 255, 255, 0.1)');
    context.setLineWidth(1);
    context.beginPath();
    context.moveTo(playheadX, 20);
    context.lineTo(playheadX, 280);
    context.stroke();

  }, [songNotes, currentTime, detectedNote]);

  return (
    <div className="flex flex-col items-center justify-center bg-[#050507]/40 backdrop-blur-sm rounded-2xl border border-white/5 p-4 neo-glow">
      <div className="text-[10px] font-mono text-cyan-400/60 uppercase tracking-[0.3em] mb-4">Neural Notation Stream</div>
      <div ref={containerRef} className="w-full h-[300px] flex items-center justify-center overflow-hidden" />
    </div>
  );
};
