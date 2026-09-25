import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, X, UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw,
  ArrowRight, ShieldCheck, Check, Trash2, Edit2, Info, ChevronRight, User, Briefcase, GraduationCap, Code, Award, Globe, Trophy
} from 'lucide-react';
import { validateResumeFile, resumeParserService, ALLOWED_RESUME_FORMATS } from '../../services/mockApi/resumeParserService';

function ResumeParserIQModal({ isOpen, onClose, currentProfile, onApplyData }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  
  // Processing state: 'idle' | 'uploading' | 'parsing' | 'success' | 'error'
  const [status, setStatus] = useState('idle');
  const [progressInfo, setProgressInfo] = useState({ step: 0, message: '', percent: 0 });
  const [parsedResult, setParsedResult] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // Field selection state for applying to profile
  const [selectedSections, setSelectedSections] = useState({
    personalInfo: true,
    skills: true,
    experiences: true,
    education: true,
    projects: true,
    certifications: true,
    languages: true,
    achievements: true
  });

  const fileInputRef = useRef(null);

  // Reset state on modal open/close
  useEffect(() => {
    if (isOpen) {
      setIsDragging(false);
      setSelectedFile(null);
      setValidationError('');
      setStatus('idle');
      setProgressInfo({ step: 0, message: '', percent: 0 });
      setParsedResult(null);
      setShowCloseConfirm(false);
      setSelectedSections({
        personalInfo: true,
        skills: true,
        experiences: true,
        education: true,
        projects: true,
        certifications: true,
        languages: true,
        achievements: true
      });
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleAttemptClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status, selectedFile, parsedResult]);

  if (!isOpen) return null;

  // File handling & validation
  const processFile = (file) => {
    setValidationError('');
    const check = validateResumeFile(file);
    if (!check.valid) {
      setValidationError(check.error);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setStatus('idle');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag & Drop Handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Trigger parsing
  const handleParse = async () => {
    if (!selectedFile) return;
    setStatus('parsing');
    setValidationError('');

    try {
      const result = await resumeParserService.parseResumeFile(selectedFile, (progress) => {
        setProgressInfo(progress);
      });
      setParsedResult(result);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setValidationError('We couldn\'t extract information from this resume. Please try another file or build your profile manually.');
    }
  };

  // Handle applying extracted data to candidate profile
  const handleConfirmApply = () => {
    if (!parsedResult) return;

    // Build payload containing only selected sections
    const dataToApply = {};

    if (selectedSections.personalInfo && parsedResult.personalInfo) {
      dataToApply.personalInfo = parsedResult.personalInfo;
    }
    if (selectedSections.skills && parsedResult.skills) {
      dataToApply.skills = parsedResult.skills;
    }
    if (selectedSections.experiences && parsedResult.experiences) {
      dataToApply.experiences = parsedResult.experiences;
    }
    if (selectedSections.education && parsedResult.education) {
      dataToApply.education = parsedResult.education;
    }
    if (selectedSections.projects && parsedResult.projects) {
      dataToApply.projects = parsedResult.projects;
    }
    if (selectedSections.certifications && parsedResult.certifications) {
      dataToApply.certifications = parsedResult.certifications;
    }
    if (selectedSections.languages && parsedResult.languages) {
      dataToApply.languages = parsedResult.languages;
    }
    if (selectedSections.achievements && parsedResult.achievements) {
      dataToApply.achievements = parsedResult.achievements;
    }

    onApplyData(dataToApply);
    onClose();
  };

  // Safe Close Handler
  const handleAttemptClose = () => {
    if (status === 'parsing' || (status === 'success' && parsedResult)) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFileExtension = (name) => {
    if (!name) return 'FILE';
    return name.split('.').pop().toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Modal Container — Google Drive Style Pop-Up */}
      <div className="saas-card p-0 border border-indigo-100 w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-outfit text-white tracking-tight">Resume Parser IQ</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  AI Powered
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Upload your resume and we'll extract your professional information to build your profile faster.
              </p>
            </div>
          </div>
          <button
            onClick={handleAttemptClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{validationError}</p>
                <button
                  onClick={() => setValidationError('')}
                  className="mt-1 font-bold text-rose-700 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* STATE 1: IDLE / UPLOAD AREA (If no file selected or state is idle) */}
          {status === 'idle' && !selectedFile && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 md:p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
                  isDragging
                    ? 'border-indigo-600 bg-indigo-50/80 scale-[0.99] shadow-inner'
                    : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                  isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-100 text-indigo-600'
                }`}>
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 font-outfit">
                    {isDragging ? 'Drop your resume to upload' : 'Drag & drop your resume here'}
                  </p>
                  <p className="text-xs text-slate-500">
                    or click to browse from your computer
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="btn-secondary text-xs px-4 py-2 font-semibold shadow-xs"
                >
                  Browse Files
                </button>

                <div className="pt-2 text-[11px] text-slate-400 font-medium border-t border-slate-200/60 w-full max-w-xs">
                  Supported Formats: <span className="font-bold text-slate-600">PDF, DOC, DOCX, TXT</span> (Max 10 MB)
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: FILE SELECTED STATE */}
          {status === 'idle' && selectedFile && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                    {getFileExtension(selectedFile.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate font-outfit">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready to parse
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-indigo-600 font-semibold hover:underline px-2 py-1"
                  >
                    Change File
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> Data Safety Guarantee
                </p>
                <p>
                  Resume Parser IQ will extract profile information for your review. Your current profile won't be modified until you review and confirm the extracted details.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button onClick={handleAttemptClose} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button onClick={handleParse} className="btn-ai text-xs px-5 py-2.5 flex items-center gap-2 font-bold shadow-md">
                  <Sparkles className="w-4 h-4" /> Parse Resume
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: PARSING PROGRESS STATE */}
          {status === 'parsing' && (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h4 className="text-base font-bold font-outfit text-slate-900">
                  Analyzing your resume...
                </h4>
                <p className="text-xs text-indigo-600 font-semibold flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {progressInfo.message || 'Extracting information...'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md mx-auto space-y-1.5">
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progressInfo.percent}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>Step {progressInfo.step} of 5</span>
                  <span>{progressInfo.percent}%</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Please do not close this window while AI is parsing document structures.
              </p>
            </div>
          )}

          {/* STATE 4: SUCCESS / PARSING REVIEW STATE */}
          {status === 'success' && parsedResult && (
            <div className="space-y-6">
              {/* Header banner */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 font-outfit">Resume Analysis Complete</h4>
                  <p className="text-xs text-emerald-800">
                    We've extracted the following information from your resume. Review and select which sections to apply to your profile.
                  </p>
                </div>
              </div>

              {/* ATS Score & Quality Analysis Card */}
              {parsedResult.atsScore && (
                <div className="saas-card p-5 border border-indigo-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4 rounded-xl shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider block">ATS Intelligence Evaluation</span>
                      <h4 className="text-lg font-black font-outfit text-white">ATS Keyword & Quality Score</h4>
                    </div>
                    <div className="flex items-center gap-2 bg-indigo-900/60 px-4 py-2 rounded-xl border border-indigo-700">
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <div>
                        <span className="text-2xl font-black font-outfit text-white font-mono">{parsedResult.atsScore}</span>
                        <span className="text-xs text-indigo-200"> / 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Grid */}
                  {parsedResult.scoreBreakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">Keyword Match (30%)</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm">{parsedResult.scoreBreakdown.keywordMatch}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">Structure (20%)</span>
                        <span className="font-bold text-indigo-300 font-mono text-sm">{parsedResult.scoreBreakdown.structure}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">Skills Coverage (20%)</span>
                        <span className="font-bold text-purple-300 font-mono text-sm">{parsedResult.scoreBreakdown.skillsCoverage}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">Experience (15%)</span>
                        <span className="font-bold text-cyan-300 font-mono text-sm">{parsedResult.scoreBreakdown.experienceRelevance}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">Projects (10%)</span>
                        <span className="font-bold text-amber-300 font-mono text-sm">{parsedResult.scoreBreakdown.projectRelevance}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block">Format Quality (5%)</span>
                        <span className="font-bold text-emerald-300 font-mono text-sm">{parsedResult.scoreBreakdown.formatting}%</span>
                      </div>
                    </div>
                  )}

                  {/* Insights preview */}
                  {parsedResult.insights && (
                    <div className="pt-2 text-xs space-y-2 border-t border-slate-800">
                      {parsedResult.insights.strengths && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">✓ Strengths</span>
                          <ul className="text-slate-300 text-[11px] list-disc list-inside space-y-0.5">
                            {parsedResult.insights.strengths.slice(0, 2).map((st, i) => (
                              <li key={i}>{st}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {parsedResult.insights.improvements && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">⚠ Recommended Improvements</span>
                          <ul className="text-slate-300 text-[11px] list-disc list-inside space-y-0.5">
                            {parsedResult.insights.improvements.slice(0, 2).map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Sections Selection & Comparison List */}
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                
                {/* 1. Personal Information */}
                {parsedResult.personalInfo && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedSections.personalInfo ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 font-outfit uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSections.personalInfo}
                          onChange={(e) => setSelectedSections({ ...selectedSections, personalInfo: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <User className="w-4 h-4 text-indigo-600" /> Personal Information & Headline
                      </label>
                      <span className="text-[11px] font-semibold text-indigo-600">Extracted</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Full Name</span>
                        <span className="font-bold text-slate-900">{parsedResult.personalInfo.name}</span>
                        {currentProfile?.name && currentProfile.name !== parsedResult.personalInfo.name && (
                          <span className="text-[10px] text-amber-600 block">Existing: {currentProfile.name}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Headline</span>
                        <span className="font-bold text-indigo-700">{parsedResult.personalInfo.headline}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Email</span>
                        <span className="font-medium text-slate-800">{parsedResult.personalInfo.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Location</span>
                        <span className="font-medium text-slate-800">{parsedResult.personalInfo.location}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Technical Skills Matrix */}
                {parsedResult.skills && parsedResult.skills.length > 0 && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedSections.skills ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 font-outfit uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSections.skills}
                          onChange={(e) => setSelectedSections({ ...selectedSections, skills: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Code className="w-4 h-4 text-indigo-600" /> Extracted Skills ({parsedResult.skills.length})
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-3">
                      {parsedResult.skills.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-900 text-xs font-semibold shadow-2xs flex items-center gap-1">
                          {sk.name} <span className="text-[10px] text-indigo-500 font-medium">({sk.category})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Work Experiences */}
                {parsedResult.experiences && parsedResult.experiences.length > 0 && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedSections.experiences ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 font-outfit uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSections.experiences}
                          onChange={(e) => setSelectedSections({ ...selectedSections, experiences: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Briefcase className="w-4 h-4 text-indigo-600" /> Work Experience Timeline ({parsedResult.experiences.length})
                      </label>
                    </div>
                    <div className="space-y-3 pt-3">
                      {parsedResult.experiences.map((exp) => (
                        <div key={exp.id} className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="font-bold text-slate-900 font-outfit">{exp.title}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{exp.period}</span>
                          </div>
                          <p className="text-indigo-600 font-semibold text-[11px]">{exp.company}</p>
                          <p className="text-slate-600 leading-relaxed text-[11px]">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Education */}
                {parsedResult.education && parsedResult.education.length > 0 && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedSections.education ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 font-outfit uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSections.education}
                          onChange={(e) => setSelectedSections({ ...selectedSections, education: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <GraduationCap className="w-4 h-4 text-emerald-600" /> Education History ({parsedResult.education.length})
                      </label>
                    </div>
                    <div className="space-y-2 pt-3">
                      {parsedResult.education.map((edu) => (
                        <div key={edu.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-900 block font-outfit">{edu.degree}</span>
                            <span className="text-[11px] text-slate-500">{edu.institution}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-semibold text-slate-700 block">{edu.year}</span>
                            <span className="text-[10px] text-emerald-600 font-bold">GPA {edu.gpa}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Projects */}
                {parsedResult.projects && parsedResult.projects.length > 0 && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedSections.projects ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 font-outfit uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSections.projects}
                          onChange={(e) => setSelectedSections({ ...selectedSections, projects: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <FileText className="w-4 h-4 text-emerald-600" /> Highlighted Projects ({parsedResult.projects.length})
                      </label>
                    </div>
                    <div className="space-y-2 pt-3">
                      {parsedResult.projects.map((proj) => (
                        <div key={proj.id} className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1 text-xs">
                          <span className="font-bold text-slate-900 font-outfit block">{proj.name}</span>
                          <p className="text-slate-600 text-[11px]">{proj.description}</p>
                          <span className="text-[10px] font-medium text-slate-500 block">{proj.tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Certifications */}
                {parsedResult.certifications && parsedResult.certifications.length > 0 && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    selectedSections.certifications ? 'border-indigo-300 bg-indigo-50/20' : 'border-slate-200 bg-slate-50/50 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-900 font-outfit uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedSections.certifications}
                          onChange={(e) => setSelectedSections({ ...selectedSections, certifications: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <Award className="w-4 h-4 text-purple-600" /> Certifications ({parsedResult.certifications.length})
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-3">
                      {parsedResult.certifications.map((c) => (
                        <div key={c.id} className="px-3 py-1.5 rounded-lg bg-white border border-purple-100 text-xs">
                          <span className="font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[10px] text-purple-700 font-medium">{c.issuer} ({c.year})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle');
                    setSelectedFile(null);
                    setParsedResult(null);
                  }}
                  className="btn-secondary text-xs"
                >
                  Upload Another Resume
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={handleAttemptClose} className="btn-secondary text-xs">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmApply}
                    className="btn-primary text-xs px-5 py-2.5 font-bold flex items-center gap-2 shadow-md"
                  >
                    <Check className="w-4 h-4" /> Apply to Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog on Unsaved Close Attempt */}
      {showCloseConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-60 animate-fade-in">
          <div className="saas-card p-6 border border-slate-200 w-full max-w-sm bg-white space-y-4 shadow-2xl rounded-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 font-outfit">Close Resume Parser IQ?</h4>
                <p className="text-xs text-slate-600">
                  {status === 'parsing'
                    ? 'Resume parsing is currently in progress. Closing now will cancel the operation.'
                    : 'Extracted resume data has not been applied to your profile yet.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCloseConfirm(false)}
                className="btn-secondary text-xs"
              >
                Keep Working
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCloseConfirm(false);
                  onClose();
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeParserIQModal;
