# Project-Specific Gemini Instructions

This file outlines the operational guidelines for Gemini when working on the `cosmetic-estimator` project.

## Git Workflow
- **Remote:** `origin` (https://github.com/gini91/marketingtest.git)
- **Branch:** `main`
- **Automatic Commits:** Gemini will automatically commit and push changes to the `main` branch after significant modifications or feature implementations.
- **Commit Messages:** Commit messages will be concise and summarize the changes made.
- **Pre-push Pull:** Gemini will attempt `git pull origin main --rebase` before pushing to avoid conflicts.
- **HTTP Post Buffer:** The global `http.postBuffer` is set to `524288000` to handle large pushes.

## Project Specific Notes
- The `server.js` file implements a Node.js backend for saving lead data to `leads.csv`.
- This `server.js` functionality (specifically file system writes) is **not compatible with Vercel's serverless environment** and will require an external database solution if deployed to Vercel.
- The `leads.csv` file is excluded from Git tracking via `.gitignore`.
