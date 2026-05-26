/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Mic, X, Sparkles, Brain, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

import { GoogleGenAI } from '@google/genai';

interface SheetMusicCoachProps {
  onClose: () => void;
}

export const SheetMusicCoach: React.FC<SheetMusicCoachProps> = ({ onClose }) => {
  const [step, setStep] = useState<'upload' | 'analyzing' | 'feedback' | 'listening' | 'result'>('upload');
  const [images, setImages] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [listeningFeedback, setListeningFeedback] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Could not access camera. Please ensure permissions are granted.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Ensure high quality draw
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.9);
        setImages(prev => [...prev, dataUrl]);
      }
    }
  };

  const analyzeSheetMusic = async () => {
    if (images.length === 0) return;
    setStep('analyzing');
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in environment.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const content = images.map(img => ({
        inlineData: {
          data: img.split(',')[1] || img,
          mimeType: "image/jpeg"
        }
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            ...content,
            { text: "You are a professional and encouraging piano mentor. Analyze these images of sheet music in their entirety. Identify complex sections, key changes, and stylistic nuances across the whole piece. Provide 5 detailed coaching tips that balance high-level musicality with specific technical advice. Be thorough but maintain a supportive, polite tone." }
          ]
        }
      });

      setAnalysis(response.text || '');
      setStep('feedback');
    } catch (err: any) {
      console.error('Sheet music analysis error:', err);
      setError(`Analysis failed: ${err.message || 'Please try again.'}`);
      setStep('upload');
    }
  };

  const startListening = async () => {
    setStep('listening');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        analyzePerformance(audioBlob);
      };

      mediaRecorder.start();
      // Auto-stop after 15 seconds for this demo
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      }, 15000);
    } catch (err: any) {
      console.error('Mic access error:', err);
      setError('Could not access microphone.');
      setStep('feedback');
    }
  };

  const analyzePerformance = async (audioBlob: Blob) => {
    setStep('analyzing');
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error('GEMINI_API_KEY missing');
        
        const ai = new GoogleGenAI({ apiKey });
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          config: {
            systemInstruction: "You are an insightful and polite piano judge. Your goal is to help students improve by being honest but encouraging. If the audio is silent or contains no piano performance, kindly mention that you couldn't hear the playing and ask for a retry. If there is music, provide helpful, polite feedback focused on areas for growth."
          },
          contents: {
            parts: [
              {
                inlineData: {
                  data: base64Audio,
                  mimeType: "audio/webm"
                }
              },
              { text: `Evaluate my performance based on the sheet music analysis we did: ${analysis}. 
              1. Listen carefully: Did I play correctly? If silence, kindly ask me to play again.
              2. Give me a balanced review: Identify my strengths and 2-3 specific areas for improvement.
              3. Be encouraging and polite, like a master-class teacher.` }
            ]
          }
        });

        setListeningFeedback(response.text || '');
        setStep('result');
      };
    } catch (err: any) {
      console.error('Performance analysis error:', err);
      setError('Performance analysis failed.');
      setStep('feedback');
    }
  };

  useEffect(() => {
    if (step === 'upload') {
      startCamera();
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [step]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl"
    >
      <div className="glass border-white/10 w-full max-w-6xl h-[90vh] rounded-[40px] overflow-hidden flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-[210] p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-y-auto p-12">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-cyan-500/20 rounded-3xl flex items-center justify-center mb-8">
                  <Camera className="text-cyan-400" size={40} />
                </div>
                <h2 className="text-4xl font-light text-white mb-4">Capture <span className="text-cyan-400 font-bold uppercase italic">Sheet Music</span></h2>
                <p className="text-white/40 mb-12 max-w-md">Position your sheet music in view. Our AI will analyze the notes and prepare a coaching session for you.</p>
                
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl items-start h-full max-h-[70vh]">
                  <div 
                    onClick={capturePhoto}
                    className="relative flex-1 aspect-[3/4] rounded-3xl overflow-hidden glass border-white/10 cursor-pointer group/video"
                  >
                    {error ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        <AlertCircle className="text-red-400 mb-4" size={48} />
                        <p className="text-white/60 mb-6">{error}</p>
                        <button onClick={(e) => { e.stopPropagation(); startCamera(); }} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest transition-all">Retry Camera</button>
                      </div>
                    ) : (
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover brightness-110 contrast-110" />
                    )}
                    <div className="absolute inset-0 border-[40px] border-slate-950/20 pointer-events-none group-hover/video:border-cyan-500/10 transition-all" />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-cyan-500/20 group-hover/video:bg-cyan-500/40 transition-all" />
                    
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); capturePhoto(); }}
                        className="px-12 py-6 bg-cyan-500 text-slate-950 font-black rounded-full transition-all uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(6,182,212,0.3)] flex items-center gap-3 group-hover/video:scale-105"
                      >
                        <Camera size={20} /> Capture The Page
                      </motion.button>
                    </div>
                  </div>

                  <div className="w-full md:w-80 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Captured Pages ({images.length})</h3>
                      {images.length > 0 && (
                        <button onClick={() => setImages([])} className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors uppercase font-bold">Clear All</button>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                      {images.length === 0 ? (
                        <div className="h-full border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                          <p className="text-white/10 text-[10px] uppercase tracking-widest">No pages captured yet</p>
                        </div>
                      ) : (
                        images.map((img, idx) => (
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={idx} 
                            className="relative aspect-[3/4] rounded-xl overflow-hidden glass border-white/20 group"
                          >
                            <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt={`Page ${idx + 1}`} />
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button 
                                onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                className="p-1.5 bg-black/60 rounded-full text-white/40 hover:text-red-400 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-white/60">PAGE {idx + 1}</div>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    <motion.button
                      disabled={images.length === 0}
                      onClick={analyzeSheetMusic}
                      className={`mt-6 py-4 rounded-full font-black transition-all uppercase tracking-[0.2em] text-[10px] ${
                        images.length > 0 
                          ? 'bg-white text-slate-950 shadow-[0_0_30px_#fff] cursor-pointer' 
                          : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                      }`}
                    >
                      {images.length > 0 ? `Analyze ${images.length} Page${images.length > 1 ? 's' : ''}` : 'Capture a page first'}
                    </motion.button>
                  </div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="relative mb-12">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-dashed border-cyan-500/20 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="text-cyan-400 animate-pulse" size={48} />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-widest">Processing Neurals...</h2>
                <p className="text-white/40 font-mono text-sm">Decoding notation and calculating difficulty nodes</p>
                
                <div className="mt-12 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1/2 h-full bg-cyan-500"
                  />
                </div>
              </motion.div>
            )}

            {step === 'feedback' && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">AI Coaching <span className="text-cyan-400 font-light italic">Insights</span></h2>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Score Analysis Complete</p>
                  </div>
                </div>

                <div className="flex-1 glass border-white/5 rounded-[32px] p-8 overflow-y-auto mb-8 prose prose-invert prose-cyan max-w-none">
                   <div className="text-white/80 whitespace-pre-wrap leading-relaxed font-light">
                     {analysis}
                   </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest text-left">Ready to listen to your performance</span>
                  </div>
                  <button
                    onClick={startListening}
                    className="px-10 py-4 bg-white hover:bg-cyan-500 hover:text-slate-950 text-slate-950 font-black rounded-full transition-all uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-3"
                  >
                    <Mic size={16} /> I'm ready, listen to me play
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'listening' && (
              <motion.div 
                key="listening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center"
              >
                <div className="relative mb-16">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl"
                  />
                  <div className="relative w-40 h-40 glass border-cyan-500/50 rounded-full flex items-center justify-center">
                    <Mic className="text-cyan-400 animate-bounce" size={64} />
                  </div>
                </div>
                <h2 className="text-4xl font-light text-white mb-6">Listening...</h2>
                <p className="text-cyan-400/60 font-mono text-sm uppercase tracking-widest mb-12">Performance analysis in progress (15s window)</p>
                
                <div className="flex gap-2">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [16, 48, 16] }}
                      transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1.5 bg-cyan-500/40 rounded-full"
                    />
                  ))}
                </div>

                <button
                   onClick={() => mediaRecorderRef.current?.stop()}
                   className="mt-16 px-8 py-3 glass border-white/10 hover:border-white/30 text-white/40 hover:text-white transition-all text-[10px] uppercase font-bold tracking-widest"
                >
                  Stop Recording
                </button>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Performance <span className="text-green-400 font-light italic">Feedback</span></h2>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-mono">Live Listening Session Complete</p>
                  </div>
                </div>

                <div className="flex-1 glass border-white/5 rounded-[32px] p-8 overflow-y-auto mb-8 prose prose-invert prose-green max-w-none">
                   <div className="text-white/80 whitespace-pre-wrap leading-relaxed font-light">
                     {listeningFeedback}
                   </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep('upload')}
                    className="px-8 py-4 glass border-white/10 hover:bg-white/5 text-white/60 font-bold rounded-full transition-all uppercase tracking-widest text-[10px]"
                  >
                    Analyze New Score
                  </button>
                  <button
                    onClick={onClose}
                    className="px-10 py-4 bg-cyan-500 text-slate-950 font-black rounded-full hover:bg-cyan-400 transition-all uppercase tracking-widest text-[10px] shadow-xl"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
