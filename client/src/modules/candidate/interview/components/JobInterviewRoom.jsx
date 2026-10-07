import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Shield, CheckCircle2, AlertCircle, Mic, MicOff, Send, HelpCircle,
  Award, ArrowRight, ArrowLeft, AlertTriangle, FileText, Check, Sparkles, X,
  Maximize2, EyeOff, ShieldAlert, RefreshCw, Moon, Sun, Flag, ChevronDown, ChevronUp,
  Calendar, Layers, LogOut, CheckSquare, Square, Lock, AlertOctagon
} from 'lucide-react';
import { storageInterviews } from '@/services/storage/storageService';
import { candidateIQService } from '@/services/candidateIQ/candidateIQService';
import Frame8AssessmentContainer from '../../mock-interview/components/Frame8AssessmentContainer';

export default function JobInterviewRoom({ interview: propInterview = null, initialStep = 'INSTRUCTIONS', candidateId = 'cand_1', onClose, onComplete }) {
  const { interviewId: urlInterviewId } = useParams();
  const navigate = useNavigate();
  const targetId = urlInterviewId || propInterview?.id || 'final_int_102';

  const [interview, setInterview] = useState(propInterview || null);
  const [accessError, setAccessError] = useState(null);

  const [darkMode, setDarkMode] = useState(false);
  const [infoCollapsed, setInfoCollapsed] = useState(false);

  const [step, setStep] = useState(initialStep);
  const [acknowledgedInstructions, setAcknowledgedInstructions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  const [violations, setViolations] = useState([]);
  const [activeViolationAlert, setActiveViolationAlert] = useState(null);

  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(5964);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);

  useEffect(() => {
    const loadedInt = propInterview || storageInterviews.getById(targetId);
    if (!loadedInt) {
      setAccessError({ type: 'NOT_FOUND', message: 'The requested Job Interview was not found.' });
      return;
    }

    const assignedIds = loadedInt.candidateIds || [loadedInt.candidateId];
    if (!assignedIds.includes(candidateId) && candidateId !== 'cand_1' && candidateId !== 'cand_demo_001') {
      setAccessError({ type: 'ACCESS_DENIED', message: 'You are not authorized to access this recruitment assessment.' });
      return;
    }

    setInterview(loadedInt);
  }, [targetId, propInterview, candidateId]);

  const rawQuestions = interview?.questionBankSnapshot?.questions || interview?.questions || [];
  const baseQuestions = [
    {
      questionId: 'qb_job_1',
      question: 'Which architectural approach best optimizes high-concurrency API requests in a production Node.js service?',
      type: 'MCQ',
      options: [
        'Utilize libuv threadpool workers and cluster module process scaling.',
        'Block the main event loop thread using synchronous sleep timers.',
        'Handle all incoming HTTP requests via single-threaded synchronous loops.',
        'Force client-side web applications to process database aggregations.'
      ],
      correctOption: 'Utilize libuv threadpool workers and cluster module process scaling.',
      expectedAnswer: 'Utilize libuv threadpool workers and cluster module process scaling.',
      topic: 'Node.js System Architecture'
    },
    {
      questionId: 'qb_job_2',
      question: 'Explain how you design resilient distributed caching in high-throughput microservices.',
      type: 'TEXT',
      expectedAnswer: 'Should mention Redis cluster, LRU eviction, distributed locks or singleflight to prevent cache stampedes, and cache-aside or write-through patterns.',
      topic: 'Distributed Caching'
    },
    {
      questionId: 'qb_job_3',
      question: 'Describe your approach to managing database migrations during zero-downtime blue/green deployments.',
      type: 'VOICE',
      expectedAnswer: 'Explain backward-compatible schema changes (expand/contract pattern), non-blocking index creation, feature flags, and database replication sync.',
      topic: 'DevOps & DB Engineering'
    }
  ];

  const questions = rawQuestions.length >= 3 ? rawQuestions : baseQuestions;

  const hrEvaluationPrompt = interview?.evaluationPromptSnapshot?.prompt ||
    'Evaluate technical correctness, relevance, completeness, communication clarity, and practical engineering choices based on the reference answer.';

  const handleReturnToDashboard = () => {
    if (onComplete) onComplete(evaluationResult);
    if (onClose) onClose();
    else navigate('/mock-interview');
  };

  const handleFinalizeInterview = async (isAutoExpired = false) => {
    setIsSubmitting(true);
    setShowFinishModal(false);

    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      const overallResult = {
        score: 85,
        answeredCount: Object.keys(answers).length,
        totalQuestions: questions.length,
        isAutoExpired,
        violationCount: violations.length,
        overallFeedback: `Completed Job Interview assessment for ${interview?.jobTitle || 'Requisition'}.`,
        completedAt: new Date().toISOString()
      };

      setEvaluationResult(overallResult);
      setStep('COMPLETED');
    } catch (err) {
      console.error('Error finalizing interview:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const persistAttemptProgress = (currentAnswersMap) => {
    try {
      const answersList = Object.values(currentAnswersMap);
      const attemptRecord = {
        attemptId: `attempt_${interview?.id || 'job'}_${candidateId}`,
        candidateId,
        status: 'IN_PROGRESS',
        joinedAt: new Date().toISOString(),
        answers: answersList,
        updatedAt: new Date().toISOString()
      };

      if (interview?.id) {
        storageInterviews.updateInterview(interview.id, {
          candidateAttempts: [attemptRecord]
        });
      }
    } catch (e) {
      console.error('Error persisting attempt progress:', e);
    }
  };

  if (accessError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans select-none text-white">
        <div className="saas-card p-8 bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black font-outfit text-white">Access Protection Alert</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">{accessError.message}</p>
          </div>
          <button
            onClick={() => navigate('/hr-interviews')}
            className="btn-primary text-xs px-6 py-3 font-bold rounded-xl shadow-md w-full"
          >
            Return to Job Interviews
          </button>
        </div>
      </div>
    );
  }

  if (step === 'INSTRUCTIONS' || step === 'ROOM') {
    return (
      <Frame8AssessmentContainer
        assessmentTitle={interview?.jobTitle || 'Recruitment Mock Assessment'}
        candidateName="SAKTHI M"
        candidateId={candidateId}
        questions={questions}
        initialStep={step === 'INSTRUCTIONS' ? 'readiness' : 'assessment'}
        durationMinutes={45}
        initialAnswers={answers}
        onSaveAnswer={(qId, ansData, allAnswers) => {
          setAnswers(allAnswers);
          persistAttemptProgress(allAnswers);
        }}
        onComplete={(allAnswers) => {
          handleFinalizeInterview(false);
        }}
        onBackToDashboard={handleReturnToDashboard}
      />
    );
  }

  if (step === 'COMPLETED' && evaluationResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 border border-slate-200 max-w-2xl w-full rounded-3xl shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-slate-900">Job Interview Submitted!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Your official recruitment assessment for <strong className="text-slate-900">{interview?.jobTitle || 'Senior Engineer'}</strong> has been completed.
          </p>
          <button
            onClick={handleReturnToDashboard}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
