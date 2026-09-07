import React, { useState, useEffect } from 'react';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { matchingService } from '../../services/mockApi/matchingService';
import { mockApplications } from '../../data/mockApplications';
import { mockCandidates } from '../../data/mockCandidates';
import ResponsibleAIDisclaimer from '../common/ResponsibleAIDisclaimer';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Brain,
  Briefcase,
  FileText,
  Sparkles,
  User,
  Info,
  Search,
  Clock,
  XCircle,
  UserCheck,
  RefreshCw,
  Layers,
  Zap,
  TrendingUp,
  Check,
  HelpCircle,
  BarChart3,
  BookmarkCheck
} from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

function CandidateIntelligenceProfile() {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApp, setSelectedApp] = useState(mockApplications[0]);
  const [candidateProfile, setCandidateProfile] = useState(mockCandidates[0]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [activeTabSection, setActiveTabSection] = useState('all'); // 'all' | 'strengths' | 'gaps' | 'evidence' | 'interview' | 'compatibility' | 'recommendations' | 'limitations'

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const apps = await mockApplicationService.getApplications();
      setApplications(apps);
      if (apps.length > 0) {
        setSelectedApp(apps[0]);
        loadCandidateDetails(apps[0].candidateId || 'cand_1');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCandidateDetails = async (candId) => {
    try {
      const cand = await mockCandidateService.getCandidateById(candId);
      setCandidateProfile(cand);
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSelectApp = (app) => {
    setSelectedApp(app);
    loadCandidateDetails(app.candidateId || 'cand_1');
  };

  // Recruiter Status Pipeline Update
  const handleUpdateStatus = async (appId, newStatus) => {
    const updated = await mockApplicationService.updateApplicationStatus(appId, newStatus);
    setApplications(applications.map((a) => (a.id === appId ? { ...a, ...updated } : a)));
    if (selectedApp?.id === appId) {
      setSelectedApp({ ...selectedApp, ...updated });
    }
    showToast(`Applicant status updated to "${newStatus}"! Synchronized with candidate tracker.`);
  };

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      app.candidateName.toLowerCase().includes(query) ||
      app.jobTitle.toLowerCase().includes(query) ||
      app.company.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Calculate Module 13 Aggregated Intelligence Profile
  const intelProfile = matchingService.calculateCandidateIntelligenceProfile(
    candidateProfile,
    selectedApp ? { title: selectedApp.jobTitle } : null
  );

  const getStatusBadge = (status) => {
    const st = (status || 'Applied').toLowerCase();
    if (st.includes('select') || st.includes('hired')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          Selected / Hired
        </span>
      );
    }
    if (st.includes('reject')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
          Rejected
        </span>
      );
    }
    if (st.includes('interview')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
          Interview
        </span>
      );
    }
    if (st.includes('shortlist')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
          Shortlisted
        </span>
      );
    }
    if (st.includes('review')) {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          Under Review
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
        Applied
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1.5 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Module 13 — Candidate Intelligence Profile
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Single Source of Truth
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Combines data from Profile, Resume, Skills, Experience, Projects, Applications, Job Match, Interview, and Skill Gap into unified recruiter intelligence.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchApplications}
          className="btn-saas px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Applicant Pool
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pipeline Updated</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['All', ...STATUS_OPTIONS].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st} ({st === 'All' ? applications.length : applications.filter((a) => a.status?.toLowerCase() === st.toLowerCase()).length})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search candidate or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-saas pl-8 w-full text-xs bg-white"
          />
        </div>
      </div>

      {/* Main Grid: Applicant Pool List (Left) vs Selected Candidate Intelligence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Pool List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Candidate Pool ({filteredApps.length})
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">Live Pipeline</span>
          </div>

          <div className="space-y-3 max-h-[780px] overflow-y-auto pr-1">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => handleSelectApp(app)}
                  className={`saas-card p-4 border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/20 shadow-md ring-2 ring-indigo-500/10'
                      : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold font-outfit text-slate-950">{app.candidateName}</h4>
                      <p className="text-[11px] text-indigo-600 font-semibold truncate max-w-[170px]">{app.jobTitle}</p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                    <span>Applied {app.appliedDate}</span>
                    <span className="font-bold text-emerald-600 font-mono">Match: {app.matchPercentage || 86}%</span>
                  </div>
                </div>
              );
            })}

            {filteredApps.length === 0 && (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
                No applicants found matching filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Candidate Intelligence Main Screen & 7 Pillars */}
        <div className="lg:col-span-2 space-y-6">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Applicant Main Intelligence Screen Header Card */}
              <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-bold font-outfit text-2xl shadow-md">
                      {selectedApp.candidateName?.charAt(0) || 'A'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold font-outfit text-slate-950">{selectedApp.candidateName}</h3>
                        {getStatusBadge(selectedApp.status)}
                      </div>
                      <p className="text-xs text-indigo-600 font-bold">{selectedApp.jobTitle} • {selectedApp.company}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{selectedApp.candidateEmail} • Applied on {selectedApp.appliedDate}</p>
                    </div>
                  </div>

                  {/* Main Screen Specification Score Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white min-w-[200px] border border-indigo-500/20 shadow-md">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block font-outfit">
                      Candidate Intelligence
                    </span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="text-xs text-slate-300 font-medium">Overall Score</span>
                      <span className="text-3xl font-black font-outfit text-white">
                        {intelProfile.overallScore} <span className="text-xs text-indigo-300 font-normal">/ 100</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                      High Readiness • Verified Intelligence
                    </span>
                  </div>
                </div>

                {/* Recruiter Status Pipeline Action Bar */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recruiter Status Pipeline Action
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Under Review')}
                      className={`btn-secondary text-xs ${selectedApp.status === 'Under Review' ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : ''}`}
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Mark Under Review
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Shortlisted')}
                      className={`btn-secondary text-xs ${selectedApp.status === 'Shortlisted' ? 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold' : ''}`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-cyan-600" /> Shortlist Candidate
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Interview')}
                      className={`btn-secondary text-xs ${selectedApp.status === 'Interview' ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold' : ''}`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Invite to Interview
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Selected')}
                      className="btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Select / Hire
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                      className="btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* 6 Normalized Metric Scores Grid (Matches Specification) */}
              <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-600" /> Normalized Metric Score Spectrum
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">9 Data Sources Aggregated</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Technical</span>
                    <span className="text-2xl font-black font-outfit text-indigo-600 block">{intelProfile.scores.technical}</span>
                    <span className="text-[9px] text-indigo-700 font-bold block">Top 5% MERN</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Job Match</span>
                    <span className="text-2xl font-black font-outfit text-blue-600 block">{intelProfile.scores.jobMatch}</span>
                    <span className="text-[9px] text-blue-700 font-bold block">Strong Fit</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Interview</span>
                    <span className="text-2xl font-black font-outfit text-purple-600 block">{intelProfile.scores.interview}</span>
                    <span className="text-[9px] text-purple-700 font-bold block">STAR Verified</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Behavioural</span>
                    <span className="text-2xl font-black font-outfit text-cyan-600 block">{intelProfile.scores.behavioural}</span>
                    <span className="text-[9px] text-cyan-700 font-bold block">Work Evidence</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Resume</span>
                    <span className="text-2xl font-black font-outfit text-slate-900 block">{intelProfile.scores.resume}</span>
                    <span className="text-[9px] text-slate-600 font-bold block">Verified Audit</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Experience</span>
                    <span className="text-2xl font-black font-outfit text-emerald-600 block">{intelProfile.scores.experience}</span>
                    <span className="text-[9px] text-emerald-700 font-bold block">3+ Yrs Relevant</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs for 7 Intelligence Pillars */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
                {[
                  { id: 'all', label: 'All Intelligence Pillars' },
                  { id: 'strengths', label: 'Strengths' },
                  { id: 'gaps', label: 'Skill Gaps' },
                  { id: 'evidence', label: 'Evidence' },
                  { id: 'interview', label: 'Interview' },
                  { id: 'compatibility', label: 'Job Compatibility' },
                  { id: 'recommendations', label: 'Recommendations' },
                  { id: 'limitations', label: 'Limitations' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTabSection(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTabSection === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* THE 7 DETAILED INTELLIGENCE PILLARS */}
              <div className="space-y-6">
                {/* 1. STRENGTHS */}
                {(activeTabSection === 'all' || activeTabSection === 'strengths') && (
                  <div className="saas-card p-6 border border-emerald-200/80 bg-emerald-50/30 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 font-outfit flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1. Evaluated Strengths
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-medium text-emerald-950">
                      {intelProfile.pillars.strengths.map((s, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-emerald-200/80 flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SKILL GAPS */}
                {(activeTabSection === 'all' || activeTabSection === 'gaps') && (
                  <div className="saas-card p-6 border border-slate-200/80 bg-white space-y-4 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> 2. Classified Skill Gap Matrix
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* STRONG */}
                      <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                        <span className="font-bold text-emerald-950 text-[10px] uppercase block tracking-wider">STRONG</span>
                        <div className="flex flex-wrap gap-1">
                          {intelProfile.pillars.skillGaps.strong.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* MODERATE */}
                      <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                        <span className="font-bold text-indigo-950 text-[10px] uppercase block tracking-wider">MODERATE</span>
                        <div className="flex flex-wrap gap-1">
                          {intelProfile.pillars.skillGaps.moderate.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-indigo-800 border border-indigo-200 font-bold text-[10px]">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* MISSING */}
                      <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
                        <span className="font-bold text-rose-950 text-[10px] uppercase block tracking-wider">MISSING GAPS</span>
                        <div className="flex flex-wrap gap-1">
                          {intelProfile.pillars.skillGaps.missing.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-200 font-bold text-[10px]">
                              {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. EVIDENCE */}
                {(activeTabSection === 'all' || activeTabSection === 'evidence') && (
                  <div className="saas-card p-6 border border-purple-200/80 bg-purple-50/20 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 font-outfit flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-600" /> 3. Objective Work Evidence Callouts
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {intelProfile.pillars.evidence.map((ev, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white border border-purple-200/80 space-y-1">
                          <span className="font-bold text-purple-900 text-[10px] uppercase block tracking-wider">{ev.category}</span>
                          <p className="text-slate-700 leading-relaxed font-medium">{ev.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. INTERVIEW */}
                {(activeTabSection === 'all' || activeTabSection === 'interview') && (
                  <div className="saas-card p-6 border border-slate-200/80 bg-white space-y-3 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-outfit flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" /> 4. AI Interview Scorecard
                      </h4>
                      <span className="font-bold text-indigo-600 text-xs font-mono">Score: {intelProfile.pillars.interview.score} / 100</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{intelProfile.pillars.interview.highlights}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      {intelProfile.pillars.interview.questions.map((q) => (
                        <div key={q.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex justify-between font-bold font-outfit text-slate-900">
                            <span>Q{q.id}: {q.text}</span>
                            <span className="text-indigo-600">{q.score} pts</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{q.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. JOB COMPATIBILITY */}
                {(activeTabSection === 'all' || activeTabSection === 'compatibility') && (
                  <div className="saas-card p-6 border border-blue-200/80 bg-blue-50/20 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-950 font-outfit flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-600" /> 5. Target Requisition Compatibility Breakdown
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Multi-dimensional deterministic rating against requisition: <span className="font-bold text-slate-900">{intelProfile?.pillars?.jobCompatibility?.targetJobTitle || 'Target Position'}</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
                      <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                        <span className="text-[9px] text-slate-400 uppercase block">Technical</span>
                        <span className="text-blue-700">{intelProfile?.pillars?.jobCompatibility?.breakdown?.technical || 88}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                        <span className="text-[9px] text-slate-400 uppercase block">Skills</span>
                        <span className="text-blue-700">{intelProfile?.pillars?.jobCompatibility?.breakdown?.skills || 85}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                        <span className="text-[9px] text-slate-400 uppercase block">Experience</span>
                        <span className="text-blue-700">{intelProfile?.pillars?.jobCompatibility?.breakdown?.experience || 82}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                        <span className="text-[9px] text-slate-400 uppercase block">Projects</span>
                        <span className="text-blue-700">{intelProfile?.pillars?.jobCompatibility?.breakdown?.projects || 80}%</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-blue-200">
                        <span className="text-[9px] text-slate-400 uppercase block">Education</span>
                        <span className="text-blue-700">{intelProfile?.pillars?.jobCompatibility?.breakdown?.education || 90}%</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* 6. RECOMMENDATIONS */}
                {(activeTabSection === 'all' || activeTabSection === 'recommendations') && (
                  <div className="saas-card p-6 border border-purple-200/80 bg-purple-50/30 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 font-outfit flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-600" /> 6. AI Recruiter Next-Step Recommendations
                    </h4>
                    <ul className="text-xs text-purple-950 space-y-2 list-disc list-inside font-medium leading-relaxed">
                      {intelProfile.pillars.recommendations.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 7. LIMITATIONS */}
                {(activeTabSection === 'all' || activeTabSection === 'limitations') && (
                  <div className="saas-card p-6 border border-amber-200/80 bg-amber-50/40 space-y-3 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 font-outfit flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-amber-600" /> 7. Evaluation Limitations & Responsible AI Notice
                    </h4>
                    <ul className="text-xs text-amber-950 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                      {intelProfile.pillars.limitations.map((l, idx) => (
                        <li key={idx}>{l}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <ResponsibleAIDisclaimer />
            </div>
          ) : (
            <div className="saas-card p-12 text-center text-slate-400 text-xs border border-slate-200">
              Select an applicant from the pool to review candidate intelligence details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateIntelligenceProfile;
