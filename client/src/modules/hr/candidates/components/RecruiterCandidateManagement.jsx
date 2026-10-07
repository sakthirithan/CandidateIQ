import React, { useState, useEffect, useCallback } from 'react';
import recruiterService from '@/services/recruiter/recruiterService';
import { matchingService } from '@/services/mockApi/matchingService';
import {
  Users,
  User,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  XCircle,
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
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

function RecruiterCandidateManagement({ onNavigate }) {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Multi-Field Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');
  const [matchScoreFilter, setMatchScoreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState('matchScore'); // 'matchScore' | 'name'
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Selected Candidate Detail & Cascade Tab State
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [activeCascadeTab, setActiveCascadeTab] = useState('profile');

  // Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: null, // 'shortlist' | 'reject' | 'schedule'
    targetApp: null,
    submitting: false
  });

  // HR Interview Schedule Modal State
  const [showScheduleHRModal, setShowScheduleHRModal] = useState(false);
  const [scheduleApp, setScheduleApp] = useState(null);
  const [hrForm, setHrForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'hr',
    notes: 'HR Recruitment Screening Round'
  });

  // Toast Notification
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ text: msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        recruiterService.getRecruiterApplications().catch(() => ({ applications: [] })),
        recruiterService.getRecruiterJobs().catch(() => ({ jobs: [] }))
      ]);

      const fetchedApps = appsRes?.applications || [];
      setApplications(fetchedApps);
      setJobs(jobsRes?.jobs || []);

      if (fetchedApps.length > 0 && !selectedAppId) {
        setSelectedAppId(fetchedApps[0]._id);
      }
    } catch (err) {
      console.error('[Recruiter Candidates] Error loading database applications:', err);
      setError('Failed to fetch candidate applications from MongoDB.');
    } finally {
      setLoading(false);
    }
  }, [selectedAppId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived Active Application Record
  const activeApp = applications.find((a) => a._id === selectedAppId) || applications[0] || null;
  const candidateUser = activeApp?.candidate || {};
  const candidateProfile = activeApp?.candidateProfile || {};
  const jobObj = activeApp?.job || jobs[0] || { title: 'Software Requisition' };

  // Shortlist Trigger
  const handleShortlistClick = (app) => {
    const candName = app.candidate?.name || 'Candidate';
    setConfirmModal({
      isOpen: true,
      title: 'Shortlist Candidate',
      message: `Shortlist "${candName}" for job "${app.job?.title || 'Requisition'}"? Candidate will move to shortlisted pipeline.`,
      actionType: 'shortlist',
      targetApp: app,
      submitting: false
    });
  };

  // Reject Trigger
  const handleRejectClick = (app) => {
    const candName = app.candidate?.name || 'Candidate';
    setConfirmModal({
      isOpen: true,
      title: 'Reject Application',
      message: `Reject application for "${candName}"? Application status will be set to REJECTED.`,
      actionType: 'reject',
      targetApp: app,
      submitting: false
    });
  };

  // Execute Confirmed Mutation
  const handleConfirmAction = async () => {
    if (!confirmModal.targetApp) return;
    setConfirmModal((prev) => ({ ...prev, submitting: true }));

    try {
      if (confirmModal.actionType === 'shortlist') {
        const res = await recruiterService.updateApplicationStatus(confirmModal.targetApp._id, 'shortlisted');
        if (res.success) {
          showToast(`Candidate "${confirmModal.targetApp.candidate?.name || 'Candidate'}" Shortlisted!`);
          loadData();
        }
      } else if (confirmModal.actionType === 'reject') {
        const res = await recruiterService.updateApplicationStatus(confirmModal.targetApp._id, 'rejected');
        if (res.success) {
          showToast(`Application marked as Rejected.`, 'info');
          loadData();
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application status.', 'error');
    } finally {
      setConfirmModal({
        isOpen: false,
        title: '',
        message: '',
        actionType: null,
        targetApp: null,
        submitting: false
      });
    }
  };

  // Open Schedule HR Modal
  const handleOpenScheduleHRModal = (app) => {
    setScheduleApp(app);
    setShowScheduleHRModal(true);
  };

  // Confirm Schedule HR Interview
  const handleScheduleHRSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleApp) return;

    try {
      const payload = {
        candidateId: scheduleApp.candidate?._id || scheduleApp.candidate,
        jobId: scheduleApp.job?._id || scheduleApp.job,
        scheduledDate: `${hrForm.date}T${hrForm.time}:00.000Z`,
        interviewType: hrForm.type,
        notes: hrForm.notes
      };

      const res = await recruiterService.scheduleInterview(payload);
      if (res.success) {
        showToast(`HR Interview scheduled for candidate "${scheduleApp.candidate?.name || 'Candidate'}"!`);
        setShowScheduleHRModal(false);
        loadData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule interview.', 'error');
    }
  };

  // Filtering Logic
  const filteredApplications = applications.filter((app) => {
    const candName = app.candidate?.name || app.candidateProfile?.personalInfo?.name || '';
    const jobTitle = app.job?.title || '';
    const q = searchQuery.toLowerCase().trim();

    if (q && !candName.toLowerCase().includes(q) && !jobTitle.toLowerCase().includes(q)) {
      return false;
    }

    if (jobFilter !== 'All' && jobTitle !== jobFilter) return false;

    const status = (app.status || 'applied').toLowerCase();
    if (statusFilter !== 'All' && status !== statusFilter.toLowerCase()) return false;

    const score = app.overallScore || app.matchAnalysis?.overallMatch || 80;
    if (matchScoreFilter === '90%+' && score < 90) return false;
    if (matchScoreFilter === '80%+' && score < 80) return false;
    if (matchScoreFilter === '70%+' && score < 70) return false;

    return true;
  });

  // Sorting Logic
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === 'matchScore') {
      const scoreA = a.overallScore || a.matchAnalysis?.overallMatch || 80;
      const scoreB = b.overallScore || b.matchAnalysis?.overallMatch || 80;
      return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
    } else {
      const nameA = a.candidate?.name || '';
      const nameB = b.candidate?.name || '';
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedApplications.length / pageSize) || 1;
  const paginatedApps = sortedApplications.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Skill Gap Analysis
  const candidateObjForMatching = {
    id: candidateUser._id,
    name: candidateUser.name,
    skills: candidateProfile.skills?.technical || ['React', 'Node.js', 'MongoDB'],
    experiences: candidateProfile.experience || []
  };
  const gapAnalysis = matchingService.analyzeSkillGaps(candidateObjForMatching, jobObj);

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-7xl mx-auto">
      {/* Toast Alert Notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm animate-fade-in ${
            toastMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : toastMsg.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold font-outfit">
            {toastMsg.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
            <span>{toastMsg.text}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            MongoDB Sync
          </span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">
                  Candidates & Application Pipeline
                </h1>
                <span className="badge-pill badge-primary text-[10px]">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Live MongoDB Stream
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review candidate applications, filter by match score, shortlist top talent, and schedule HR interviews.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync DB</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('comparison')}
            className="btn-saas px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" /> Compare Candidates
          </button>
        </div>
      </div>

      {/* SEARCH BAR & FILTERS */}
      <div className="saas-card p-5 border border-slate-200/90 bg-white space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search candidate name or job position..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="input-saas pl-9 w-full text-xs bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="matchScore">Match Score</option>
              <option value="name">Candidate Name</option>
            </select>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Target Job</label>
            <select
              value={jobFilter}
              onChange={(e) => {
                setJobFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Jobs</option>
              {jobs.map((j) => (
                <option key={j._id || j.id} value={j.title}>
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Match Score</label>
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

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200/80 text-slate-800 text-[11px] font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* MAIN GRID: CANDIDATE APPLICATION STREAM (LEFT) vs CANDIDATE DETAILS & ACTIONS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: APPLICATIONS LIST */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Applications Stream ({sortedApplications.length})
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {error ? (
            <div className="p-6 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-medium space-y-2">
              <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="py-12 flex justify-center items-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3 min-h-[480px]">
              {paginatedApps.map((app) => {
                const isSelected = activeApp?._id === app._id;
                const candName = app.candidate?.name || app.candidateProfile?.personalInfo?.name || 'Candidate';
                const jobTitle = app.job?.title || 'Software Position';
                const score = app.overallScore || app.matchAnalysis?.overallMatch || 80;

                return (
                  <div
                    key={app._id}
                    onClick={() => setSelectedAppId(app._id)}
                    className={`saas-card p-4 border cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-gradient-to-r from-white via-indigo-50/40 to-purple-50/20 shadow-md ring-2 ring-indigo-500/10'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-bold font-outfit text-slate-950">{candName}</h4>
                        <p className="text-[11px] text-indigo-600 font-semibold truncate max-w-[180px]">{jobTitle}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize">
                        {(app.status || 'applied').replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100 font-medium">
                      <span>Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently'}</span>
                      <span className="font-bold text-emerald-600 font-mono">Match: {score}%</span>
                    </div>
                  </div>
                );
              })}

              {sortedApplications.length === 0 && (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-medium">
                  No candidate applications found in database matching current filters.
                </div>
              )}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 text-xs">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: CANDIDATE DETAILS CASCADE & EVALUATION ACTIONS */}
        <div className="lg:col-span-2 space-y-6">
          {activeApp ? (
            <div className="space-y-6">
              {/* Header Hero Card & Recruiter Actions Toolbar */}
              <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-bold font-outfit text-2xl shadow-md">
                      {(candidateUser.name || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold font-outfit text-slate-950">
                        {candidateUser.name || 'Candidate'}
                      </h3>
                      <p className="text-xs text-indigo-600 font-bold">{jobObj.title || 'Applied Position'}</p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {candidateUser.email || 'N/A'} &bull; Status:{' '}
                        <strong className="text-slate-900 capitalize font-bold">
                          {(activeApp.status || 'applied').replace('_', ' ')}
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* Recruiter Evaluation Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleShortlistClick(activeApp)}
                      className="px-3 py-2 rounded-xl bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold text-xs hover:bg-cyan-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Shortlist
                    </button>

                    <button
                      onClick={() => handleOpenScheduleHRModal(activeApp)}
                      className="px-3 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" /> Schedule HR Interview
                    </button>

                    <button
                      onClick={() => handleRejectClick(activeApp)}
                      className="px-3 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-bold text-xs hover:bg-rose-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Reject
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
                      { id: 'appForm', label: 'Application Submission', icon: FileText },
                      { id: 'profile', label: 'Candidate Profile', icon: User },
                      { id: 'skills', label: 'Skills', icon: Brain },
                      { id: 'jobMatch', label: 'Job Match', icon: Layers },
                      { id: 'skillGap', label: 'Skill Gap', icon: BookOpen }
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
                {/* 0. Application Form Submission (Snapshot) */}
                {activeCascadeTab === 'appForm' && (
                  <div className="space-y-4 text-xs">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Historical Application Form Snapshot
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Submitted Resume</span>
                        <span className="text-indigo-600 font-bold flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-indigo-500" />
                          {activeApp.resumeSnapshot?.fileName || 'Candidate_Resume.pdf'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase block">Expected Compensation</span>
                        <span className="text-emerald-700 font-extrabold font-mono">
                          {activeApp.expectedCompensation?.formatted || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-medium">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Contact & Location</span>
                        <span className="text-slate-900 font-semibold block">
                          Phone: {activeApp.candidateSnapshot?.mobile || candidateUser.phone || 'N/A'}
                        </span>
                        <span className="text-slate-600 block">
                          Location: {activeApp.candidateSnapshot?.location || 'N/A'}
                        </span>
                        <span className="text-slate-500 text-[10px] block">
                          Gender: {activeApp.candidateSnapshot?.gender || 'Not Specified'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Professional Details</span>
                        <span className="text-slate-900 font-bold block">
                          {activeApp.professionalSnapshot?.designation || 'Software Engineer'} ({activeApp.professionalSnapshot?.userType || 'Professional'})
                        </span>
                        <span className="text-slate-600 block">
                          Experience: {activeApp.professionalSnapshot?.experience || '2 Years'}
                        </span>
                        <span className="text-slate-600 block">
                          Organization: {activeApp.professionalSnapshot?.organization || 'Tech Solutions'}
                        </span>
                      </div>
                    </div>

                    {/* Screening Answers */}
                    {activeApp.screeningAnswers && activeApp.screeningAnswers.length > 0 && (
                      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                        <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">
                          Screening Questions & Answers
                        </span>
                        {activeApp.screeningAnswers.map((qa, idx) => (
                          <div key={idx} className="space-y-0.5 border-b border-indigo-100/60 pb-2 last:border-b-0 last:pb-0">
                            <span className="font-bold text-slate-900 block">{qa.question}</span>
                            <span className="text-slate-700 font-medium block bg-white/70 p-2 rounded-lg border border-indigo-100/80">
                              {qa.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* 1. Candidate Profile */}
                {activeCascadeTab === 'profile' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Candidate Profile Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                        <span className="text-slate-900 font-semibold">{candidateUser.email || 'N/A'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Headline</span>
                        <span className="text-slate-900 font-semibold">
                          {candidateProfile.personalInfo?.headline || 'Full Stack Engineer'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Skills */}
                {activeCascadeTab === 'skills' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Verified Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(candidateProfile.skills?.technical || ['React', 'Node.js', 'JavaScript', 'MongoDB']).map(
                        (sk, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-bold"
                          >
                            {sk}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Job Match */}
                {activeCascadeTab === 'jobMatch' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      AI Job Match Compatibility Score
                    </h3>
                    <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                      <span className="font-black text-3xl font-outfit text-emerald-700 block">
                        {activeApp.overallScore || activeApp.matchAnalysis?.overallMatch || 80}% Overall Match
                      </span>
                      <p className="font-semibold text-slate-800">
                        {activeApp.matchAnalysis?.explanation || 'Strong candidate alignment with role requirements.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 4. Skill Gap */}
                {activeCascadeTab === 'skillGap' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-2">
                      3-Tier Skill Gap Classification
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                        STRONG: {gapAnalysis?.strong?.length || 2} Verified Skills
                      </div>
                      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold">
                        MODERATE: {gapAnalysis?.moderate?.length || 1} Skills
                      </div>
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold">
                        MISSING: {gapAnalysis?.missing?.length || 1} Gaps
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="saas-card p-12 text-center text-slate-400 text-xs border border-slate-200">
              Select a candidate application to explore details.
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION ACTION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 bg-white border border-slate-200 max-w-sm w-full rounded-2xl shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3">
              <div
                className={`p-2.5 rounded-xl ${
                  confirmModal.actionType === 'reject' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold font-outfit text-slate-950">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">{confirmModal.message}</p>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: '',
                    message: '',
                    actionType: null,
                    targetApp: null,
                    submitting: false
                  })
                }
                disabled={confirmModal.submitting}
                className="btn-secondary text-xs px-3.5 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={confirmModal.submitting}
                className={`text-xs px-4 py-1.5 rounded-xl font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer ${
                  confirmModal.actionType === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmModal.submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECRUITER SCHEDULE HR INTERVIEW MODAL */}
      {showScheduleHRModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-md w-full rounded-2xl shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold font-outfit text-slate-950">Schedule HR Interview</h3>
                <p className="text-xs text-slate-500">
                  Assign interview date for: {scheduleApp?.candidate?.name || 'Candidate'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleHRModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleHRSubmit} className="space-y-4 text-xs font-medium">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Interview Date</label>
                <input
                  type="date"
                  required
                  value={hrForm.date}
                  onChange={(e) => setHrForm({ ...hrForm, date: e.target.value })}
                  className="input-saas w-full bg-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Start Time</label>
                <input
                  type="time"
                  required
                  value={hrForm.time}
                  onChange={(e) => setHrForm({ ...hrForm, time: e.target.value })}
                  className="input-saas w-full bg-white font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Interview Round Type</label>
                <select
                  value={hrForm.type}
                  onChange={(e) => setHrForm({ ...hrForm, type: e.target.value })}
                  className="input-saas w-full bg-white font-semibold cursor-pointer"
                >
                  <option value="hr">HR Screening Round</option>
                  <option value="technical">Technical Evaluation</option>
                  <option value="behavioural">Behavioural Round</option>
                  <option value="mixed">Mixed Assessment</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Notes / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="HR interview agenda or instructions for candidate..."
                  value={hrForm.notes}
                  onChange={(e) => setHrForm({ ...hrForm, notes: e.target.value })}
                  className="input-saas w-full bg-white resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowScheduleHRModal(false)}
                  className="btn-secondary text-xs px-4 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs px-5 py-2 font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterCandidateManagement;
