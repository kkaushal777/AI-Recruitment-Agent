# AI Recruitment Copilot

A modern, dark-themed AI-powered recruitment assistant built with React and the Google Gemini API. This tool helps recruiters analyze resumes against job descriptions, manage candidate pipelines, and generate data-driven interview scripts.

![AI Recruitment Copilot UI](./screenshot.png)
*(Replace `./screenshot.png` with your actual application screenshot)*

## Core Features

### 🔍 Deep Analysis
- **Resume Analysis**: Upload PDF/Image resumes and compare them against a text-based Job Description.
- **Visual Fit Score**: Get an instant percentage match (0-100%) with a dynamic color-coded gauge.
- **Gap Analysis**: Automatically identifies specific skills present in the JD but missing from the resume.
- **Integrity Check (BS Detector)**: Flags inconsistent dates, impossible timelines, or buzzword stuffing.
- **Visual Quality**: Scores resume formatting, whitespace usage, and readability.

### 🚀 Workflow Automation
- **Pipeline Management**: A Kanban-style board to drag and drop candidates through stages (New Applications, Screening, Interview, Offer).
- **Smart Sorting**: Candidates are automatically assigned an initial status based on their AI Fit Score.
- **Handoff Emails**: One-click generation of professional summary emails for hiring managers, highlighting strengths and suggested interview questions.

### ⚖️ Fair Hiring
- **Blind Hiring Mode**: A toggle that anonymizes candidate data (hides names, genders, university names) during analysis to reduce unconscious bias.
- **Moderate & Fair Scoring**: The AI is tuned to recognize transferable skills and potential rather than just exact keyword matching.

### 💬 AI Assistant
- **Context-Aware Chatbot**: Ask natural language questions about your candidate pool (e.g., *"Show me candidates with React experience who scored above 80%"*).

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism UI
- **AI Model**: Google Gemini 2.5 Flash & 3.0 Pro (via `@google/genai` SDK)
- **Icons**: Lucide React

## Setup & Running

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure API Key:**
   Ensure `process.env.API_KEY` is available (e.g., via a `.env` file or environment variables).
4. **Start the app:**
   ```bash
   npm start
   ```
