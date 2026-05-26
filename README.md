# 🎹 PianoQuest

A futuristic, AI-powered interactive piano tutor designed to help players learn, practice, and progress on their musical journey. PianoQuest analyzes live microphone input for pitch detection, offers progressive learning levels, tracks XP on a shared leaderboard, and provides real-time coaching via Gemini AI.

---

## 🚀 Key Features

*   **Quest-based Learning Path:** Experience-based progressive quest path tailored for beginners and advancing pianists.
*   **Live Pitch Detection:** High-accuracy microphone pitch analysis with real-time score tracking and feedback.
*   **Gemini AI Piano Coach:** Seamlessly analyze uploaded sheet music images or recorded performances with high-fidelity canvas capturing for the AI.
*   **Full Firebase Integration:** Complete with user authentication (Google Login), secure Firestore cloud storage for progressive stats (Leaderboard/XP), and asynchronous Firebase Analytics tracking.
*   **Privacy-First Architecture:** Advanced `.gitignore` ruleset ensuring all private developer keys, workspace secrets, local environments, and personal credentials are never exposed.

---

## 🛠️ Security & Safe GitHub Push

Your project has been fully configured for a clean, secure export to GitHub. **Local credentials and sensitive environments will not be committed.**

### 🔒 Secured Assets via `.gitignore`
*   **Environment Variables (`.env`, `.env.local`):** Hidden securely.
*   **Developer Credentials:** Keys (`*.pem`, `*.json`, `service-account.json`) cannot be committed.
*   **Local Caches & Builds:** Caches, dependency logs, and build artifacts (`dist/`) are safely ignored.

---

## 📦 How to Push to GitHub

To store, share, or version-control your applet on GitHub, follow these direct steps:

### Step 1: Export the Project
1. In the **Google AI Studio** interface, navigate to the settings or project menu.
2. Select **Export Project** and download the code as a ZIP archive.
3. Extract the ZIP archive onto your computer and open a terminal in that folder.

### Step 2: Initialize Git & Commit
Run the following commands in your terminal:
```bash
# Initialize local repository
git init

# Stages all non-ignored project files
git add .

# Save snapshot locally
git commit -m "feat: initial release of PianoQuest"
```

### Step 3: Publish to GitHub
1. Go to [GitHub](https://github.com) and click **New Repository**.
2. Name your repository (e.g., `PianoQuest`) and leave it as private or public matching your preferences.
3. **Do not** initialize it with a README, `.gitignore`, or license (as you already have them).
4. Run the commands shown on GitHub:
```bash
# Rename the default branch to main
git branch -M main

# Link local repository to GitHub
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/PianoQuest.git

# Push changes securely
git push -u origin main
```

---

## ⚡ Real-Time Automatic Push to GitHub

If you ever see a **"failed to load file differences"** or **"failed to load all changes"** alert in AI Studio, it typically means the browser's sandbox/extension blocked local IndexedDB/Git sync cached differences from syncing with your remote browser state, or the internal Git state got desynchronized temporarily.

To bypass this fully, or if you want **every change you make locally to automatically save and push to GitHub without lifting a finger**, you can activate our **Debounced Sync Daemon**:

### 🛠️ Setting up Automatic Live Pushes
Ensure you have run Step 1, 2, and 3 above to link your local folder to GitHub, and then start the automatic engine:

```bash
# Start the live hot-reload automatic push tracker
npm run auto-push
```

### 🧠 How it works:
* **Passive Watcher:** It monitors changes in your project files (`src`, `index.html`, etc.) in real-time.
* **Smart Debounce:** It waits for a 5-second pause in your typing before staging any changes (preventing GitHub from being spammed on every keypress).
* **Automatic Ship:** It dynamically packages the modified modules, constructs a clean timestamped commit message, and issues a standard, secure `git push origin YOUR_BRANCH_NAME` under the hood!

---

## 💻 Local Workspace Setup

To run PianoQuest locally on your machine, configure the following:

### 1. Configure Secrets
1. Duplicate `.env.example` and name the clone `.env`:
   ```bash
   cp .env.example .env
   ```
2. Insert your private Gemini API key:
   ```env
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
   ```

### 2. Live Run
```bash
# Install dependencies
npm install

# Start local server on http://localhost:3000
npm run dev
```

### 3. Production Build
```bash
# Build optimized static production bundle in /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🗃️ Firebase Configuration Note
The public client configurations needed for Firestore connection, user registration, and real-time syncing are already specified inside `/firebase-applet-config.json` and are fully operational. Access rules are enforced server-side.
