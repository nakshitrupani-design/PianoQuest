/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { YIN } from 'pitchfinder';

export function useAudioEngine() {
  const [isMicrophoneReady, setIsMicrophoneReady] = useState(false);
  const [detectedNote, setDetectedNote] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<any>(null);
  const inputStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    // Initialize synth
    synthRef.current = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();
    synthRef.current.volume.value = -12; // Moderate volume

    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const playNote = useCallback((midi: number, duration: number = 0.5) => {
    if (!synthRef.current) return;
    const freq = Tone.Frequency(midi, 'midi').toFrequency();
    try {
      synthRef.current.triggerAttackRelease(freq, duration);
    } catch (e) {
      console.warn('Synth trigger failed:', e);
    }
  }, []);

  const startMicrophone = useCallback(async () => {
    try {
      await Tone.start();
      // Use raw audio constraints for better instrument tracking
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      inputStreamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      
      // Add a high-pass filter to remove low-frequency rumble and some voice fundamentals
      const filter = audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 80; // Cut off below 80hz
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.1; // Faster response
      
      source.connect(filter);
      filter.connect(analyser);
      analyserRef.current = analyser;

      detectorRef.current = YIN({ 
        sampleRate: audioContext.sampleRate,
        threshold: 0.15 // Adjust YIN threshold for more stability
      });
      setIsMicrophoneReady(true);
      
      detectPitch();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (inputStreamRef.current) {
      inputStreamRef.current.getTracks().forEach(track => track.stop());
    }
    setDetectedNote(null);
    setIsMicrophoneReady(false);
  }, []);

  const detectPitch = useCallback(() => {
    if (!analyserRef.current || !detectorRef.current) return;

    const buffer = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(buffer);

    // Calculate RMS (volume level) to filter out background noise/voices
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    
    // Minimum volume threshold to consider the sound a piano note (adjust as needed)
    const MIN_RMS = 0.015; 

    if (rms > MIN_RMS) {
      const pitch = detectorRef.current(buffer);

      if (pitch) {
        // Convert frequency to MIDI note number
        const midiNote = Math.round(12 * Math.log2(pitch / 440) + 69);
        // Filter out unrealistic notes for a piano (MIDI 21 to 108)
        if (midiNote >= 21 && midiNote <= 108) {
          setDetectedNote(midiNote);
        } else {
          setDetectedNote(null);
        }
      } else {
        setDetectedNote(null);
      }
    } else {
      setDetectedNote(null);
    }

    animationFrameRef.current = requestAnimationFrame(detectPitch);
  }, []);

  useEffect(() => {
    return () => {
      stopMicrophone();
    };
  }, [stopMicrophone]);

  return {
    isMicrophoneReady,
    detectedNote,
    startMicrophone,
    stopMicrophone,
    playNote
  };
}
