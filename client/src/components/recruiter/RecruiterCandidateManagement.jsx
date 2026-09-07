import React, { useState, useEffect } from 'react';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { mockInterviewService } from '../../services/mockApi/interviewService';
import { matchingService } from '../../services/mockApi/matchingService';
import {
  Users,
  User,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  XCircle,
  Clock,
  Sparkles,
  Archive,
  BarChart3,
  CheckCircle2,
  FileText,
  Brain,
  Briefcase,
  Layers,
  Award,
  BookOpen,
  Zap,
  Eye,
  RefreshCw,
  Plus,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

import { mockCandidates } from '../../data/mockCandidates';
import { mockJobs } from '../../data/mockJobs';
import { mockApplications } from '../../data/mockApplications';
import { mockInterviews } from '../../data/mockInterviews';

function RecruiterCandidateManagement({ onNavigate }) {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [jobs, setJobs] = useState(mockJobs);
  const [applications, setApplications] = useState(mockApplications);
  const [interviews, setInterviews] = useState(mockInterviews);
  const [isLoading, setIsLoading] = useState(false);

  // Search & 6 Multi-Field Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [matchScoreFilter, setMatchScoreFilter] = useState('All');
  const [interviewScoreFilter, setInterviewScoreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState('matchScore'); // 'matchScore' | 'iqScore' | 'techScore' | 'name'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Selected Candidate Detail & Cascade Tab State
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [activeCascadeTab, setActiveCascadeTab] = useState('profile');
  // 'profile' | 'resume' | 'skills' | 'experience' | 'jobMatch' | 'interview' | 'skillGap' | 'intelligence'

  // Recruiter Action Notification Toast
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [candData, jobData, appData, intData] = await Promise.all([
        mockCandidateService.getCandidates(),
        mockJobService.getJobs(),
        mockApplicationService.getApplications(),
        mockInterviewService.getInterviews()
      ]);

      setCandidates(candData || []);
      setJobs(jobData || []);
      setApplications(appData || []);
      setInterviews(intData || []);

      if (candData && candData.length > 0) {
        setSelectedCandidateId(candData[0].id);
      }
    } catch (err) {
      console.error('Error loading Recruiter Candidate Management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Recruiter Action Handlers (Shortlist, Reject, Move to Interview, Archive, Compare)
  const handleShortlistCandidate = async (candId) => {
    const app = applications.find((a) => a.candidateId === candId || a.candidateName === activeCandidate?.name);
    if (app) {
      await mockApplicationService.updateApplicationStatus(app.id, 'Shortlisted');
    }
    showToast(`Candidate "${activeCandidate?.name || 'Selected'}" successfully Shortlisted!`);
  };

  const handleRejectCandidate = async (candId) => {
    const app = applications.find((a) => a.candidateId === candId || a.candidateName === activeCandidate?.name);
    if (app) {
      await mockApplicationService.updateApplicationStatus(app.id, 'Rejected');
    }
    showToast(`Candidate "${activeCandidate?.name || 'Selected'}" marked as Rejected.`);
  };

  const handleMoveToInterview = async (candId) => {
    const app = applications.find((a) => a.candidateId === candId || a.candidateName === activeCandidate?.name);
    if (app) {
      await mockApplicationService.updateApplicationStatus(app.id, 'Interview');
    }
    showToast(`Candidate "${activeCandidate?.name || 'Selected'}" invited to Interview round!`);
  };

  const handleArchiveCandidate = async (candId) => {
    showToast(`Candidate "${activeCandidate?.name || 'Selected'}" moved to Candidate Archive.`);
  };

  const handleCompareCandidate = () => {
    if (onNavigate) {
      onNavigate('comparison');
    }
  };

  // Filtering Logic (Applying 6 Multi-Field Filters)
  const filteredCandidates = candidates.filter((cand) => {
    // Search Query
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (cand.name || '').toLowerCase().includes(q) ||
      (cand.headline || '').toLowerCase().includes(q) ||
      (cand.email || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;

    // 1. Skill Filter
    if (skillFilter !== 'All') {
      const hasSkill = (cand.skills || []).some((s) => {
        const sName = typeof s === 'string' ? s : s.name;
        return (sName || '').toLowerCase().includes(skillFilter.toLowerCase());
      });
      if (!hasSkill) return false;
    }

    // 2. Experience Filter
    if (experienceFilter !== 'All') {
      const expCount = (cand.experiences || []).length;
      if (experienceFilter === '1-2 Years' && expCount > 2) return false;
      if (experienceFilter === '3-5 Years' && (expCount < 2 || expCount > 4)) return false;
      if (experienceFilter === '5+ Years' && expCount < 3) return false;
    }

    // 3. Job Filter
    if (jobFilter !== 'All') {
      const app = applications.find((a) => a.candidateId === cand.id || a.candidateName === cand.name);
      if (!app || app.jobTitle !== jobFilter) return false;
    }

    // 4. Match Score Filter
    const matchScore = cand.scores?.jobMatch || cand.overallScore || 85;
    if (matchScoreFilter === '90%+' && matchScore < 90) return false;
    if (matchScoreFilter === '80%+' && matchScore < 80) return false;
    if (matchScoreFilter === '70%+' && matchScore < 70) return false;

    // 5. Interview Score Filter
    const intScore = cand.scores?.interview || 86;
    if (interviewScoreFilter === '85%+' && intScore < 85) return false;
    if (interviewScoreFilter === '75%+' && intScore < 75) return false;

    // 6. Application Status Filter
    if (statusFilter !== 'All') {
      const app = applications.find((a) => a.candidateId === cand.id || a.candidateName === cand.name);
      const st = app ? app.status : 'Applied';
      if (st.toLowerCase() !== statusFilter.toLowerCase()) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    let valA = 0;
    let valB = 0;

    if (sortBy === 'matchScore') {
      valA = a.scores?.jobMatch || a.overallScore || 85;
      valB = b.scores?.jobMatch || b.overallScore || 85;
    } else if (sortBy === 'iqScore') {
      valA = a.overallScore || 88;
      valB = b.overallScore || 88;
    } else if (sortBy === 'techScore') {
      valA = a.scores?.technical || 90;
      valB = b.scores?.technical || 90;
    } else if (sortBy === 'name') {
      return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }

    return sortOrder === 'asc' ? valA - valB : valB - valA;
  });

  // Derived active candidate (currently clicked or fallback to top filtered candidate)
  const activeCandidate = filteredCandidates.find((c) => c.id === selectedCandidateId) || filteredCandidates[0] || null;

  // Pagination Logic
  const totalPages = Math.ceil(sortedCandidates.length / pageSize) || 1;
  const paginatedCandidates = sortedCandidates.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const selectedJobObj = jobs[0] || { title: 'Senior MERN Stack & AI Engineer' };
  const gapAnalysis = matchingService.analyzeSkillGaps(activeCandidate, selectedJobObj);
  const intelProfile = matchingService.calculateCandidateIntelligenceProfile(activeCandidate, selectedJobObj);


  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs font-bold font-outfit">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Action Recorded
          </span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 15 — Recruiter Candidate Management
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Candidate Evaluation Desk
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Explore candidate pool with 6 multi-field filters, sorting, pagination, cascade tabs, and recruiter evaluation actions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCompareCandidate}
            className="btn-saas px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Multi-Candidate Matrix
          </button>
        </div>
      </div>

      {/* SEARCH BAR & 6 MULTI-FIELD FILTERS TOOLBAR */}
      <div className="saas-card p-5 border border-slate-200/90 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by candidate name, role, or skill..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-saas pl-9 w-full text-xs bg-slate-50/50"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="matchScore">Job Match Score</option>
              <option value="iqScore">Overall IQ Score</option>
              <option value="techScore">Tech Score</option>
              <option value="name">Candidate Name</option>
            </select>
          </div>
        </div>

        {/* 6 Multi-Field Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* 1. Skill Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Skill
            </label>
            <select
              value={skillFilter}
              onChange={(e) => {
                setSkillFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Skills</option>
              <option value="React">React.js</option>
              <option value="Node">Node.js</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Python">Python</option>
              <option value="MongoDB">MongoDB</option>
              <option value="Docker">Docker</option>
            </select>
          </div>

          {/* 2. Experience Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              2. Experience
            </label>
            <select
              value={experienceFilter}
              onChange={(e) => {
                setExperienceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Experience</option>
              <option value="1-2 Years">1-2 Years</option>
              <option value="3-5 Years">3-5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </div>

          {/* 3. Job Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              3. Target Job
            </label>
            <select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer truncate"
            >
              <option value="All">All Requisitions</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.title}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Match Score Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              4. Match Score
            </label>
            <select
              value={matchScoreFilter}
              onChange={(e) => {
                setMatchScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Match Scores</option>
              <option value="90%+">90%+ Match</option>
              <option value="80%+">80%+ Match</option>
              <option value="70%+">70%+ Match</option>
            </select>
          </div>

          {/* 5. Interview Score Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              5. Interview Score
            </label>
            <select
              value={interviewScoreFilter}
              onChange={(e) => {
                setInterviewScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Interview Scores</option>
              <option value="85%+">85%+ Score</option>
              <option value="75%+">75%+ Score</option>
            </select>
          </div>

          {/* 6. Application Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              6. App Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN GRID: CANDIDATE LIST (LEFT) vs CANDIDATE DETAIL CASCADE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: CANDIDATE LIST & PAGINATION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Candidate Pool ({sortedCandidates.length})
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="space-y-3 min-h-[480px]">
            {paginatedCandidates.map((cand) => {
              const isSelected = activeCandidate?.id === cand.id;
              const app = applications.find((a) => a.candidateId === cand.id || a.candidateName === cand.name);
              const status = app ? app.status : 'Applied';

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`saas-card p-4 border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/20 shadow-md ring-2 ring-indigo-500/10'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold font-outfit text-slate-950">{cand.name}</h4>
                      <p className="text-[11px] text-indigo-600 font-semibold truncate max-w-[180px]">
                        {cand.headline || 'Full Stack MERN Developer'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(cand.skills || []).slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {typeof sk === 'string' ? sk : sk.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                    <span>IQ Score: <strong className="text-slate-900">{cand.overallScore || 88}</strong></span>
                    <span className="font-bold text-emerald-600 font-mono">Match: {cand.scores?.jobMatch || 89}%</span>
                  </div>
                </div>
              );
            })}

            {sortedCandidates.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No candidates found matching the applied 6 filters.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 text-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CANDIDATE DETAIL CASCADE TABS & RECRUITER ACTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {activeCandidate ? (
            <div className="space-y-6">
              {/* Header Hero Card & Recruiter Actions Toolbar */}
              <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-bold font-outfit text-2xl shadow-md">
                      {activeCandidate?.name?.charAt(0) || 'C'}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold font-outfit text-slate-950">{activeCandidate?.name || 'Selected Candidate'}</h3>
                      <p className="text-xs text-indigo-600 font-bold">{activeCandidate?.headline || 'Candidate Profile'}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{activeCandidate?.email || 'N/A'} • {activeCandidate?.location || 'Remote'}</p>
                    </div>
                  </div>

                  {/* Recruiter Evaluation Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleShortlistCandidate(activeCandidate?.id)}
                      className="px-3 py-2 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-xs hover:bg-cyan-100 flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Shortlist
                    </button>

                    <button
                      onClick={() => handleMoveToInterview(activeCandidate?.id)}
                      className="px-3 py-2 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 font-bold text-xs hover:bg-purple-100 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Move to Interview
                    </button>

                    <button
                      onClick={() => handleRejectCandidate(activeCandidate?.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs hover:bg-rose-100 flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Reject
                    </button>

                    <button
                      onClick={() => handleArchiveCandidate(activeCandidate?.id)}
                      className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs hover:bg-slate-200 flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" /> Archive
                    </button>

                    <button
                      onClick={handleCompareCandidate}
                      className="px-3 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 flex items-center gap-1.5 shadow-2xs"
                    >
                      <BarChart3 className="w-3.5 h-3.5" /> Compare
                    </button>
                  </div>
                </div>

                {/* CANDIDATE DETAIL CASCADE NAVIGATION TABS */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Candidate Detail Lifecycle Cascade
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'profile', label: 'Candidate Profile', icon: User },
                      { id: 'resume', label: 'Resume', icon: FileText },
                      { id: 'skills', label: 'Skills', icon: Brain },
                      { id: 'experience', label: 'Experience', icon: Briefcase },
                      { id: 'jobMatch', label: 'Job Match', icon: Layers },
                      { id: 'interview', label: 'Interview', icon: Award },
                      { id: 'skillGap', label: 'Skill Gap', icon: BookOpen },
                      { id: 'intelligence', label: 'Candidate Intelligence', icon: Zap }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeCascadeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveCascadeTab(tab.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-slate-950 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" /> {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CASCADE TAB CONTENT PANELS */}
              <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white shadow-sm">
                {/* 1. Candidate Profile */}
                {activeCascadeTab === 'profile' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Candidate Profile Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                        <span className="text-slate-900 font-semibold">{activeCandidate?.phone || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Location</span>
                        <span className="text-slate-900 font-semibold">{activeCandidate?.location || 'Remote'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Resume */}
                {activeCascadeTab === 'resume' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Resume Parser Audit & Completeness
                    </h3>
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
                      <p className="font-bold text-indigo-950">File: {activeCandidate?.resumeDetails?.filename || 'Resume_2026.pdf'}</p>
                      <p className="text-indigo-900">Completeness Rating: {activeCandidate?.resumeDetails?.completeness || '96%'}</p>
                      <p className="text-indigo-900">Extracted Skills: {activeCandidate?.resumeDetails?.extractedSkillsCount || 14} skills verified</p>
                    </div>
                  </div>
                )}

                {/* 3. Skills */}
                {activeCascadeTab === 'skills' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Skill Matrix & Confidence Ratings
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(activeCandidate?.skills || []).map((sk, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                          <span className="font-bold text-slate-900 block font-outfit">{typeof sk === 'string' ? sk : sk.name}</span>
                          <span className="text-[10px] text-indigo-600 font-bold block">{sk.level || 'Expert'} • {sk.confidence || 90}% confidence</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Experience */}
                {activeCascadeTab === 'experience' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Engineering Tenure & Work History
                    </h3>
                    <div className="space-y-3 text-xs">
                      {(activeCandidate?.experiences || []).map((exp, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <h4 className="font-bold font-outfit text-slate-950">{exp.title} • {exp.company}</h4>
                          <span className="text-[10px] text-indigo-600 font-semibold block">{exp.period}</span>
                          <p className="text-slate-600 leading-relaxed font-medium">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Job Match */}
                {activeCascadeTab === 'jobMatch' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Multi-Dimensional Requisition Match
                    </h3>
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                      <span className="font-black text-2xl font-outfit text-emerald-700 block">
                        {activeCandidate?.scores?.jobMatch || 89}% Match Score
                      </span>
                      <p className="font-medium">High technical compatibility with {selectedJobObj.title}.</p>
                    </div>
                  </div>
                )}

                {/* 6. Interview */}
                {activeCascadeTab === 'interview' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      AI Mock Interview Scorecard
                    </h3>
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 space-y-2">
                      <span className="font-black text-2xl font-outfit text-purple-700 block">
                        {activeCandidate?.scores?.interview || 86} / 100 Score
                      </span>
                      <p className="font-medium">STAR methodology verified across 3 technical questions.</p>
                    </div>
                  </div>
                )}

                {/* 7. Skill Gap */}
                {activeCascadeTab === 'skillGap' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      3-Tier Skill Gap Classification
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                        STRONG: {gapAnalysis?.strong?.length || 0} Skills
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold">
                        MODERATE: {gapAnalysis?.moderate?.length || 0} Skills
                      </div>
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold">
                        MISSING: {gapAnalysis?.missing?.length || 0} Gaps
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Candidate Intelligence */}
                {activeCascadeTab === 'intelligence' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2 flex justify-between items-center">
                      <span>Module 13 Candidate Intelligence Profile</span>
                      <span className="font-black font-outfit text-indigo-600 text-base">IQ: {intelProfile?.overallScore || 88}/100</span>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Single source of truth summarizing technical depth (88), job match (86), interview (82), behavioural (76), resume (81), and experience (79).
                    </p>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="saas-card p-12 text-center text-slate-400 text-xs border border-slate-200">
              Select a candidate from the pool to explore candidate detail cascade.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecruiterCandidateManagement;
