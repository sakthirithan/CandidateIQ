import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApplicationService } from '../../services/mockApi/applicationService';
import { subscribeToStorage, storageInterviews } from '../../services/storage/storageService';
import {
  Award, Calendar, Clock, Video, FileText, CheckCircle2, User, Building, ExternalLink, AlertCircle, XCircle, Play
} from 'lucide-react';

export default function CandidateHRInterviews() {
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('job'); // 'job' | 'hr'
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    loadInterviews();

    // Subscribe to real-time storage updates (both same-tab and cross-tab)
    const unsubscribe = subscribeToStorage((detail) => {
      if (!detail || detail.entity === 'interview' || detail.entity === 'application') {
        loadInterviews();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const list = await mockApplicationService.getHRInterviewsForCandidate('cand_1');
      setInterviews(list || []);
    } catch (err) {
      console.error('Error loading interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter based on active subtab
  const jobInterviews = interviews.filter((i) => i.type === 'FINAL' || i.type === 'JOB');
  const hrInterviews = interviews.filter((i) => i.type === 'HR' || (!i.type && i.id.startsWith('hr')));
  const currentList = activeSubTab === 'job' ? jobInterviews : hrInterviews;

  // Helper to determine interview window status (Scheduled, Available, Closed, Completed)
  const getInterviewAvailability = (inv) => {
    const candidateId = 'cand_1';
    const candidateAttempt = (inv.candidateAttempts || []).find(a => a.candidateId === candidateId);
    if (candidateAttempt && candidateAttempt.status === 'COMPLETED') {
      return { status: 'COMPLETED', label: 'Completed', color: 'emerald', canJoin: false };
    }
    if (inv.status === 'Cancelled') {
      return { status: 'CANCELLED', label: 'Cancelled', color: 'rose', canJoin: false };
    }

    let startMs = 0;
    let endMs = 0;

    if (inv.startDateTime || inv.startTimeISO) {
      startMs = new Date(inv.startDateTime || inv.startTimeISO).getTime();
    }
    if (inv.endDateTime || inv.endTimeISO) {
      endMs = new Date(inv.endDateTime || inv.endTimeISO).getTime();
    }

    // Fallback parsing if ISO timestamps are not directly attached
    if (!startMs) {
      const dateStr = inv.scheduledDate || inv.interviewDate || new Date().toISOString().split('T')[0];
      const timeStr = inv.scheduledTime || inv.startTime || '10:00';
      let [hStr, mStr] = timeStr.split(':');
      let hours = parseInt(hStr || '10', 10);
      let minutes = parseInt((mStr || '00').split(' ')[0], 10);
      if (timeStr.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (timeStr.toLowerCase().includes('am') && hours === 12) hours = 0;
      const start = new Date(dateStr);
      start.setHours(hours, minutes, 0, 0);
      startMs = start.getTime();
    }

    if (!endMs) {
      let durMs = (inv.scheduleDurationMinutes ? inv.scheduleDurationMinutes * 60 : 2 * 3600) * 1000;
      if (inv.duration && !inv.scheduleDurationMinutes) {
        const numMatch = inv.duration.match(/(\d+)/);
        if (numMatch) {
          const num = parseInt(numMatch[1], 10);
          durMs = inv.duration.toLowerCase().includes('hour') ? num * 3600 * 1000 : num * 60 * 1000;
        }
      }
      endMs = startMs + durMs;
    }

    const startDate = new Date(startMs);
    const endDate = new Date(endMs);
    const now = Date.now();

    const startTimeFormatted = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (now < startMs) {
      return {
        status: 'SCHEDULED',
        label: `Scheduled (Available at ${startTimeFormatted})`,
        color: 'amber',
        canJoin: false,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted
      };
    } else if (now >= startMs && now < endMs) {
      return {
        status: 'AVAILABLE',
        label: 'Interview Available',
        color: 'purple',
        canJoin: true,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted
      };
    } else {
      return {
        status: 'CLOSED',
        label: 'Interview Window Closed',
        color: 'slate',
        canJoin: false,
        startTimeStr: startTimeFormatted,
        endTimeStr: endTimeFormatted
      };
    }
  };

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-6 select-none animate-fadeIn py-6 font-sans">
      {/* Top Header & Tab Controls Container */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-5 shadow-xs rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-600/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold font-outfit text-slate-950">Official Recruiter Assigned Interviews</h1>
                <span className="badge-pill bg-purple-100 text-purple-800 border-purple-200 text-[10px] font-bold">
                  Recruiter Assigned
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Official interview assessments scheduled by recruiters following candidate shortlisting.
              </p>
            </div>
          </div>

          {/* Primary Top Center Tabs: Job Interview | HR Interview */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveSubTab('job')}
              className={`px-5 py-2 rounded-lg text-xs font-extrabold font-outfit transition-all cursor-pointer ${
                activeSubTab === 'job'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60 ring-2 ring-purple-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Job Interview ({jobInterviews.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('hr')}
              className={`px-5 py-2 rounded-lg text-xs font-extrabold font-outfit transition-all cursor-pointer ${
                activeSubTab === 'hr'
                  ? 'bg-white text-purple-700 shadow-xs border border-slate-200/60 ring-2 ring-purple-500/10'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HR Interview ({hrInterviews.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 mt-2 font-medium">Loading assigned interviews...</p>
        </div>
      ) : currentList.length === 0 ? (
        /* Empty State */
        <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center border border-purple-100">
            <Award className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-950 font-outfit">
              No {activeSubTab === 'job' ? 'Job' : 'HR'} Interviews Scheduled Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Recruiter-assigned {activeSubTab === 'job' ? 'Job' : 'HR'} interviews will automatically appear here once scheduled by the hiring team.
            </p>
          </div>
        </div>
      ) : (
        /* Interview List Cards */
        <div className="w-full space-y-5">
          {currentList.map((inv) => {
            const avail = getInterviewAvailability(inv);
            const isJobType = inv.type === 'FINAL' || inv.type === 'JOB';

            return (
              <div
                key={inv.id}
                className={`saas-card p-6 md:p-8 border bg-white space-y-5 rounded-2xl shadow-xs transition-all ${
                  avail.status === 'CANCELLED' ? 'border-rose-200 opacity-80' : 'border-slate-200/90 hover:border-purple-300'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isJobType
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-purple-100 text-purple-800 border border-purple-200'
                      }`}>
                        {isJobType ? 'Job Interview' : 'HR Round'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">&bull; Scheduled for {inv.scheduledDate}</span>
                    </div>
                    <h3 className="text-xl font-black font-outfit text-slate-950">{inv.title}</h3>
                    <p className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500" /> {inv.company} &bull; Requisition: {inv.jobTitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      avail.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : avail.color === 'purple'
                        ? 'bg-purple-50 text-purple-800 border border-purple-200 animate-pulse'
                        : avail.color === 'amber'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {avail.label}
                    </span>
                  </div>
                </div>

                {/* Session Meta Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Interview Window
                    </span>
                    <span className="font-extrabold text-slate-900 block">
                      {inv.scheduledDate} &bull; {inv.scheduledTime} – {avail.endTimeStr || '12:00 PM'}
                    </span>
                    <span className="text-slate-500 block text-[11px]">Timezone: IST (UTC+5:30) &bull; Duration: {inv.duration || '2 Hours'}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-purple-500" /> Question Bank & Prompt
                    </span>
                    <span className="font-extrabold text-slate-900 block">
                      Questions: {inv.questionBankSnapshot?.questions?.length || 3} Evaluatable Items
                    </span>
                    <span className="text-slate-500 block text-[11px]">HR Evaluation Criteria Snapshotted</span>
                  </div>

                  <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block flex items-center gap-1">
                      <Video className="w-3.5 h-3.5 text-purple-500" /> Virtual Test Room
                    </span>
                    <span className="font-extrabold text-purple-950 block truncate">
                      {avail.canJoin ? 'Room Active — Ready to Enter' : 'Room Locked Until Start Time'}
                    </span>
                    <span className="text-purple-800 block text-[11px]">MCQ, Text & Voice Submissions</span>
                  </div>
                </div>

                {/* Concise 25-30 Word Description */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 font-outfit block">Candidate Assessment Overview:</span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    "{inv.instructions || 'Answer recruiter questions accurately within the scheduled window. Evaluated against HR reference answers and scoring prompt.'}"
                  </p>
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Requisition ID: {inv.jobId || 'job_1'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedInterview(inv)}
                      className="btn-secondary text-xs py-2 px-4 font-bold cursor-pointer"
                    >
                      View Details
                    </button>

                    {/* Join Job Interview Action Button - Dedicated Route Navigation */}
                    {avail.canJoin ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/job-interview/${inv.id}/instructions`)}
                        className="btn-primary bg-purple-600 hover:bg-purple-500 text-xs py-2 px-5 font-bold flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-white" /> Join Job Interview
                      </button>
                    ) : avail.status === 'COMPLETED' ? (
                      <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Interview Submitted
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
                      >
                        Interview Not Available Yet
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="saas-card p-6 border border-slate-200 bg-white max-w-lg w-full rounded-2xl shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold font-outfit text-slate-950">{selectedInterview.title}</h3>
              <button onClick={() => setSelectedInterview(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <p><strong>Employer:</strong> {selectedInterview.company}</p>
              <p><strong>Round Type:</strong> {selectedInterview.type === 'FINAL' || selectedInterview.type === 'JOB' ? 'Job Interview' : 'HR Interview'}</p>
              <p><strong>Scheduled Time:</strong> {selectedInterview.scheduledDate} at {selectedInterview.scheduledTime}</p>
              <p><strong>Assigned Interviewer:</strong> {selectedInterview.interviewer}</p>
              <p><strong>Instructions:</strong> {selectedInterview.instructions}</p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button onClick={() => setSelectedInterview(null)} className="btn-primary text-xs px-5 py-2 font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
