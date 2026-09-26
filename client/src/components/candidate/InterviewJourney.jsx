import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Sparkles, Brain, CheckCircle2, Clock, AlertCircle, HelpCircle, ArrowRight,
  TrendingUp, FileText, Zap, RotateCcw, Eye, ChevronRight, MessageSquare, Bot,
  Award, ShieldCheck, Heart, User, Check, RefreshCw, Play, X, Calendar
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

function InterviewJourney({ onLaunchTargetedInterview, onNavigate }) {
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal / Drawer state for viewing question-by-question interview details
  const [selectedInterviewForDetail, setSelectedInterviewForDetail] = useState(null);

  useEffect(() => {
    fetchInterviewJourney();
  }, []);

  const fetchInterviewJourney = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/candidates/me/interview-journey');
      if (res.data && res.data.data) {
        setJourneyData(res.data.data);
      } else {
        throw new Error('Interview journey format invalid');
      }
    } catch (err) {
      console.error('[InterviewJourney] Error loading interview journey:', err);
      setError('Unable to load your interview journey records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto animate-pulse">
        <div className="saas-card p-6 md:p-8 h-32 bg-slate-100 rounded-2xl"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="saas-card p-6 h-40 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 saas-card">
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold font-outfit text-slate-950">{error}</h3>
        <p className="text-xs text-slate-500">Please check your database connection or refresh your session.</p>
        <button
          onClick={fetchInterviewJourney}
          className="btn-ai text-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Loading Journey
        </button>
      </div>
    );
  }

  const interviews = journeyData?.interviews || [];
  const metrics = journeyData?.summaryMetrics || {};
  const trend = journeyData?.performanceTrend || {};

  const getStatusPill = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">✓ COMPLETED</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">🟡 IN PROGRESS</span>;
      case 'generating':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">⚙ GENERATING</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">⚪ READY</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Top Welcome Header Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">My Interview Journey</h2>
            <span className="badge-pill badge-ai text-[10px]">
              <Sparkles className="w-3 h-3 text-indigo-600" /> Stored Database Records
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Chronological log of AI mock sessions and recruiter interviews with question-level evaluations and competency progression.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate && onNavigate('interview')}
            className="btn-ai text-xs flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Practice New AI Interview
          </button>
        </div>
      </div>

      {/* Summary Metrics & Progression Trend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="saas-card p-5 border border-slate-200/80 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Attempts</span>
          <div className="text-3xl font-black font-outfit text-slate-950">{metrics.totalAttempts || 0}</div>
          <span className="text-[11px] text-slate-500">{metrics.completedCount || 0} Completed & Evaluated</span>
        </div>

        <div className="saas-card p-5 border border-slate-200/80 space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Overall Score</span>
          <div className="text-3xl font-black font-outfit text-indigo-600">{metrics.averageOverallScore || 0} / 100</div>
          <span className="text-[11px] text-slate-500">Avg Tech: {metrics.averageTechnicalScore || 0} / 100</span>
        </div>

        {/* Performance Trend Card */}
        <div className="saas-card p-5 border border-slate-200/80 space-y-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Performance Progression</span>
          {trend.hasTrend ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-4 h-4" /> {trend.trendMessage}
              </div>
              <div className="h-12 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend.dataPoints}>
                    <Line type="monotone" dataKey="overallScore" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              {trend.trendMessage}
            </p>
          )}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" /> Stored Interview Attempts
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Showing {interviews.length} session records
          </span>
        </div>

        {interviews.length === 0 ? (
          <div className="saas-card p-12 text-center space-y-4 border border-slate-200/80 my-4">
            <Brain className="w-12 h-12 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold font-outfit text-slate-950">No completed interviews yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Complete your first AI mock interview to start building your interview journey analytics and evidence matrix.
              </p>
            </div>
            <button
              onClick={() => onNavigate && onNavigate('interview')}
              className="btn-ai text-xs inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Start First Mock Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {interviews.map((inv) => (
              <div
                key={inv.interviewId}
                className="saas-card p-6 border border-slate-200/80 hover:border-indigo-300 transition-all space-y-4 bg-white hover:shadow-md"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="text-base font-bold font-outfit text-slate-950">{inv.title}</h4>
                      {getStatusPill(inv.status)}
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {inv.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Date: {new Date(inv.startedAt || inv.completedAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })} • {inv.answeredCount} of {inv.questionCount} Questions Answered
                    </p>
                  </div>

                  {inv.scores?.overallScore > 0 && (
                    <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall</span>
                        <span className="text-xl font-black font-outfit text-indigo-600">{inv.scores.overallScore}</span>
                      </div>
                      <div className="h-6 w-[1px] bg-slate-200"></div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Technical</span>
                        <span className="text-lg font-bold font-outfit text-purple-600">{inv.scores.technicalScore}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Demonstrated Skills Chips */}
                {inv.skillsDemonstrated && inv.skillsDemonstrated.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Demonstrated Skills:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {inv.skillsDemonstrated.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
                  <span className="text-slate-400 text-[11px]">Category: {inv.interviewCategory} • Type: {inv.interviewType}</span>
                  <button
                    onClick={() => setSelectedInterviewForDetail(inv)}
                    className="btn-outline py-1.5 px-3 text-xs inline-flex items-center gap-1.5 text-indigo-600 font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Question Breakdown ({inv.questionPerformance?.length || 0})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Question-by-Question Evaluation Modal */}
      {selectedInterviewForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/60">
              <div>
                <h3 className="text-lg font-bold font-outfit text-slate-950">{selectedInterviewForDetail.title}</h3>
                <p className="text-xs text-slate-500">Question-by-Question Evaluation Breakdown</p>
              </div>
              <button
                onClick={() => setSelectedInterviewForDetail(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {selectedInterviewForDetail.questionPerformance?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No recorded question evaluations for this interview.</p>
              ) : (
                selectedInterviewForDetail.questionPerformance.map((q, idx) => (
                  <div key={q.questionId || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Question {idx + 1} ({q.answerType})</span>
                        <h5 className="text-xs font-bold text-slate-900">{q.questionText}</h5>
                      </div>
                      {q.score !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-xs shrink-0">
                          {q.score} / 10
                        </span>
                      )}
                    </div>

                    {q.candidateResponse && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Candidate Response / Transcript:</span>
                        <p className="italic">{q.candidateResponse}</p>
                      </div>
                    )}

                    {q.feedback && (
                      <div className="p-2.5 rounded-lg bg-purple-50/60 border border-purple-100 text-xs text-purple-900">
                        <span className="text-[10px] font-bold text-purple-700 uppercase block mb-0.5">AI Evaluation Feedback:</span>
                        <p>{q.feedback}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedInterviewForDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewJourney;
