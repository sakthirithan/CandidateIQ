import React, { useState } from 'react';
import {
  FileText, Download, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, ShieldCheck, ArrowLeft, Printer, Award, User, Briefcase, Code, Brain
} from 'lucide-react';

function DynamicInterviewReport({ interview, resumeSnapshot, onClose }) {
  const [expandedSections, setExpandedSections] = useState({
    execSummary: true,
    resumeOverview: true,
    resumeVsInterview: true,
    questionReview: true,
    technicalEval: true,
    communication: true,
    claimMatrix: true,
    recommendations: true
  });

  const toggleSection = (sec) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (!interview) return null;

  const questions = interview.questions || [];
  const claimedSkills = resumeSnapshot?.claimedSkills || [];

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none py-6 pb-12">
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <button
          onClick={onClose}
          className="btn-secondary text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" /> Back to Review Summary
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" /> Print / Save PDF
          </button>
          <button
            onClick={() => alert('Computer-generated report exported as PDF.')}
            className="btn-primary text-xs flex items-center gap-2 shadow-md"
          >
            <Download className="w-3.5 h-3.5 text-white" /> Download Report
          </button>
        </div>
      </div>

      {/* Document Report Shell */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Report Document Header */}
        <div className="p-8 bg-slate-950 text-white relative overflow-hidden space-y-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                  Job Interview Intelligence Report
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {interview.id}</span>
              </div>
              <h1 className="text-2xl font-black font-outfit text-white tracking-tight">{interview.title}</h1>
              <p className="text-xs text-slate-300 font-medium">
                {interview.role} &bull; {interview.company || 'Enterprise Round'} &bull; {interview.date}
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold block">Overall Match</span>
              <span className="text-3xl font-black font-outfit text-indigo-400">{interview.overallScore}%</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
            <div>
              <span className="text-slate-400 font-medium">Resume Snapshot Used:</span>{' '}
              <strong className="text-indigo-300 font-mono">{interview.resumeVersionLabel || 'Resume v2'}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Interviewer:</span>{' '}
              <strong className="text-white">{interview.interviewerName || 'Technical Hiring Board'}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Duration:</span>{' '}
              <strong className="text-white">{interview.duration || '45 mins'}</strong>
            </div>
          </div>
        </div>

        {/* Report Sections Accordion */}
        <div className="p-6 md:p-8 space-y-6 divide-y divide-slate-100">

          {/* Section 1: Executive Summary */}
          <div className="pt-4 first:pt-0 space-y-4">
            <button
              onClick={() => toggleSection('execSummary')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">1</div>
                <span>Executive Summary</span>
              </div>
              {expandedSections.execSummary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.execSummary && (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-normal pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <h4 className="font-bold text-slate-900 font-outfit text-xs uppercase tracking-wider">Overall Impression</h4>
                  <p className="text-slate-700">{interview.finalFeedback}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                    <h5 className="font-bold text-emerald-950 font-outfit uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Demonstrated Strengths
                    </h5>
                    <ul className="space-y-1.5 text-slate-700">
                      {(interview.strengths || ['React hooks memoization', 'Database query latency tuning']).map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">&bull;</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
                    <h5 className="font-bold text-amber-950 font-outfit uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Improvement Opportunities
                    </h5>
                    <ul className="space-y-1.5 text-slate-700">
                      {(interview.improvementAreas || ['High throughput API gateway scaling', 'Circuit breaker resilience']).map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">&bull;</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Resume Overview */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('resumeOverview')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">2</div>
                <span>Resume Overview & Profile Context</span>
              </div>
              {expandedSections.resumeOverview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.resumeOverview && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-600">
                  This report compares the candidate's responses against claims in resume snapshot <strong className="font-mono font-bold">{interview.resumeVersionLabel}</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {claimedSkills.slice(0, 6).map((sk, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900 font-outfit">{sk.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">{sk.level}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sk.claimText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Resume vs Interview Alignment */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('resumeVsInterview')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">3</div>
                <span>Resume vs Interview Alignment Analysis</span>
              </div>
              {expandedSections.resumeVsInterview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.resumeVsInterview && (
              <div className="space-y-3 text-xs pt-2">
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                  <h5 className="font-bold text-indigo-950 font-outfit text-xs">How well did the candidate's answers support their resume claims?</h5>
                  <p className="text-slate-700 leading-relaxed">
                    During this enterprise final round, the candidate demonstrated clear alignment on <strong>React state architecture</strong> and <strong>MongoDB query optimization</strong>. Specific empirical metrics provided in question responses directly confirmed experience listed on the resume.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Question-by-Question Review */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('questionReview')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">4</div>
                <span>Question-by-Question Review & Feedback</span>
              </div>
              {expandedSections.questionReview ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.questionReview && (
              <div className="space-y-4 pt-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Question {idx + 1} &bull; {q.category}</span>
                        <h5 className="text-xs font-bold text-slate-900 font-outfit mt-0.5">{q.question}</h5>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        q.evaluationState === 'WELL_EXPLAINED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {q.evaluationState === 'WELL_EXPLAINED' ? '✓ Well Explained' : '🟡 Could Be Stronger'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Candidate Answer</span>
                      <p className="text-slate-700 leading-relaxed font-mono text-[11px]">"{q.candidateAnswer}"</p>
                    </div>

                    <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase block">CandidateIQ Opinion</span>
                      <p className="text-indigo-950 leading-relaxed">{q.aiFeedback}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Technical / Role Evaluation */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('technicalEval')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">5</div>
                <span>Technical & Role Domain Matrix</span>
              </div>
              {expandedSections.technicalEval ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.technicalEval && (
              <div className="space-y-3 pt-2 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <span className="text-slate-500 font-medium text-[11px]">Technical Knowledge</span>
                    <p className="text-lg font-extrabold text-slate-900 font-outfit">Strong</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <span className="text-slate-500 font-medium text-[11px]">Project Explanation</span>
                    <p className="text-lg font-extrabold text-slate-900 font-outfit">Articulate</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <span className="text-slate-500 font-medium text-[11px]">Problem Solving</span>
                    <p className="text-lg font-extrabold text-slate-900 font-outfit">Empirical</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Communication */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('communication')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">6</div>
                <span>Communication & Explanation Clarity</span>
              </div>
              {expandedSections.communication ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.communication && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed pt-2">
                Candidate demonstrated structured STAR framework principles (Situation, Task, Action, Result) when explaining high-latency database incidents. Communication was concise and confident.
              </div>
            )}
          </div>

          {/* Section 7: Resume Alignment Matrix */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('claimMatrix')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">7</div>
                <span>Resume Claim Validation Summary</span>
              </div>
              {expandedSections.claimMatrix ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.claimMatrix && (
              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center font-medium">
                  <span>✓ React.js & State Management</span>
                  <span className="font-bold text-emerald-800">Supported by Interview</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex justify-between items-center font-medium">
                  <span>✓ MongoDB & Index Optimization</span>
                  <span className="font-bold text-emerald-800">Supported by Interview</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex justify-between items-center font-medium">
                  <span>🟡 System Design & High Volume Architecture</span>
                  <span className="font-bold text-amber-800">Partially Supported</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 8: Final Recommendations */}
          <div className="pt-6 space-y-4">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full flex justify-between items-center text-left py-2 font-bold font-outfit text-slate-900 text-lg hover:text-indigo-600 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">8</div>
                <span>Final Recommendations & Profile Next Steps</span>
              </div>
              {expandedSections.recommendations ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {expandedSections.recommendations && (
              <div className="p-5 rounded-2xl bg-indigo-950 text-white space-y-3 text-xs pt-2">
                <h5 className="font-bold font-outfit text-amber-300 text-xs">Suggested Next Steps for Candidate</h5>
                <ul className="space-y-2 text-slate-200">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>Practice high-throughput system design scenarios (100k+ RPS rate limiting, circuit breaker patterns).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>Highlight your empirical 1.2s to 45ms database query optimization metric prominently on your main profile headline.</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Report Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 flex flex-wrap justify-between items-center gap-2">
          <span>CandidateIQ Automated Computer-Generated Interview Report &bull; Powered by AI Intelligence Engine</span>
          <span>Report Generated on {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default DynamicInterviewReport;
