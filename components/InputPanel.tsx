import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Briefcase, Files } from 'lucide-react';
import { FileData } from '../types';

interface InputPanelProps {
  text: string;
  setText: (text: string) => void;
  files: FileData[];
  setFiles: (files: FileData[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  blindMode: boolean;
  progress?: string;
}

const InputPanel: React.FC<InputPanelProps> = ({
  text,
  setText,
  files,
  setFiles,
  onAnalyze,
  isAnalyzing,
  blindMode,
  progress
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (fileList: File[]) => {
    const validFiles = fileList.filter(file => file.type.match('image.*') || file.type === 'application/pdf');
    
    if (validFiles.length === 0) {
      alert("Please upload image or PDF files.");
      return;
    }

    // Process all files
    const promises = validFiles.map(file => {
      return new Promise<FileData>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const base64 = result.split(',')[1];
          resolve({
            base64,
            mimeType: file.type,
            name: file.name,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(newFilesData => {
      setFiles([...files, ...newFilesData]);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="flex flex-col h-full bg-white/5 backdrop-blur-lg rounded-2xl border border-blue-500/10 p-6 shadow-xl transition-colors duration-500">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-100">
        <Briefcase className="w-5 h-5" />
        Job & Candidate Data
      </h2>

      {/* Text Input */}
      <div className="flex-1 flex flex-col mb-6">
        <label className="text-sm font-medium text-gray-300 mb-2">
            Job Description
        </label>
        <textarea
          className="flex-1 w-full bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-sm text-gray-200 outline-none resize-none transition-all placeholder-gray-600 focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the job description here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Resume Upload */}
      <div className="mb-6 flex-shrink-0">
        <label className="text-sm font-medium text-gray-300 mb-2 block">
            Candidate Resumes
        </label>
        
        {files.length === 0 ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-500/10' 
                : 'border-gray-600 hover:border-blue-400 hover:bg-gray-800'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
            <p className="text-xs text-gray-500 mt-1">Upload multiple PDFs/Images</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400 font-medium">{files.length} Files Selected</span>
                <button onClick={() => setFiles([])} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
             </div>
            {files.map((file, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between border border-gray-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-blue-600/20">
                    <FileText className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-medium text-white truncate max-w-[180px] ${blindMode ? 'blur-sm select-none' : ''}`}>
                        {blindMode ? `Candidate #${idx + 1}` : file.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(idx)}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors text-gray-500 hover:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full py-2 border border-dashed border-gray-700 rounded-lg text-xs text-gray-500 hover:border-gray-500 hover:text-gray-400 transition-colors"
            >
                + Add more files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={onAnalyze}
        disabled={isAnalyzing || !text || files.length === 0}
        className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${
          isAnalyzing || !text || files.length === 0
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
        }`}
      >
        {isAnalyzing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {progress || 'Analyzing...'}
          </span>
        ) : (
          `Analyze ${files.length > 1 ? `(${files.length})` : 'Fit'}`
        )}
      </button>
    </div>
  );
};

export default InputPanel;