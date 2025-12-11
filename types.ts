export interface CandidateTag {
  label: string;
  color: 'green' | 'red' | 'blue';
  type: 'strength' | 'risk' | 'skill';
}

export interface AnalysisResult {
  fitScore?: number;
  scoreReasoning?: string;
  topStrengths?: string[];
  candidateTags?: CandidateTag[];
  resumeQuality?: {
    readabilityScore: number;
    visualFeedback: string[];
  };
  integrityCheck?: {
    status: 'clean' | 'flagged';
    issues: string[];
  };
  gapAnalysis?: string[];
  interviewQuestions?: string[];
}

export interface CandidateProfile {
  id: string;
  name: string;
  role: string;
  score: number;
  status: 'New Applications' | 'Screening' | 'Interview' | 'Offer';
  tags: CandidateTag[];
  summary: string;
  timestamp: number;
  analysis: AnalysisResult; // Added full analysis storage
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}