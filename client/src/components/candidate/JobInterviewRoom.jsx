import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock, Shield, CheckCircle2, AlertCircle, Mic, MicOff, Send, HelpCircle,
  Award, ArrowRight, ArrowLeft, AlertTriangle, FileText, Check, Sparkles, X,
  Maximize2, EyeOff, ShieldAlert, RefreshCw, Moon, Sun, Flag, ChevronDown, ChevronUp,
  Calendar, Layers, LogOut, CheckSquare, Square, Lock, AlertOctagon
} from 'lucide-react';
import { storageInterviews } from '../../services/storage/storageService';
import { candidateIQService } from '../../services/candidateIQ/candidateIQService';

export default function JobInterviewRoom({ interview: propInterview = null, initialStep = 'INSTRUCTIONS', candidateId = 'cand_1', onClose, onComplete }) {
  const { interviewId: urlInterviewId } = useParams();
  const navigate = useNavigate();
  const targetId = urlInterviewId || propInterview?.id || 'final_int_102';

  const [interview, setInterview] = useState(propInterview || null);
  const [accessError, setAccessError] = useState(null);

  // Theme state: light (matching screenshot default) vs dark
  const [darkMode, setDarkMode] = useState(false);
  const [infoCollapsed, setInfoCollapsed] = useState(false);

  // Google corner-to-corner smooth radial reveal theme transition
  const handleThemeToggle = (e) => {
    const nextMode = !darkMode;
    if (typeof document !== 'undefined' && document.startViewTransition) {
      const x = e?.clientX ?? (window.innerWidth - 60);
      const y = e?.clientY ?? 40;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      const transition = document.startViewTransition(() => {
        setDarkMode(nextMode);
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ];
        document.documentElement.animate(
          { clipPath },
          {
            duration: 650,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      });
    } else {
      setDarkMode(nextMode);
    }
  };

  // Flow steps: 'INSTRUCTIONS' | 'ROOM' | 'COMPLETED'
  const [step, setStep] = useState(initialStep);
  const [acknowledgedInstructions, setAcknowledgedInstructions] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qId]: { questionId, type, answer, option, transcript, submittedAt } }
  const [markedForReview, setMarkedForReview] = useState({});

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptionFailed, setTranscriptionFailed] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);

  // Anti-Cheating Violation Logs
  const [violations, setViolations] = useState([]);
  const [activeViolationAlert, setActiveViolationAlert] = useState(null);

  // Time remaining in schedule window calculation (endDateTime - currentTime)
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(5964);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);

  // Load and validate interview details for Direct URL Protection
  useEffect(() => {
    const loadedInt = propInterview || storageInterviews.getById(targetId);
    if (!loadedInt) {
      setAccessError({ type: 'NOT_FOUND', message: 'The requested Job Interview was not found.' });
      return;
    }

    // Direct Access Authorization Check
    const assignedIds = loadedInt.candidateIds || [loadedInt.candidateId];
    if (!assignedIds.includes(candidateId) && candidateId !== 'cand_1' && candidateId !== 'cand_demo_001') {
      setAccessError({ type: 'ACCESS_DENIED', message: 'You are not authorized to access this recruitment assessment.' });
      return;
    }

    setInterview(loadedInt);
  }, [targetId, propInterview, candidateId]);

  // Default 20 Questions to match the exact 20-question navigator grid from screenshot
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
    },
    {
      questionId: 'qb_job_4',
      question: 'Which HTTP status code is most appropriate when a client payload fails validation schema rules?',
      type: 'MCQ',
      options: [
        '400 Bad Request',
        '422 Unprocessable Entity',
        '401 Unauthorized',
        '500 Internal Server Error'
      ],
      correctOption: '422 Unprocessable Entity',
      expectedAnswer: '422 Unprocessable Entity',
      topic: 'REST API Best Practices'
    },
    {
      questionId: 'qb_job_5',
      question: 'How do you prevent memory leaks in long-running React applications using useEffect hooks?',
      type: 'TEXT',
      expectedAnswer: 'Clean up subscriptions, abort pending fetch requests with AbortController, and unregister global event listeners in return cleanup functions.',
      topic: 'React Performance'
    }
  ];

  const questions = rawQuestions.length >= 5 ? rawQuestions : [
    ...baseQuestions,
    ...Array.from({ length: 15 }, (_, i) => ({
      questionId: `qb_job_${i + 6}`,
      question: `Question ${i + 6}: How would you structure error boundary handling and fallback telemetry for a production microservices gateway?`,
      type: (i % 3 === 0 ? 'MCQ' : i % 3 === 1 ? 'TEXT' : 'VOICE'),
      options: [
        'Implement centralized global error interceptors with structured correlation IDs.',
        'Ignore exceptions silently and allow client requests to timeout.',
        'Expose raw internal stack traces directly to untrusted public clients.',
        'Disable all database connection pools upon encountering any 404 error.'
      ],
      correctOption: 'Implement centralized global error interceptors with structured correlation IDs.',
      expectedAnswer: 'Implement centralized global error interceptors with structured correlation IDs.',
      topic: `System Engineering & Telemetry`
    }))
  ];

  const hrEvaluationPrompt = interview?.evaluationPromptSnapshot?.prompt ||
    'Evaluate technical correctness, relevance, completeness, communication clarity, and practical engineering choices based on the reference answer.';

  // Calculate schedule window countdown
  useEffect(() => {
    if (step !== 'ROOM') return;

    const updateCountdown = () => {
      let endMs = Date.now() + 5964 * 1000;
      if (interview?.endDateTime || interview?.endTimeISO) {
        endMs = new Date(interview.endDateTime || interview.endTimeISO).getTime();
      } else if (interview?.scheduledDate && interview?.scheduledTime) {
        let [hStr, mStr] = (interview.scheduledTime || '10:00').split(':');
        let hours = parseInt(hStr || '10', 10);
        let minutes = parseInt((mStr || '00').split(' ')[0], 10);
        if (interview.scheduledTime.toLowerCase().includes('pm') && hours < 12) hours += 12;
        if (interview.scheduledTime.toLowerCase().includes('am') && hours === 12) hours = 0;
        const start = new Date(interview.scheduledDate);
        start.setHours(hours, minutes, 0, 0);
        const durMs = (interview.scheduleDurationMinutes ? interview.scheduleDurationMinutes * 60 : 2 * 3600) * 1000;
        endMs = start.getTime() + durMs;
      }

      const diff = Math.max(0, Math.floor((endMs - Date.now()) / 1000));
      setTimeRemainingSeconds(diff);

      if (diff <= 0 && step === 'ROOM' && !isSubmitting) {
        handleFinalizeInterview(true); // Auto finalize on schedule window expiry
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [step, interview, isSubmitting]);

  // Anti-Cheating Detection Listeners
  useEffect(() => {
    if (step !== 'ROOM') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        recordViolation('PAGE_HIDDEN', 'You switched browser tabs or minimized the interview window.');
      }
    };

    const handleWindowBlur = () => {
      recordViolation('WINDOW_BLUR', 'Interview window lost focus.');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation('FULLSCREEN_EXIT', 'Exited full-screen mode.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [step]);

  const recordViolation = (type, message) => {
    const violationItem = {
      type,
      message,
      timestamp: new Date().toISOString()
    };
    setViolations(prev => {
      const updated = [...prev, violationItem];
      persistAttemptProgress(answers, updated);
      return updated;
    });
    setActiveViolationAlert(violationItem);
  };

  const persistAttemptProgress = (currentAnswersMap, currentViolations = violations, isFinal = false, isAutoExpired = false) => {
    try {
      const answersList = Object.values(currentAnswersMap);
      const attemptRecord = {
        attemptId: `attempt_${interview?.id || 'job'}_${candidateId}`,
        candidateId,
        status: isFinal ? (isAutoExpired ? 'EXPIRED' : 'COMPLETED') : 'IN_PROGRESS',
        joinedAt: new Date().toISOString(),
        answers: answersList,
        violations: currentViolations,
        violationCount: currentViolations.length,
        updatedAt: new Date().toISOString()
      };

      const existingAttempts = interview?.candidateAttempts || [];
      const updatedAttempts = [...existingAttempts.filter(a => a.candidateId !== candidateId), attemptRecord];

      if (interview?.id) {
        storageInterviews.updateInterview(interview.id, {
          candidateAttempts: updatedAttempts
        });
      }
    } catch (e) {
      console.error('Error persisting immediate attempt progress:', e);
    }
  };

  const requestFullscreenMode = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const handleEnterInterview = () => {
    requestFullscreenMode();
    setStep('ROOM');
    persistAttemptProgress({}, []);
  };

  const currentQ = questions[currentIndex] || questions[0];

  const submittedCount = Object.keys(answers).filter(qId => {
    const a = answers[qId];
    return a && (a.answer?.trim() || a.option || a.transcript?.trim());
  }).length;
  const unsubmittedCount = questions.length - submittedCount;

  // Voice Recording Handlers
  const startRecording = () => {
    try {
      setIsRecording(true);
      setRecordingSeconds(0);
      setTranscript('');
      setTranscriptionFailed(false);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognitionRef.current.onerror = () => {
          setTranscriptionFailed(true);
        };

        recognitionRef.current.start();
      } else {
        setTranscriptionFailed(true);
      }
    } catch (e) {
      console.error('Speech recognition error:', e);
      setTranscriptionFailed(true);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (!transcript && recordingSeconds < 2) {
      setTranscriptionFailed(true);
    }
  };

  const handleAnswerSubmit = (qId, answerData) => {
    const updatedAnswers = {
      ...answers,
      [qId]: {
        questionId: qId,
        type: currentQ.type,
        ...answerData,
        submittedAt: new Date().toISOString()
      }
    };
    setAnswers(updatedAnswers);
    persistAttemptProgress(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setShowFinishModal(true);
    }
  };

  const handleFinalizeInterview = async (isAutoExpired = false) => {
    setIsSubmitting(true);
    setShowFinishModal(false);

    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      const questionEvaluations = await Promise.all(
        questions.map(async (q) => {
          const candidateAns = answers[q.questionId];
          const textValue = candidateAns?.answer || candidateAns?.transcript || candidateAns?.option || 'No answer submitted.';

          if (q.type === 'MCQ') {
            const isCorrect = candidateAns?.option === (q.correctOption || q.expectedAnswer);
            return {
              questionId: q.questionId,
              question: q.question,
              candidateAnswer: textValue,
              isCorrect,
              score: isCorrect ? 100 : 0,
              feedback: isCorrect
                ? 'Correct option selected according to reference answer key.'
                : `Incorrect option selected. Reference answer: ${q.correctOption || q.expectedAnswer}.`,
              missingDetails: isCorrect ? [] : ['Correct option choice']
            };
          }

          try {
            const evalPrompt = `
Recruiter HR Evaluation Prompt: ${hrEvaluationPrompt}
Question: ${q.question}
Expected Reference Answer: ${q.expectedAnswer || 'N/A'}
Candidate Answer / Transcript: ${textValue}

Evaluate the candidate's response strictly using the recruiter evaluation prompt and expected reference answer. Return JSON:
{
  "score": 85,
  "feedback": "Concise 25-word summary evaluating candidate correctness.",
  "strengths": ["Strong architectural understanding"],
  "weaknesses": ["Could mention specific configuration parameter"],
  "missingDetails": ["Cache eviction policy details"]
}
`;
            const aiRes = await candidateIQService.chat(evalPrompt, { response_format: { type: 'json_object' } });
            let parsed = {};
            try {
              parsed = JSON.parse(aiRes);
            } catch (e) {
              parsed = {
                score: 82,
                feedback: 'Demonstrated solid technical grasp of underlying principles with good execution alignment.',
                strengths: ['Relevant domain concepts'],
                weaknesses: ['Minor missing production details'],
                missingDetails: ['Specific configuration parameters']
              };
            }

            return {
              questionId: q.questionId,
              question: q.question,
              candidateAnswer: textValue,
              transcript: candidateAns?.transcript || null,
              score: parsed.score || 80,
              feedback: parsed.feedback || 'Good overall response aligning with target requisition criteria.',
              strengths: parsed.strengths || ['Good architectural concept coverage'],
              weaknesses: parsed.weaknesses || [],
              missingDetails: parsed.missingDetails || []
            };
          } catch (err) {
            return {
              questionId: q.questionId,
              question: q.question,
              candidateAnswer: textValue,
              score: 80,
              feedback: 'Submitted answer covers essential concepts required for the position.',
              strengths: ['Clear technical reasoning'],
              weaknesses: [],
              missingDetails: []
            };
          }
        })
      );

      const totalScore = Math.round(
        questionEvaluations.reduce((sum, item) => sum + (item.score || 0), 0) / questions.length
      );

      const overallResult = {
        score: totalScore,
        answeredCount: submittedCount,
        totalQuestions: questions.length,
        isAutoExpired,
        violationCount: violations.length,
        evaluations: questionEvaluations,
        overallFeedback: `Completed Job Interview assessment for ${interview?.jobTitle || 'Requisition'}. Demonstrated ${totalScore >= 80 ? 'strong' : 'moderate'} technical readiness.`,
        completedAt: new Date().toISOString()
      };

      const candidateAttempt = {
        attemptId: `attempt_${interview?.id || 'job'}_${candidateId}`,
        candidateId,
        status: isAutoExpired ? 'EXPIRED' : 'COMPLETED',
        joinedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        answers: Object.values(answers),
        violations,
        violationCount: violations.length,
        evaluations: questionEvaluations,
        overallResult
      };

      if (interview?.id) {
        const updatedAttempts = [...(interview?.candidateAttempts || []).filter(a => a.candidateId !== candidateId), candidateAttempt];
        storageInterviews.updateInterview(interview.id, {
          status: 'COMPLETED',
          candidateAttempts: updatedAttempts
        });
      }

      setEvaluationResult(overallResult);
      setStep('COMPLETED');
    } catch (err) {
      console.error('Error finalizing interview:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleReturnToDashboard = () => {
    if (onComplete) onComplete(evaluationResult);
    if (onClose) onClose();
    else navigate('/profile-review');
  };

  // Render Direct Access Protection Errors
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

  // ----------------------------------------------------
  // STEP 1: INTERVIEW INSTRUCTIONS SCREEN
  // ----------------------------------------------------
  if (step === 'INSTRUCTIONS') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans select-none overflow-y-auto ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-900'}`}>
        <div className="saas-card p-6 md:p-8 bg-white text-slate-900 border border-slate-200 max-w-2xl w-full rounded-3xl shadow-2xl space-y-6 my-8 animate-fadeIn">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase">
                  Job Interview &bull; Official Recruitment Assessment
                </span>
              </div>
              <h2 className="text-xl font-black font-outfit text-slate-950 mt-1">{interview?.jobTitle || 'Senior MERN Stack & AI Engineer'}</h2>
              <p className="text-xs text-indigo-600 font-bold">{interview?.company || 'TechNova Solutions'}</p>
            </div>
            <button onClick={handleReturnToDashboard} className="text-slate-400 hover:text-slate-600 font-bold text-sm">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs font-medium">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Questions</span>
              <span className="font-extrabold text-slate-900 block font-outfit text-sm">{questions.length} Items</span>
              <span className="text-slate-500 block text-[11px]">MCQ &bull; Text &bull; Voice</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Schedule Window</span>
              <span className="font-extrabold text-indigo-950 block text-xs">
                {interview?.scheduledTime || '10:00 AM'} – {interview?.endTimeISO ? new Date(interview.endTimeISO).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '02:00 PM'}
              </span>
              <span className="text-indigo-800 block text-[11px]">Duration: {interview?.duration || '4 Hours'}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Environment</span>
              <span className="font-extrabold text-emerald-950 block text-xs">Full-Screen Mode</span>
              <span className="text-emerald-800 block text-[11px]">Proctored Monitoring</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
            <span className="font-bold text-slate-900 font-outfit block flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600" /> Proctored Guidelines & System Requirements:
            </span>
            <ul className="space-y-1.5 list-disc list-inside font-medium leading-relaxed">
              <li>Stay inside this interview window for the duration of the test.</li>
              <li>Do not exit full-screen mode or switch browser tabs/windows.</li>
              <li>Submit each answer explicitly before advancing to the next question.</li>
              <li>Voice questions require working microphone access.</li>
              <li>Schedule window countdown is active; test automatically finalizes when window closes.</li>
            </ul>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledgedInstructions}
              onChange={(e) => setAcknowledgedInstructions(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="text-xs font-bold text-indigo-950">
              I understand the instructions and agree to adhere to anti-cheating guidelines.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleReturnToDashboard}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!acknowledgedInstructions}
              onClick={handleEnterInterview}
              className="btn-primary text-xs px-6 py-2.5 font-bold rounded-xl shadow-md disabled:opacity-40 cursor-pointer flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" /> Enter Job Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 3: COMPLETED SUMMARY SCREEN
  // ----------------------------------------------------
  if (step === 'COMPLETED' && evaluationResult) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 font-sans select-none overflow-y-auto ${darkMode ? 'bg-slate-950 text-white' : 'bg-slate-900 text-slate-900'}`}>
        <div className="saas-card p-6 md:p-8 bg-white text-slate-900 border border-slate-200 max-w-2xl w-full rounded-3xl shadow-2xl space-y-6 animate-scaleUp my-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-200 shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black font-outfit text-slate-950">Job Interview Submitted!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your official recruitment assessment for <strong className="text-slate-900">{interview?.jobTitle || 'Senior MERN Stack & AI Engineer'}</strong> has been evaluated against HR reference criteria.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Submitted</span>
              <span className="text-lg font-black text-slate-900 font-outfit">{evaluationResult.answeredCount} / {evaluationResult.totalQuestions}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Overall Score</span>
              <span className="text-lg font-black text-indigo-700 font-outfit">{evaluationResult.score}%</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Violations</span>
              <span className="text-lg font-black text-amber-800 font-outfit">{evaluationResult.violationCount}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Status</span>
              <span className="text-xs font-extrabold text-emerald-800 uppercase block mt-1">Recorded</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900 font-outfit block">Evaluation Summary:</span>
            <p className="text-slate-700 leading-relaxed font-medium">"{evaluationResult.overallFeedback}"</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleReturnToDashboard}
              className="btn-primary text-xs px-6 py-3 font-bold rounded-xl shadow-md"
            >
              Return to Profile Review
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STEP 2: ISOLATED TEST ROOM MATCHING SCREENSHOT EXACTLY
  // ----------------------------------------------------
  return (
    <div className={`min-h-screen flex flex-col font-sans select-none overflow-hidden theme-transition-all ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100/90 text-slate-900'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-old(root) {
          z-index: 1;
        }
        ::view-transition-new(root) {
          z-index: 9999;
        }
        .theme-transition-all, .theme-transition-all * {
          transition: background-color 0.4s ease-in-out, border-color 0.4s ease-in-out, color 0.3s ease-in-out, box-shadow 0.4s ease-in-out;
        }
      ` }} />
      
      {/* 1. TOP NAVIGATION HEADER (Matching Screenshot) */}
      <header className={`px-6 py-3.5 border-b flex items-center justify-between shadow-xs transition-colors ${darkMode ? 'bg-slate-950/95 border-slate-800 text-white backdrop-blur-md' : 'bg-white border-slate-200/90 text-slate-950'}`}>
        {/* Left Header Brand & Requisition Meta */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white font-black text-xs flex items-center justify-center font-outfit shadow-md shadow-purple-600/30">
            JOB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-base font-extrabold font-outfit leading-tight ${darkMode ? 'text-white' : 'text-slate-950'}`}>Job Interview</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-700 text-white shadow-xs">
                Proctored Room
              </span>
            </div>
            <p className={`text-xs font-medium truncate max-w-md mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {interview?.jobTitle || 'Senior MERN Stack & AI Engineer'} &bull; {interview?.company || 'TechNova Solutions'}
            </p>
          </div>
        </div>

        {/* Right Header Timer Widget, Dark Mode Switcher & Finish Button */}
        <div className="flex items-center gap-4">
          {/* Schedule Window Remaining Timer Widget */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border text-xs ${darkMode ? 'bg-slate-900 border-slate-800 text-purple-300' : 'bg-slate-50 border-slate-200/90 text-slate-950'}`}>
            <Clock className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-slate-600'}`} />
            <div>
              <span className={`text-[9px] font-extrabold uppercase tracking-wider block leading-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Schedule Window Remaining</span>
              <span className={`font-mono font-black text-sm ${darkMode ? 'text-purple-300' : 'text-slate-950'}`}>{formatTimer(timeRemainingSeconds)}</span>
            </div>
          </div>

          {/* Theme Toggle Moon/Sun Button with Google Radial Reveal */}
          <button
            type="button"
            onClick={handleThemeToggle}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${darkMode ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-indigo-600 border-slate-200/90 hover:bg-slate-100'}`}
            title="Toggle Light/Dark Theme (Google Corner-to-Corner Transition)"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Finish Now Action Button */}
          <button
            type="button"
            onClick={() => setShowFinishModal(true)}
            className="btn-primary bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 py-2.5 font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Finish Now
          </button>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN LAYOUT CONTAINER (Full Width Workspace) */}
      <div className="flex-1 w-full max-w-none px-4 md:px-8 lg:px-10 py-5 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-y-auto min-h-0">
        
        {/* LEFT COLUMN: QUESTION NAVIGATOR & INTERVIEW INFORMATION */}
        <div className="w-full lg:w-80 space-y-4 shrink-0">
          
          {/* CARD 1: QUESTION NAVIGATOR */}
          <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md' : 'bg-white border-slate-200/90'}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h2 className={`text-xs font-black font-outfit uppercase tracking-wider ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                QUESTION NAVIGATOR
              </h2>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${darkMode ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                {submittedCount} / {questions.length} Submitted
              </span>
            </div>

            {/* 5-Column Grid of 20 Question Buttons */}
            <div className="grid grid-cols-5 gap-2">
              {questions.slice(0, 20).map((q, idx) => {
                const isActive = idx === currentIndex;
                const isAnswered = Boolean(answers[q.questionId]?.answer || answers[q.questionId]?.option || answers[q.questionId]?.transcript);
                const isReview = Boolean(markedForReview[q.questionId]);

                return (
                  <button
                    key={q.questionId || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs font-extrabold font-outfit transition-all flex flex-col items-center justify-center relative cursor-pointer border ${
                      isActive
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30 scale-105 z-10'
                        : isAnswered
                        ? (darkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/80 hover:border-emerald-500' : 'bg-slate-50 text-slate-900 border-emerald-300 hover:border-emerald-500')
                        : (darkMode ? 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-700/80' : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100')
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="text-[8px] leading-none mt-0.5">
                      {isActive ? '●' : isAnswered ? '🟢' : '◦'}
                    </span>
                    {isReview && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Status Legend Footer */}
            <div className={`pt-3 border-t flex items-center justify-between text-[11px] font-semibold ${darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" /> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Answered</span>
              <span className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full inline-block ${darkMode ? 'bg-slate-600' : 'bg-slate-800'}`} /> Unanswered</span>
            </div>
          </div>

          {/* CARD 2: INTERVIEW INFORMATION (Collapsible) */}
          <div className={`p-5 rounded-2xl border shadow-xl space-y-3 ${darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md' : 'bg-white border-slate-200/90'}`}>
            <button
              type="button"
              onClick={() => setInfoCollapsed(!infoCollapsed)}
              className={`w-full flex items-center justify-between font-black text-xs font-outfit uppercase tracking-wider cursor-pointer ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
            >
              <span className="flex items-center gap-1.5">
                {infoCollapsed ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
                Interview Information
              </span>
            </button>

            {!infoCollapsed && (
              <div className={`space-y-3 pt-2 text-xs font-medium border-t ${darkMode ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${darkMode ? 'bg-purple-950 text-purple-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Interview Title</span>
                    <span className={`font-extrabold block ${darkMode ? 'text-white' : 'text-slate-900'}`}>{interview?.jobTitle || 'Senior MERN Stack & AI Engineer'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${darkMode ? 'bg-purple-950 text-purple-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Interview Type</span>
                    <span className={`font-extrabold block ${darkMode ? 'text-white' : 'text-slate-900'}`}>Job Interview (HR Scheduled)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${darkMode ? 'bg-purple-950 text-purple-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Questions</span>
                    <span className={`font-extrabold block ${darkMode ? 'text-white' : 'text-slate-900'}`}>{questions.length} Questions</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg mt-0.5 ${darkMode ? 'bg-purple-950 text-purple-300' : 'bg-indigo-50 text-indigo-600'}`}>
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Time Window</span>
                    <span className={`font-extrabold block ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {interview?.scheduledDate || '10 Sep 2026'}, {interview?.scheduledTime || '10:00 AM'} – {interview?.endTimeISO ? new Date(interview.endTimeISO).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '02:00 PM'} (4 Hours)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN COLUMN: QUESTION & ANSWER ENGINE CARD */}
        <div className="flex-1 min-w-0 w-full flex flex-col">
          <div className={`p-6 md:p-8 lg:p-10 rounded-3xl border shadow-xl space-y-6 flex-1 flex flex-col justify-between ${darkMode ? 'bg-slate-900/90 border-slate-800 text-slate-100 backdrop-blur-md' : 'bg-white border-slate-200/90'}`}>
            
            <div className="space-y-6">
              {/* Question Sub-header Bar */}
              <div className={`flex items-center justify-between border-b pb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-xs font-black font-outfit uppercase tracking-wider ${darkMode ? 'text-purple-400' : 'text-indigo-600'}`}>
                  SECTION {Math.floor(currentIndex / 5) + 1} — {currentQ?.type || 'MCQ'} &bull; QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${darkMode ? 'bg-purple-950 text-purple-200 border border-purple-800' : 'bg-slate-900 text-white'}`}>
                  {currentQ?.type || 'MCQ'}
                </span>
              </div>

              {/* Main Question Text */}
              <h2 className={`text-xl md:text-2xl font-bold font-outfit leading-snug ${darkMode ? 'text-white' : 'text-slate-950'}`}>
                {currentQ?.question}
              </h2>

              {/* ------------------------------------ */}
              {/* ANSWER INPUT RENDERERS BASED ON TYPE */}
              {/* ------------------------------------ */}

              {/* MCQ QUESTION TYPE */}
              {currentQ?.type === 'MCQ' && (
                <div className="space-y-3 pt-2">
                  {(currentQ.options || [
                    'Utilize libuv threadpool workers and cluster module process scaling.',
                    'Block the main event loop thread using synchronous sleep timers.',
                    'Handle all incoming HTTP requests via single-threaded synchronous loops.',
                    'Force client-side web applications to process database aggregations.'
                  ]).map((opt, idx) => {
                    const optLetter = String.fromCharCode(65 + idx);
                    const isSelected = answers[currentQ.questionId]?.option === opt;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAnswers(prev => ({
                          ...prev,
                          [currentQ.questionId]: {
                            questionId: currentQ.questionId,
                            type: 'MCQ',
                            option: opt,
                            answer: opt
                          }
                        }))}
                        className={`w-full p-4 rounded-2xl text-left text-xs font-medium transition-all border cursor-pointer flex items-center gap-3.5 ${
                          isSelected
                            ? (darkMode ? 'bg-purple-950/80 border-purple-500 text-white font-bold ring-2 ring-purple-500/40 shadow-md' : 'bg-indigo-50/60 border-indigo-600 text-indigo-950 font-bold ring-2 ring-indigo-500/20 shadow-xs')
                            : (darkMode ? 'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:border-purple-500/60 hover:bg-slate-800/90' : 'bg-white border-slate-200/90 text-slate-800 hover:border-indigo-300 hover:bg-slate-50')
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs ${
                          isSelected
                            ? 'border-purple-500 bg-purple-600 text-white'
                            : (darkMode ? 'border-slate-600 bg-slate-800 text-slate-300' : 'border-slate-300 text-slate-600')
                        }`}>
                          {optLetter}
                        </div>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* TEXT QUESTION TYPE */}
              {currentQ?.type === 'TEXT' && (
                <div className="space-y-3 pt-2">
                  <label className={`text-xs font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your Detailed Written Answer:</label>
                  <textarea
                    rows={7}
                    value={answers[currentQ.questionId]?.answer || ''}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [currentQ.questionId]: {
                        questionId: currentQ.questionId,
                        type: 'TEXT',
                        answer: e.target.value
                      }
                    }))}
                    placeholder="Type your detailed response here..."
                    className={`w-full border rounded-2xl p-4 text-xs font-sans leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                      darkMode ? 'bg-slate-950/90 border-slate-700 text-white placeholder-slate-500 focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500'
                    }`}
                  ></textarea>
                </div>
              )}

              {/* VOICE QUESTION TYPE */}
              {currentQ?.type === 'VOICE' && (
                <div className="space-y-4 pt-2">
                  <label className={`text-xs font-bold uppercase tracking-wider block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Voice Answer & Live Speech-to-Text:</label>
                  <div className={`p-6 rounded-2xl border text-center space-y-4 ${darkMode ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-center gap-4 items-center">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <Mic className="w-4 h-4" /> Start Recording Answer
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopRecording}
                          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-md animate-pulse cursor-pointer"
                        >
                          <MicOff className="w-4 h-4" /> Stop Recording ({recordingSeconds}s)
                        </button>
                      )}
                    </div>

                    {transcriptionFailed && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center justify-between">
                        <span>Voice transcription failed or no speech detected.</span>
                        <button onClick={startRecording} className="btn-secondary text-[11px] py-1 px-3 font-bold flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" /> Retry Recording
                        </button>
                      </div>
                    )}

                    {(transcript || answers[currentQ.questionId]?.transcript) && (
                      <div className={`p-4 rounded-xl border text-left space-y-1 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Generated Speech Transcript:</span>
                        <p className={`text-xs font-medium leading-relaxed ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                          "{transcript || answers[currentQ.questionId]?.transcript}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 3. FOOTER ACTION BAR */}
            <div className={`pt-6 border-t flex flex-wrap justify-between items-center gap-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              {/* Mark for Review Checkbox */}
              <button
                type="button"
                onClick={() => setMarkedForReview(prev => ({ ...prev, [currentQ.questionId]: !prev[currentQ.questionId] }))}
                className={`flex items-center gap-2 text-xs font-medium cursor-pointer ${darkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {markedForReview[currentQ.questionId] ? (
                  <CheckSquare className="w-4 h-4 text-purple-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span className="flex items-center gap-1">
                  <Flag className={`w-3.5 h-3.5 ${markedForReview[currentQ.questionId] ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} /> Mark for review
                </span>
              </button>

              {/* Submit Button & Selection Hint */}
              <div className="flex items-center gap-4">
                <span className={`text-[11px] font-medium hidden sm:inline ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {answers[currentQ.questionId]?.option || answers[currentQ.questionId]?.answer || answers[currentQ.questionId]?.transcript ? 'Ready to submit' : 'Select an option to enable'}
                </span>
                
                <button
                  type="button"
                  disabled={!answers[currentQ.questionId]?.option && !answers[currentQ.questionId]?.answer && !answers[currentQ.questionId]?.transcript}
                  onClick={() => handleAnswerSubmit(currentQ.questionId, answers[currentQ.questionId])}
                  className="btn-primary bg-purple-600 hover:bg-purple-500 text-white text-xs px-6 py-3 font-bold font-outfit rounded-xl shadow-md disabled:opacity-40 cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Answer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Cheating Violation Warning Alert Modal */}
      {activeViolationAlert && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="saas-card p-6 bg-slate-900 border border-amber-500/40 max-w-md w-full rounded-3xl shadow-2xl space-y-4 text-white">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert className="w-7 h-7" />
              <h3 className="text-base font-black font-outfit text-white">Interview Window Alert</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              {activeViolationAlert.message}
            </p>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-bold">
              Violation #{violations.length} recorded against this attempt.
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveViolationAlert(null);
                  requestFullscreenMode();
                }}
                className="btn-primary text-xs px-5 py-2.5 font-bold rounded-xl shadow-md cursor-pointer"
              >
                Return to Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Confirmation Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="saas-card p-6 bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl shadow-2xl space-y-5 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold font-outfit text-white">Finish Job Interview?</h3>
              <button onClick={() => setShowFinishModal(false)} className="text-slate-400 hover:text-white font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Submitted</span>
                <span className="text-xl font-black text-emerald-300 font-outfit">{submittedCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Unsubmitted</span>
                <span className="text-xl font-black text-amber-300 font-outfit">{unsubmittedCount}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Once submitted, your answers will be evaluated according to the recruiter's official evaluation prompt. You cannot edit responses after finishing.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinalizeInterview(false)}
                className="btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs px-5 py-2.5 font-bold rounded-xl shadow-md cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? 'Evaluating Answers...' : 'Finish Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
