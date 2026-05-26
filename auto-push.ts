import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Files and folders to watch
const watchTargets = [
  'src',
  'public',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'index.html',
  'README.md',
  'firestore.rules',
  'firebase-blueprint.json'
];

// Configuration
const DEBOUNCE_MS = 5000; // Wait 5 seconds after the last change before pushing to Git
let debounceTimer: NodeJS.Timeout | null = null;
let changedFiles = new Set<string>();

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m'
};

function log(message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  let color = colors.cyan;
  if (type === 'success') color = colors.green;
  if (type === 'warn') color = colors.yellow;
  if (type === 'error') color = colors.red;

  console.log(`${colors.bold}[${timestamp}]${colors.reset} ${color}${message}${colors.reset}`);
}

// Get standard active branch name
function getActiveBranch(): string {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim() || 'main';
  } catch {
    return 'main';
  }
}

// Execute the git push process
function triggerGitSync() {
  log(`\n⚡ Change threshold met. Starting automatic Git sync...`, 'warn');
  
  try {
    // 1. Get branch details
    const branchName = getActiveBranch();
    log(`Using active branch: ${colors.bold}${branchName}${colors.reset}`);

    // List changed files for the commit message
    const changeSummary = Array.from(changedFiles).map(f => path.basename(f)).join(', ');
    log(`Staging files: ${changeSummary}`);

    // 2. Stage updated files
    execSync('git add .', { stdio: 'inherit' });

    // 3. Commit with a clear automated timestamped message
    const commitMessage = `Auto-commit: modified ${changeSummary || 'project files'} (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()})`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    log(`Changes committed successfully!`, 'success');

    // 4. Push to remote origin
    log(`Pushing commit to remote origin ${branchName}...`);
    execSync(`git push origin ${branchName}`, { stdio: 'inherit' });
    log(`🚀 All changes successfully synchronized with GitHub!`, 'success');

  } catch (error: any) {
    log(`Failed to execute auto-push: ${error.message}`, 'error');
    log(`Please ensure you have initialized Git ('git init'), linked a remote repo ('git remote add ...'), and have push access.`, 'warn');
  }

  // Clear tracking of changed files
  changedFiles.clear();
  debounceTimer = null;
}

// Watch function using native fs
function startWatching() {
  log(`🎹 Starting PianoQuest Git Autopush Daemon...`, 'success');
  log(`Watching core project directories for hot changes...`);
  
  watchTargets.forEach(target => {
    const fullPath = path.resolve(target);
    if (!fs.existsSync(fullPath)) return;

    const isDir = fs.statSync(fullPath).isDirectory();
    
    fs.watch(fullPath, { recursive: isDir }, (eventType, filename) => {
      if (!filename) return;

      // Ignore common development exclusions
      if (
        filename.includes('node_modules') || 
        filename.includes('.git') || 
        filename.endsWith('.log') ||
        filename.startsWith('.')
      ) {
        return;
      }

      const filePath = path.join(target, filename);
      changedFiles.add(filePath);

      // Reset the debouncing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      log(`Modification detected in: ${colors.bold}${filePath}${colors.reset}. Syncing in ${DEBOUNCE_MS / 1000}s...`);
      debounceTimer = setTimeout(triggerGitSync, DEBOUNCE_MS);
    });
  });

  log(`System is listening. Press Ctrl+C to stop.\n`, 'success');
}

// Self-check and run
try {
  // Verify git folder presence locally
  const hasGit = fs.existsSync(path.resolve('.git'));
  if (!hasGit) {
    log(`Git repository not initialized yet. Running local initialization flow first...`, 'warn');
    execSync('git init', { stdio: 'inherit' });
    log(`Initialized empty Git repository locally.`, 'success');
  }
  startWatching();
} catch (err: any) {
  log(`Initialization error: ${err.message}`, 'error');
}
