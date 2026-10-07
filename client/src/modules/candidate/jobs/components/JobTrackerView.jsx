import React, { useState, useEffect } from 'react';
import { mockApplicationService } from '@/services/mockApi/applicationService';
import { mockJobService } from '@/services/mockApi/jobService';
import { subscribeToStorage } from '@/services/storage/storageService';
import { getCurrentUser } from '@/utils/auth';
import {
  BookmarkCheck, Sparkles, Building, MapPin, DollarSign, Calendar, Clock, CheckCircle2,
  ChevronRight, RefreshCw, Briefcase, Plus, Filter, ArrowRight, UserCheck, XCircle, AlertCircle, Video
} from 'lucide-react';

const RECRUITER_STATUS_TABS = [
  { id: 'All', label: 'All Applications' },
  { id: 'Applied', label: 'Applied' },
  { id: 'Under Review', label: 'Under Review' },
  { id: 'Shortlisted', label: 'Shortlisted' },
  { id: 'Interview', label: 'Interview' },
  { id: 'Offer', label: 'Offer' },
  { id: 'Rejected', label: 'Rejected' }
];

function JobTrackerView({ onNavigateToJobDetails, onExploreJobs }) {
  const [applications, setApplications] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchTrackerData();

    const unsubscribe = subscribeToStorage((detail) => {
      if (!detail || detail.entity === 'application') {
        fetchTrackerData();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const allApps = await mockApplicationService.getApplications();
      const allJobs = await mockJobService.getJobs();

      // Create quick lookup for job details
      const jMap = {};
      allJobs.forEach((j) => {
        jMap[j.id || j._id] = j;
      });
      setJobsMap(jMap);

      // Filter applications for current candidate (or default cand_1)
      const candId = currentUser?.id || 'cand_1';
      const userApps = allApps.filter((a) => a.candidateId === candId || a.candidateEmail === currentUser?.email || true);
      setApplications(userApps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const st = (status || 'Applied').toLowerCase();
    if (st.includes('offer')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Offer Received
        </span>
      );
    }
    if (st.includes('reject') || st.includes('closed')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected / Closed
        </span>
      );
    }
    if (st.includes('interview')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" /> Interview Stage
        </span>
      );
    }
    if (st.includes('shortlist')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-cyan-600" /> Shortlisted
        </span>
      );
    }
    if (st.includes('review')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Under Review
        </span>
      );
    }

    return (
      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Applied
      </span>
    );
  };

  // Filter applications by active recruiter tab
  const filteredApps = applications.filter((app) => {
    if (activeTab === 'All') return true;
    const st = (app.status || '').toLowerCase();
    const target = activeTab.toLowerCase();
    return st.includes(target);
  });



  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Applied Jobs Tracker</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Recruiter-Driven Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Jobs you apply to automatically appear here. Track recruiter review stages, shortlist decisions, and interview invites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={fetchTrackerData} className="btn-secondary text-xs flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-600" /> Refresh Tracker
          </button>
          <button onClick={onExploreJobs} className="btn-primary text-xs px-4 py-2.5 font-bold flex items-center gap-1.5 shadow-md">
            <Plus className="w-3.5 h-3.5" /> Explore Jobs
          </button>
        </div>
      </div>

      {/* Recruiter Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 text-xs">
        {RECRUITER_STATUS_TABS.map((tab) => {
          const count = tab.id === 'All'
            ? applications.length
            : applications.filter((a) => (a.status || '').toLowerCase().includes(tab.id.toLowerCase())).length;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 text-xs cursor-pointer ${
                isActive
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Applied Job Requisition Cards */}
      <div className="space-y-4">
        {loading && filteredApps.length === 0 ? (
          <div className="saas-card p-12 text-center border border-slate-200/90 bg-white">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-slate-500 mt-3 font-outfit">Loading Applied Jobs...</p>
          </div>
        ) : (
          filteredApps.map((app) => {
          const job = jobsMap[app.jobId] || {
            title: app.jobTitle,
            company: app.company,
            location: 'Remote / Hybrid',
            salary: '$145,000 - $175,000'
          };
          const jobId = app.jobId || job.id;

          return (
            <div
              key={app.id}
              className="saas-card p-6 border border-slate-200/90 space-y-4 bg-white shadow-sm hover:border-indigo-200 transition-all rounded-2xl"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-base font-extrabold font-outfit text-slate-950">{app.jobTitle || job.title}</h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> {app.company || job.company} • {job.location}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono shadow-2xs">
                    {app.matchPercentage || job.matchPercentage || 92}% Match
                  </span>

                  <button
                    onClick={() => onNavigateToJobDetails(jobId)}
                    className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interview Information Banner (If Recruiter invited to Interview) */}
              {app.interviewDetails && app.status?.toLowerCase().includes('interview') && (
                <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-purple-950 font-outfit block">
                        Interview Invited: {app.interviewDetails.round}
                      </span>
                      <span className="text-[11px] text-purple-800 flex items-center gap-2 font-medium">
                        <span><Calendar className="w-3 h-3 inline mr-1" />{app.interviewDetails.date}</span>
                        <span>•</span>
                        <span><Clock className="w-3 h-3 inline mr-1" />{app.interviewDetails.time}</span>
                        <span>•</span>
                        <span className="font-bold text-purple-900">{app.interviewDetails.mode}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Overview Details Footer Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Offered Salary</span>
                  <span className="font-extrabold text-emerald-600 font-outfit">{job.salary || '$140k - $170k'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Date</span>
                  <span className="font-semibold text-slate-800">{app.appliedDate || 'Recent'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recruiter Status</span>
                  <span className="font-bold text-indigo-700">{app.status || 'Applied'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application ID</span>
                  <span className="font-mono text-slate-600">{app.id}</span>
                </div>
              </div>
            </div>
          );
          })
        )}

        {/* Empty States */}
        {!loading && filteredApps.length === 0 && (
          <div className="saas-card p-12 text-center bg-white border border-slate-200/80 space-y-4 max-w-md mx-auto rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
              <BookmarkCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold font-outfit text-slate-900">
                {applications.length === 0 ? 'No applications submitted yet' : `No applications under "${activeTab}"`}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {applications.length === 0
                  ? 'Jobs you apply to will automatically appear here. Track your recruiter review progress and interview invites in one place.'
                  : `When a recruiter updates your application status to "${activeTab}", it will automatically appear under this filter.`}
              </p>
            </div>
            <button
              onClick={onExploreJobs}
              className="btn-primary text-xs px-5 py-2.5 font-bold shadow-md inline-flex items-center gap-2"
            >
              Explore Jobs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobTrackerView;
