import React from 'react';
import { Award, CheckCircle2, TrendingUp, Sparkles, MessageSquare, AlertCircle, FileText, Check, ShieldCheck, Download } from 'lucide-react';

function InterviewResults({ report }) {
  const data = report?.overallEvaluation || {
    overallInterviewScore: 87,
    technicalProficiency: 90,
    behaviouralCompetency: 82,
    communicationClarity: 85,
    summaryExplanation: 'Candidate scored 87/100 in AI Mock Interview (90% technical proficiency, 82% behavioural competency). Demonstrated exceptional domain depth in React state architecture and Node.js REST API design with structured reasoning.',
    topStrengths: ['Structured answer formulation and STAR methodology', 'React Context & Hooks optimization clarity', 'Direct problem-solving focus during technical questions'],
    recommendedImprovementAreas: ['Elaborate on production deployment scale and server latency metrics', 'Include explicit AWS/Docker container management examples']
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">AI Interview Scorecard & Feedback Report</h2>
            <span className="badge-pill badge-success text-[10px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Evaluation Generated
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Multi-dimensional evaluation results across technical accuracy, communication, and STAR framework.</p>
        </div>

        <div className="text-right p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 min-w-[170px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interview Score</span>
          <span className="text-3xl font-black font-outfit text-slate-950">87 <span className="text-xs font-semibold text-slate-400">/ 100</span></span>
        </div>
      </div>

      {/* Main Scorecard Overview */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/80 space-y-6 bg-white shadow-sm">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Overall AI Rating</span>
            <h3 className="text-3xl font-black font-outfit text-slate-950 mt-1">{data.overallInterviewScore} / 100</h3>
            <span className="text-[10px] text-indigo-600 font-bold block mt-1">High Readiness</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Technical Accuracy</span>
            <h3 className="text-3xl font-black font-outfit text-indigo-600 mt-1">{data.technicalProficiency}%</h3>
            <span className="text-[10px] text-indigo-600 font-bold block mt-1">Top 5% MERN</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Behavioural Index</span>
            <h3 className="text-3xl font-black font-outfit text-purple-600 mt-1">{data.behaviouralCompetency}%</h3>
            <span className="text-[10px] text-slate-500 font-medium block mt-1">STAR Structured</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Communication Clarity</span>
            <h3 className="text-3xl font-black font-outfit text-emerald-600 mt-1">{data.communicationClarity}%</h3>
            <span className="text-[10px] text-emerald-600 font-bold block mt-1">Fluent & Concise</span>
          </div>
        </div>

        {/* AI Feedback Summary Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border border-indigo-200/80 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-bold text-slate-950 uppercase tracking-wider text-xs font-outfit">AI Feedback Summary Explanation:</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{data.summaryExplanation}</p>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Evaluated Strengths
            </h4>
            <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              {(data.topStrengths || []).map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
              <AlertCircle className="w-4 h-4 text-amber-600" /> Recommended Action Areas
            </h4>
            <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              {(data.recommendedImprovementAreas || []).map((a, idx) => (
                <li key={idx}>{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewResults;
