import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, CandidateProfile } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const recruiterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fitScore: { type: Type.NUMBER },
    scoreReasoning: { type: Type.STRING },
    topStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    candidateTags: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          color: { type: Type.STRING, enum: ['green', 'red', 'blue'] },
          type: { type: Type.STRING, enum: ['strength', 'risk', 'skill'] }
        }
      }
    },
    resumeQuality: {
      type: Type.OBJECT,
      properties: {
        readabilityScore: { type: Type.NUMBER },
        visualFeedback: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["readabilityScore", "visualFeedback"],
    },
    integrityCheck: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["clean", "flagged"] },
        issues: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["status", "issues"],
    },
    gapAnalysis: { type: Type.ARRAY, items: { type: Type.STRING } },
    interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["fitScore", "scoreReasoning", "topStrengths", "candidateTags", "resumeQuality", "integrityCheck", "gapAnalysis", "interviewQuestions"],
};

export const analyzeResumeFit = async (
  jdText: string,
  resumeBase64: string,
  resumeMimeType: string,
  blindMode: boolean = false
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      Job Description:
      ${jdText}

      System Instruction:
      You are a balanced and moderate technical recruiter. Visually analyze the resume layout and content provided in the image/pdf. 
      Compare it to the Job Description above. 
      
      BEHAVIOR GUIDELINES:
      - Be OBJECTIVE but FAIR. Do not be overly harsh.
      - Recognize transferable skills (e.g., if JD asks for AWS and candidate has Azure, that is a partial match, not a zero).
      - Look for "potential" and "fundamentals" rather than exact keyword matches only.
      - However, maintain professional standards—if a core hard skill is completely missing, note it.

      ${blindMode ? `
      *** BLIND HIRING MODE ACTIVE ***
      - STRICTLY IGNORE the candidate's Name, Gender, Age, Photo/Headshot, and University/College Names.
      - Do not allow the prestige of a university or demographic factors to influence the score.
      - Focus ONLY on skills, experience, projects, and technical qualifications.
      - In your output, refer to the candidate as "The Candidate".
      ` : ''}
      
      Tasks:
      1. Analyze the content for skill matches against the JD. Identify the top 3 distinct strengths.
      
      2. GENERATE TAGS (Crucial): Create exactly 3 tags for this candidate:
         - One GREEN tag (type: 'strength'): A unique key strength (e.g., "Ex-Google", "Patent Holder", "PhD").
         - One RED tag (type: 'risk'): A potential risk factor (e.g., "Job Hopper", "Gap Year", "Short Tenure"). If no major risk, use "Generalist".
         - One BLUE tag (type: 'skill'): The absolute top hard skill (e.g., "Python Expert", "System Design").

      3. Visually analyze the document formatting (Resume Quality):
         - Evaluate "readabilityScore" (0-100) based on: effective use of whitespace, clear section hierarchy, consistent font usage, and bullet point alignment.
         - Rubric:
           * 90-100: Professional, polished, easy to scan, excellent layout.
           * 75-89: Good readability, minor spacing or inconsistency issues.
           * 50-74: Average, slightly cluttered or dense, but readable.
           * <50: Poorly formatted, hard to read, unstructured, or plain text dump.
         - Provide specific "visualFeedback" on layout, fonts, or density.

      4. Perform an "Integrity Check" (BS Detector):
         - Audit dates for impossible timelines (e.g., Senior title with <3 years exp).
         - Flag "Buzzword Stuffing" (listing complex skills like Kubernetes/AI without project evidence).
         - Check for employment gaps disguised as generic "Freelancing" or "Consulting" without client details.
         - If any logical inconsistencies are found, set status to 'flagged' and list specific issues. Otherwise, 'clean'.
      
      5. Evaluate the "Fit Score" based on this MODERATE rubric:
         - 90-100%: Excellent match (Strongly aligned with requirements, exceeds expectations).
         - 75-89%: Good match (Meets most core requirements; minor gaps are acceptable/trainable).
         - 60-74%: Moderate match (Has potential and relevant fundamentals, but missing specific tools or seniority).
         - 40-59%: Weak match (Significant gaps in core requirements, but has some relevant background).
         - 0-39%: Mismatch (Irrelevant background).
      
      Output JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: resumeMimeType, data: resumeBase64 } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: recruiterSchema,
        systemInstruction: blindMode 
          ? "You are a fair and moderate technical recruiter practicing blind hiring." 
          : "You are a fair and moderate technical recruiter.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

export const filterCandidates = async (
  query: string,
  candidates: CandidateProfile[]
): Promise<string[]> => {
  try {
    const candidateData = candidates.map(c => ({
      id: c.id,
      name: c.name,
      score: c.score,
      tags: c.tags,
      summary: c.summary
    }));

    const prompt = `
      User Query: "${query}"

      Candidate Pool:
      ${JSON.stringify(candidateData, null, 2)}

      Task: Return a JSON array of candidate IDs that match the user's natural language query. 
      Be smart about synonyms (e.g. if user asks for "React", match "Frontend" or "JS").
      If the user specifies logic like "Score > 80", strictly follow it.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { text: prompt },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);

  } catch (error) {
    console.error("Filter error:", error);
    return candidates.map(c => c.id);
  }
};

export const sendChatMessage = async (
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  context?: string
): Promise<string> => {
  try {
    const systemInstruction = `You are a helpful AI assistant inside a recruitment application called "RecruiterOS".
    You have access to the current candidate pipeline data.
    
    ${context ? `CURRENT CANDIDATE DATA (Use this to answer questions):\n${context}\n\nINSTRUCTIONS:\n- You can compare candidates, summarize their strengths, or suggest interview questions based on their profiles.\n- If the user asks about something not in the data, just say you don't know.` : ''}`;

    const chat = ai.chats.create({
      model: "gemini-3-pro-preview",
      history: history,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message: newMessage });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I encountered an error. Please try again.";
  }
};