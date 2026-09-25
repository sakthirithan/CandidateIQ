import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { mockTrackerService } from '../../services/mockApi/trackerService';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { matchingService } from '../../services/mockApi/matchingService';
import { getCurrentUser } from '../../utils/auth';
import {
  ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, Clock, CheckCircle2, Zap,
  Bookmark, BookmarkCheck, Share2, Building, Sparkles, AlertCircle, FileText, Check, Copy, UserCheck
} from 'lucide-react';

function JobDetailsView({ jobId, returnTab, onBack, onNavigate }) {
  const params = useParams();
  const effectiveJobId = jobId || params.jobId || 'job_1';

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [applying, setApplying] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const isTracked = Boolean(application);
  const trackingStatus = application?.status || 'Applied';

  const [showIncompleteModal, setShowIncompleteModal] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [effectiveJobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const allJobs = await mockJobService.getJobs();
      const targetJob = allJobs.find((j) => (j.id || j._id) === effectiveJobId) || allJobs[0];
      setJob(targetJob);

      // Fetch candidate-specific application status
      const currentUser = getCurrentUser();
      const candidateId = currentUser?.id || 'cand_1';
      const userApps = await mockApplicationService.getApplicationsForCandidate(candidateId);
      const userApp = userApps.find((a) => (a.jobId === targetJob.id || a.jobId === targetJob._id || String(a.jobId) === String(targetJob.id)));
      setApplication(userApp || null);

      // Calculate initial match score if candidate available
      const candidate = await mockCandidateService.getCandidateById(candidateId);
      if (candidate && targetJob) {
        const match = matchingService.calculateMatch(candidate, targetJob);
        setMatchResult(match);
      }
    } catch (err) {
      console.error('Error loading job details:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApply = async (bypassProfileCheck = false) => {
    if (!job || application) return;
    const currentUser = getCurrentUser();
    const candidateId = currentUser?.id || 'cand_1';
    const candidate = await mockCandidateService.getCandidateById(candidateId);

    // Profile Completeness check
    const hasSkills = candidate?.skills && candidate.skills.length > 0;
    const hasEdu = candidate?.education && candidate.education.length > 0;
    if (!bypassProfileCheck && (!hasSkills || !hasEdu)) {
      setShowIncompleteModal(true);
      return;
    }

    try {
      setApplying(true);
      const calculatedMatch = matchingService.calculateMatch(candidate, job);

      const newApp = await mockApplicationService.applyForJob({
        jobId: job.id || job._id,
        jobTitle: job.title,
        company: job.company || 'CandidateIQ Enterprise',
        candidateId,
        candidateName: currentUser?.name || 'Alex Johnson',
        candidateEmail: currentUser?.email || 'alex@example.com',
        matchPercentage: calculatedMatch.overallMatch,
        iqScore: 88
      });

      setApplication(newApp);
      setMatchResult(calculatedMatch);
      setShowIncompleteModal(false);
      showToast(`Application submitted! This job has been automatically added to your Tracker.`);
    } catch (err) {
      console.error(err);
      if (err.code === 'ALREADY_APPLIED') {
        showToast('You have already applied for this job position.');
      } else {
        showToast('Failed to submit application. Please try again.');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/candidate/jobs?id=${job?.id || jobId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    showToast('Job requisition link copied to clipboard!');
  };

  const getApplicationStatusBadge = () => {
    if (!application) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
          Not Applied
        </span>
      );
    }

    const st = (application.status || 'Applied').toLowerCase();
    if (st.includes('select') || st.includes('hired')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selected / Hired
        </span>
      );
    }
    if (st.includes('reject')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          Application Closed
        </span>
      );
    }
    if (st.includes('interview')) {
      return (
        <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Interview Stage
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
      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Applied
      </span>
    );
  };

  if (loading || !job) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const backLabel = returnTab === 'tracker' ? 'Back to Tracker' : 'Back to Job Discovery';

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

      {/* Top Back Navigation Button */}
      <div>
        <button
          onClick={onBack}
          className="btn-secondary text-xs px-3.5 py-2 inline-flex items-center gap-2 font-semibold hover:translate-x-[-2px] transition-transform"
        >
          <ArrowLeft className="w-4 h-4 text-indigo-600" /> {backLabel}
        </button>
      </div>

      {/* Header Requisition Card — Unstop Style */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 space-y-6 bg-white shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center text-white font-black font-outfit text-2xl shadow-md shrink-0">
              {job.company ? job.company.charAt(0).toUpperCase() : 'C'}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">{job.title}</h1>
                {getApplicationStatusBadge()}
              </div>
              <p className="text-sm font-bold text-indigo-600 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-indigo-500" /> {job.company || 'CandidateIQ Enterprise'}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-1 font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.type || 'Full-Time'}</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-slate-400" /> {job.salary || '$140k - $170k'}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Posted: {job.postedDate || 'Recent'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <button onClick={handleShare} className="btn-secondary p-2.5 cursor-pointer" title="Share Job">
              <Share2 className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('interview', {
                    jobId: job.id || job._id,
                    targetJobTitle: job.title,
                    company: job.company || 'CandidateIQ Requisition',
                    jobDescriptionSnapshot: job.description
                  });
                }
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" /> Practice Mock Interview
            </button>

            <button
              onClick={handleApply}
              disabled={applying || Boolean(application)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                application
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {applying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : application ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Applied
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" /> Apply Now
                </>
              )}
            </button>
          </div>
        </div>

        {/* Overview Key Metrics Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Experience Required</span>
            <span className="font-extrabold text-slate-900 font-outfit text-sm">{job.experience || '3+ Years'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Offered Compensation</span>
            <span className="font-extrabold text-emerald-600 font-outfit text-sm">{job.salary || '$140k - $170k'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</span>
            <span className="font-extrabold text-indigo-700 font-outfit text-sm capitalize">{job.department || 'Engineering'}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Match Score</span>
            <span className="font-extrabold text-purple-700 font-outfit text-sm">
              {matchResult ? `${matchResult.overallMatch}% Overall` : `${job.matchPercentage || 92}% Match`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Details Body Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Job Description, Requirements, Responsibilities & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description Card */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-3 bg-white">
            <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-indigo-600" /> Requisition Overview & Description
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Key Requirements Card */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="saas-card p-6 border border-slate-200/80 space-y-3 bg-white">
              <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Candidate Requirements & Qualifications
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-relaxed font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5"></span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required & Preferred Skills Matrix */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white">
            <h3 className="text-sm font-bold font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-purple-600" /> Skills Matrix
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Required Core Stack</span>
                <div className="flex flex-wrap gap-2">
                  {(job.requiredSkills || []).map((sk, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200/80 font-bold text-xs shadow-2xs">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {job.preferredSkills && job.preferredSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Preferred / Bonus Stack</span>
                  <div className="flex flex-wrap gap-2">
                    {(job.preferredSkills || []).map((sk, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-xl bg-purple-50 text-purple-900 border border-purple-200/80 font-bold text-xs shadow-2xs">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Match Breakdown & Application Timeline */}
        <div className="space-y-6">
          {/* AI Match Breakdown Card */}
          {matchResult && (
            <div className="saas-card p-6 border border-slate-200/90 space-y-4 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xs font-bold font-outfit text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> AI Compatibility Rating
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                  {matchResult.overallMatch}% Match
                </span>
              </div>

              {matchResult.breakdown && (
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
              )}

              {matchResult.explainability?.strongMatches && (
                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">✓ Verified Matches</span>
                  <div className="flex flex-wrap gap-1">
                    {matchResult.explainability.strongMatches.map((m, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Requisition Metadata Details Card */}
          <div className="saas-card p-6 border border-slate-200/80 space-y-3 bg-white text-xs">
            <h3 className="text-xs font-bold font-outfit text-slate-950 uppercase tracking-wider border-b border-slate-100 pb-3">
              Application Details
            </h3>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Requisition ID</span>
                <span className="font-mono font-bold text-slate-900">{job.id || job._id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Company</span>
                <span className="font-bold text-slate-900">{job.company || 'CandidateIQ Enterprise'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Job Type</span>
                <span className="font-semibold text-slate-900">{job.type || 'Full-Time'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Applicants Count</span>
                <span className="font-semibold text-indigo-600">{job.applicantsCount || 18} Applicants</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Tracker Status</span>
                <span className="font-bold text-amber-700">{isTracked ? trackingStatus : 'Not Tracked'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incomplete Profile Prompt Modal */}
      {showIncompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="saas-card bg-white w-full max-w-md p-6 space-y-4 border border-slate-200 shadow-2xl rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold font-outfit text-slate-950">Complete Your Profile</h3>
                <p className="text-xs text-slate-500 font-medium">Profile information is required before applying</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your profile is currently missing key skills or education details. Complete your resume profile before applying to improve your application quality and AI compatibility match score.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleApply(true)}
                className="btn-secondary text-xs px-4 py-2 font-bold"
              >
                Apply Anyway
              </button>
              <button
                onClick={() => {
                  setShowIncompleteModal(false);
                  if (onNavigate) onNavigate('profile');
                }}
                className="btn-primary text-xs px-4 py-2 font-bold"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailsView;
