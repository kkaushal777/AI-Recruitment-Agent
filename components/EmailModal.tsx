import React, { useState, useEffect } from 'react';
import { Copy, X, Check, Mail } from 'lucide-react';
import { AnalysisResult } from '../types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
  candidateName: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, result, candidateName }) => {
  const [copied, setCopied] = useState(false);
  const [emailContent, setEmailContent] = useState('');

  useEffect(() => {
    if (result) {
      const strength = result.topStrengths?.[0] || 'Solid technical background';
      // Prioritize integrity issues as concerns, then skill gaps
      const concern = result.integrityCheck?.status === 'flagged' && result.integrityCheck.issues.length > 0
        ? result.integrityCheck.issues[0]
        : result.gapAnalysis?.[0] || 'No major red flags identified.';
        
      const focusQuestion = result.interviewQuestions?.[0] || 'Walk me through your most complex project.';
      const score = result.fitScore || 0;

      // Strip file extension if present in candidate name
      const cleanName = candidateName.replace(/\.[^/.]+$/, "");

      const body = `Hi [Hiring Manager],

I found a strong candidate for the role. ${cleanName} is a ${score}% match based on the job description.

Key Highlights:
• Top Strength: ${strength}
• Potential Concern: ${concern}

Suggested Interview Focus:
${focusQuestion}

Link to resume: [Insert Link Here]

Best,
Recruiting Team`;

      setEmailContent(body);
    }
  }, [result, candidateName]);

  const handleCopy = () => {
    navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Handoff Email</h3>
              <p className="text-sm text-gray-400">Ready to send to Hiring Manager</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-gray-900">
          <div className="relative">
            <textarea
              readOnly
              value={emailContent}
              className="w-full h-80 bg-gray-950 border border-gray-800 rounded-xl p-6 text-gray-300 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all transform active:scale-95 ${
              copied 
                ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;