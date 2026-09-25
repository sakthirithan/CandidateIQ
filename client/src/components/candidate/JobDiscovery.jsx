import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockTrackerService } from '../../services/mockApi/trackerService';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import {
  Briefcase, MapPin, CheckCircle2, ChevronRight, Sparkles, Search, DollarSign,
  Bookmark, BookmarkCheck, Calendar, ArrowRight, Building, Zap, Copy
} from 'lucide-react';

import { getCurrentUser } from '../../utils/auth';

function JobDiscovery({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackedJobIds, setTrackedJobIds] = useState([]);
  const [candidateApps, setCandidateApps] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [skillFilter, setSkillFilter] = useState('All');
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'recent' | 'salary'

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      const candidateId = currentUser?.id || 'cand_1';

      const res = await api.get('/jobs').catch(() => null);
      let jobList = [];
      if (res?.data?.jobs && res.data.jobs.length > 0) {
        jobList = res.data.jobs;
      } else {
        const mockList = await mockJobService.getJobs();
        const activeJobs = mockList.filter((j) => j.status !== 'Draft' && j.status !== 'Closed');
        jobList = activeJobs.length > 0 ? activeJobs : mockList;
      }
      setJobs(jobList);

      // Fetch tracked jobs status
      const trackedList = await mockTrackerService.getTrackedJobs();
      setTrackedJobIds(trackedList.map((t) => t.jobId));

      // Fetch candidate-specific applications status
      const appList = await mockApplicationService.getApplicationsForCandidate(candidateId);
      setCandidateApps(appList || []);
    } catch (err) {
      const mockList = await mockJobService.getJobs();
      setJobs(mockList);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleTrackJob = async (e, jobId) => {
    e.stopPropagation();
    if (trackedJobIds.includes(jobId)) {
      await mockTrackerService.untrackJob(jobId);
      setTrackedJobIds(trackedJobIds.filter((id) => id !== jobId));
      showToast('Removed job from your tracker.');
    } else {
      await mockTrackerService.trackJob(jobId, 'Interested');
      setTrackedJobIds([...trackedJobIds, jobId]);
      showToast('Job added to your tracker!');
    }
  };

  // Filter & Search Logic
  let filtered = jobs.filter((j) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      j.title.toLowerCase().includes(query) ||
      j.company?.toLowerCase().includes(query) ||
      j.description?.toLowerCase().includes(query) ||
      (j.requiredSkills || []).some((s) => s.toLowerCase().includes(query));

    const matchesLocation = locationFilter === 'All' || j.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesExperience = experienceFilter === 'All' || (j.experience && j.experience.includes(experienceFilter));
    const matchesType = typeFilter === 'All' || j.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesDept = departmentFilter === 'All' || j.department?.toLowerCase() === departmentFilter.toLowerCase();
    const matchesSkill = skillFilter === 'All' || (j.requiredSkills || []).includes(skillFilter);

    return matchesSearch && matchesLocation && matchesExperience && matchesType && matchesDept && matchesSkill;
  });

  // Sorting Logic
  filtered.sort((a, b) => {
    if (sortBy === 'match') {
      return (b.matchPercentage || b.matchScore || 85) - (a.matchPercentage || a.matchScore || 85);
    }
    if (sortBy === 'recent') {
      return new Date(b.postedDate || '2026-01-01') - new Date(a.postedDate || '2026-01-01');
    }
    if (sortBy === 'salary') {
      return (b.salary || '').localeCompare(a.salary || '');
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-6xl mx-auto">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-2xl animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-3 text-slate-400 hover:text-white">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner & Search Controls — Unstop Style Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 space-y-5 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Job Discovery</h2>
              <span className="badge-pill badge-ai text-[10px]">
                <Sparkles className="w-3 h-3 text-indigo-600" /> AI Requisition Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Explore open opportunities, evaluate AI compatibility match scores, and track your application journey.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (e.g. React, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-saas pl-9 pr-4 w-full text-xs shadow-xs"
            />
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {/* Location Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Location</label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="input-saas w-full text-[11px] py-1.5"
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Austin">Austin</option>
              <option value="New York">New York</option>
              <option value="Bangalore">Bangalore</option>
            </select>
          </div>

          {/* Experience Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Experience</label>
            <select
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="input-saas w-full text-[11px] py-1.5"
            >
              <option value="All">All Levels</option>
              <option value="1-3">1-3 Years</option>
              <option value="2-4">2-4 Years</option>
              <option value="4+">4+ Years</option>
              <option value="6+">6+ Years</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-saas w-full text-[11px] py-1.5"
            >
              <option value="All">All Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Skills</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="input-saas w-full text-[11px] py-1.5"
            >
              <option value="All">All Skills</option>
              <option value="React.js">React.js</option>
              <option value="Node.js">Node.js</option>
              <option value="Python">Python</option>
              <option value="TypeScript">TypeScript</option>
              <option value="MongoDB">MongoDB</option>
              <option value="Docker">Docker</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="input-saas w-full text-[11px] py-1.5"
            >
              <option value="All">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="ai research">AI Research</option>
              <option value="product design">Product Design</option>
            </select>
          </div>

          {/* Sorting Control */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-saas w-full text-[11px] py-1.5 font-semibold text-indigo-700 bg-indigo-50/50"
            >
              <option value="match">Match Score (High → Low)</option>
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unstop-Style Job Requisition List Cards (Full Width) */}
      <div className="space-y-4">
        {filtered.map((job) => {
          const jobId = job.id || job._id;
          const isTracked = trackedJobIds.includes(jobId);
          const candidateApp = candidateApps.find((a) => a.jobId === jobId || a.jobId === String(jobId));
          const appStatus = candidateApp?.status || (candidateApp ? 'Applied' : null);
          const matchScore = job.matchPercentage || job.matchScore || 91;

          const renderStatusBadge = () => {
            if (!appStatus) return null;
            const st = appStatus.toLowerCase();
            if (st.includes('select') || st.includes('hired')) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Selected / Hired
                </span>
              );
            }
            if (st.includes('reject')) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                  Application Closed
                </span>
              );
            }
            if (st.includes('interview')) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" /> Interview Scheduled
                </span>
              );
            }
            if (st.includes('shortlist')) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Shortlisted
                </span>
              );
            }
            if (st.includes('review')) {
              return (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  Under Review
                </span>
              );
            }
            return (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Applied
              </span>
            );
          };

          return (
            <div
              key={jobId}
              onClick={() => onSelectJob && onSelectJob(jobId)}
              className="saas-card p-6 border border-slate-200/90 hover:border-indigo-300 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer rounded-2xl group space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-black font-outfit text-xl shadow-sm shrink-0">
                    {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-extrabold font-outfit text-slate-950 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      {renderStatusBadge()}
                    </div>
                    <p className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500" /> {job.company || 'CandidateIQ Enterprise'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono shadow-2xs">
                    {matchScore}% Match
                  </span>
                </div>
              </div>

              {/* Description snippet */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                {job.description}
              </p>

              {/* Tags & Metadata Footer Row */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-3 font-medium text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.experience || '2-4 Years'}</span>
                  <span>•</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {job.salary || '$140k - $170k'}</span>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectJob) onSelectJob(jobId);
                    }}
                    className="btn-primary text-xs px-4 py-1.5 font-bold flex items-center gap-1.5 shadow-sm group-hover:bg-indigo-700"
                  >
                    View Job <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="saas-card p-12 text-center bg-white border border-slate-200/80 space-y-2 text-slate-500 text-xs">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700 font-outfit text-sm">No Matching Job Requisitions Found</p>
            <p>Try broadening your search keywords or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDiscovery;
