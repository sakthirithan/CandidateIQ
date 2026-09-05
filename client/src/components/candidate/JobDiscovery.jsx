import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { matchingService } from '../../services/mockApi/matchingService';
import { getCurrentUser } from '../../utils/auth';
import {
  Briefcase, MapPin, CheckCircle2, ChevronRight, AlertCircle, Sparkles, Filter, Search, Zap, Building,
  Bookmark, BookmarkCheck, Share2, ArrowUpDown, DollarSign, GraduationCap, Check, Copy, ExternalLink
} from 'lucide-react';

function JobDiscovery({ onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [applying, setApplying] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState([]);
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
      const res = await api.get('/jobs').catch(() => null);
      if (res?.data?.jobs && res.data.jobs.length > 0) {
        setJobs(res.data.jobs);
        setSelectedJob(res.data.jobs[0]);
      } else {
        const mockList = await mockJobService.getJobs();
        // Show published/active jobs
        const activeJobs = mockList.filter(j => j.status !== 'Draft' && j.status !== 'Closed');
        const finalJobs = activeJobs.length > 0 ? activeJobs : mockList;
        setJobs(finalJobs);
        setSelectedJob(finalJobs[0]);
      }
    } catch (err) {
      const mockList = await mockJobService.getJobs();
      setJobs(mockList);
      setSelectedJob(mockList[0]);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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

  // Action 1: Apply with Deterministic matchingService Engine
  const handleApply = async (jobId) => {
    try {
      setApplying(true);
      const currentUser = getCurrentUser();
      const candidate = await mockCandidateService.getCandidateById(currentUser?.id || 'cand_1');

      // Call matchingService.calculateMatch(candidate, selectedJob)
      const calculatedMatch = matchingService.calculateMatch(candidate, selectedJob);

      await mockApplicationService.applyForJob({
        jobId: selectedJob.id || selectedJob._id,
        jobTitle: selectedJob.title,
        company: selectedJob.company || 'CandidateIQ Enterprise',
        candidateId: currentUser?.id || 'cand_1',
        candidateName: currentUser?.name || 'Alex Johnson',
        candidateEmail: currentUser?.email || 'alex@example.com',
        matchPercentage: calculatedMatch.overallMatch,
        iqScore: 88
      });

      setMatchResult(calculatedMatch);
      showToast(`Applied successfully to "${selectedJob.title}"! Overall match: ${calculatedMatch.overallMatch}%.`);
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  // Action 2: Save / Bookmark Job
  const handleToggleSaveJob = (jobId) => {
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
      showToast('Removed from saved bookmarks.');
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      showToast('Job saved to your bookmarks!');
    }
  };

  // Action 3: Share Job
  const handleShareJob = (job) => {
    const url = `${window.location.origin}/candidate/jobs?id=${job.id || job._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast(`Share link for "${job.title}" copied to clipboard!`);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 select-none max-w-7xl mx-auto">
      {/* Top Banner & Search Header */}
      <div className="saas-card p-6 border border-slate-200/90 space-y-4 bg-white shadow-sm">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">Candidate Job Discovery</h2>
              <span className="badge-pill badge-ai text-[10px]">
                <Sparkles className="w-3 h-3 text-indigo-600" /> AI Compatibility Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Discover open technical requisitions, filter by domain, and evaluate candidate match score.</p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search title, skills (e.g. React, Node, AI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-saas pl-9 pr-4 w-full text-xs"
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

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)}><Copy className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
      )}

      {/* Main Content Grid: Job Cards vs Selected Job Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Job Cards List */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.map((job) => {
            const isSelected = selectedJob?.id === job.id || selectedJob?._id === job._id;
            const isSaved = savedJobIds.includes(job.id || job._id);
            const matchScore = job.matchPercentage || job.matchScore || 91;

            return (
              <div
                key={job.id || job._id}
                onClick={() => { setSelectedJob(job); setMatchResult(null); }}
                className={`saas-card p-6 border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-gradient-to-r from-white via-indigo-50/20 to-purple-50/10 shadow-md ring-2 ring-indigo-500/10'
                    : 'border-slate-200/80 hover:border-slate-300 bg-white shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold font-outfit text-slate-950">{job.title}</h3>
                    <p className="text-xs text-indigo-600 font-bold mt-0.5">
                      {job.company || 'CandidateIQ Enterprise'} • {job.location} • {job.type || 'Full-Time'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleSaveJob(job.id || job._id); }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                      title={isSaved ? 'Bookmarked' : 'Save job'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                    </button>

                    <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono">
                      {matchScore}% Match
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">{job.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {(job.requiredSkills || []).map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-900 text-[11px] font-semibold border border-indigo-100">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Inspect Match <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="saas-card p-12 text-center bg-white border border-slate-200/80 space-y-2 text-slate-500 text-xs">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 font-outfit text-sm">No Matching Job Requisitions Found</p>
              <p>Try broadening your filter criteria or search keyword.</p>
            </div>
          )}
        </div>

        {/* Right Column: Selected Job Requisition Details & Actions Drawer */}
        <div className="space-y-4">
          {selectedJob ? (
            <div className="saas-card p-6 border border-slate-200/90 space-y-6 sticky top-24 bg-white shadow-sm">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requisition Details</span>
                  <h3 className="text-lg font-extrabold font-outfit text-slate-950">{selectedJob.title}</h3>
                  <p className="text-xs text-indigo-600 font-bold">{selectedJob.company || 'CandidateIQ Enterprise'}</p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleSaveJob(selectedJob.id || selectedJob._id)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200"
                    title="Bookmark Job"
                  >
                    {savedJobIds.includes(selectedJob.id || selectedJob._id) ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-600 fill-amber-500" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleShareJob(selectedJob)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200"
                    title="Share Job"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Job Metadata Tags */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Location</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {selectedJob.location}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Salary</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1"><DollarSign className="w-3 h-3" /> {selectedJob.salary || '$130k - $160k'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience</span>
                  <span className="font-bold text-slate-900">{selectedJob.experience || '3+ Years'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Education</span>
                  <span className="font-bold text-slate-900 truncate block">{selectedJob.education || 'B.S. in CS'}</span>
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Job Description</span>
                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Required & Preferred Skills */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Required Technical Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedJob.requiredSkills || []).map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100 text-xs font-bold">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedJob.preferredSkills && selectedJob.preferredSkills.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Preferred Qualifications</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedJob.preferredSkills || []).map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-100 text-xs font-bold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Action Buttons: Apply / Save / Share */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleApply(selectedJob.id || selectedJob._id)}
                  disabled={applying}
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {applying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-indigo-400" /> Apply & Calculate AI Match
                    </>
                  )}
                </button>
              </div>

              {/* Match Result Breakdown & Explainability Drawer */}
              {matchResult && (
                <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in duration-200">
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Overall Candidate Match</span>
                    <h4 className="text-3xl font-black font-outfit text-indigo-600 mt-1">{matchResult.overallMatch}% Overall</h4>
                  </div>

                  {/* Multi-Dimensional Breakdown Ratings */}
                  {matchResult.breakdown && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category Breakdown</span>
                      <div className="grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Technical</span>
                          <span className="font-extrabold text-indigo-600 font-outfit text-sm">{matchResult.breakdown.technical}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Skills</span>
                          <span className="font-extrabold text-emerald-600 font-outfit text-sm">{matchResult.breakdown.skills}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Experience</span>
                          <span className="font-extrabold text-purple-600 font-outfit text-sm">{matchResult.breakdown.experience}%</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Projects</span>
                          <span className="font-extrabold text-amber-600 font-outfit text-sm">{matchResult.breakdown.projects}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Explainability: Strong Matches & Missing Skills */}
                  {matchResult.explainability && (
                    <>
                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">✓ Strong Matches</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(matchResult.explainability.strongMatches || []).map((m, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/80">
                              ✓ {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">⚠ Missing Skills</span>
                        <div className="flex flex-wrap gap-1.5">
                          {(matchResult.explainability.missingSkills || []).map((m, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200/80">
                              ⚠ {m}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Verified Evidence Callouts */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                        <span className="font-bold text-slate-900 block font-outfit">Verified Evidence Callouts:</span>
                        <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-600 font-medium">
                          {(matchResult.explainability.evidence || []).map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="saas-card p-8 text-center text-slate-400 text-xs border border-slate-200">
              Select a job requisition from the marketplace to view details and calculate compatibility match score.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default JobDiscovery;
