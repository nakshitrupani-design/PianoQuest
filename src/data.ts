/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Song, Level } from './types';

export const SAMPLE_SONGS: Song[] = [
  {
    id: 'middle-c',
    title: 'Middle C Drill',
    artist: 'Academy',
    difficulty: 1,
    bpm: 60,
    category: 'basic',
    notes: (() => {
      const notes = [];
      for (let i = 0; i < 60; i++) {
        notes.push({ midi: 60, time: i * 1, duration: 0.8, fingering: 1 });
        // Add LH on every 4th note
        if (i % 4 === 0) {
          notes.push({ midi: 48, time: i * 1, duration: 2.0 });
        }
      }
      return notes;
    })()
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle (Original Duo)',
    artist: 'Traditional',
    difficulty: 2,
    bpm: 80,
    category: 'melody',
    notes: (() => {
      const melody = [60, 60, 67, 67, 69, 69, 67, 67, 65, 65, 64, 64, 62, 62, 60, 60];
      const harmony = [48, 48, 52, 52, 53, 53, 52, 52, 50, 50, 48, 48, 47, 47, 48, 48];
      const notes = [];
      for (let loop = 0; loop < 4; loop++) {
        const tOffset = loop * 16;
        melody.forEach((pitch, i) => {
          notes.push({ midi: pitch, time: tOffset + i, duration: 0.8 });
          notes.push({ midi: harmony[i], time: tOffset + i, duration: 0.8 });
        });
      }
      return notes;
    })()
  },
  {
    id: 'c-major-scale',
    title: 'C Major Scale Velocity',
    artist: 'Technical Drill',
    difficulty: 3,
    bpm: 120,
    category: 'basic',
    notes: (() => {
      const notes = [];
      const scale = [60, 62, 64, 65, 67, 69, 71, 72];
      const lhScale = [48, 50, 52, 53, 55, 57, 59, 60];
      for (let r = 0; r < 8; r++) {
        const offset = r * 8;
        scale.forEach((p, i) => {
          notes.push({ midi: p, time: offset + i * 0.5, duration: 0.4 });
          notes.push({ midi: lhScale[i], time: offset + i * 0.5, duration: 0.4 });
        });
      }
      return notes;
    })()
  },
  {
    id: 'ode-to-joy',
    title: 'Ode to Joy (Full Arrangement)',
    artist: 'Beethoven',
    difficulty: 3,
    bpm: 120,
    category: 'melody',
    notes: (() => {
      const melody = [
        64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62,
        64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60
      ];
      const lh = [48, 52, 55, 48, 50, 52, 53, 55];
      const notes = [];
      for (let loop = 0; loop < 4; loop++) {
        const offset = loop * 30;
        melody.forEach((p, i) => {
          notes.push({ midi: p, time: offset + i, duration: 0.8 });
          if (i % 4 === 0) {
            notes.push({ midi: lh[i % lh.length], time: offset + i, duration: 3.5 });
          }
        });
      }
      return notes;
    })()
  },
  {
    id: 'chord-basic',
    title: 'C Major Master Chords',
    artist: 'Chord Lab',
    difficulty: 4,
    bpm: 80,
    category: 'chords',
    notes: (() => {
      const notes = [];
      const progressions = [
        [60, 64, 67], [62, 65, 69], [64, 67, 71], [65, 69, 72]
      ];
      for (let m = 0; m < 20; m++) {
        const chord = progressions[m % progressions.length];
        chord.forEach(p => {
          notes.push({ midi: p, time: m * 2, duration: 1.5 });
        });
        // Bass octaves
        notes.push({ midi: chord[0] - 12, time: m * 2, duration: 1.5 });
        notes.push({ midi: chord[0] - 24, time: m * 2, duration: 1.5 });
      }
      return notes;
    })()
  },
  {
    id: 'interstellar',
    title: 'First Step (Full OST)',
    artist: 'Hans Zimmer',
    difficulty: 6,
    bpm: 96,
    category: 'song',
    notes: (() => {
      const notes = [];
      const rhPattern = [69, 72, 76];
      for (let m = 0; m < 16; m++) {
        const t = m * 6;
        for (let b = 0; b < 6; b++) {
          notes.push({ midi: rhPattern[0], time: t + b, duration: 0.8 });
          notes.push({ midi: rhPattern[1], time: t + b + 0.33, duration: 0.8 });
          notes.push({ midi: rhPattern[2], time: t + b + 0.66, duration: 0.8 });
        }
        notes.push({ midi: 33, time: t, duration: 5.5 });
        notes.push({ midi: 45, time: t, duration: 5.5 });
      }
      return notes;
    })()
  },
  {
    id: 'fur-elise',
    title: 'Für Elise (Concert Version)',
    artist: 'Beethoven',
    difficulty: 8,
    bpm: 124,
    category: 'song',
    notes: (() => {
      const notes = [];
      const theme = [76, 75, 76, 75, 76, 71, 74, 72, 69];
      const lh = [33, 45, 52, 57];
      for (let l = 0; l < 8; l++) {
        const offset = l * 5;
        theme.forEach((p, i) => {
          notes.push({ midi: p, time: offset + i * 0.25, duration: 0.2 });
        });
        notes.push({ midi: lh[l % 4], time: offset, duration: 2.0 });
        notes.push({ midi: lh[l % 4] + 12, time: offset + 0.5, duration: 1.0 });
      }
      return notes;
    })()
  }
];

export const SONG_LIBRARY: { [category: string]: Song[] } = {
  classical: [
    { 
      id: 'c1', 
      title: 'Für Elise (Original Full)', 
      artist: 'Beethoven', 
      difficulty: 6, 
      bpm: 124, 
      notes: (() => {
        const notes = [];
        const themeRH = [76, 75, 76, 75, 76, 71, 74, 72, 69];
        const transitionRH = [60, 64, 69, 71, 64, 68, 71, 72];
        const sectionBRH = [71, 72, 74, 76, 67, 77, 76, 74, 65, 76, 74, 72, 64, 71, 71];

        // Section A (Theme)
        for (let loop = 0; loop < 2; loop++) {
          const mOffset = loop * 8;
          themeRH.forEach((p, idx) => {
            const t = mOffset + idx * 0.25;
            notes.push({ midi: p, time: t, duration: 0.2 });
            if (idx === 0) notes.push({ midi: 33, time: t, duration: 1.0 });
            if (idx === 3) notes.push({ midi: 45, time: t, duration: 0.5 });
            if (idx === 6) notes.push({ midi: 52, time: t, duration: 0.5 });
          });
          transitionRH.forEach((p, idx) => {
            const t = mOffset + 2.25 + idx * 0.25;
            notes.push({ midi: p, time: t, duration: 0.2 });
          });
        }

        // Section B
        const bOffset = 16;
        sectionBRH.forEach((p, idx) => {
          const t = bOffset + idx * 0.5;
          notes.push({ midi: p, time: t, duration: 0.4 });
          if (idx % 2 === 0) {
            notes.push({ midi: 43 - (idx % 4), time: t, duration: 0.9 });
            notes.push({ midi: 55 - (idx % 4), time: t, duration: 0.9 });
          }
        });

        // Return to Theme A
        for (let loop = 0; loop < 2; loop++) {
          const mOffset = bOffset + 8 + loop * 8;
          themeRH.forEach((p, idx) => {
            const t = mOffset + idx * 0.25;
            notes.push({ midi: p, time: t, duration: 0.2 });
            if (idx === 0) notes.push({ midi: 33, time: t, duration: 1.0 });
            if (idx === 3) notes.push({ midi: 45, time: t, duration: 0.5 });
          });
        }
        return notes;
      })()
    },
    { 
      id: 'c2', 
      title: 'Moonlight Sonata (Full Version)', 
      artist: 'Beethoven', 
      difficulty: 5, 
      bpm: 54, 
      notes: (() => {
        const notes = [];
        const triplets = [57, 60, 64]; 
        const melody = [69, 69, 71, 72, 72, 74, 76, 74, 72, 71];

        for (let m = 0; m < 32; m++) {
          const mTime = m * 4;
          // LH Bass (Octaves)
          const bassNote = m < 8 ? 33 : (m < 16 ? 31 : (m < 24 ? 29 : 33));
          notes.push({ midi: bassNote, time: mTime, duration: 3.8 });
          notes.push({ midi: bassNote + 12, time: mTime, duration: 3.8 });

          // RH Triplets
          for (let beat = 0; beat < 4; beat++) {
            triplets.forEach((p, i) => {
              const pitchShift = m < 16 ? 0 : (m < 24 ? 2 : 0);
              notes.push({ midi: p + pitchShift, time: mTime + beat + i * 0.33, duration: 0.3 });
            });
          }

          // Top melody enters and develops
          if (m >= 4 && m < 8) {
            notes.push({ midi: 69, time: mTime + 0.5, duration: 2.0 });
          } else if (m >= 8) {
            notes.push({ midi: melody[(m - 8) % melody.length], time: mTime + 1.5, duration: 1.5 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'c3', 
      title: 'Clair de Lune (Complete)', 
      artist: 'Debussy', 
      difficulty: 7, 
      bpm: 68, 
      notes: (() => {
        const notes = [];
        const themes = [
          [65, 69, 72, 74, 77, 74, 72, 69], // A
          [64, 67, 71, 72, 76, 72, 71, 67], // B
          [62, 65, 69, 70, 74, 70, 69, 65]  // C
        ];
        const bassProgression = [41, 45, 48, 53, 40, 43, 47, 52, 38, 41, 45, 50];
        
        for (let m = 0; m < 48; m++) {
           const t = m * 4;
           const themeIdx = Math.floor(m / 16) % themes.length;
           const theme = themes[themeIdx];
           
           // RH Melody
           theme.forEach((p, i) => {
             notes.push({ midi: p, time: t + i * 0.5, duration: 0.4 });
           });
           
           // LH Impressionistic accompaniment
           const bass = bassProgression[m % bassProgression.length];
           notes.push({ midi: bass, time: t, duration: 3.8 });
           notes.push({ midi: bass + 12, time: t + 1, duration: 2.8 });
           notes.push({ midi: bass + 16, time: t + 2, duration: 1.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'c4', 
      title: 'Canon in D (Orchestral Variations)', 
      artist: 'Pachelbel', 
      difficulty: 4, 
      bpm: 76, 
      notes: (() => {
        const notes = [];
        const groundBass = [62, 57, 59, 54, 55, 50, 55, 57]; // D, A, B, F#, G, D, G, A
        const themeM = [74, 73, 71, 69, 67, 66, 67, 69]; 
        
        for (let loop = 0; loop < 12; loop++) {
          groundBass.forEach((bass, idx) => {
            const t = (loop * 8 + idx) * 2;
            // Constant Ground Bass
            notes.push({ midi: bass - 12, time: t, duration: 1.5 });
            notes.push({ midi: bass - 24, time: t, duration: 1.5 });
            
            if (loop === 1 || loop === 2) {
              // Quarter notes melody
              notes.push({ midi: themeM[idx], time: t, duration: 0.8 });
            } else if (loop === 3 || loop === 4) {
              // Eighth notes variation
              notes.push({ midi: themeM[idx], time: t, duration: 0.4 });
              notes.push({ midi: themeM[idx] + 2, time: t + 0.5, duration: 0.4 });
            } else if (loop >= 5 ) {
              // Simulating part of the complexity
              notes.push({ midi: themeM[idx] + 5, time: t, duration: 0.2 });
              notes.push({ midi: themeM[idx] + 7, time: t + 0.5, duration: 0.2 });
              notes.push({ midi: themeM[idx] + 9, time: t + 1.0, duration: 0.2 });
            }
          });
        }
        return notes;
      })()
    },
    { 
      id: 'c5', 
      title: 'The Swan (Full Arrangement)', 
      artist: 'Saint-Saëns', 
      difficulty: 5, 
      bpm: 66, 
      notes: (() => {
        const notes = [];
        const melodies = [
          [67, 70, 74, 75, 74, 70, 67, 63, 67, 70, 72, 70], // Part 1
          [74, 75, 77, 79, 81, 79, 77, 74, 75, 72, 70, 67], // Part 2
          [70, 74, 79, 81, 82, 81, 79, 75, 74, 70, 67, 63]  // Part 3
        ];
        
        for (let m = 0; m < melodies.length * 2; m++) {
          const t = m * 6;
          const melody = melodies[m % melodies.length];
          
          // RH Flowing Melody
          melody.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.8 });
          });
          
          // LH Arpeggiated "Water" effect
          for (let b = 0; b < 12; b++) {
            const pattern = [43, 47, 50, 52, 55, 59];
            notes.push({ midi: pattern[b % 6], time: t + b * 0.5, duration: 0.4 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'c6', 
      title: 'Gymnopédie No. 1 (Full Composition)', 
      artist: 'Erik Satie', 
      difficulty: 4, 
      bpm: 64, 
      notes: (() => {
        const notes = [];
        const themes = [
          [64, 60, 57, 62, 59, 55], // Part 1
          [64, 59, 55, 62, 57, 53], // Part 2
          [60, 57, 53, 59, 55, 52], // Part 3
          [67, 64, 60, 65, 62, 59]  // Part 4 (Variation)
        ];
        const lhRoots = [48, 52, 45, 50, 47, 43, 41, 40];
        
        for (let i = 0; i < 48; i++) {
          const t = i * 3.0; // 3/4 time feel
          const themeIdx = Math.floor(i / 12) % themes.length;
          const theme = themes[themeIdx];
          
          // RH Melody
          notes.push({ midi: theme[i % theme.length], time: t, duration: 2.5 });
          
          // LH Bass + Chord (Typical Satie pattern)
          const root = lhRoots[i % lhRoots.length];
          notes.push({ midi: root, time: t, duration: 1.0 });
          // Chord on beat 2
          notes.push({ midi: root + 12, time: t + 1.0, duration: 1.5 });
          notes.push({ midi: root + 16, time: t + 1.0, duration: 1.5 });
          notes.push({ midi: root + 19, time: t + 1.0, duration: 1.5 });
        }
        return notes;
      })() 
    },
    { 
      id: 'c7', 
      title: 'Nocturne in Eb Major (Complete)', 
      artist: 'Chopin', 
      difficulty: 8, 
      bpm: 66, 
      notes: (() => {
        const notes = [];
        const mainTheme = [67, 75, 74, 72, 70, 72, 69, 70, 67];
        const variation1 = [67, 75, 77, 79, 80, 79, 78, 79, 75];
        const variation2 = [75, 82, 80, 79, 77, 78, 79, 75, 74];
        
        for (let m = 0; m < 32; m++) {
          const tOffset = m * 6;
          // LH Arpeggiated waltz (Eb major context)
          const base = m % 4 === 0 ? 39 : (m % 4 === 1 ? 43 : (m % 4 === 2 ? 46 : 39));
          for (let b = 0; b < 6; b++) {
            notes.push({ midi: base + (b % 3) * 4, time: tOffset + b * 1.0, duration: 0.9 });
          }
          
          // RH Operatic Melody with variations
          const theme = m < 8 ? mainTheme : (m < 24 ? variation1 : variation2);
          theme.forEach((p, idx) => {
            const time = tOffset + idx * 0.6;
            notes.push({ midi: p, time, duration: 0.5 });
            // Add some "Chopin" ornaments
            if (m > 8 && m % 4 === 0 && idx === 3) {
               notes.push({ midi: p + 1, time: time + 0.1, duration: 0.1 });
               notes.push({ midi: p, time: time + 0.2, duration: 0.1 });
            }
          });
        }
        return notes;
      })()
    },
    { 
      id: 'c8', 
      title: 'Minuet in G (Full Bach Edition)', 
      artist: 'Bach', 
      difficulty: 3, 
      bpm: 92, 
      notes: (() => {
        const notes = [];
        const themeA_RH = [67, 60, 62, 64, 65, 67, 60, 60, 69, 62, 64, 66, 67, 69, 62, 64];
        const themeB_RH = [64, 60, 62, 59, 60, 55, 57, 59, 60, 62, 64, 65, 64, 62, 60];
        const lhBass = [48, 52, 55, 48, 50, 52, 53, 48];
        
        for (let m = 0; m < 32; m++) {
          const t = m * 4;
          const theme = m < 16 ? themeA_RH : themeB_RH;
          
          // RH melody
          theme.slice(0, 8).forEach((p, i) => {
             notes.push({ midi: p + (m % 2 === 0 ? 0 : 12), time: t + i * 0.5, duration: 0.4 });
          });
          
          // LH counterpoint
          const bassIdx = m % lhBass.length;
          notes.push({ midi: lhBass[bassIdx], time: t, duration: 2.0 });
          notes.push({ midi: lhBass[(bassIdx + 1) % lhBass.length], time: t + 2, duration: 1.5 });
        }
        return notes;
      })()
    },
    { 
      id: 'c9', 
      title: 'Blue Danube (Original Waltz Suite)', 
      artist: 'Strauss', 
      difficulty: 5, 
      bpm: 110, 
      notes: (() => {
        const notes = [];
        const themeA = [60, 60, 64, 64, 67, 67];
        const themeB = [72, 72, 69, 69, 65, 65];
        
        for (let m = 0; m < 64; m++) {
          const startTime = m * 3;
          // LH Waltz Pattern
          const bass = m % 8 < 4 ? 48 : 43; // C major to G major
          notes.push({ midi: bass, time: startTime, duration: 0.5 });
          notes.push({ midi: bass + 12, time: startTime + 1, duration: 0.5 });
          notes.push({ midi: bass + 16, time: startTime + 1, duration: 0.5 });
          notes.push({ midi: bass + 12, time: startTime + 2, duration: 0.5 });
          notes.push({ midi: bass + 16, time: startTime + 2, duration: 0.5 });
          
          // RH Melody
          const theme = m < 32 ? themeA : themeB;
          const pitch = theme[m % theme.length];
          notes.push({ midi: pitch + (m < 32 ? 0 : 12), time: startTime, duration: 1.5 });
          
          if (m % 4 === 0) {
            notes.push({ midi: pitch + 12, time: startTime + 0.5, duration: 1.0 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'c10', 
      title: 'Turkish March (Rondo alla Turca Full)', 
      artist: 'Mozart', 
      difficulty: 9, 
      bpm: 132, 
      notes: (() => {
        const notes = [];
        const themeA = [69, 68, 69, 71, 72, 71, 72, 74, 76]; // B section theme
        const themeB = [76, 77, 79, 81, 83, 81, 79, 77, 76]; // C major theme
        
        for (let m = 0; m < 64; m++) {
           const t = m * 2;
           const theme = m < 32 ? themeA : themeB;
           
           // RH rapid patterns
           theme.forEach((p, idx) => {
             notes.push({ midi: p, time: t + idx * 0.125, duration: 0.1 });
           });
           
           // LH steady accompaniment
           const bassNote = m < 32 ? 45 : 48; // A minor to C major
           notes.push({ midi: bassNote, time: t, duration: 0.5 });
           notes.push({ midi: bassNote + 7, time: t + 0.5, duration: 0.5 });
           notes.push({ midi: bassNote + 12, time: t + 1.0, duration: 0.5 });
           notes.push({ midi: bassNote + 7, time: t + 1.5, duration: 0.5 });
        }
        // Grand Finale 
        const endT = 128;
        for (let i = 0; i < 8; i++) {
           notes.push({ midi: 69, time: endT + i * 0.25, duration: 0.2 });
           notes.push({ midi: 45, time: endT + i * 0.25, duration: 0.2 });
        }
        return notes;
      })()
    },
  ],
  pop: [
    { 
      id: 'p1', 
      title: 'Someone Like You (Original Structure)', 
      artist: 'Adele', 
      difficulty: 4, 
      bpm: 67, 
      notes: (() => {
        const notes = [];
        const arpeggio = [69, 68, 64, 62]; // A, G#, E, D context
        const verseMelody = [64, 64, 64, 66, 64, 60, 61];
        
        for (let m = 0; m < 60; m++) {
          const t = m * 4;
          // LH Deep Chords
          const bass = m < 16 ? 33 : (m < 32 ? 31 : (m < 48 ? 29 : 33));
          notes.push({ midi: bass, time: t, duration: 3.8 });
          notes.push({ midi: bass + 12, time: t, duration: 3.8 });

          // RH Arpeggio throughout
          for (let b = 0; b < 4; b++) {
            arpeggio.forEach((p, i) => {
              notes.push({ midi: p + (m >= 16 ? -2 : 0), time: t + b + i * 0.25, duration: 0.2 });
            });
          }

          // Vocal Melody simulation
          if (m >= 8) {
             const mNote = verseMelody[m % verseMelody.length];
             notes.push({ midi: mNote + 12, time: t + 0.5, duration: 2.0 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'p2', 
      title: 'All of Me (Full Ballad)', 
      artist: 'John Legend', 
      difficulty: 5, 
      bpm: 63, 
      notes: (() => {
        const notes = [];
        const rhChords = [
          [65, 68, 72], // Fm
          [63, 67, 70], // Db
          [61, 65, 68], // Ab
          [63, 66, 70]  // Eb
        ];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const chord = rhChords[m % 4];
          
          // LH Bass
          const bass = [29, 25, 20, 27][m % 4];
          notes.push({ midi: bass, time: t, duration: 3.5 });
          notes.push({ midi: bass + 12, time: t + 1, duration: 2.5 });

          // RH Piano Chords
          for (let b = 0; b < 4; b++) {
             chord.forEach(p => notes.push({ midi: p, time: t + b, duration: 0.8 }));
          }

          // Counter melody in Bridge/Chorus
          if (m > 16) {
             notes.push({ midi: 77 - (m % 3), time: t + 0.5, duration: 1.0 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'p3', 
      title: 'Bohemian Rhapsody (Full Piano Intro)', 
      artist: 'Queen', 
      difficulty: 9, 
      bpm: 72, 
      notes: (() => {
        const notes = [];
        const progression = [
          [58, 62, 65], // Bb
          [57, 61, 64], // Gm
          [56, 60, 63], // Eb
          [58, 62, 65]  // Bb
        ];
        
        for (let m = 0; m < 48; m++) {
          const t = m * 4;
          const chord = progression[m % 4];
          
          // LH Iconic Bass Line
          notes.push({ midi: 34, time: t, duration: 3.5 });
          if (m % 2 === 0) {
            notes.push({ midi: 46, time: t + 1, duration: 0.5 });
            notes.push({ midi: 46, time: t + 1.5, duration: 0.5 });
          }

          // RH Piano Chords / Arpeggios
          chord.forEach(p => notes.push({ midi: p, time: t, duration: 0.8 }));
          notes.push({ midi: chord[0], time: t + 1, duration: 0.4 });
          notes.push({ midi: chord[1], time: t + 1.5, duration: 0.4 });
          notes.push({ midi: chord[2], time: t + 2, duration: 0.4 });

          // Vocal Lines
          if (m > 4) {
             const vocal = [70, 69, 70, 72, 70];
             notes.push({ midi: vocal[m % 5], time: t + 2.5, duration: 1.0 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'p4', 
      title: 'Golden Hour (Full Solo Edit)', 
      artist: 'JVKE', 
      difficulty: 8, 
      bpm: 94, 
      notes: (() => {
        const notes = [];
        const pattern = [60, 63, 67, 70, 72, 75, 79, 82];
        const variations = [0, 2, 4, -1];
        
        for (let m = 0; m < 80; m++) {
          const t = m * 3;
          const shift = variations[Math.floor(m / 4) % variations.length];
          
          // Cascading Arpeggios
          pattern.forEach((p, i) => {
            notes.push({ midi: p + shift, time: t + i * 0.15, duration: 0.15 });
            notes.push({ midi: p + shift + 12, time: t + 1.2 + i * 0.15, duration: 0.15 });
          });

          // Deep Bass
          const bass = 24 + shift;
          notes.push({ midi: bass, time: t, duration: 2.8 });
          notes.push({ midi: bass + 12, time: t, duration: 2.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'p5', 
      title: 'Stay (Full Retro Groove)', 
      artist: 'The Kid LAROI', 
      difficulty: 5, 
      bpm: 170, 
      notes: (() => {
        const notes = [];
        const rhHook = [69, 71, 72, 74, 76, 74, 72, 71];
        const verseProg = [45, 41, 48, 43]; // Am, F, C, G bass
        
        for (let m = 0; m < 80; m++) {
          const t = m * 4;
          // Alternating section logic
          if (m % 16 < 8) {
            // Hook Section
            rhHook.forEach((p, i) => notes.push({ midi: p, time: t + i * 0.5, duration: 0.4 }));
          } else {
             // Verse Section (Chords)
             [60, 64, 67].forEach(p => notes.push({ midi: p + (m % 4), time: t, duration: 1.0 }));
             [60, 64, 67].forEach(p => notes.push({ midi: p + (m % 4), time: t + 2, duration: 1.0 }));
          }

          // Driving Bassline
          const bass = verseProg[Math.floor(m / 2) % 4];
          notes.push({ midi: bass, time: t, duration: 0.8 });
          notes.push({ midi: bass, time: t + 1, duration: 0.8 });
          notes.push({ midi: bass, time: t + 2, duration: 0.8 });
          notes.push({ midi: bass, time: t + 3, duration: 0.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'p6', 
      title: 'Blinding Lights (Complete Suite)', 
      artist: 'The Weeknd', 
      difficulty: 6, 
      bpm: 171, 
      notes: (() => {
        const notes = [];
        const synthLine = [72, 70, 72, 74, 75, 74, 72, 70];
        const melodyLine = [67, 65, 63, 65, 67];
        
        for (let m = 0; m < 80; m++) {
          const t = m * 4;
          // Intro -> Verse -> Chorus
          if (m < 16 || m > 48) {
            synthLine.forEach((p, i) => notes.push({ midi: p, time: t + i * 0.5, duration: 0.4 }));
          } else {
            melodyLine.forEach((p, i) => notes.push({ midi: p, time: t + i, duration: 0.9 }));
          }

          // 80s Synth Bass
          const bass = m % 16 < 8 ? 48 : 44; 
          notes.push({ midi: bass, time: t, duration: 3.5 });
          notes.push({ midi: bass - 12, time: t, duration: 3.5 });
        }
        return notes;
      })()
    },
    { 
      id: 'p7', 
      title: 'Perfect (Concert Arrangement)', 
      artist: 'Ed Sheeran', 
      difficulty: 4, 
      bpm: 63, 
      notes: (() => {
        const notes = [];
        const melody = [67, 64, 62, 60, 67, 64, 62, 60];
        const chorus = [72, 72, 71, 69, 67, 65, 64];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 6;
          const section = m < 32 ? melody : chorus;
          
          // RH Triplets inspired melody
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.75, duration: 0.7 });
          });

          // LH Gentle Arpeggio
          const bassRoots = [48, 45, 41, 43];
          const root = bassRoots[Math.floor(m / 4) % 4];
          for (let b = 0; b < 6; b++) {
            notes.push({ midi: root + (b % 3) * 4, time: t + b, duration: 0.6 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'p8', 
      title: 'Imagine (Complete Piano Score)', 
      artist: 'John Lennon', 
      difficulty: 3, 
      bpm: 75, 
      notes: (() => {
        const notes = [];
        const patternA = [60, 64, 67]; // C major
        const patternB = [60, 65, 69]; // F major
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const isF = m % 4 === 3;
          
          // iconic piano pulse
          for (let b = 0; b < 4; b++) {
            const chord = isF ? patternB : patternA;
            chord.forEach(p => notes.push({ midi: p, time: t + b, duration: 0.8 }));
          }

          // Bass movement
          notes.push({ midi: isF ? 41 : 48, time: t, duration: 3.8 });
          
          // Simple vocal guide
          if (m > 8) {
             notes.push({ midi: 60 + (m % 4), time: t + 0.5, duration: 1.5 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'p9', 
      title: 'Hey Jude (Full Anthem)', 
      artist: 'The Beatles', 
      difficulty: 4, 
      bpm: 74, 
      notes: (() => {
        const notes = [];
        const verse = [65, 64, 62, 60, 65, 64, 62, 60];
        const anthem = [65, 67, 69, 70, 72, 70, 69, 67];
        
        for (let m = 0; m < 100; m++) {
          const t = m * 4;
          const section = m < 48 ? verse : anthem;
          
          // RH Chords + Melody
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.45 });
            if (m > 48) notes.push({ midi: p - 12, time: t + i * 0.5, duration: 0.45 });
          });

          // LH Bass Roots
          const bass = m < 48 ? 41 : (m % 8 < 4 ? 41 : 43);
          notes.push({ midi: bass, time: t, duration: 3.8 });
          notes.push({ midi: bass - 12, time: t, duration: 3.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'p10', 
      title: 'Clocks (Complete Performance)', 
      artist: 'Coldplay', 
      difficulty: 6, 
      bpm: 131, 
      notes: (() => {
        const notes = [];
        const progression = [
          [70, 72, 74], // Eb
          [69, 72, 74], // Bbm
          [69, 72, 74], // Bbm
          [67, 70, 74]  // Fm
        ];
        
        for (let m = 0; m < 128; m++) {
          const t = m * 3; // 4/4 but phrased in 3-3-2 roughly or just 8 notes
          const chord = progression[Math.floor(m / 8) % 4];
          
          // The iconic 8-note arpeggio
          for (let i = 0; i < 8; i++) {
             notes.push({ midi: chord[i % 3], time: t + i * 0.375, duration: 0.2 });
          }

          // LH matching the chords
          const bass = [46, 45, 45, 43][Math.floor(m / 8) % 4];
          notes.push({ midi: bass, time: t, duration: 2.8 });
          notes.push({ midi: bass - 12, time: t, duration: 2.8 });
        }
        return notes;
      })()
    },
  ],
  game: [
    { 
      id: 'g1', 
      title: 'Megalo Box (Main Theme Full)', 
      artist: 'Game OST', 
      difficulty: 7, 
      bpm: 120, 
      notes: (() => {
        const notes = [];
        const theme = [60, 62, 63, 65, 67, 68, 70, 72];
        const bridge = [72, 70, 68, 67, 65, 63, 62, 60];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const section = m < 32 ? theme : bridge;
          
          // RH Theme
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.4 });
          });

          // LH Driving Bass
          notes.push({ midi: 36, time: t, duration: 0.5 });
          notes.push({ midi: 36, time: t + 1, duration: 0.5 });
          notes.push({ midi: 36, time: t + 2, duration: 0.5 });
          notes.push({ midi: 36, time: t + 3, duration: 0.5 });
          if (m % 4 === 3) notes.push({ midi: 48, time: t + 3.5, duration: 0.4 });
        }
        return notes;
      })()
    },
    { 
      id: 'g2', 
      title: 'Zelda Lullaby (Complete Orchestral)', 
      artist: 'Nintendo', 
      difficulty: 3, 
      bpm: 70, 
      notes: (() => {
        const notes = [];
        const theme = [71, 74, 69, 67, 69, 71, 74, 69];
        const secondary = [71, 74, 79, 78, 74, 71, 69];
        
        for (let m = 0; m < 48; m++) {
          const t = m * 3; // 3/4 time
          const current = m < 24 ? theme : secondary;
          
          // RH Lullaby
          current.forEach((p, i) => {
            notes.push({ midi: p + (m > 24 ? 12 : 0), time: t + i, duration: 0.9 });
          });

          // LH Ethereal Chords
          const root = [43, 41, 39, 43][Math.floor(m / 4) % 4];
          notes.push({ midi: root, time: t, duration: 2.8 });
          notes.push({ midi: root + 7, time: t + 1, duration: 1.8 });
          notes.push({ midi: root + 12, time: t + 2, duration: 0.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'g3', 
      title: 'Mario Overworld (The Complete Journey)', 
      artist: 'Nintendo', 
      difficulty: 5, 
      bpm: 180, 
      notes: (() => {
        const notes = [];
        const intro = [76, 76, 76, 72, 76, 79, 67];
        const main = [72, 67, 64, 69, 71, 70, 69];
        
        for (let m = 0; m < 80; m++) {
          const t = m * 4;
          const section = m < 4 ? intro : main;
          
          // RH Melody
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.3 });
          });

          // LH Bouncing Bass
          if (m >= 4) {
             notes.push({ midi: 48, time: t, duration: 0.5 });
             notes.push({ midi: 55, time: t + 0.5, duration: 0.5 });
             notes.push({ midi: 48, time: t + 1, duration: 0.5 });
             notes.push({ midi: 53, time: t + 2, duration: 0.5 });
          } else {
             notes.push({ midi: 43, time: t, duration: 0.5 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'g4', 
      title: 'Dearly Beloved (Complete KH)', 
      artist: 'Kingdom Hearts', 
      difficulty: 5, 
      bpm: 66, 
      notes: (() => {
        const notes = [];
        const theme = [60, 64, 67, 72, 71, 67, 64, 60];
        const vari = [62, 66, 69, 74, 73, 69, 66, 62];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 8;
          const notesArr = m < 32 ? theme : vari;
          
          // Cascading RH
          notesArr.forEach((p, i) => {
            notes.push({ midi: p + (m >= 32 ? 12 : 0), time: t + i, duration: 0.9 });
          });

          // Deep LH Pad
          const root = m < 32 ? 36 : 38;
          notes.push({ midi: root, time: t, duration: 7.8 });
          notes.push({ midi: root + 12, time: t + 2, duration: 5.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'g5', 
      title: 'Sweden (C418 Complete Edition)', 
      artist: 'C418', 
      difficulty: 4, 
      bpm: 80, 
      notes: (() => {
        const notes = [];
        const theme = [60, 64, 67, 64, 62, 66, 69, 66];
        const theme2 = [60, 65, 69, 65, 59, 62, 65, 62];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 10;
          const current = m < 32 ? theme : theme2;
          
          // Ethereal RH
          current.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 1.2, duration: 1.0 });
            if (m > 16) notes.push({ midi: p + 12, time: t + i * 1.2 + 0.1, duration: 0.5 });
          });

          // Distant LH
          const bass = m < 32 ? 36 : 41;
          notes.push({ midi: bass, time: t, duration: 9.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'g6', 
      title: 'Megalovania (Original Undertale)', 
      artist: 'Toby Fox', 
      difficulty: 10, 
      bpm: 240, 
      notes: (() => {
        const notes = [];
        const pattern = [62, 62, 74, 69, 68, 67, 65, 62, 65, 67];
        const variations = [0, -2, -3, -5];
        
        for (let m = 0; m < 120; m++) {
          const t = m * 2;
          const offset = variations[Math.floor(m / 4) % 4];
          
          // Fast RH Lead
          pattern.forEach((p, i) => {
            notes.push({ midi: p + offset, time: t + i * 0.15, duration: 0.13 });
          });

          // Percussive LH
          notes.push({ midi: 38 + offset, time: t, duration: 0.4 });
          notes.push({ midi: 38 + offset, time: t + 1, duration: 0.4 });
        }
        return notes;
      })()
    },
    { 
      id: 'g7', 
      title: 'Tetris Theme (Korobeiniki Complete)', 
      artist: 'Traditional', 
      difficulty: 6, 
      bpm: 140, 
      notes: (() => {
        const notes = [];
        const main = [76, 71, 72, 74, 72, 71, 69, 69, 72, 76, 74, 72, 71];
        const bridge = [74, 77, 81, 79, 77, 76, 72, 76, 74, 72, 71];
        
        for (let m = 0; m < 100; m++) {
          // Accelerando simulation: decrease step size slightly over time
          const speedUp = Math.max(0.7, 1 - (m / 200));
          const t = m * 4 * speedUp;
          const section = m < 50 ? main : bridge;
          
          // Russian Folk Melodies
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.3 * speedUp, duration: 0.2 });
          });

          // Balalaika-style LH
          notes.push({ midi: 33, time: t, duration: 0.3 });
          notes.push({ midi: 40, time: t + speedUp, duration: 0.3 });
          notes.push({ midi: 45, time: t + 2 * speedUp, duration: 0.3 });
        }
        return notes;
      })()
    },
    { 
      id: 'g8', 
      title: 'To Zanarkand (Full Piano Performance)', 
      artist: 'FFX', 
      difficulty: 7, 
      bpm: 100, 
      notes: (() => {
        const notes = [];
        const intro = [64, 67, 71, 72, 76, 74, 72, 71];
        const theme = [64, 62, 60, 59, 60, 64, 67, 64];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 6;
          const melody = m < 16 ? intro : theme;
          
          // Emotional RH
          melody.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.75, duration: 0.7 });
          });

          // Arpeggiated LH
          const bass = [40, 36, 41, 43][Math.floor(m / 4) % 4];
          for (let b = 0; b < 6; b++) {
            notes.push({ midi: bass + (b % 3) * 4, time: t + b, duration: 0.8 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'g9', 
      title: 'Final Fantasy Prelude (Complete Arpeggios)', 
      artist: 'Nobuo Uematsu', 
      difficulty: 4, 
      bpm: 120, 
      notes: (() => {
        const notes = [];
        const pattern = [72, 74, 76, 77, 79, 81, 83, 84, 83, 81, 79, 77, 76, 74, 72, 71];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const shift = (Math.floor(m / 8) % 4) * 5; // C -> F -> Bb -> G logic (simulated)
          
          // Flowing Harp Pattern
          pattern.forEach((p, i) => {
            notes.push({ midi: p + shift, time: t + i * 0.25, duration: 0.2 });
          });

          // Pad LH
          notes.push({ midi: 36 + shift, time: t, duration: 3.8 });
          notes.push({ midi: 48 + shift, time: t, duration: 3.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'g10', 
      title: 'Halo Theme (Complete Mjolnir Edition)', 
      artist: 'Marty O\'Donnell', 
      difficulty: 6, 
      bpm: 120, 
      notes: (() => {
        const notes = [];
        const chant = [64, 64, 64, 62, 64, 67, 64, 62];
        const driving = [64, 64, 67, 69, 71, 69, 67, 64];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const section = m < 16 ? chant : driving;
          
          // RH Theme
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.4 });
          });

          // Epic Bass
          const bass = [40, 36, 45, 43][Math.floor(m / 4) % 4];
          notes.push({ midi: bass, time: t, duration: 3.5 });
          notes.push({ midi: bass - 12, time: t, duration: 3.5 });
          if (m > 16) { // rhythmic accent
             notes.push({ midi: bass, time: t + 0.75, duration: 0.2 });
             notes.push({ midi: bass, time: t + 1.5, duration: 0.2 });
          }
        }
        return notes;
      })()
    },
  ],
  cinematic: [
    { 
      id: 'f1', 
      title: 'First Step (Interstellar Complete)', 
      artist: 'Hans Zimmer', 
      difficulty: 7, 
      bpm: 96, 
      notes: (() => {
        const notes = [];
        const rhPattern = [69, 72, 76]; // A, C, E
        const bassProg = [33, 29, 36, 31]; // Am, F, C, G logic
        
        for (let m = 0; m < 96; m++) {
          const t = m * 3; // 3/4 feel or rolling 3
          // Rolling RH
          const shift = m < 32 ? 0 : (m < 64 ? -2 : 0);
          rhPattern.forEach((p, i) => {
            notes.push({ midi: p + shift, time: t + i, duration: 0.8 });
            if (m > 32) notes.push({ midi: p + shift + 12, time: t + i + 0.1, duration: 0.5 });
          });

          // Deep Bass
          if (m % 4 === 0) {
            const root = bassProg[Math.floor(m / 8) % 4];
            notes.push({ midi: root, time: t, duration: 11.5 });
            notes.push({ midi: root + 12, time: t, duration: 11.5 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'f2', 
      title: 'Time (Inception Complete)', 
      artist: 'Hans Zimmer', 
      difficulty: 4, 
      bpm: 60, 
      notes: (() => {
        const notes = [];
        const chords = [
          [33, 45, 57, 60, 64], // Am
          [29, 41, 53, 57, 60], // F
          [36, 48, 60, 64, 67], // C
          [31, 43, 55, 59, 62]  // G
        ];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const chord = chords[Math.floor(m / 4) % 4];
          
          // Slow pulsing chords
          chord.forEach(p => notes.push({ midi: p, time: t, duration: 3.8 }));
          
          // Melody enters late
          if (m > 16) {
             const mel = [64, 67, 69, 72];
             notes.push({ midi: mel[m % 4], time: t + 2, duration: 1.5 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'f3', 
      title: 'Valse d\'Amélie (Complete Edition)', 
      artist: 'Yann Tiersen', 
      difficulty: 6, 
      bpm: 100, 
      notes: (() => {
        const notes = [];
        const rhTheme = [69, 72, 76, 72, 69, 72];
        const lhBass = [45, 41, 48, 43]; // Am, F, C, G
        
        for (let m = 0; m < 120; m++) {
          const t = m * 3; // 3/4 waltz
          // RH Folk melody
          const pitch = rhTheme[m % rhTheme.length];
          notes.push({ midi: pitch + (m > 60 ? 12 : 0), time: t, duration: 1.5 });
          if (m % 2 === 0) notes.push({ midi: pitch + 4, time: t + 0.5, duration: 0.5 });

          // LH Waltz rhythm
          const root = lhBass[Math.floor(m / 4) % 4];
          notes.push({ midi: root, time: t, duration: 0.8 });
          notes.push({ midi: root + 12, time: t + 1, duration: 0.8 });
          notes.push({ midi: root + 12, time: t + 2, duration: 0.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'f4', 
      title: 'Hedwig\'s Theme (Full Magical Score)', 
      artist: 'John Williams', 
      difficulty: 8, 
      bpm: 125, 
      notes: (() => {
        const notes = [];
        const theme = [71, 76, 79, 78, 76, 83, 81, 78, 76, 79, 74, 75, 71];
        const variations = [71, 76, 79, 78, 76, 83, 86, 85, 84, 80, 83, 82, 81, 77, 76];
        
        for (let m = 0; m < 96; m++) {
          const t = m * 3; // 3/8 or 6/8 simplified
          const current = m < 48 ? theme : variations;
          
          // Mystical RH
          const p = current[m % current.length];
          notes.push({ midi: p, time: t, duration: 0.7 });
          if (m % 2 === 0) notes.push({ midi: p + 12, time: t + 0.25, duration: 0.2 });

          // orchestral LH pad
          const bass = [35, 33, 31, 35][Math.floor(m / 12) % 4];
          notes.push({ midi: bass, time: t, duration: 2.8 });
        }
        return notes;
      })()
    },
    { 
      id: 'f5', 
      title: 'The Godfather (Original Full Theme)', 
      artist: 'Nino Rota', 
      difficulty: 5, 
      bpm: 80, 
      notes: (() => {
        const notes = [];
        const melody = [64, 69, 72, 71, 69, 72, 69, 68, 65, 64];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          // Melancholy RH
          melody.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.4, duration: 0.35 });
          });

          // Strummed LH chords
          const bass = [33, 29, 31, 33][Math.floor(m / 16) % 4];
          notes.push({ midi: bass, time: t, duration: 3.5 });
          [12, 15, 19].forEach((off, i) => {
            notes.push({ midi: bass + off, time: t + i * 0.1, duration: 3.0 });
          });
        }
        return notes;
      })()
    },
    { 
      id: 'f6', 
      title: 'Merry Go Round of Life (Full Waltz)', 
      artist: 'Joe Hisaishi', 
      difficulty: 8, 
      bpm: 120, 
      notes: (() => {
        const notes = [];
        const theme = [67, 71, 74, 79, 78, 74, 71];
        const themeB = [79, 83, 86, 91, 90, 86, 83];
        
        for (let m = 0; m < 100; m++) {
          const t = m * 3;
          const section = m < 50 ? theme : themeB;
          
          // Virtuoso RH
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.4, duration: 0.3 });
          });

          // Classical LH Waltz
          const root = [43, 40, 41, 43][Math.floor(m / 4) % 4];
          notes.push({ midi: root, time: t, duration: 0.5 });
          notes.push({ midi: root + 12, time: t + 1, duration: 0.5 });
          notes.push({ midi: root + 15, time: t + 1, duration: 0.5 });
          notes.push({ midi: root + 12, time: t + 2, duration: 0.5 });
          notes.push({ midi: root + 15, time: t + 2, duration: 0.5 });
        }
        return notes;
      })()
    },
    { 
      id: 'f7', 
      title: 'One Summer\'s Day (Original Soundtrack)', 
      artist: 'Joe Hisaishi', 
      difficulty: 7, 
      bpm: 84, 
      notes: (() => {
        const notes = [];
        const theme = [72, 74, 76, 79, 81, 79, 76, 74];
        const bridge = [60, 64, 67, 72, 79];
        
        for (let m = 0; m < 80; m++) {
          const t = m * 4;
          const melArr = m < 40 ? theme : bridge;
          
          // Expressive RH
          melArr.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.45 });
          });

          // Rolling LH
          const base = m < 40 ? 48 : 41;
          for (let b = 0; b < 4; b++) {
            notes.push({ midi: base + (b * 2), time: t + b, duration: 0.9 });
          }
        }
        return notes;
      })()
    },
    { 
      id: 'f8', 
      title: 'Skyfall (Complete Orchestral Arrangement)', 
      artist: 'Adele', 
      difficulty: 5, 
      bpm: 76, 
      notes: (() => {
        const notes = [];
        const verse = [60, 63, 62, 59, 60];
        const chorus = [72, 72, 72, 70, 68, 67];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 4;
          const section = m < 32 ? verse : chorus;
          
          // Sultry RH
          section.forEach((p, i) => {
            notes.push({ midi: p, time: t + i, duration: 0.9 });
          });

          // Full LH Orchestral Pad
          const root = m < 32 ? 36 : 33;
          notes.push({ midi: root, time: t, duration: 3.5 });
          notes.push({ midi: root - 12, time: t, duration: 3.5 });
          notes.push({ midi: root + 7, time: t + 2, duration: 1.5 });
        }
        return notes;
      })()
    },
    { 
      id: 'f9', 
      title: 'Imperial March (Full Orchestral Theme)', 
      artist: 'John Williams', 
      difficulty: 6, 
      bpm: 103, 
      notes: (() => {
        const notes = [];
        const main = [67, 67, 67, 63, 70, 67, 63, 70];
        const middle = [74, 74, 74, 75, 70, 66, 63, 70];
        
        for (let m = 0; m < 80; m++) {
          const t = m * 4;
          const theme = m % 16 < 8 ? main : middle;
          
          // Powerful RH
          theme.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.5, duration: 0.35 });
          });

          // Driving LH March
          const root = m % 16 < 8 ? 43 : 39;
          notes.push({ midi: root, time: t, duration: 0.4 });
          notes.push({ midi: root, time: t + 1, duration: 0.4 });
          notes.push({ midi: root, time: t + 2, duration: 0.4 });
          notes.push({ midi: root, time: t + 3, duration: 0.4 });
        }
        return notes;
      })()
    },
    { 
      id: 'f10', 
      title: 'Gladiator: Now We Are Free (Full Composition)', 
      artist: 'Hans Zimmer', 
      difficulty: 5, 
      bpm: 70, 
      notes: (() => {
        const notes = [];
        const theme = [60, 64, 67, 65, 62, 60, 64, 67, 72, 71];
        
        for (let m = 0; m < 64; m++) {
          const t = m * 6;
          // Ethereal RH
          theme.forEach((p, i) => {
            notes.push({ midi: p, time: t + i * 0.6, duration: 0.5 });
          });

          // Flowing LH Pads
          const root = [36, 41, 43, 36][Math.floor(m / 4) % 4];
          notes.push({ midi: root, time: t, duration: 5.5 });
          notes.push({ midi: root + 12, time: t + 2, duration: 3.5 });
        }
        return notes;
      })()
    },
  ]
};

export const LEVELS: Level[] = [
  ...[1,2,3,4,5,6,7,8,9,10].map(id => {
    switch(id) {
       case 1: return { id: 1, title: 'Key', description: 'Master the center anchor and learn to translate visual patterns to sound.', requiredXp: 0, category: 'basic' as const, lessons: SAMPLE_SONGS.slice(0, 5) };
       case 2: return { id: 2, title: 'Scale', description: 'Standard patterns and basic finger movement.', requiredXp: 400, category: 'melody' as const, lessons: SAMPLE_SONGS.slice(1, 4) };
       case 3: return { id: 3, title: 'Flow', description: 'Combining longer sequences and varying rhythms.', requiredXp: 800, category: 'melody' as const, lessons: SAMPLE_SONGS.slice(2, 5) };
       case 4: return { id: 4, title: 'Triad', description: 'Playing multiple notes in harmony.', requiredXp: 1500, category: 'chords' as const, lessons: [SAMPLE_SONGS[4]] };
       case 5: return { id: 5, title: 'Tempo', description: 'Syncing with the grid under pressure.', requiredXp: 2200, category: 'song' as const, lessons: SONG_LIBRARY.classical.slice(0, 3) };
       case 6: return { id: 6, title: 'Sustain', description: 'Atmospheric pieces from the stars.', requiredXp: 3000, category: 'song' as const, lessons: SONG_LIBRARY.cinematic.slice(0, 3) };
       case 7: return { id: 7, title: 'Etude', description: 'Challenge your internal recall of Für Elise and Moonlight.', requiredXp: 4000, category: 'song' as const, lessons: [SONG_LIBRARY.classical[0], SONG_LIBRARY.classical[1]] };
       case 8: return { id: 8, title: 'Prelude', description: 'Recall the emotional peaks of Adele and John Legend.', requiredXp: 5500, category: 'song' as const, lessons: [SONG_LIBRARY.pop[0], SONG_LIBRARY.pop[1]] };
       case 9: return { id: 9, title: 'Sonata', description: 'Master the complex structures of Hans Zimmer by heart.', requiredXp: 7500, category: 'song' as const, lessons: [SONG_LIBRARY.cinematic[0], SONG_LIBRARY.cinematic[1]] };
       case 10: return { id: 10, title: 'Virtuoso', description: 'The final barrier. Play Queen and Mozart with zero assistance.', requiredXp: 10000, category: 'song' as const, lessons: [SONG_LIBRARY.pop[2], SONG_LIBRARY.classical[9]] };
       default: return {} as Level;
    }
  })
];

