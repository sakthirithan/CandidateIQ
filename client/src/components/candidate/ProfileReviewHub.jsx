import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Sparkles, Award, ArrowRight, GitCompare, Plus, CheckCircle2,
  AlertCircle, HelpCircle, Briefcase, Calendar, Clock, ChevronRight, FilePlus,
  Play, RefreshCw, AlertTriangle, Eye, ShieldCheck, UserCheck
} from 'lucide-react';
import { getMockInterviewAttempts, storageInterviews } from '../../services/storage/storageService';
import { evidenceIntelligenceService } from '../../services/mockApi/evidenceIntelligenceService';
import InterviewReviewDetail from './InterviewReviewDetail';
import InterviewComparisonPage from './InterviewComparisonPage';
import ExternalFeedbackModal from './ExternalFeedbackModal';

function ProfileReviewHub({ onNavigateToMockInterview, initialInterviewId = null, initialView = 'list' }) {
  const navigate = useNavigate();
  const { interviewId: urlInterviewId } = useParams();
  const activeInterviewId = urlInterviewId || initialInterviewId;

  // Active Tab: 'mock' (Mock Interview) | 'job' (Job Interviews)
  const [activeTab, setActiveTab] = useState('mock');

  // Independent Data & Loading States
  const [mockAttempts, setMockAttempts] = useState([]);
  const [jobInterviews, setJobInterviews] = useState([]);
  const [mockLoading, setMockLoading] = useState(true);
  const [jobLoading, setJobLoading] = useState(true);
  const [mockError, setMockError] = useState(null);
  const [jobError, setJobError] = useState(null);

  const [selectedInterviewId, setSelectedInterviewId] = useState(activeInterviewId);
  const [currentView, setCurrentView] = useState(initialView); // 'list' | 'compare'
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [targetInterviewForFeedback, setTargetInterviewForFeedback] = useState(null);

  useEffect(() => {
    loadMockAttemptsData();
    loadJobInterviewsData();
  }, []);

  useEffect(() => {
    if (activeInterviewId) {
      setSelectedInterviewId(activeInterviewId);
    }
  }, [activeInterviewId]);

  // Load Mock Interview Attempts from central storage source of truth
  const loadMockAttemptsData = async () => {
    try {
      setMockLoading(true);
      setMockError(null);
      await new Promise((r) => setTimeout(r, 120));
      const attempts = getMockInterviewAttempts();
      setMockAttempts(attempts || []);
    } catch (err) {
      console.error('Error loading mock attempts for Profile Review:', err);
      setMockError('Unable to load mock interview history.');
    } finally {
      setMockLoading(false);
    }
  };

  // Load Actual Job Interviews attended from recruitment interview storage source of truth
  const loadJobInterviewsData = async () => {
    try {
      setJobLoading(true);
      setJobError(null);
      await new Promise((r) => setTimeout(r, 150));
      const actualList = await evidenceIntelligenceService.getInterviewRecords('cand_1', 'FINAL');
      const recruiterInterviews = storageInterviews.getByCandidateId('cand_1');

      // Combine actual recruitment interviews (strictly filtering out mock attempts)
      const combined = [...actualList];
      recruiterInterviews.forEach((rec) => {
        if (!combined.some((item) => item.id === rec.id)) {
          combined.push({
            id: rec.id,
            type: 'FINAL',
            title: rec.title || `${rec.jobTitle || 'Role'} — ${rec.interviewType || 'Job Interview'}`,
            jobTitle: rec.jobTitle,
            role: rec.jobTitle,
            company: rec.company,
            date: rec.scheduledDate || '2026-09-20',
            status: rec.status || 'Attended',
            interviewer: rec.interviewer || 'Hiring Panel',
            overallScore: 88,
            finalFeedback: rec.instructions || 'Technical system design evaluation and candidate alignment review.'
          });
        }
      });

      setJobInterviews(combined);
    } catch (err) {
      console.error('Error loading job interviews for Profile Review:', err);
      setJobError('Unable to load job interview history.');
    } finally {
      setJobLoading(false);
    }
  };

  const handleOpenUploadFeedback = (interviewRecord) => {
    setTargetInterviewForFeedback(interviewRecord || jobInterviews[0]);
    setIsFeedbackModalOpen(true);
  };

  // Dedicated Comparison Page View
  if (currentView === 'compare') {
    return (
      <InterviewComparisonPage
        defaultType={activeTab === 'mock' ? 'MOCK' : 'FINAL'}
        onBack={() => setCurrentView('list')}
      />
    );
  }

  // Dedicated Detailed Review View
  if (selectedInterviewId) {
    return (
      <InterviewReviewDetail
        interviewId={selectedInterviewId}
        onBack={() => setSelectedInterviewId(null)}
        onOpenUploadFeedback={handleOpenUploadFeedback}
      />
    );
  }

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none animate-fadeIn py-6 font-sans">
      
      {/* TOP NAVIGATION & PRIMARY SECTION TABS */}
      <div className="flex justify-between items-center relative border-b border-slate-200/80 pb-4">
        {/* Left spacer for symmetry */}
        <div className="w-24 hidden md:block" />

        {/* Center: Primary Tabs (Mock Interview vs Job Interviews) */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200/80 shadow-xs max-w-md w-full mx-auto md:mx-0">
          <button
            type="button"
            onClick={() => setActiveTab('mock')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold font-outfit transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'mock'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Mock Interview ({mockAttempts.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('job')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold font-outfit transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'job'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-purple-400" /> Job Interviews ({jobInterviews.length})
          </button>
        </div>

        {/* Top-Right Action Controls */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              type="button"
              onClick={() => setCurrentView('compare')}
              aria-label="Compare two interviews"
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-950 text-slate-700 hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-12 hidden group-hover:block z-30 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap shadow-xl border border-slate-800">
              Compare interviews
            </div>
          </div>

          <div className="relative group">
            <button
              type="button"
              onClick={() => handleOpenUploadFeedback(null)}
              aria-label="Upload interviewer feedback report"
              className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white border border-indigo-200 flex items-center justify-center transition-all shadow-xs cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-12 hidden group-hover:block z-30 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] font-bold whitespace-nowrap shadow-xl border border-slate-800">
              Upload interviewer feedback report
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: MOCK INTERVIEW ATTEMPTS */}
      {activeTab === 'mock' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black font-outfit text-slate-950">AI Mock Interview History</h2>
              <p className="text-xs text-slate-500 font-medium">Complete record of your practice mock interview attempts & CandidateIQ reviews.</p>
            </div>

            {onNavigateToMockInterview && (
              <button
                type="button"
                onClick={onNavigateToMockInterview}
                className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer font-bold font-outfit"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Start Mock Interview
              </button>
            )}
          </div>

          {mockLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Loading Mock Interview history...</p>
            </div>
          ) : mockError ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 max-w-md mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-900">{mockError}</p>
              <button
                type="button"
                onClick={loadMockAttemptsData}
                className="btn-secondary text-xs px-4 py-1.5 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : mockAttempts.length === 0 ? (
            /* NO MOCK ATTEMPTS EMPTY STATE */
            <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-950 font-outfit">
                  No Mock Interviews Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Practice your interview skills with AI Mock Interview.
                </p>
              </div>
              {onNavigateToMockInterview && (
                <button
                  type="button"
                  onClick={onNavigateToMockInterview}
                  className="btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2 shadow-md cursor-pointer font-bold font-outfit"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" /> Start Mock Interview
                </button>
              )}
            </div>
          ) : (
            /* MOCK ATTEMPTS CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mockAttempts.map((att) => {
                const attId = att.attemptId || att.id || att.sessionId;
                const isCompleted = att.status === 'completed' || att.status === 'Completed' || att.state === 'Completed';
                const totalQ = att.questions?.length || 10;
                const ansQ = att.answers?.length || (att.result?.answeredCount || 0);
                const unansQ = totalQ - ansQ;
                const isCustom = att.source === 'CUSTOM_JD' || att.jobId === 'custom' || !att.jobId;
                const hasReview = att.candidateIQ && att.candidateIQ.status === 'COMPLETED';

                return (
                  <div
                    key={attId}
                    className="saas-card p-6 border border-slate-200 bg-white rounded-2xl space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                            isCustom ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                          }`}>
                            {isCustom ? 'Custom JD Source' : 'Recruiter Job Source'}
                          </span>
                          <h4 className="text-lg font-bold font-outfit text-slate-950 mt-1">{att.jobTitle || att.title}</h4>
                          <p className="text-xs text-slate-500 font-semibold">{att.company || 'CandidateIQ Requisition'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                          isCompleted ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <div><strong className="text-slate-900">Difficulty:</strong> {att.difficulty || 'Medium'}</div>
                        <div><strong className="text-slate-900">Method:</strong> {att.method || 'RANDOM'}</div>
                        <div><strong className="text-slate-900">Questions:</strong> {totalQ} Qs</div>
                        <div><strong className="text-slate-900">Answered:</strong> {ansQ} / {totalQ}</div>
                        <div><strong className="text-slate-900">Not Answered:</strong> {unansQ}</div>
                        <div><strong className="text-slate-900">Date:</strong> {att.startedAt ? att.startedAt.split('T')[0] : 'Sep 10, 2026'}</div>
                      </div>

                      {/* CandidateIQ Review Status Banner */}
                      <div className={`p-2.5 rounded-xl text-[11px] font-bold border flex justify-between items-center ${
                        hasReview
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-800 border-indigo-100'
                      }`}>
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> CandidateIQ Status
                        </span>
                        <span>{hasReview ? 'Review Ready' : 'Review Pending'}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-mono">ID: {attId}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedInterviewId(attId)}
                        className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: JOB INTERVIEWS (ACTUAL RECRUITMENT INTERVIEWS) */}
      {activeTab === 'job' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black font-outfit text-slate-950">Actual Job Interviews History</h2>
              <p className="text-xs text-slate-500 font-medium">Record of recruitment interviews scheduled and attended with enterprise employers.</p>
            </div>
          </div>

          {jobLoading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Loading Job Interviews history...</p>
            </div>
          ) : jobError ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3 max-w-md mx-auto">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <p className="text-xs font-bold text-rose-900">{jobError}</p>
              <button
                type="button"
                onClick={loadJobInterviewsData}
                className="btn-secondary text-xs px-4 py-1.5 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : jobInterviews.length === 0 ? (
            /* NO JOB INTERVIEWS EMPTY STATE */
            <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center border border-purple-100">
                <Award className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-950 font-outfit">
                  No Job Interviews Yet
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  Your attended recruitment interviews will appear here.
                </p>
              </div>
            </div>
          ) : (
            /* JOB INTERVIEW CARDS GRID */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {jobInterviews.map((jobInt) => (
                <div
                  key={jobInt.id}
                  className="saas-card p-6 border border-slate-200 bg-white rounded-2xl space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-800 border border-purple-200">
                          Recruitment Job Interview
                        </span>
                        <h4 className="text-lg font-bold font-outfit text-slate-950 mt-1">{jobInt.jobTitle || jobInt.title}</h4>
                        <p className="text-xs font-semibold text-slate-600">{jobInt.company || 'Enterprise Partner'}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {jobInt.status || 'Attended'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                      <div><strong className="text-slate-900">Round:</strong> {jobInt.interviewType || 'Technical Round'}</div>
                      <div><strong className="text-slate-900">Interviewer:</strong> {jobInt.interviewer || 'Hiring Manager'}</div>
                      <div><strong className="text-slate-900">Date:</strong> {jobInt.date || jobInt.scheduledDate || 'Sep 20, 2026'}</div>
                      <div><strong className="text-slate-900">Score:</strong> {jobInt.overallScore || 88}%</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-mono">Record ID: {jobInt.id}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedInterviewId(jobInt.id)}
                      className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" /> View Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* External Feedback Upload Modal */}
      <ExternalFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        targetInterview={targetInterviewForFeedback}
        onFeedbackUploaded={() => loadJobInterviewsData()}
      />
    </div>
  );
}

export default ProfileReviewHub;
