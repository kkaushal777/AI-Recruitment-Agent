import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, HelpCircle, Activity, Layout, Eye, Info, ShieldCheck, ShieldAlert, Search, Mail } from 'lucide-react';
import { AnalysisResult } from '../types';
import Gauge from './Gauge';
import EmailModal from './EmailModal';

interface ResultsPanelProps {
  result: AnalysisResult | null;
  hasSearched: boolean;
  candidateName?: string;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, hasSearched, candidateName = "Candidate" }) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  if (!hasSearched) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-gray-400">
        <Activity className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg">Ready to analyze.</p>
        <p className="text-sm opacity-60">Upload a resume and paste details to begin.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-gray-400">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-700 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-32 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // --- RECRUITER VIEW ONLY ---
  return (
    <>
      <div className="h-full flex flex-col relative overflow-hidden">
        
        {/* Header / Action Bar */}
        <div className="flex-shrink-0 flex justify-end pb-4 px-1 pt-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg transition-all transform hover:scale-105 z-20"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Generate Handoff Email</span>
            <span className="sm:hidden">Email</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            
            {/* Top Row: Fit Score, Integrity Check, Resume Quality */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Fit Score Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group min-h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="w-full flex justify-between items-start z-10 absolute top-4 px-4">
                <h3 className="text-gray-300 font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" /> Overall Match
                </h3>
                <button 
                    onClick={() => setShowReasoning(!showReasoning)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all border ${
                        showReasoning 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                    }`}
                >
                    <Info className="w-3 h-3" /> Why?
                </button>
                </div>

                <div className="z-10 mt-6 relative w-full flex justify-center">
                <div className={`transition-all duration-500 ${showReasoning ? 'opacity-10 blur-sm scale-90' : 'opacity-100 scale-100'}`}>
                    <Gauge score={result.fitScore || 0} />
                </div>
                
                {/* Reasoning Overlay */}
                {showReasoning && result.scoreReasoning && (
                    <div className="absolute inset-0 flex items-center justify-center animate-in fade-in zoom-in duration-300">
                    <div className="bg-gray-900/90 border border-white/10 p-4 rounded-xl max-w-[90%] text-center shadow-2xl backdrop-blur-md">
                        <p className="text-sm text-gray-200 leading-relaxed">
                        {result.scoreReasoning}
                        </p>
                    </div>
                    </div>
                )}
                </div>
            </div>

            {/* Integrity Check (BS Detector) Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col relative overflow-hidden min-h-[250px]">
                <div className={`absolute inset-0 bg-gradient-to-br pointer-events-none ${
                    result.integrityCheck?.status === 'flagged' ? 'from-red-500/10 to-orange-500/5' : 'from-green-500/10 to-emerald-500/5'
                }`}></div>
                <div className="flex justify-between items-center mb-4 z-10">
                    <h3 className="text-gray-300 font-medium flex items-center gap-2">
                        <Search className="w-4 h-4 text-purple-400" /> Integrity Check
                    </h3>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                        result.integrityCheck?.status === 'flagged' 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                        : 'bg-green-500/10 border-green-500/30 text-green-400'
                    }`}>
                        {result.integrityCheck?.status === 'flagged' 
                            ? <ShieldAlert className="w-3.5 h-3.5" /> 
                            : <ShieldCheck className="w-3.5 h-3.5" />
                        }
                        <span className="text-xs font-bold uppercase tracking-wide">
                            {result.integrityCheck?.status === 'flagged' ? 'Issues Found' : 'Verified'}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent relative z-10">
                    {result.integrityCheck?.issues && result.integrityCheck.issues.length > 0 ? (
                        <ul className="space-y-2">
                            {result.integrityCheck.issues.map((issue, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300 bg-red-500/10 p-2 rounded border border-red-500/10">
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs leading-relaxed">{issue}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2">
                            <CheckCircle2 className="w-10 h-10 text-green-500/40"/>
                            <p className="text-sm text-center max-w-[80%]">No logical inconsistencies or timeline gaps detected.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Resume Quality Check Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col relative overflow-hidden min-h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 pointer-events-none"></div>
                <div className="flex justify-between items-center mb-4 z-10">
                <h3 className="text-gray-300 font-medium flex items-center gap-2">
                    <Layout className="w-4 h-4 text-pink-400" /> Visual Quality
                </h3>
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <Eye className="w-3 h-3 text-gray-400" />
                    <span className={`text-sm font-bold ${result.resumeQuality && result.resumeQuality.readabilityScore > 75 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {result.resumeQuality?.readabilityScore || 0}/100
                    </span>
                </div>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent relative z-10">
                {result.resumeQuality && result.resumeQuality.visualFeedback.length > 0 ? (
                    <ul className="space-y-2">
                        {result.resumeQuality.visualFeedback.map((fb, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 bg-white/5 p-2.5 rounded-lg border border-white/5 hover:border-pink-500/20 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
                            {fb}
                        </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <CheckCircle2 className="w-8 h-8 text-green-500/50 mb-2"/>
                        <p className="text-sm">Formatting looks perfect.</p>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* Bottom Row: Gap Analysis & Interview Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            
            {/* Gap Analysis Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col relative overflow-hidden min-h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none"></div>
                <h3 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> Skill Gaps
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {result.gapAnalysis && result.gapAnalysis.length > 0 ? (
                    <ul className="space-y-3">
                        {result.gapAnalysis.map((gap, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 bg-red-500/10 p-2 rounded-lg border border-red-500/10">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                            {gap}
                        </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <CheckCircle2 className="w-8 h-8 text-green-500/50 mb-2"/>
                        <p className="text-sm">No significant gaps found.</p>
                    </div>
                )}
                </div>
            </div>

            {/* Interview Script Card */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-lg flex flex-col relative overflow-hidden min-h-[250px]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none"></div>
                <h3 className="text-gray-300 font-medium mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400" /> Interview Questions
                </h3>
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <ul className="space-y-3">
                    {result.interviewQuestions?.map((question, idx) => (
                    <li key={idx} className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-colors">
                        <div className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-900/50 text-cyan-400 flex items-center justify-center text-[10px] font-bold border border-cyan-700/30 mt-0.5">
                            {idx + 1}
                        </span>
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed">{question}</p>
                        </div>
                    </li>
                    ))}
                </ul>
                </div>
            </div>

            </div>

        </div>
      </div>
      
      <EmailModal 
        isOpen={isEmailModalOpen} 
        onClose={() => setIsEmailModalOpen(false)} 
        result={result}
        candidateName={candidateName}
      />
    </>
  );
};

export default ResultsPanel;