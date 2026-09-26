import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, AlertCircle, FileText, Sparkles, ChevronDown, ChevronUp,
  Brain, HelpCircle, ShieldCheck, Download, Award, User, MessageSquare, Plus, Check,
  Clock, RefreshCw, AlertTriangle, BookOpen, Target, ArrowRight, CornerDownRight, Mic, Filter, X
} from 'lucide-react';
import { mockInterviewService } from '../../services/mockApi/interviewService';

function InterviewReviewDetail({ interviewId, onBack, onOpenUploadFeedback }) {
  const [interviewDoc, setInterviewDoc] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);

  const [evalProgress, setEvalProgress] = useState(null);

  // Filter State: 'all' | 'mcq' | 'voice' | 'text' | 'correct' | 'incorrect' | 'needs_improvement'
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadInterviewAndEvaluation();
  }, [interviewId]);

  // Real-time SSE Evaluation Progress Listener
  useEffect(() => {
    let eventSource = null;
    if (evaluating && interviewId) {
      const url = `/api/mock-interviews/${interviewId}/evaluation-progress`;
      eventSource = new EventSource(url);
      eventSource.addEventListener('evaluation-progress', (e) => {
        try {
          const data = JSON.parse(e.data);
          setEvalProgress(data);
          if (data.type === 'evaluation_completed' || data.stage === 'COMPLETED') {
            eventSource.close();
            loadInterviewAndEvaluation();
          }
        } catch (err) {
          console.error('SSE parse error:', err);
        }
      });
      eventSource.onerror = () => {
        eventSource.close();
      };
    }
    return () => {
      if (eventSource) eventSource.close();
    };
  }, [evaluating, interviewId]);

  const loadInterviewAndEvaluation = async () => {
    try {
      setLoading(true);
      setEvalError(null);

      // 1. Fetch live document strictly from MongoDB via API
      let doc = await mockInterviewService.getMockInterviewById(interviewId);

      if (!doc) {
        setInterviewDoc(null);
        setLoading(false);
        return;
      }

      setInterviewDoc(doc);

      // 2. Read existing evaluation directly from MongoDB doc
      if (doc.evaluation && doc.evaluation.status === 'completed') {
        setEvaluation(doc.evaluation);
      } else if (doc.status === 'completed') {
        // Automatically evaluate completed interview if evaluation not generated yet
        setEvaluating(true);
        const evalRes = await mockInterviewService.evaluateMockInterview(interviewId, false);
        if (evalRes && evalRes.evaluation) {
          setEvaluation(evalRes.evaluation);
          setInterviewDoc(evalRes.interview || doc);
        } else {
          setEvaluation(doc.evaluation || null);
        }
        setEvaluating(false);
      } else {
        setEvaluation(doc.evaluation || null);
      }
    } catch (err) {
      console.error('Error loading Profile Review evaluation from MongoDB:', err);
      setEvalError('CandidateIQ review could not be completed at this time.');
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  const handleRetryEvaluation = async () => {
    try {
      setEvaluating(true);
      setEvalError(null);
      const evalRes = await mockInterviewService.evaluateMockInterview(interviewId, true);
      if (evalRes && evalRes.evaluation) {
        setEvaluation(evalRes.evaluation);
        setInterviewDoc(evalRes.interview || interviewDoc);
      }
    } catch (err) {
      console.error('Retry evaluation failed:', err);
      setEvalError('Retry failed. Please check AI provider status.');
    } finally {
      setEvaluating(false);
    }
  };

  // NOT FOUND STATE
  if (!loading && !interviewDoc) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto bg-white border border-slate-200/90 rounded-2xl my-8 shadow-sm">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-outfit">Mock Interview Record Unavailable</h3>
        <p className="text-xs text-slate-500">
          The requested mock interview (ID: <code className="font-mono">{interviewId}</code>) could not be found in MongoDB.
        </p>
        <button type="button" onClick={onBack} className="btn-secondary text-xs cursor-pointer">
          Back to Profile Review
        </button>
      </div>
    );
  }

  // Extract structured question lists directly from MongoDB document
  const mcqList = interviewDoc?.mock_interview_questions?.mcq || [];
  const voiceList = interviewDoc?.mock_interview_questions?.voice || [];
  const textList = interviewDoc?.mock_interview_questions?.text || [];

  // Combine flat question items strictly from stored data
  const allQuestions = [];

  mcqList.forEach((q, idx) => {
    allQuestions.push({
      type: 'MCQ',
      index: idx + 1,
      questionId: q.questionId,
      questionText: q.question || q.questionText,
      options: q.options || [],
      userAnswer: q.userAnswer,
      correctAnswer: q.correctAnswer,
      isAnswered: q.isAnswered,
      evaluation: q.evaluation || (q.isAnswered ? { isCorrect: q.userAnswer === q.correctAnswer, score: q.userAnswer === q.correctAnswer ? 1 : 0 } : null),
      topic: q.topic || 'Technical MCQ'
    });
  });

  voiceList.forEach((q, idx) => {
    allQuestions.push({
      type: 'VOICE',
      index: mcqList.length + idx + 1,
      questionId: q.questionId,
      questionText: q.question || q.questionText,
      transcript: q.transcript || q.answer || q.userAnswer,
      durationSeconds: q.durationSeconds || 0,
      isAnswered: q.isAnswered,
      evaluation: q.evaluation || null,
      topic: q.topic || 'Voice Architecture & Communication'
    });
  });

  textList.forEach((q, idx) => {
    allQuestions.push({
      type: 'TEXT',
      index: mcqList.length + voiceList.length + idx + 1,
      questionId: q.questionId,
      questionText: q.question || q.questionText,
      userAnswer: q.userAnswer || q.answer,
      isAnswered: q.isAnswered,
      evaluation: q.evaluation || null,
      topic: q.topic || 'Written Technical Reasoning'
    });
  });

  // Apply Active Category/Result Filters
  const filteredQuestions = allQuestions.filter((q) => {
    if (activeFilter === 'mcq') return q.type === 'MCQ';
    if (activeFilter === 'voice') return q.type === 'VOICE';
    if (activeFilter === 'text') return q.type === 'TEXT';
    if (activeFilter === 'correct') {
      if (q.type === 'MCQ') return q.evaluation?.isCorrect === true;
      return (q.evaluation?.technicalAccuracy?.score || 0) >= 8;
    }
    if (activeFilter === 'incorrect') {
      if (q.type === 'MCQ') return q.evaluation?.isCorrect === false;
      return q.evaluation && (q.evaluation?.technicalAccuracy?.score || 0) < 6;
    }
    if (activeFilter === 'needs_improvement') {
      if (q.type === 'MCQ') return q.evaluation?.isCorrect === false;
      return q.evaluation && (q.evaluation?.technicalAccuracy?.score || 0) < 8;
    }
    return true;
  });

  const overallScore = evaluation?.overallScore ?? interviewDoc?.overallEvaluation?.overallInterviewScore ?? null;
  const techScore = evaluation?.technicalScore ?? interviewDoc?.overallEvaluation?.technicalProficiency ?? null;
  const commScore = evaluation?.communicationScore ?? interviewDoc?.overallEvaluation?.communicationClarity ?? null;
  const reasScore = evaluation?.reasoningScore ?? interviewDoc?.overallEvaluation?.problemSolvingRating ?? null;
  const behavScore = evaluation?.behaviouralScore ?? interviewDoc?.overallEvaluation?.behaviouralCompetency ?? null;
  const isEvaluated = evaluation && evaluation.status === 'completed';

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-8 select-none animate-fadeIn py-6 font-sans">
      
      {/* Top Header Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button type="button" onClick={onBack} className="btn-secondary text-xs flex items-center gap-2 cursor-pointer font-bold font-outfit">
          <ArrowLeft className="w-4 h-4 text-slate-600" /> ← Back to Profile Review
        </button>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold font-mono">
            Mock Interview ID: {interviewDoc?._id || interviewId}
          </span>
        </div>
      </div>

      {/* 1. INTERVIEW SUMMARY HERO CARD */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 bg-white space-y-6 relative overflow-hidden shadow-xs rounded-2xl">
        <div className="flex flex-wrap justify-between items-start gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                AI Mock Interview
              </span>
              <span className="text-xs text-slate-500 font-medium">
                &bull; Created: {interviewDoc?.createdAt ? new Date(interviewDoc.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <h1 className="text-2xl font-black font-outfit text-slate-950 tracking-tight">{interviewDoc?.jobTitle || 'AI Mock Interview'}</h1>
            <p className="text-xs text-indigo-600 font-bold">
              {interviewDoc?.sourceSnapshot?.job?.company || 'CandidateIQ Enterprise'} &bull; Difficulty: {interviewDoc?.difficulty || 'Medium'} &bull; Method: {(interviewDoc?.interviewType || 'RANDOM').toUpperCase()}
            </p>
          </div>

          <div className="px-6 py-4 rounded-2xl bg-slate-950 text-white text-center space-y-0.5 shadow-md">
            <span className="text-[10px] text-slate-400 uppercase font-bold block tracking-wider">Overall Performance</span>
            <span className="text-3xl font-black font-outfit text-indigo-400">
              {overallScore !== null ? `${overallScore} / 100` : '—'}
            </span>
            <span className="text-[11px] text-emerald-400 font-bold block pt-0.5">
              {overallScore !== null
                ? overallScore >= 80 ? 'Strong Performance' : overallScore >= 70 ? 'Proficient Alignment' : 'Needs Technical Practice'
                : 'Evaluation Pending'}
            </span>
          </div>
        </div>

        {/* 2. TOP SCORE METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Technical</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{techScore !== null ? techScore : '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Communication</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{commScore !== null ? commScore : '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Reasoning</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{reasScore !== null ? reasScore : '—'}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider">Behavioural</span>
            <span className="text-2xl font-black font-outfit text-slate-900">{behavScore !== null ? behavScore : '—'}</span>
          </div>
        </div>
      </div>

      {/* REAL-TIME EVALUATING PROGRESS CARD */}
      {evaluating && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-6 shadow-2xl max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              <div>
                <h3 className="text-base font-bold font-outfit text-white">✨ CandidateIQ AI Review</h3>
                <p className="text-xs text-slate-400">Analyzing your interview responses question-by-question...</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
              {evalProgress?.completedQuestions || 0} / {evalProgress?.totalQuestions || allQuestions.length || 20} Analyzed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300 font-mono">
                Question {evalProgress?.questionNumber || (evalProgress?.completedQuestions ? evalProgress.completedQuestions + 1 : 1)} of {evalProgress?.totalQuestions || allQuestions.length || 20}
              </span>
              <span className="text-indigo-400 font-mono font-bold">{evalProgress?.progress || 0}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${Math.max(5, evalProgress?.progress || 0)}%` }}
              />
            </div>
          </div>

          {/* Current Question Topic */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span>Currently Analyzing Question {evalProgress?.questionNumber || 1}</span>
            </div>
            <p className="text-xs font-bold text-slate-200 font-outfit">
              {evalProgress?.topic || 'Technical Deep Dive & Domain Reasoning'}
            </p>
            <p className="text-[11px] text-slate-400">Evaluating technical accuracy, communication clarity and demonstrated evidence...</p>
          </div>
        </div>
      )}

      {/* EVALUATION ERROR BANNER */}
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

      {/* UNEVALUATED INTERVIEW ALERT BANNER */}
      {!isEvaluated && !evaluating && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="block font-outfit text-sm">Evaluation Pending for this Mock Interview</strong>
              <span>Answers are saved in MongoDB. Run AI Evaluation to generate evidence-based feedback.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRetryEvaluation}
            className="btn-primary text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" /> Generate AI Evaluation
          </button>
        </div>
      )}

      {/* 3. QUESTION-BY-QUESTION REVIEW SECTION & FILTERS */}
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider block">Question Level Evaluation</span>
            <h2 className="text-xl font-extrabold font-outfit text-slate-950 tracking-tight">Question-by-Question Review ({allQuestions.length})</h2>
          </div>

          {/* Review Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80">
            {[
              { id: 'all', label: `All (${allQuestions.length})` },
              { id: 'mcq', label: `MCQ (${mcqList.length})` },
              { id: 'voice', label: `Voice (${voiceList.length})` },
              { id: 'text', label: `Text (${textList.length})` },
              { id: 'correct', label: 'Correct' },
              { id: 'needs_improvement', label: 'Needs Improvement' }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* QUESTION CARDS LIST */}
        <div className="space-y-6">
          {filteredQuestions.map((q) => {
            // RENDERING TYPE 1: MCQ QUESTION REVIEW
            if (q.type === 'MCQ') {
              const hasAnswered = q.userAnswer && q.userAnswer.trim().length > 0;
              const isCorrect = q.evaluation?.isCorrect === true;
              return (
                <div key={q.questionId || q.index} className="saas-card p-6 border border-slate-200/90 space-y-4 bg-white shadow-xs rounded-2xl">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">Question {q.index} &bull; MCQ</span>
                        <span>Topic: {q.topic}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-950 font-outfit">{q.questionText}</h3>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-extrabold border shrink-0 ${
                      !hasAnswered
                        ? 'bg-slate-100 text-slate-600 border-slate-300'
                        : isCorrect
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {!hasAnswered ? '⚪ Not Answered' : isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-medium">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Candidate Selected Option</span>
                      <span className={`font-mono font-bold ${!hasAnswered ? 'text-slate-400 italic' : isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {q.userAnswer || 'Not Answered'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Correct Option</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {q.correctAnswer}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                    <span>Deterministic Result: {isCorrect ? '1 / 1 Point' : '0 / 1 Point'}</span>
                    <span className="text-[11px] font-semibold text-slate-400">Direct answer evaluation</span>
                  </div>
                </div>
              );
            }

            // RENDERING TYPE 2: VOICE QUESTION REVIEW
            if (q.type === 'VOICE') {
              const ev = q.evaluation;
              const hasVoiceAns = q.transcript && q.transcript.trim().length > 0;

              return (
                <div key={q.questionId || q.index} className="saas-card p-6 border border-slate-200/90 space-y-5 bg-white shadow-xs rounded-2xl">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100 flex items-center gap-1 font-outfit">
                          <Mic className="w-3 h-3 text-indigo-600" /> Question {q.index} &bull; VOICE RESPONSE
                        </span>
                        <span>Topic: {q.topic}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-950 font-outfit">{q.questionText}</h3>
                    </div>

                    {ev ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-extrabold">
                          Tech Accuracy: {ev.technicalAccuracy?.score ?? '—'}/10
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-extrabold">
                          Communication: {ev.communication?.score ?? '—'}/10
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                        Evaluation Pending
                      </span>
                    )}
                  </div>

                  {/* READ-ONLY VOICE RESPONSE BOX */}
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-100 space-y-2.5 border border-slate-800">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 font-outfit">
                        <Mic className="w-3.5 h-3.5 text-indigo-400" /> 🎙 Voice Response (Read-Only Evidence)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        Duration: {q.durationSeconds || 0} seconds
                      </span>
                    </div>
                    <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap font-sans select-text">
                      {hasVoiceAns ? `"${q.transcript}"` : 'No spoken voice transcript recorded.'}
                    </pre>
                  </div>

                  {/* VOICE AI EVALUATION GRID */}
                  {ev ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Scores & Observable Behavioural Signals */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Communication & Behavioral Signals</span>
                        <div className="flex flex-wrap gap-2 text-slate-700 font-medium">
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <strong>Tone:</strong> {ev.tone?.label || 'Neutral'}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <strong>Sentiment:</strong> {ev.sentiment?.label || 'Neutral'}
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Observable Behavioural Signals:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(ev.behaviouralSignals || []).map((sig, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-100 text-[10px] font-bold">
                                • {sig}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* STRICT 20-25 WORD AI FEEDBACK BOX */}
                      <div className="p-4 rounded-xl bg-indigo-950 text-white space-y-2 border border-indigo-800 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                          <Sparkles className="w-3.5 h-3.5" /> AI Feedback (20–25 Words Concise Opinion)
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium bg-indigo-900/60 p-3 rounded-lg border border-indigo-800">
                          "{ev.feedback || 'Evaluation not available yet.'}"
                        </p>
                        {ev.feedback && (
                          <span className="text-[10px] text-indigo-300 font-mono text-right block pt-1">
                            Word Count: {ev.feedback.trim().split(/\s+/).length} words
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                      Evaluation not available yet for this voice question. Run interview evaluation to analyze transcript.
                    </div>
                  )}
                </div>
              );
            }

            // RENDERING TYPE 3: TEXT QUESTION REVIEW
            if (q.type === 'TEXT') {
              const ev = q.evaluation;
              const hasTextAns = q.userAnswer && q.userAnswer.trim().length > 0;

              return (
                <div key={q.questionId || q.index} className="saas-card p-6 border border-slate-200/90 space-y-5 bg-white shadow-xs rounded-2xl">
                  <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-100 font-outfit font-bold">
                          ✍ Question {q.index} &bull; TEXT RESPONSE
                        </span>
                        <span>Topic: {q.topic}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-950 font-outfit">{q.questionText}</h3>
                    </div>

                    {ev ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-extrabold">
                          Tech Accuracy: {ev.technicalAccuracy?.score ?? '—'}/10
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                          Reasoning: {ev.reasoning?.score ?? '—'}/10
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                        Evaluation Pending
                      </span>
                    )}
                  </div>

                  {/* READ-ONLY TEXT RESPONSE BOX */}
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 border border-slate-800">
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block font-outfit">
                      ✍ Text Response (Read-Only Evidence)
                    </span>
                    <pre className="text-xs font-mono leading-relaxed text-slate-200 whitespace-pre-wrap font-sans select-text">
                      {hasTextAns ? `"${q.userAnswer}"` : 'No written text response submitted.'}
                    </pre>
                  </div>

                  {/* TEXT AI EVALUATION GRID */}
                  {ev ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Behavioural Signals */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Written Signals & Sentiment</span>
                        <div className="flex flex-wrap gap-2 text-slate-700 font-medium">
                          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px]">
                            <strong>Sentiment:</strong> {ev.sentiment?.label || 'Neutral'}
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Observable Behavioural Signals:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {(ev.behaviouralSignals || []).map((sig, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-100 text-[10px] font-bold">
                                • {sig}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* STRICT 20-25 WORD AI FEEDBACK BOX */}
                      <div className="p-4 rounded-xl bg-indigo-950 text-white space-y-2 border border-indigo-800 flex flex-col justify-between">
                        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                          <Sparkles className="w-3.5 h-3.5" /> AI Feedback (20–25 Words Concise Opinion)
                        </span>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium bg-indigo-900/60 p-3 rounded-lg border border-indigo-800">
                          "{ev.feedback || 'Evaluation not available yet.'}"
                        </p>
                        {ev.feedback && (
                          <span className="text-[10px] text-indigo-300 font-mono text-right block pt-1">
                            Word Count: {ev.feedback.trim().split(/\s+/).length} words
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 italic">
                      Evaluation not available yet for this text question. Run interview evaluation to analyze answer.
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* 4. OVERALL INSIGHTS SECTION (BOTTOM) */}
      {isEvaluated && (
        <div className="saas-card p-6 md:p-8 border border-slate-900 bg-slate-950 text-white rounded-2xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-black font-outfit text-white">Overall Mock Interview Insights</h2>
              <span className="text-xs text-indigo-400 font-semibold">Aggregated CandidateIQ Strengths, Improvement Areas & Final Recommendation</span>
            </div>
          </div>

          {/* Strengths & Improvement Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 space-y-3 text-xs">
              <span className="font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> What You Did Well
              </span>
              <div className="space-y-2 text-slate-200">
                {(evaluation?.strengths || []).map((st, sIdx) => (
                  <div key={sIdx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">&bull;</span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-amber-950/60 border border-amber-800/80 space-y-3 text-xs">
              <span className="font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1.5 font-outfit">
                <AlertCircle className="w-4 h-4 text-amber-400" /> Areas to Improve
              </span>
              <div className="space-y-2 text-slate-200">
                {(evaluation?.improvements || []).map((im, iIdx) => (
                  <div key={iIdx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">&rarr;</span>
                    <span>{im}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Focus */}
          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider block font-outfit">Recommended Focus & Final Feedback</span>
            <p className="text-slate-300 leading-relaxed font-medium">
              {evaluation?.finalFeedback || 'Evaluation summary generated by CandidateIQ.'}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default InterviewReviewDetail;
