/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Note {
  midi: number;
  time: number; // Start time in seconds
  duration: number; // Duration in seconds
  fingering?: number; // Optional finger number (1-5)
}

export type LevelCategory = 'basic' | 'melody' | 'chords' | 'song';

export interface Song {
  id: string;
  title: string;
  artist: string;
  difficulty: number;
  notes: Note[];
  bpm: number;
  category?: LevelCategory;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  requiredXp: number;
  category: LevelCategory;
  lessons: Song[];
}

export interface PerformanceStats {
  accuracy: number;
  timing: number;
  combo: number;
  maxCombo: number;
  score: number;
  missedNotes: number[];
  incorrectNotes: number[];
}
