import React, { useState } from 'react';
import { Search, Sparkles, AlertTriangle, Trophy, Code2, GripVertical, ChevronRight } from 'lucide-react';
import { CandidateProfile } from '../types';
import { filterCandidates } from '../services/gemini';

interface PipelineBoardProps {
  candidates: CandidateProfile[];
  onSelectCandidate: (candidate: CandidateProfile) => void;
  onMoveCandidate: (id: string, newStatus: CandidateProfile['status']) => void;
}

const PipelineBoard: React.FC<PipelineBoardProps> = ({ candidates, onSelectCandidate, onMoveCandidate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIds, setFilteredIds] = useState<string[] | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);

  const columns: CandidateProfile['status'][] = ['New Applications', 'Screening', 'Interview', 'Offer'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setFilteredIds(null);
      return;
    }

    setIsFiltering(true);
    const ids = await filterCandidates(searchQuery, candidates);
    setFilteredIds(ids);
    setIsFiltering(false);
  };

  const getDisplayedCandidates = () => {
    if (filteredIds === null) return candidates;
    return candidates.filter(c => filteredIds.includes(c.id));
  };

  const displayedCandidates = getDisplayedCandidates();

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('candidateId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedCandidateId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: CandidateProfile['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('candidateId');
    if (id) {
        onMoveCandidate(id, status);
    }
    setDraggedCandidateId(null);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Search Bar */}
      <div className="flex-shrink-0">
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <input
            type="text"
            placeholder="Ask AI: 'Show me React experts with no job gaps who scored above 80%'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-3 px-5 pl-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <button 
            type="submit"
            disabled={isFiltering}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 text-white transition-colors"
          >
            {isFiltering ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          </button>
        </form>
        {filteredIds && (
          <div className="mt-2 text-xs text-blue-400 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-3 h-3" />
            Found {filteredIds.length} candidates matching your criteria. 
            <button onClick={() => {setFilteredIds(null); setSearchQuery('');}} className="underline hover:text-white ml-2">Clear</button>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full gap-6 min-w-[1000px]">
          {columns.map((column) => (
            <div 
                key={column} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column)}
                className={`flex-1 flex flex-col bg-white/5 border rounded-2xl overflow-hidden backdrop-blur-sm transition-colors ${
                   draggedCandidateId ? 'border-blue-500/30 bg-white/10' : 'border-white/5'
                }`}
            >
              {/* Column Header */}
              <div className="p-4 bg-gray-800/50 border-b border-white/5 flex justify-between items-center select-none">
                <h3 className="font-semibold text-gray-200 text-sm flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shadow-lg shadow-current ${
                    column === 'New Applications' ? 'bg-gray-500 text-gray-500' :
                    column === 'Screening' ? 'bg-blue-500 text-blue-500' :
                    column === 'Interview' ? 'bg-purple-500 text-purple-500' : 'bg-green-500 text-green-500'
                  }`} />
                  {column}
                </h3>
                <span className="bg-gray-700/50 px-2 py-0.5 rounded text-xs text-gray-400 font-mono">
                  {displayedCandidates.filter(c => c.status === column).length}
                </span>
              </div>

              {/* Drop Area */}
              <div className="flex-1 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent space-y-3">
                {displayedCandidates
                  .filter(c => c.status === column)
                  .map((candidate) => (
                    <div 
                      key={candidate.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, candidate.id)}
                      onClick={() => onSelectCandidate(candidate)}
                      className="bg-gray-900/80 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:bg-gray-800 transition-all group cursor-grab active:cursor-grabbing relative overflow-hidden"
                    >
                      {/* Left color bar based on score */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          candidate.score >= 90 ? 'bg-green-500' :
                          candidate.score >= 75 ? 'bg-blue-500' :
                          candidate.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />

                      <div className="flex justify-between items-start mb-2 pl-2">
                        <div>
                          <h4 className="font-bold text-gray-100 text-sm group-hover:text-blue-400 transition-colors flex items-center gap-2">
                              {candidate.name}
                              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-1 transition-all" />
                          </h4>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">{candidate.role}</p>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-bold ${
                          candidate.score >= 90 ? 'bg-green-500/10 text-green-400' :
                          candidate.score >= 75 ? 'bg-blue-500/10 text-blue-400' :
                          candidate.score >= 50 ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {candidate.score}%
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3 pl-2">
                        {candidate.tags?.map((tag, idx) => (
                          <div 
                            key={idx} 
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium ${
                              tag.color === 'green' ? 'bg-green-900/30 border-green-800 text-green-300' :
                              tag.color === 'red' ? 'bg-red-900/30 border-red-800 text-red-300' :
                              'bg-blue-900/30 border-blue-800 text-blue-300'
                            }`}
                          >
                            {tag.color === 'green' && <Trophy className="w-2.5 h-2.5" />}
                            {tag.color === 'red' && <AlertTriangle className="w-2.5 h-2.5" />}
                            {tag.color === 'blue' && <Code2 className="w-2.5 h-2.5" />}
                            {tag.label}
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center pl-2">
                        <span className="text-[10px] text-gray-600">
                            {new Date(candidate.timestamp).toLocaleDateString()}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-400 font-medium">
                            Click to View Analysis
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {displayedCandidates.filter(c => c.status === column).length === 0 && (
                    <div className="h-32 border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center flex-col gap-2 opacity-50">
                      <GripVertical className="w-6 h-6 text-gray-600" />
                      <span className="text-xs text-gray-600">Drag Candidates Here</span>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PipelineBoard;