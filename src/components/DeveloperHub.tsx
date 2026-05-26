import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Download, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  X, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw,
  Sliders,
  Sparkles
} from 'lucide-react';

export function DeveloperHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState('');
  const [branch, setBranch] = useState('main');
  const [forcePush, setForcePush] = useState(true);
  const [commitMessage, setCommitMessage] = useState('PianoQuest Live Export: Build Sync');
  
  // States for pushing
  const [isPushing, setIsPushing] = useState(false);
  const [pushLogs, setPushLogs] = useState<string[]>([]);
  const [pushStatus, setPushStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // States for zipping
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedRepo = localStorage.getItem('pianoquest_git_repo');
    const savedToken = localStorage.getItem('pianoquest_git_token');
    const savedBranch = localStorage.getItem('pianoquest_git_branch');
    
    if (savedRepo) setRepoUrl(savedRepo);
    if (savedToken) setToken(savedToken);
    if (savedBranch) setBranch(savedBranch);
  }, []);

  // Save changes automatically to local localStorage
  const handleSaveConfig = (repo: string, tok: string, br: string) => {
    localStorage.setItem('pianoquest_git_repo', repo);
    localStorage.setItem('pianoquest_git_token', tok);
    localStorage.setItem('pianoquest_git_branch', br);
  };

  // Download ZIP file from /api/git/download-zip
  const handleDownloadZip = async () => {
    if (isZipping) return;
    setIsZipping(true);
    setZipSuccess(false);

    try {
      const response = await fetch('/api/git/download-zip');
      if (!response.ok) {
        throw new Error('Could not request zip package from workspace developer server.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pianoquest-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err: any) {
      console.error('ZIP compilation error:', err);
      alert(`ZIP Package Failed: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  // Trigger Remote GitHub Sync
  const handlePushToGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) {
      setErrorMessage('Please provide your GitHub repository URL.');
      setPushStatus('error');
      return;
    }

    setIsPushing(true);
    setPushStatus('idle');
    setPushLogs(['[Sync Engine] Connecting to PianoQuest internal gateway...', '[Sync Engine] Extracting workspace modules...']);
    setErrorMessage('');

    // Persist configurations
    handleSaveConfig(repoUrl, token, branch);

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          token,
          branch,
          commitMessage,
          forcePush
        })
      });

      const data = await res.json();
      if (data.logs) {
        setPushLogs(data.logs);
      }

      if (res.ok && data.success) {
        setPushStatus('success');
      } else {
        setPushStatus('error');
        setErrorMessage(data.error || 'Sync process aborted with non-zero exit code.');
      }
    } catch (err: any) {
      setPushStatus('error');
      setErrorMessage(err.message || 'Network loss or workspace container connection timeout.');
      setPushLogs(prev => [...prev, `[Fatal error] Sync disconnected: ${err.message}`]);
    } finally {
      setIsPushing(false);
    }
  };

  const getCleanRepoUrl = (url: string) => {
    // Trim trailing and show clean view
    return url.replace(/https:\/\/.*github\.com\//, 'github.com/').replace(/\.git$/, '');
  };

  return (
    <>
      {/* Retractable Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 px-4.5 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/15 hover:from-cyan-500/20 hover:to-blue-500/25 border border-cyan-500/30 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.15)] group hover:border-cyan-400"
          id="btn_dev_hub_trigger"
        >
          <Github size={13} className="text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
          <span>Publish & Export</span>
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
        </motion.button>
      </div>

      {/* Side Slide-out Developer Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop Guard */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950 z-[90]"
              id="dev_hub_backdrop"
            />

            {/* Main Portal Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-slate-900 border-l border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[100] flex flex-col overflow-hidden"
              id="dev_hub_panel"
            >
              {/* Header */}
              <div className="h-18 p-6 bg-slate-950/40 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <Github className="text-cyan-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-cyan-300">Publish Center</h3>
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Instant Code sync & download</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Workspace Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                
                {/* 1. Quick Info Callout */}
                <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10 space-y-2">
                  <div className="flex gap-2.5">
                    <Sparkles size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">Direct Push Sync Engine</h4>
                      <p className="text-slate-400 text-[10px] leading-relaxed mt-1">
                        If GitHub returns a "failed to load files" or "failed to load differences" in Google AI Studio, use this panel to package, download, or directly push all of your custom code directly to GitHub.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. ZIP exporter */}
                <div className="glass border-white/5 rounded-2xl p-5 space-y-4 relative overflow-hidden bg-slate-950/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Download size={14} className="text-cyan-400" />
                        Download Project Bundle
                      </h4>
                      <p className="text-[10px] text-white/40 mt-1">
                        Export your full active PianoQuest workspace as a safe ready-to-run ZIP file.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="w-full h-11 bg-white/5 hover:bg-white/10 active:bg-white/12 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isZipping ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-cyan-400" />
                        <span>Compiling ZIP Package...</span>
                      </>
                    ) : zipSuccess ? (
                      <>
                        <CheckCircle2 size={13} className="text-green-400" />
                        <span className="text-green-400">Download Initiated!</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} className="text-cyan-400" />
                        <span>Export Source Code ZIP</span>
                      </>
                    )}
                  </button>

                  <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest text-center mt-1">
                    Zero terminal code required • Completely self-contained
                  </div>
                </div>

                {/* 2. Direct GitHub Exporter Form */}
                <div id="github_exporter_wrapper" className="glass border-white/5 rounded-2xl p-5 bg-slate-950/20 space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Github size={14} className="text-cyan-400" />
                      Auto-Upload to GitHub
                    </h4>
                    <p className="text-[10px] text-white/40 mt-1">
                      Instantly clone, stage, commit, and push changes directly from this sandboxed devcontainer.
                    </p>
                  </div>

                  <form onSubmit={handlePushToGitHub} className="space-y-4">
                    {/* Repository Destination */}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">GitHub Repository URL</label>
                      <input
                        type="url"
                        value={repoUrl}
                        onChange={(e) => {
                          setRepoUrl(e.target.value);
                          handleSaveConfig(e.target.value, token, branch);
                        }}
                        placeholder="https://github.com/my-username/pianoquest"
                        className="w-full h-10 px-3.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] text-slate-200 placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none transition-colors"
                        required
                        id="git_repo_url"
                      />
                    </div>

                    {/* GitHub Security Token */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-bold uppercase tracking-wider text-white/50 block">Personal Access Token (PAT)</label>
                        <a 
                          href="https://github.com/settings/tokens/new" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[9px] font-bold text-cyan-400 hover:underline flex items-center gap-1 uppercase tracking-wider"
                        >
                          Generate New PAT <ChevronRight size={8} />
                        </a>
                      </div>
                      <input
                        type="password"
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          handleSaveConfig(repoUrl, e.target.value, branch);
                        }}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full h-10 px-3.5 bg-slate-950 border border-white/5 rounded-lg text-[11px] text-slate-200 placeholder:text-white/25 focus:border-cyan-500/50 focus:outline-none transition-colors"
                        required
                        id="git_security_token"
                      />
                      <span className="text-[9px] text-white/30 block leading-normal mt-1">
                        Use a classical developer token with the <strong className="text-white/50 font-medium">repo</strong> checkbox enabled. Your token remains safely masked and stored solely inside this applet browser local storage.
                      </span>
                    </div>

                    {/* Collapsible Advanced configs */}
                    <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between gap-4">
                        {/* Branch */}
                        <div className="w-1/2 space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">Target Branch</span>
                          <input
                            type="text"
                            value={branch}
                            onChange={(e) => {
                              setBranch(e.target.value);
                              handleSaveConfig(repoUrl, token, e.target.value);
                            }}
                            className="w-full h-8 px-2.5 bg-slate-950 border border-white/5 rounded-md text-[10px] text-slate-200 focus:outline-none"
                            id="git_branch_name"
                          />
                        </div>
                        {/* Force Push toggle */}
                        <div className="w-1/2 space-y-1">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">Push Profile</span>
                          <label className="flex items-center gap-2 h-8 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={forcePush}
                              onChange={(e) => setForcePush(e.target.checked)}
                              className="accent-cyan-400 rounded focus:ring-0 focus:outline-none"
                              id="git_force_push"
                            />
                            <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Overwrite Origin</span>
                          </label>
                        </div>
                      </div>

                      {/* Customize commit message */}
                      <div className="space-y-1">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-white/40 block">Commit Message</span>
                        <input
                          type="text"
                          value={commitMessage}
                          onChange={(e) => setCommitMessage(e.target.value)}
                          className="w-full h-8 px-2.5 bg-slate-950 border border-white/5 rounded-md text-[10px] text-slate-200 focus:outline-none"
                          id="git_commit_message"
                        />
                      </div>
                    </div>

                    {/* Sync Trigger button */}
                    <button
                      type="submit"
                      disabled={isPushing}
                      className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:opacity-50 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.15)] flex items-center justify-center gap-2"
                      id="btn_trigger_git_push"
                    >
                      {isPushing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Pushing to GitHub Repo...</span>
                        </>
                      ) : (
                        <>
                          <Github size={13} />
                          <span>Push Complete Workspace to GitHub</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Live Console Output Log */}
                {pushLogs.length > 0 && (
                  <div className="bg-slate-950/70 border border-white/5 rounded-xl p-4.5 space-y-2.5">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5 font-mono">
                        <Terminal size={11} className="text-cyan-400 animate-pulse" />
                        Gateway Transaction Console
                      </span>
                      {pushStatus === 'success' && (
                        <span className="text-[8px] font-bold bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Finished
                        </span>
                      )}
                      {pushStatus === 'error' && (
                        <span className="text-[8px] font-bold bg-red-400/10 text-red-400 border border-red-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          Failed
                        </span>
                      )}
                    </div>
                    
                    {/* Log Terminal */}
                    <div className="max-h-40 overflow-y-auto space-y-1 font-mono text-[9px] text-cyan-200/80 leading-normal scrollbar-thin">
                      {pushLogs.map((logLine, idx) => (
                        <div key={idx} className="whitespace-pre-wrap">
                          <span className="text-white/20 select-none mr-2">{String(idx + 1).padStart(2, '0')}</span>
                          {logLine}
                        </div>
                      ))}
                    </div>

                    {/* Status feedback banner */}
                    {pushStatus === 'success' && (
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 mt-2">
                        <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                        <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">
                          Project exported to GitHub branch '{branch}'! Go verify your repo!
                        </span>
                      </div>
                    )}

                    {pushStatus === 'error' && (
                      <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg space-y-1.5 mt-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} className="text-red-400 shrink-0" />
                          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">
                            Push Action Failed
                          </span>
                        </div>
                        <p className="text-[9px] font-mono text-red-300 leading-relaxed overflow-x-auto whitespace-pre">
                          {errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed steps help guide */}
                <div className="glass border-white/5 rounded-2xl p-5 bg-slate-950/20 space-y-3">
                  <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest flex items-center gap-1.5">
                    <HelpCircle size={13} className="text-cyan-400" />
                    How to construct a classical PAT?
                  </h4>
                  <ol className="list-decimal list-inside text-white/50 text-[10px] space-y-2 leading-relaxed">
                    <li>Log into your <strong>GitHub account</strong>.</li>
                    <li>Click your profile picture in the top right, go to <strong>Settings</strong>.</li>
                    <li>Scroll down and click <strong>Developer Settings</strong> on the left-hand column.</li>
                    <li>Select <strong>Personal Access Tokens</strong> &gt; <strong>Tokens (classic)</strong>.</li>
                    <li>Click <strong>Generate new token (classic)</strong>. Name it "PianoQuest".</li>
                    <li>Select the <strong className="text-white">repo</strong> checkbox (this gives the token push access).</li>
                    <li>Click <strong>Generate Token</strong> at the bottom. Copy the token immediately and paste it into the sync fields above!</li>
                  </ol>
                </div>

              </div>

              {/* Live Run Helper bar */}
              <div className="p-4.5 bg-slate-950/60 border-t border-white/5 flex items-center justify-between">
                <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
                  PianoQuest • Export Hub • v1.1.0
                </div>
                {repoUrl && (
                  <div className="text-[9px] font-mono text-cyan-400/60 font-medium tracking-tight truncate max-w-[200px]" title={repoUrl}>
                    Active repo: {getCleanRepoUrl(repoUrl)}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
