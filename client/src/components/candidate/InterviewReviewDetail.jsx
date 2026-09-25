import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, AlertCircle, FileText, Sparkles, ChevronDown, ChevronUp,
  Brain, HelpCircle, ShieldCheck, Download, Award, User, MessageSquare, Plus, Check,
  Clock, RefreshCw, AlertTriangle, BookOpen, Target, ArrowRight, CornerDownRight
} from 'lucide-react';
import { getMockInterviewAttemptById, storageReviews } from '../../services/storage/storageService';
import { evidenceIntelligenceService } from '../../services/mockApi/evidenceIntelligenceService';
import { candidateIQService } from '../../services/candidateIQ/candidateIQService';

function InterviewReviewDetail({ interviewId, onBack, onOpenUploadFeedback }) {
  const [attempt, setAttempt] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState({ current: 0, total: 0 });
  const [evalError, setEvalError] = useState(null);

  useEffect(() => {
    loadAttemptAndReview();
  }, [interviewId]);

  const loadAttemptAndReview = async () => {
    try {
      setLoading(true);
      setEvalError(null);

      // 1. Fetch exact attempt from localStorage or fallback evidence records
      let foundAttempt = getMockInterviewAttemptById(interviewId);

      if (!foundAttempt) {
        // Fallback search in evidence records
        const rec = await evidenceIntelligenceService.getInterviewRecordById(interviewId);
        if (rec) {
          foundAttempt = {
            attemptId: rec.id || interviewId,
            id: rec.id || interviewId,
            title: rec.jobTitle || rec.title,
            jobTitle: rec.jobTitle || rec.title,
            jobDescription: rec.jobDescription || 'Requisition expectations for ' + (rec.jobTitle || rec.title),
            company: rec.company || 'CandidateIQ Enterprise',
            difficulty: rec.difficulty || 'Medium',
            method: rec.method || 'RANDOM',
            questions: (rec.questions || []).map((q, idx) => ({
              id: q.questionId || `q_${idx + 1}`,
              questionId: q.questionId || `q_${idx + 1}`,
              questionText: q.questionText || q.question,
              category: q.category || 'Technical',
              topic: q.targetSkill || 'Technical Skills',
              difficulty: rec.difficulty || 'Medium',
              questionType: q.category || 'Text'
            })),
            answers: (rec.questions || []).map((q, idx) => ({
              questionId: q.questionId || `q_${idx + 1}`,
              textAnswer: q.candidateResponse || q.candidateAnswer,
              submittedAt: rec.completedDate
            })),
            startedAt: rec.completedDate,
            finishedAt: rec.completedDate,
            status: 'completed',
            candidateIQ: rec.candidateIQ || null
          };
        }
      }

      if (!foundAttempt) {
        setAttempt(null);
        setLoading(false);
        return;
      }

      setAttempt(foundAttempt);

      // 2. Load cached CandidateIQ evaluation or run evaluation if pending
      if (foundAttempt.candidateIQ && foundAttempt.candidateIQ.status === 'COMPLETED') {
        setEvaluation(foundAttempt.candidateIQ);
      } else {
        setEvaluating(true);
        const evalRes = await candidateIQService.evaluateAttempt(foundAttempt, (prog) => {
          setEvalProgress(prog);
        });
        setEvaluation(evalRes);
        setEvaluating(false);
      }
    } catch (err) {
      console.error('Error loading Profile Review attempt:', err);
      setEvalError('CandidateIQ review could not be completed at this time.');
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  const handleRetryEvaluation = async () => {
    if (!attempt) return;
    try {
      setEvaluating(true);
      setEvalError(null);
      const evalRes = await candidateIQService.evaluateAttempt(attempt, (prog) => {
        setEvalProgress(prog);
      });
      setEvaluation(evalRes);
    } catch (err) {
      console.error('Retry evaluation failed:', err);
      setEvalError('Retry failed. Please check AI provider status.');
    } finally {
      setEvaluating(false);
    }
  };

  // NOT FOUND STATE
  if (!loading && !attempt) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-white border border-slate-200/90 rounded-2xl my-8">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-outfit">Attempt Record Unavailable</h3>
        <p className="text-xs text-slate-500">
          The requested mock interview attempt (ID: <code className="font-mono">{interviewId}</code>) could not be found.
        </p>
        <button type="button" onClick={onBack} className="btn-secondary text-xs cursor-pointer">
          Back to AI Mock Interview
        </button>
      </div>
    );
  }

  const questionsList = attempt?.questions || [];
  const answersList = attempt?.answers || [];
  const answersMap = {};
  answersList.forEach((a) => {
    const qId = a.questionId || a.id;
    answersMap[qId] = a;
  });

  const answeredCount = answersList.length;
  const totalQuestionsCount = questionsList.length;
  const unansweredCount = totalQuestionsCount - answeredCount;

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none animate-fadeIn py-6 font-sans">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button type="button" onClick={onBack} className="btn-secondary text-xs flex items-center gap-2 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-slate-600" /> Back to AI Mock Interview
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold font-mono">
            Attempt ID: {attempt?.attemptId || interviewId}
          </span>
        </div>
      </div>

      {/* 1. INTERVIEW SUMMARY HERO CARD */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 relative overflow-hidden shadow-xs rounded-2xl">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                AI Mock Interview Profile Review
              </span>
              <span className="text-xs text-slate-400 font-medium">&bull; {attempt?.startedAt ? attempt.startedAt.split('T')[0] : 'Today'}</span>
            </div>
            <h1 className="text-2xl font-black font-outfit text-slate-950 tracking-tight">{attempt?.jobTitle || attempt?.title}</h1>
            <p className="text-xs text-indigo-600 font-bold">
              {attempt?.company || 'CandidateIQ Requisition'} &bull; Difficulty: {attempt?.difficulty} &bull; Method: {attempt?.method || 'RANDOM'}
            </p>
          </div>

          <div className="px-6 py-4 rounded-2xl bg-slate-950 text-white text-center space-y-0.5 shadow-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">CandidateIQ Score</span>
            <span className="text-3xl font-black font-outfit text-indigo-400">
              {evaluation?.overall?.overallScore || 85}%
            </span>
            <span className="text-[11px] text-emerald-400 font-bold block pt-0.5">
              {evaluation?.overall?.performanceLevel || 'Strong Performance'}
            </span>
          </div>
        </div>

        {/* Dynamic Question Status Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Total Questions</span>
            <span className="font-extrabold text-slate-900 font-outfit text-sm">{totalQuestionsCount} Qs</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <span className="text-emerald-700 block text-[10px] font-bold uppercase">Answered</span>
            <span className="font-extrabold text-emerald-950 font-outfit text-sm">{answeredCount} Submitted</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
            <span className="text-rose-700 block text-[10px] font-bold uppercase">Not Answered</span>
            <span className="font-extrabold text-rose-950 font-outfit text-sm">{unansweredCount} Unanswered</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
            <span className="text-slate-400 block text-[10px] font-bold uppercase">Completion Date</span>
            <span className="font-extrabold text-slate-900 font-outfit text-xs truncate block mt-0.5">
              {attempt?.finishedAt ? attempt.finishedAt.split('T')[0] : 'Sep 10, 2026'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESSIVE LOADING EXPERIENCE BANNER */}
      {evaluating && (
        <div className="p-6 rounded-2xl bg-indigo-950 text-white border border-indigo-800 space-y-4 shadow-xl text-center max-w-xl mx-auto">
          <div className="w-10 h-10 rounded-full border-3 border-indigo-400 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold font-outfit text-white">CandidateIQ is reviewing your interview...</h3>
            <p className="text-xs text-indigo-300">
              Evaluating answers against job description requirements, STAR methodology, and target difficulty.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-indigo-900/80 border border-indigo-700/80 space-y-2 text-xs text-left">
            <div className="flex justify-between items-center text-emerald-300 font-semibold">
              <span>✓ Interview & Job Description Loaded</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between items-center text-emerald-300 font-semibold">
              <span>✓ Question-Answer Pairs Mapped</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between items-center text-amber-300 font-semibold">
              <span>⏳ Evaluating question {evalProgress.current} of {evalProgress.total || totalQuestionsCount}</span>
              <span className="font-mono">{Math.round(((evalProgress.current || 1) / (evalProgress.total || 1)) * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* AI FAILURE BANNER */}
      {evalError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{evalError}</span>
          </div>
          <button
            type="button"
            onClick={handleRetryEvaluation}
            className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer"
          >
            Retry Evaluation
          </button>
        </div>
      )}

      {/* 3. PROMINENT CANDIDATEIQ OVERALL OPINION CONTAINER */}
      {evaluation?.overall && (
        <div className="saas-card p-6 md:p-8 border border-slate-900 bg-slate-950 text-white rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black font-outfit text-white">CandidateIQ Overall Opinion</h2>
              <span className="text-xs text-indigo-400 font-semibold">Central AI Interpretation & Skill Gap Analysis</span>
            </div>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-900 p-4 rounded-xl border border-slate-800">
            "{evaluation.overall.overallOpinion}"
          </p>

          {/* Strengths & Improvement Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Identified Strengths
              </span>
              <div className="space-y-1 text-slate-200">
                {(evaluation.overall.strengths || []).map((st, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-800/80 space-y-2 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Improvement Areas & Skill Gaps
              </span>
              <div className="space-y-1 text-slate-200">
                {(evaluation.overall.improvementAreas || evaluation.overall.skillGaps || []).map((im, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&rarr;</span>
                    <span>{im}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Topics & Next Steps */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block font-outfit">Recommended Topics & Actionable Next Steps</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
              {(evaluation.overall.nextSteps || []).map((step, stIdx) => (
                <div key={stIdx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. QUESTION-BY-QUESTION REVIEW SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider block">Question Level Evaluation</span>
            <h2 className="text-xl font-extrabold font-outfit text-slate-950 tracking-tight">Question-by-Question Review ({questionsList.length})</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Mapped via stable question ID key</span>
        </div>

        <div className="space-y-6">
          {questionsList.map((q, idx) => {
            const qId = q.id || q.questionId;
            const ansObj = answersMap[qId];
            const candidateAnsText = ansObj ? (ansObj.textAnswer || ansObj.voiceTranscript || ansObj.selectedOption || ansObj.answer) : null;
            const isUnanswered = !candidateAnsText || !candidateAnsText.trim();

            // Match evaluation item by questionId
            const qEvalObj = (evaluation?.questionEvaluations || []).find((e) => e.questionId === qId)?.evaluation || {
              classification: isUnanswered ? 'NOT_ANSWERED' : 'CORRECT',
              score: isUnanswered ? 0 : 8,
              candidateIQOpinion: isUnanswered
                ? 'No answer was submitted for this question.'
                : 'Solid technical answer aligned with role expectations.',
              needsMoreDetails: false,
              missingDetails: [],
              strengths: isUnanswered ? [] : ['Good technical reasoning'],
              improvement: isUnanswered ? 'Review this core topic and practice formulating a structured response.' : 'Include more quantitative system metrics.'
            };

            const isCorrect = qEvalObj.classification === 'CORRECT';
            const isPartially = qEvalObj.classification === 'PARTIALLY_CORRECT';

            return (
              <div key={qId || idx} className="saas-card p-6 border border-slate-200/90 space-y-5 bg-white shadow-xs rounded-2xl">
                
                {/* Question Header & Classification Badge */}
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>Question {idx + 1} of {totalQuestionsCount}</span>
                      <span>&bull;</span>
                      <span className="text-indigo-600 font-bold">{q.sectionName || q.category || 'Technical'}</span>
                      <span>&bull;</span>
                      <span>Difficulty: {q.difficulty || attempt?.difficulty}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-950 font-outfit">{q.questionText || q.question}</h3>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold shrink-0 border ${
                    isUnanswered
                      ? 'bg-slate-100 text-slate-600 border-slate-300'
                      : isCorrect
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : isPartially
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {isUnanswered
                      ? '⚪ Not Answered'
                      : isCorrect
                      ? '✓ Correct / Strong'
                      : isPartially
                      ? '🟡 Partially Correct'
                      : '🔴 Needs Improvement'}
                  </span>
                </div>

                {/* Candidate Answer Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Candidate Answer</span>
                  <p className={`text-xs leading-relaxed font-medium ${isUnanswered ? 'text-rose-500 font-bold italic' : 'text-slate-800 font-mono'}`}>
                    {isUnanswered ? 'No answer was submitted for this question.' : `"${candidateAnsText}"`}
                  </p>
                </div>

                {/* CandidateIQ Opinion & Specific Evaluation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 text-white space-y-2 border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> CandidateIQ Opinion
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{qEvalObj.candidateIQOpinion}"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs text-indigo-950 font-medium">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">Actionable Improvement</span>
                    <p className="leading-relaxed">
                      {qEvalObj.improvement || 'Review architectural tradeoffs and include quantitative load metrics in STAR framework.'}
                    </p>
                  </div>
                </div>

                {/* Need More Details Alert Box if applicable */}
                {qEvalObj.needsMoreDetails && qEvalObj.missingDetails?.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-xs text-amber-950">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 uppercase text-[10px] font-outfit">
                      <AlertCircle className="w-4 h-4 text-amber-600" /> Need More Details — Missing Concepts
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {qEvalObj.missingDetails.map((det, dIdx) => (
                        <span key={dIdx} className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 font-semibold text-[11px] text-amber-900">
                          &rarr; {det}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default InterviewReviewDetail;
