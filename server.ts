import express from 'express';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { createServer as createViteServer } from 'vite';
import AdmZip from 'adm-zip';

const app = express();
const PORT = 3000;

app.use(express.json());

// API: Get Git Status of the Workspace
app.get('/api/git/status', (req, res) => {
  try {
    const hasGit = fs.existsSync(path.resolve('.git'));
    let activeBranch = 'N/A';
    let remoteUrl = 'N/A';
    let localCommits = [];

    if (hasGit) {
      try {
        activeBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      } catch {}
      try {
        remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
        // Hide token if embedded
        remoteUrl = remoteUrl.replace(/:[^@]+@/, ':***@');
      } catch {}
      try {
        const log = execSync('git log -n 5 --oneline', { encoding: 'utf8' }).trim();
        localCommits = log ? log.split('\n') : [];
      } catch {}
    }

    res.json({
      success: true,
      hasGit,
      activeBranch,
      remoteUrl,
      localCommits
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Download Project as ZIP archive
app.get('/api/git/download-zip', (req, res) => {
  try {
    const zip = new AdmZip();
    const rootPath = path.resolve('.');

    function addFilesToZip(currentDir: string, zipPrefix = '') {
      const items = fs.readdirSync(currentDir);
      for (const item of items) {
        // Excluded folders & files
        if (
          item === 'node_modules' ||
          item === '.git' ||
          item === 'dist' ||
          item === '.npm' ||
          item === 'tmp' ||
          item === '.vscode' ||
          item === '.idea'
        ) {
          continue;
        }

        const fullPath = path.join(currentDir, item);
        const relativePath = zipPrefix ? path.join(zipPrefix, item) : item;
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          addFilesToZip(fullPath, relativePath);
        } else {
          const content = fs.readFileSync(fullPath);
          zip.addFile(relativePath, content);
        }
      }
    }

    addFilesToZip(rootPath);
    const buffer = zip.toBuffer();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=pianoquest-export.zip');
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Direct Git Sync to GitHub Repository
app.post('/api/git/push', (req, res) => {
  const { repoUrl, token, branch = 'main', commitMessage, forcePush = true } = req.body;

  if (!repoUrl) {
    return res.status(400).json({ success: false, error: 'Repository URL is required.' });
  }

  const logs: string[] = [];
  const logStep = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    logs.push(`[${time}] ${msg}`);
  };

  try {
    logStep('Initializing export process...');
    
    // Format authenticated repo url
    let authenticatedUrl = repoUrl.trim();
    if (!authenticatedUrl.endsWith('.git') && !authenticatedUrl.includes('git@')) {
      authenticatedUrl += '.git';
    }

    if (token) {
      if (authenticatedUrl.startsWith('https://')) {
        authenticatedUrl = authenticatedUrl.replace('https://', `https://${token.trim()}@`);
        logStep('GitHub Authentication Token integrated successfully.');
      } else {
        authenticatedUrl = `https://${token.trim()}@` + authenticatedUrl.replace(/^http:\/\//, '');
        logStep('Normalized URL format with Auth Session key.');
      }
    } else {
      logStep('Warning: No synchronization token was provided. Relying on cached system credentials.');
    }

    // Initialize local repo if absent
    if (!fs.existsSync(path.resolve('.git'))) {
      logStep('No localized Git repository found. Spawning index databases...');
      execSync('git init', { stdio: 'pipe' });
      logStep('Git index initialized.');
    }

    // Set fallback git configurations for committing
    logStep('Configuring transaction agent standard identities...');
    execSync('git config user.name "PianoQuest Exporter"', { stdio: 'pipe' });
    execSync('git config user.email "composer@pianoquest.ai"', { stdio: 'pipe' });

    // Handle Remote URL
    let hasOrigin = false;
    try {
      execSync('git remote get-url origin', { stdio: 'pipe' });
      hasOrigin = true;
    } catch {}

    if (hasOrigin) {
      logStep('Resetting target repository link...');
      execSync(`git remote set-url origin "${authenticatedUrl}"`, { stdio: 'pipe' });
    } else {
      logStep('Binding new target repository link...');
      execSync(`git remote add origin "${authenticatedUrl}"`, { stdio: 'pipe' });
    }

    // Stage all files
    logStep('Staging active workspace modifications...');
    execSync('git add .', { stdio: 'pipe' });

    // Commit
    const finalMsg = commitMessage?.trim() || `PianoQuest Live Export: Build Sync (${new Date().toLocaleDateString()})`;
    logStep(`Composing commit transaction: "${finalMsg}"`);
    try {
      execSync(`git commit -m "${finalMsg}"`, { stdio: 'pipe' });
      logStep('Changes committed successfully.');
    } catch (e: any) {
      // If there's nothing to commit, it's fine, we can still proceed
      logStep('Git reported: Nothing to commit or working tree perfectly clean.');
    }

    // Set Branch Name
    logStep(`Refining head pointer branch: ${branch}`);
    execSync(`git branch -M "${branch}"`, { stdio: 'pipe' });

    // Push with optional force
    const pushFlags = forcePush ? '-f' : '';
    logStep(`Syncing payload package. Triggering git push to origin ${branch}...`);
    
    // Run push with timeout
    execSync(`git push ${pushFlags} -u origin "${branch}"`, { stdio: 'pipe', timeout: 45000 });
    
    logStep('🚀 Synchronization completed! Your repository is fully up to date.');
    res.json({ success: true, logs });

  } catch (error: any) {
    const errorDetails = error.stderr?.toString() || error.message;
    logStep(`Sync Failed: ${errorDetails}`);
    res.status(500).json({ success: false, error: errorDetails, logs });
  }
});

// Configure Vite Asset Pipeline or Static Serving
async function bootServer() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Mounting Hot Module Vite Pipelines...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Mounting static production servers...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PianoQuest Developer Server online at http://localhost:${PORT}`);
  });
}

bootServer();
