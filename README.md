# RecruiterOS

**The Multimodal Recruitment Command Center**

RecruiterOS redefines the hiring process by replacing keyword-based ATS filters with an autonomous, multimodal AI hiring partner. Built with Google's Gemini API, it leverages native vision capabilities to "see" and analyze resumes as a human would—evaluating layout, formatting, and content hierarchy—while simultaneously using deep reasoning to assess candidate fit.

Unlike traditional tools, RecruiterOS includes an ethical "Bias Blocker" (Blind Hiring Mode) that dynamically anonymizes personal data to ensure merit-based scoring. It features a "Deep Reasoning Gap Map" that identifies missing skills and generates tailored interview questions, and a "Smart Pipeline" that automatically organizes candidates into a Kanban board based on their fit scores. From catching "buzzword stuffing" with its Integrity Check to generating instant handoff emails, RecruiterOS turns recruitment into a strategic, data-driven command center.

![RecruiterOS UI]
<img width="1902" height="817" alt="image" src="https://github.com/user-attachments/assets/8f97c971-db1f-4bba-a23c-833973276e7f" />


## Key Features

### 🛡️ Bias Blocker (Blind Hiring)
A toggle that dynamically anonymizes candidate PII (names, photos, schools) during analysis to ensure scores are based purely on skill, solving a critical ethical problem in tech.

### 🧠 Deep Reasoning Gap Map
Instead of simple keyword matching, the agent infers missing skills based on project context and generates a "Gap Analysis" with tailored interview questions to probe those weaknesses.

### 🔍 Multimodal Visual Analysis
Uses Gemini's native vision capabilities to "see" resumes—evaluating layout quality, font readability, and professional formatting alongside the text content.

### 🕵️ Integrity Check (BS Detector)
Flags inconsistent dates, impossible career timelines, or buzzword stuffing that standard ATS software misses.

### 🚀 Smart Pipeline
An automated Kanban board that sorts candidates into "New", "Screening", or "Interview" columns based on their AI-calculated Fit Score.

### 💬 Context-Aware Assistant
Powered by **Gemini 3.0 Pro**, the built-in chatbot allows you to query your candidate pool using natural language (e.g., "Show me React experts who scored above 80%").

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism UI
- **AI Models**: 
  - **Gemini 2.5 Flash**: For high-speed, multimodal resume analysis.
  - **Gemini 3.0 Pro**: For complex reasoning and natural language chat.
- **SDK**: `@google/genai`

## Setup & Running

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure API Key:**
   Ensure `process.env.API_KEY` is available.
4. **Start the app:**
   ```bash
   npm start
   ```
