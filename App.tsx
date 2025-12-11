import React, { useState, useEffect } from 'react';
import { analyzeResumeFit } from './services/gemini';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import PipelineBoard from './components/PipelineBoard';
import ChatBot from './components/ChatBot';
import { AnalysisResult, FileData, CandidateProfile } from './types';
import { Sparkles, Shield, BarChart3, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [text, setText] = useState(''); // Job Description
  const [files, setFiles] = useState<FileData[]>([]); 
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // Pipeline State
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'analyze' | 'pipeline'>('analyze');

  // App States
  const [blindMode, setBlindMode] = useState(false);

  // Re-analyze on blind mode toggle if data exists (only for the last result view)
  useEffect(() => {
    if (hasSearched && text && files.length > 0 && !selectedCandidateId) {
        handleSingleReanalysis();
    }
  }, [blindMode]);

  const handleSingleReanalysis = async () => {
     if (!files[0]) return;
     setIsAnalyzing(true);
     setAnalysisProgress('Re-analyzing...');
     try {
        const data = await analyzeResumeFit(text, files[0].base64, files[0].mimeType, blindMode);
        setResult(data);
     } catch (e) {
        console.error(e);
     } finally {
        setIsAnalyzing(false);
        setAnalysisProgress('');
     }
  }

  const handleAnalyze = async () => {
    if (!text || files.length === 0) return;

    setIsAnalyzing(true);
    setHasSearched(true);
    setSelectedCandidateId(null); // Clear selected candidate on new analysis
    if (!blindMode) setResult(null); 
    
    if (files.length > 1) {
        setActiveTab('pipeline');
    }

    try {
        let completedCount = 0;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            setAnalysisProgress(`Analyzing ${i + 1}/${files.length}...`);
            
            try {
                const data = await analyzeResumeFit(text, file.base64, file.mimeType, blindMode);
                
                // --- SMART SORTING PIPELINE LOGIC ---
                let status: CandidateProfile['status'] = 'New Applications';
                const score = data.fitScore || 0;
                
                if (score >= 80) status = 'Interview';
                else if (score >= 50) status = 'Screening';
                else status = 'New Applications';

                const newCandidate: CandidateProfile = {
                    id: Date.now().toString() + Math.random(),
                    name: file.name.replace(/\.[^/.]+$/, ""),
                    role: "Candidate",
                    score: score,
                    status: status,
                    tags: data.candidateTags || [],
                    summary: data.scoreReasoning || "",
                    timestamp: Date.now(),
                    analysis: data // Store full analysis
                };

                setCandidates(prev => [newCandidate, ...prev]);
                
                // Show the last result if we stay on analyze tab
                if (files.length === 1) setResult(data);
                
            } catch (err) {
                console.error(`Failed to analyze ${file.name}`, err);
            }
            completedCount++;
        }

    } catch (error) {
      console.error("Analysis process failed", error);
      alert("An error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress('');
    }
  };

  const handleCandidateSelect = (candidate: CandidateProfile) => {
    setResult(candidate.analysis);
    setHasSearched(true);
    setSelectedCandidateId(candidate.id);
    setActiveTab('analyze');
  };

  const handleCandidateMove = (id: string, newStatus: CandidateProfile['status']) => {
    setCandidates(prev => prev.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  const getActiveCandidateName = () => {
    if (selectedCandidateId) {
        return candidates.find(c => c.id === selectedCandidateId)?.name || "Candidate";
    }
    return files[0]?.name;
  };

  return (
    <div className="min-h-screen text-white overflow-hidden flex flex-col transition-colors duration-700 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617]">
      {/* Navbar */}
      <nav className="h-16 border-b border-white/5 bg-gray-900/50 backdrop-blur-md flex items-center px-6 md:px-12 fixed w-full top-0 z-40 justify-between">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden md:inline">
            Recruiter<span className="text-blue-400">OS</span>
          </span>
        </div>

        {/* Center: Recruiter Navigation (Analyze vs Pipeline) */}
        <div className="flex items-center gap-4">
           <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setActiveTab('analyze')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                  activeTab === 'analyze' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Analyze
              </button>
              <button 
                onClick={() => setActiveTab('pipeline')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${
                  activeTab === 'pipeline' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" /> Pipeline
                {candidates.length > 0 && (
                    <span className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 rounded-full">
                        {candidates.length}
                    </span>
                )}
              </button>
           </div>
        </div>

        {/* Right: Blind Hiring Toggle */}
        <div className="w-[140px] flex justify-end">
            {activeTab === 'analyze' && !selectedCandidateId && (
                <div 
                    onClick={() => setBlindMode(!blindMode)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer transition-all select-none group ${
                        blindMode 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-800'
                    }`}
                >
                    <Shield className={`w-3.5 h-3.5 ${blindMode ? 'fill-emerald-500/20' : ''}`} />
                    <span className="text-xs font-medium">Blind Hiring</span>
                    <div className={`w-6 h-3.5 rounded-full relative transition-colors ${blindMode ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                        <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${blindMode ? 'translate-x-[11px]' : 'translate-x-[2px]'}`} />
                    </div>
                </div>
            )}
        </div>
      </nav>

      {/* Main Content */}
      <main 
        className="flex-1 pt-20 md:!pt-40 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full h-[100dvh] flex flex-col min-h-0"
        style={{ paddingTop: '50px' }}
      >
        
        {activeTab === 'pipeline' ? (
           <PipelineBoard 
             candidates={candidates} 
             onSelectCandidate={handleCandidateSelect}
             onMoveCandidate={handleCandidateMove}
           />
        ) : (
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Left Panel - Input */}
            <div className={`w-full md:w-5/12 lg:w-4/12 h-full flex flex-col transition-all duration-300 ${selectedCandidateId ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
              <InputPanel
                text={text}
                setText={setText}
                files={files}
                setFiles={setFiles}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                blindMode={blindMode}
                progress={analysisProgress}
              />
            </div>

            {/* Right Panel - Results */}
            <div className="w-full md:w-7/12 lg:w-8/12 h-full flex flex-col min-h-0 relative">
              {selectedCandidateId && (
                <div className="flex-shrink-0 bg-blue-600 text-white text-xs py-2 px-4 text-center rounded-t-xl font-semibold shadow-lg z-10">
                    Viewing Historical Analysis: {getActiveCandidateName()}
                    <button onClick={() => {setSelectedCandidateId(null); setResult(null); setActiveTab('pipeline');}} className="ml-4 underline hover:text-blue-100">Back to Pipeline</button>
                </div>
              )}
              <div className="flex-1 min-h-0 bg-white/5 backdrop-blur-lg rounded-b-2xl md:rounded-2xl border border-white/10 overflow-hidden">
                  <ResultsPanel 
                    result={result} 
                    hasSearched={hasSearched} 
                    candidateName={getActiveCandidateName()}
                  />
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Chatbot */}
      <ChatBot candidates={candidates} />
    </div>
  );
};

export default App;