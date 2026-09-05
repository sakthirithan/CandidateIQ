import React, { useState, useEffect } from 'react';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import {
  ShieldCheck, CheckCircle2, AlertTriangle, Award, Brain, Briefcase, FileText, Sparkles, User, Info,
  ThumbsUp, ThumbsDown, MessageSquare, Download, Share2, Search, Filter, Clock, XCircle, UserCheck, RefreshCw, X
} from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

function CandidateIntelligenceProfile() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

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
    setTimeout(() => setToastMsg(null), 3000);
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
    <div className="p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Applicant Pipeline & Candidate Intelligence</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Module 08 Integration Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Review candidates, evaluate evidence density, and transition applicants through the hiring status pipeline.</p>
        </div>

        <button onClick={fetchApplications} className="btn-secondary text-xs flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Applicant Desk
        </button>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
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
            placeholder="Search candidate name or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-saas pl-8 w-full text-xs"
          />
        </div>
      </div>

      {/* Main Grid: Candidate Pool List (Left) vs Selected Candidate Intelligence (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Applicant Cards List */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Applicants ({filteredApps.length})</span>
          {filteredApps.map((app) => {
            const isSelected = selectedApp?.id === app.id;
            return (
              <div
                key={app.id}
                onClick={() => handleSelectApp(app)}
                className={`saas-card p-4 border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-indigo-600 bg-gradient-to-r from-white via-indigo-50/20 to-purple-50/10 shadow-md ring-2 ring-indigo-500/10'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold font-outfit text-slate-950">{app.candidateName}</h4>
                    <p className="text-[11px] text-indigo-600 font-semibold truncate max-w-[180px]">{app.jobTitle}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Applied {app.appliedDate}</span>
                  <span className="font-bold text-emerald-600 font-mono">{app.matchPercentage || 92}% Match</span>
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

        {/* Right Column: Selected Candidate Detailed Intelligence & Status Pipeline Control */}
        <div className="lg:col-span-2 space-y-6">
          {selectedApp ? (
            <div className="space-y-6">
              {/* Applicant Hero & Recruiter Status Pipeline Box */}
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

                  <div className="text-right p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 min-w-[150px]">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Candidate IQ</span>
                    <h4 className="text-3xl font-black font-outfit text-slate-950 mt-0.5">{selectedApp.iqScore || 88} <span className="text-xs font-normal text-slate-400">/ 100</span></h4>
                  </div>
                </div>

                {/* Recruiter Status Pipeline Actions */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recruiter Status Pipeline Action</span>
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
                      className={`btn-primary text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Select / Hire
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedApp.id, 'Rejected')}
                      className={`btn-secondary text-xs text-rose-600 hover:bg-rose-50 border-rose-200`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* Multi-Dimensional Evidence Breakdown */}
              <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" /> Candidate Evidence Matrix
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Resume Score</span>
                    <span className="text-xl font-black font-outfit text-slate-950 mt-0.5 block">86%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Skills Fit</span>
                    <span className="text-xl font-black font-outfit text-indigo-600 mt-0.5 block">92%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Job Match</span>
                    <span className="text-xl font-black font-outfit text-emerald-600 mt-0.5 block">{selectedApp.matchPercentage || 91}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">AI Interview</span>
                    <span className="text-xl font-black font-outfit text-purple-600 mt-0.5 block">87%</span>
                  </div>
                </div>

                {/* Candidate Technical Skills extracted */}
                {candidateProfile && (
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Skills Verified</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(candidateProfile.skills || []).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-semibold">
                          {sk.name || sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="saas-card p-12 text-center text-slate-400 text-xs border border-slate-200">
              Select an applicant from the pool to review details and change pipeline status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateIntelligenceProfile;
