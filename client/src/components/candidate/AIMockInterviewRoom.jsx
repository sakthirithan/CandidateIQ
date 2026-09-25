import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mockInterviewService,
  extractAIFeaturesFromJD,
  generateQuestionsFromJD,
  fallbackAIProvider,
  METHOD_CONFIG
} from '../../services/mockApi/interviewService';
import { mockJobService } from '../../services/mockApi/jobService';
import { mockCandidateService } from '../../services/mockApi/candidateService';
import { getCurrentUser } from '../../utils/auth';
import {
  subscribeToStorage,
  saveMockInterviewAttempt,
  getMockInterviewAttempts,
  updateMockInterviewAttempt,
  completeMockInterviewAttempt,
  storageResumes
} from '../../services/storage/storageService';
import CustomQuestionBankUploadModal from './CustomQuestionBankUploadModal';
import {
  Play, Send, Mic, Clock, Sparkles, MessageSquare, CheckCircle2, AlertCircle,
  Video, MicOff, Bot, Pause, RotateCcw, Briefcase, Calendar, Upload, FileSpreadsheet,
  AlertTriangle, ShieldCheck, Lock, LogOut, Check, Eye, Sun, Moon, ArrowLeft,
  CheckSquare, Square, FileText, ChevronRight, RefreshCw, X, Edit3, Layers, Sliders
} from 'lucide-react';
import * as XLSX from 'xlsx';

function AIMockInterviewRoom({ onComplete, targetSkill, initialJobData = null }) {
  const navigate = useNavigate();

  // Top Primary Tab: 'jobs' (Job Requisitions) | 'results' (My Mock Attempts / Results)
  const [activeModuleTab, setActiveModuleTab] = useState('jobs');

  // Flow Steps: 'idle' | 'creation_popup' | 'generating' | 'guidelines' | 'testing' | 'completed'
  const [flowStep, setFlowStep] = useState('idle');

  // Recruiter Jobs & Stored Mock Attempts List
  const [availableJobs, setAvailableJobs] = useState([]);
  const [mockAttemptsList, setMockAttemptsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creation Popup Configuration State
  const [creationSource, setCreationSource] = useState('RECRUITER_JOB'); // 'RECRUITER_JOB' | 'CUSTOM_JD'
  const [selectedJob, setSelectedJob] = useState(null);
  const [customTitle, setCustomTitle] = useState('Senior Frontend Developer');
  const [customJobDescription, setCustomJobDescription] = useState('We are looking for a Senior Frontend Engineer proficient in React, TypeScript, modern CSS, state management, web performance optimization, and REST API integration.');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium'); // 'Easy' | 'Medium' | 'Hard' | 'Random'
  const [selectedMethod, setSelectedMethod] = useState('RANDOM'); // 'MCQ' | 'VOICE' | 'TEXT' | 'RANDOM'

  // Modals state
  const [showUploadBankModal, setShowUploadBankModal] = useState(false);
  const [showFinishConfirmModal, setShowFinishConfirmModal] = useState(false);
  const [showUnsubmittedWarning, setShowUnsubmittedWarning] = useState(false);
  const [pendingNextIndex, setPendingNextIndex] = useState(null);
  const [customQuestionBanks, setCustomQuestionBanks] = useState([]);

  // AI Feature Extraction & Generation Progress State
  const [aiFeatures, setAiFeatures] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generationElapsed, setGenerationElapsed] = useState(0);
  const [generationPhase, setGenerationPhase] = useState(1); // 1: Analyzing, 2: Extracting, 3: Creating, 4: Done
  const [generationError, setGenerationError] = useState(null);

  // Guidelines Checkboxes State (ALL 4 REQUIRED)
  const [guidelinesCheckboxes, setGuidelinesCheckboxes] = useState({
    format: false,
    submission: false,
    timer: false,
    ready: false
  });

  // Active Attempt State
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Local draft inputs for current question (NOT saved until Submit is clicked!)
  const [draftMcqOption, setDraftMcqOption] = useState('');
  const [draftTextAnswer, setDraftTextAnswer] = useState('');
  const [draftVoiceTranscript, setDraftVoiceTranscript] = useState('');

  // Dictionary of SUBMITTED answers: { [questionId]: { questionId, selectedOption, textAnswer, voiceTranscript, submittedAt } }
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [testSecondsElapsed, setTestSecondsElapsed] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Theme Switch State inside Test Mode ('dark' | 'light')
  const [testThemeMode, setTestThemeMode] = useState('dark');

  useEffect(() => {
    loadMockList();
    loadJobs();

    // Subscribe to reactive localStorage updates
    const unsubscribe = subscribeToStorage((detail) => {
      if (!detail || detail.entity === 'mockInterview') {
        loadMockList();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadMockList = () => {
    try {
      setLoading(true);
      const list = getMockInterviewAttempts();
      setMockAttemptsList(list || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobs = await mockJobService.getJobs();
      setAvailableJobs(jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-open Creation flow if initialJobData is passed from JobDetailsView
  useEffect(() => {
    if (initialJobData) {
      openRecruiterJobCreation(initialJobData);
    }
  }, [initialJobData]);

  // Generation Elapsed Timer Effect
  useEffect(() => {
    let timer;
    if (flowStep === 'generating') {
      setGenerationElapsed(0);
      timer = setInterval(() => {
        setGenerationElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [flowStep]);

  // Test Mode Timer Effect (derives elapsed time from attempt.startedAt)
  useEffect(() => {
    let timer;
    if (flowStep === 'testing' && currentAttempt?.startedAt) {
      const startTime = new Date(currentAttempt.startedAt).getTime();
      timer = setInterval(() => {
        const now = Date.now();
        const elapsedSecs = Math.max(0, Math.floor((now - startTime) / 1000));
        setTestSecondsElapsed(elapsedSecs);

        // Auto-finish if total duration reached (e.g. 30 mins = 1800s)
        const totalDurationSecs = (currentAttempt.timerMinutes || 30) * 60;
        if (elapsedSecs >= totalDurationSecs) {
          clearInterval(timer);
          handleAutoFinishTimer();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [flowStep, currentAttempt]);

  // Tab switch & visibility monitoring during active test
  useEffect(() => {
    if (flowStep !== 'testing') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        mockInterviewService.recordTabSwitch(currentAttempt?.attemptId);
      }
    };

    const handleBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      mockInterviewService.recordTabSwitch(currentAttempt?.attemptId);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [flowStep, currentAttempt]);

  // Reset local draft state when switching active question
  useEffect(() => {
    if (!currentAttempt || !currentAttempt.questions[currentQuestionIndex]) return;
    const qId = currentAttempt.questions[currentQuestionIndex].id || currentAttempt.questions[currentQuestionIndex].questionId;
    const existing = submittedAnswers[qId];

    if (existing) {
      setDraftMcqOption(existing.selectedOption || '');
      setDraftTextAnswer(existing.textAnswer || '');
      setDraftVoiceTranscript(existing.voiceTranscript || '');
    } else {
      setDraftMcqOption('');
      setDraftTextAnswer('');
      setDraftVoiceTranscript('');
    }
  }, [currentQuestionIndex, currentAttempt, submittedAnswers]);

  // 1. OPEN CREATION POPUP — SOURCE 1 (RECRUITER JOB)
  const openRecruiterJobCreation = (job) => {
    setCreationSource('RECRUITER_JOB');
    setSelectedJob(job);
    setCustomTitle(job.title);
    setCustomJobDescription(job.description || job.jobDescription || '');
    setSelectedDifficulty('Medium');
    setSelectedMethod('RANDOM');
    setFlowStep('creation_popup');
  };

  // 2. OPEN CREATION POPUP — SOURCE 2 (CUSTOM JOB DESCRIPTION)
  const openCustomJDCreation = () => {
    setCreationSource('CUSTOM_JD');
    setSelectedJob(null);
    setCustomTitle('Senior Frontend Developer');
    setCustomJobDescription('We are seeking a Senior Frontend Developer proficient in React 19, TypeScript, modern CSS, state management, web performance optimization, and REST API integration.');
    setSelectedDifficulty('Medium');
    setSelectedMethod('RANDOM');
    setFlowStep('creation_popup');
  };

  // 3. EXECUTE AI PIPELINE ON CREATE CONFIRMATION
  const handleConfirmCreateMockInterview = async () => {
    const jobTitleToUse = creationSource === 'RECRUITER_JOB' ? selectedJob.title : customTitle;
    const jdToUse = creationSource === 'RECRUITER_JOB' ? (selectedJob.description || selectedJob.jobDescription) : customJobDescription;

    if (!jobTitleToUse.trim() || !jdToUse.trim()) return;

    try {
      setFlowStep('generating');
      setGenerationError(null);
      setGenerationPhase(1);

      // Step 1: Analyzing Job Description
      await new Promise((r) => setTimeout(r, 500));
      setGenerationPhase(2);

      // Step 2: Extracting Features (returns keywords, topics, technicalSkills, concepts, responsibilities, tools, frameworks, domainKnowledge)
      const features = extractAIFeaturesFromJD(jdToUse);
      setAiFeatures(features);
      await new Promise((r) => setTimeout(r, 600));
      setGenerationPhase(3);

      // Step 3: Question Blueprint & Generation respecting candidate profile, primary resume & JD
      let questions = [];
      try {
        const currentUser = getCurrentUser();
        const candId = currentUser?.id || 'cand_1';
        const candProfile = await mockCandidateService.getCandidateById(candId);
        const primaryRes = storageResumes.getPrimaryByCandidateId(candId);
        const missingSkills = (selectedJob?.requiredSkills || []).filter(
          (req) => !(candProfile?.skills || []).some((s) => (s.name || s).toLowerCase().includes(req.toLowerCase()))
        );

        questions = generateQuestionsFromJD({
          jobDescriptionSnapshot: jdToUse,
          targetJobTitle: jobTitleToUse,
          questionType: selectedMethod,
          difficulty: selectedDifficulty,
          questionCount: METHOD_CONFIG[selectedMethod]?.totalCount || 20,
          candidateProfile: candProfile,
          resumeAnalysis: primaryRes?.parsedData || null,
          missingSkills
        });
      } catch (err) {
        // Fallback AI Provider if generation error
        const fallbackRes = await fallbackAIProvider({
          jobTitle: jobTitleToUse,
          jobDescription: jdToUse,
          difficulty: selectedDifficulty,
          method: selectedMethod
        });
        questions = fallbackRes.questions;
      }

      setGeneratedQuestions(questions);
      await new Promise((r) => setTimeout(r, 500));
      setGenerationPhase(4);

      // Transition to Guidelines / Assessment Preview Screen
      setGuidelinesCheckboxes({ format: false, submission: false, timer: false, ready: false });
      setFlowStep('guidelines');
    } catch (err) {
      console.error('AI Pipeline Failure:', err);
      // Fallback AI Provider Recovery
      const fallbackRes = await fallbackAIProvider({
        jobTitle: jobTitleToUse,
        jobDescription: jdToUse,
        difficulty: selectedDifficulty,
        method: selectedMethod
      });
      setAiFeatures(fallbackRes.extractedFeatures);
      setGeneratedQuestions(fallbackRes.questions);
      setGuidelinesCheckboxes({ format: false, submission: false, timer: false, ready: false });
      setFlowStep('guidelines');
    }
  };

  const handleRetryGeneration = () => {
    handleConfirmCreateMockInterview();
  };

  // 4. LAUNCH MOCK INTERVIEW ATTEMPT
  const handleLaunchMockInterview = () => {
    const allChecked = guidelinesCheckboxes.format && guidelinesCheckboxes.submission && guidelinesCheckboxes.timer && guidelinesCheckboxes.ready;
    if (!allChecked) return;

    const newAttemptId = `mock_att_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const methodCfg = METHOD_CONFIG[selectedMethod] || METHOD_CONFIG.RANDOM;

    const jobTitleToUse = creationSource === 'RECRUITER_JOB' ? selectedJob.title : customTitle;
    const jdToUse = creationSource === 'RECRUITER_JOB' ? (selectedJob.description || selectedJob.jobDescription) : customJobDescription;
    const companyToUse = creationSource === 'RECRUITER_JOB' ? (selectedJob.company || 'Recruiter Requisition') : 'Custom Requisition';

    const newAttempt = {
      attemptId: newAttemptId,
      id: newAttemptId,
      sessionId: newAttemptId,
      source: creationSource,
      jobId: creationSource === 'RECRUITER_JOB' ? selectedJob.id : null,
      userId: 'cand_1',
      candidateId: 'cand_1',
      title: jobTitleToUse,
      jobTitle: jobTitleToUse,
      jobDescription: jdToUse,
      company: companyToUse,
      difficulty: selectedDifficulty,
      method: selectedMethod,
      sections: methodCfg.sections,
      extractedFeatures: aiFeatures,
      questions: generatedQuestions,
      answers: [],
      startedAt: new Date().toISOString(),
      finishedAt: null,
      duration: methodCfg.estimatedDuration || 30,
      timerMinutes: methodCfg.estimatedDuration || 30,
      status: 'in-progress',
      state: 'In Progress',
      result: null
    };

    saveMockInterviewAttempt(newAttempt);
    setCurrentAttempt(newAttempt);
    setSubmittedAnswers({});
    setCurrentQuestionIndex(0);
    setTestSecondsElapsed(0);
    setTabSwitchCount(0);
    setFlowStep('testing');

    // Request browser fullscreen if available
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleCancelGuidelines = () => {
    setFlowStep('idle');
    setSelectedJob(null);
  };

  // 5. SUBMIT ANSWER HANDLER
  const handleSubmitAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!currentAttempt || !currentAttempt.questions[currentQuestionIndex]) return;

    const currentQ = currentAttempt.questions[currentQuestionIndex];
    const qId = currentQ.id || currentQ.questionId;
    const qType = currentQ.questionType || currentQ.type || 'Voice';

    let payload = {
      questionId: qId,
      questionType: qType
    };

    if (qType === 'MCQ') {
      if (!draftMcqOption) return;
      payload.selectedOption = draftMcqOption;
    } else if (qType === 'Voice') {
      if (!draftVoiceTranscript) return;
      payload.voiceTranscript = draftVoiceTranscript;
      payload.answer = draftVoiceTranscript;
    } else {
      if (!draftTextAnswer.trim()) return;
      payload.textAnswer = draftTextAnswer.trim();
      payload.answer = draftTextAnswer.trim();
    }

    try {
      setSubmitting(true);

      const answerEntry = {
        questionId: qId,
        question: currentQ.questionText || currentQ.question,
        answer: payload.answer || payload.textAnswer || payload.voiceTranscript || payload.selectedOption,
        selectedOption: payload.selectedOption || null,
        textAnswer: payload.textAnswer || null,
        voiceTranscript: payload.voiceTranscript || null,
        submittedAt: new Date().toISOString()
      };

      const updatedSubmitted = {
        ...submittedAnswers,
        [qId]: answerEntry
      };
      setSubmittedAnswers(updatedSubmitted);

      // Persist immediately to localStorage attempt object
      const answersArray = Object.values(updatedSubmitted);
      updateMockInterviewAttempt(currentAttempt.attemptId, {
        answers: answersArray
      });

      // Automatically advance to next unsubmitted question if available
      if (currentQuestionIndex + 1 < currentAttempt.questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Check if current active question has unsubmitted input
  const hasUnsubmittedInput = () => {
    if (!currentAttempt || !currentAttempt.questions[currentQuestionIndex]) return false;
    const q = currentAttempt.questions[currentQuestionIndex];
    const qId = q.id || q.questionId;
    if (submittedAnswers[qId]) return false; // Already submitted

    if (q.questionType === 'MCQ' && draftMcqOption) return true;
    if (q.questionType === 'Voice' && draftVoiceTranscript) return true;
    if (q.questionType === 'Text' && draftTextAnswer.trim()) return true;
    return false;
  };

  const handleSelectQuestion = (targetIdx) => {
    if (targetIdx === currentQuestionIndex) return;
    if (hasUnsubmittedInput()) {
      setPendingNextIndex(targetIdx);
      setShowUnsubmittedWarning(true);
    } else {
      setCurrentQuestionIndex(targetIdx);
    }
  };

  const handleConfirmLeaveUnsubmitted = () => {
    setShowUnsubmittedWarning(false);
    if (pendingNextIndex !== null) {
      setCurrentQuestionIndex(pendingNextIndex);
      setPendingNextIndex(null);
    }
  };

  // FINISH CONFIRMATION POPUP HANDLERS
  const handleTriggerFinishNow = (e) => {
    if (e) e.preventDefault();
    setShowFinishConfirmModal(true);
  };

  const handleCancelFinishModal = () => {
    setShowFinishConfirmModal(false);
  };

  const handleConfirmFinishAttempt = async () => {
    setShowFinishConfirmModal(false);
    await finalizeAttemptCompletion();
  };

  const handleAutoFinishTimer = async () => {
    await finalizeAttemptCompletion();
  };

  const finalizeAttemptCompletion = async () => {
    if (!currentAttempt) return;

    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    const finalAnswersArray = Object.values(submittedAnswers);
    const resultObj = {
      overallScore: 85,
      answeredCount: finalAnswersArray.length,
      unansweredCount: currentAttempt.questions.length - finalAnswersArray.length,
      completionTime: formatTimeDisplay(testSecondsElapsed)
    };

    const completedAttempt = completeMockInterviewAttempt(currentAttempt.attemptId, resultObj);
    setCurrentAttempt({ ...currentAttempt, ...completedAttempt, status: 'completed', state: 'Completed' });
    setFlowStep('completed');
    loadMockList();
  };

  const formatTimeDisplay = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatRemainingTimer = () => {
    const totalSecs = (currentAttempt?.timerMinutes || 30) * 60;
    const remainingSecs = Math.max(0, totalSecs - testSecondsElapsed);
    return formatTimeDisplay(remainingSecs);
  };

  const handleVoiceSim = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setDraftVoiceTranscript("I architect non-blocking asynchronous APIs using Express middleware, libuv worker pools, and Redis caching layers to ensure low query latency under high traffic.");
        setIsRecording(false);
      }, 1400);
    }
  };

  const blockPrevent = (e) => {
    e.preventDefault();
  };

  // Launch attempt from a saved card on Results tab
  const handleViewResultDetails = (attemptItem) => {
    const attId = attemptItem.attemptId || attemptItem.id || attemptItem.sessionId;
    navigate(`/profile-review/${attId}`);
  };

  const answeredCount = Object.keys(submittedAnswers).length;
  const totalQuestionsCount = currentAttempt?.questions?.length || 10;
  const unansweredCount = totalQuestionsCount - answeredCount;

  return (
    <div className="w-full max-w-none px-5 md:px-8 space-y-6 select-none font-sans py-6">

      {/* TOP HEADER & PRIMARY MODULE TABS (Hidden during active test mode) */}
      {flowStep !== 'testing' && flowStep !== 'generating' && flowStep !== 'creation_popup' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold font-outfit text-slate-950">AI Mock Interview Studio</h2>
                  <span className="badge-pill bg-indigo-50 text-indigo-700 border-indigo-100 font-bold text-[10px]">
                    2 Creation Sources: Recruiter Job & Custom JD
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Attempt job-specific mock interviews created from recruiter requisitions or your custom Job Description.
                </p>
              </div>
            </div>

            {/* Top Right Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openCustomJDCreation}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600 transition-all cursor-pointer flex items-center gap-2 text-xs font-bold font-outfit shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-amber-300" />
                <span>Create With My Job Description</span>
              </button>

              <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => { setActiveModuleTab('jobs'); setFlowStep('idle'); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
                    activeModuleTab === 'jobs' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Job Requisitions ({availableJobs.length})
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveModuleTab('results'); setFlowStep('idle'); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold font-outfit transition-all cursor-pointer ${
                    activeModuleTab === 'results' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  My Mock Attempts ({mockAttemptsList.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE TAB 1: RECRUITER JOB REQUISITIONS LISTING */}
      {flowStep === 'idle' && activeModuleTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" /> Source 1 — Recruiter Created Jobs
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click "Create Mock Interview" to launch read-only JD extraction
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-7 h-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 mt-2 font-medium">Loading recruiter job requisitions...</p>
            </div>
          ) : availableJobs.length === 0 ? (
            <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-950 font-outfit">No Jobs Available</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Use "Create With My Job Description" above to enter a custom requisition.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {availableJobs.map((job) => (
                <div
                  key={job.id}
                  className="saas-card p-6 border border-slate-200/90 hover:border-indigo-300 bg-white rounded-2xl space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {job.department || 'Engineering'} &bull; {job.type || 'Full-Time'}
                        </span>
                        <h4 className="text-lg font-bold font-outfit text-slate-950 mt-1">{job.title}</h4>
                        <p className="text-xs font-semibold text-slate-600">{job.company || 'CandidateIQ Enterprise'} &bull; {job.location || 'Remote'}</p>
                      </div>
                      <span className="badge-pill bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-mono">
                        {job.experience || '3-5 Yrs Exp'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {job.description || job.jobDescription || 'Senior engineering requisition focusing on high performance web architecture and AI endpoint integration.'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(job.skills || ['React.js', 'Node.js', 'MongoDB', 'REST API']).map((sk, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded-lg bg-indigo-50/70 text-indigo-800 text-[10px] font-bold border border-indigo-100">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-mono">Requisition ID: {job.id}</span>
                    <button
                      type="button"
                      onClick={() => openRecruiterJobCreation(job)}
                      className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Create Mock Interview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE TAB 2: MY MOCK ATTEMPTS / RESULTS TAB */}
      {flowStep === 'idle' && activeModuleTab === 'results' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold font-outfit text-slate-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed Candidate Mock Attempts
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click "View Result" for detailed profile review</span>
          </div>

          {mockAttemptsList.length === 0 ? (
            <div className="saas-card p-12 text-center space-y-4 max-w-md mx-auto border border-slate-200/90 bg-white rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-950 font-outfit">No Completed Attempts Yet</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Create and complete a mock interview to view scorecards and attempt reviews.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {mockAttemptsList.map((att) => {
                const attId = att.attemptId || att.id || att.sessionId;
                const isCompleted = att.status === 'completed' || att.status === 'Completed' || att.state === 'Completed';
                const totalQ = att.questions?.length || 10;
                const ansQ = att.answers?.length || (att.result?.answeredCount || 0);
                const isCustom = att.source === 'CUSTOM_JD' || att.jobId === 'custom' || !att.jobId;

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
                        <div><strong className="text-slate-900">Answered:</strong> {ansQ} / {totalQ} Qs</div>
                        <div><strong className="text-slate-900">Score:</strong> {att.overallScore || 85}/100</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Date: {att.startedAt ? att.startedAt.split('T')[0] : 'Sep 10, 2026'}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleViewResultDetails(att)}
                        className="btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Result
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STEP 1: CREATION POPUP MODAL (Handles Source 1 & Source 2) */}
      {flowStep === 'creation_popup' && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 max-w-2xl w-full rounded-2xl p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold font-outfit text-slate-950">Configure AI Mock Interview</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {creationSource === 'RECRUITER_JOB' ? 'Source 1 — Recruiter Created Job (Read-Only Title & JD)' : 'Source 2 — Custom Job Description'}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setFlowStep('idle')} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            {/* Title Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-900 font-outfit">Job Title</label>
                {creationSource === 'RECRUITER_JOB' && (
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only (Recruiter Source)
                  </span>
                )}
              </div>
              {creationSource === 'RECRUITER_JOB' ? (
                <div className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 cursor-not-allowed">
                  {selectedJob?.title}
                </div>
              ) : (
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="e.g. Senior Frontend Developer"
                />
              )}
            </div>

            {/* Job Description Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-900 font-outfit">Job Description</label>
                {creationSource === 'RECRUITER_JOB' && (
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Read-Only (Recruiter Source)
                  </span>
                )}
              </div>
              {creationSource === 'RECRUITER_JOB' ? (
                <div className="w-full p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 max-h-32 overflow-y-auto leading-relaxed cursor-not-allowed">
                  {selectedJob?.description || selectedJob?.jobDescription}
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={customJobDescription}
                  onChange={(e) => setCustomJobDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 leading-relaxed focus:ring-2 focus:ring-indigo-500/20 resize-none font-medium"
                  placeholder="Paste job description requirements here..."
                ></textarea>
              )}
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 font-outfit block">Select Difficulty Level</label>
              <div className="grid grid-cols-4 gap-2">
                {['Easy', 'Medium', 'Hard', 'Random'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Method Selection (Uses Centralized METHOD_CONFIG) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 font-outfit block">Select Assessment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(METHOD_CONFIG).map((methodKey) => {
                  const mCfg = METHOD_CONFIG[methodKey];
                  const isSel = selectedMethod === methodKey;
                  return (
                    <button
                      key={methodKey}
                      type="button"
                      onClick={() => setSelectedMethod(methodKey)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? 'bg-indigo-50/90 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/20'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-extrabold text-xs block">{mCfg.key}</span>
                      <span className="text-[10px] text-slate-500 font-medium mt-1">{mCfg.totalCount} Questions</span>
                    </button>
                  );
                })}
              </div>

              {selectedMethod === 'RANDOM' && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] font-medium text-indigo-900 flex justify-between items-center">
                  <span><strong>RANDOM Structure:</strong> Section 1 — MCQ (15) &bull; Section 2 — VOICE (3) &bull; Section 3 — TEXT (2)</span>
                  <span className="badge-pill bg-indigo-100 text-indigo-800 text-[10px] font-mono font-bold">Total: 20 Qs</span>
                </div>
              )}
            </div>

            {/* Popup Buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFlowStep('idle')}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateMockInterview}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Create Mock Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: AI FEATURE EXTRACTION & QUESTION GENERATION TIMER SCREEN */}
      {flowStep === 'generating' && (
        <div className="saas-card p-8 border border-slate-200/90 space-y-6 bg-white text-center shadow-sm max-w-lg mx-auto rounded-2xl my-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black font-outfit text-slate-950">Generating Your Mock Interview</h3>
            <p className="text-xs text-slate-500 font-medium">
              Target: <strong>{creationSource === 'RECRUITER_JOB' ? selectedJob?.title : customTitle}</strong> ({selectedDifficulty} Difficulty &bull; {selectedMethod} Method)
            </p>
          </div>

          {/* Progress Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Analyzing Job Description</span>
              <span className="text-emerald-600 font-bold">✓</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Extracting Skills & Topics</span>
              <span className={generationPhase >= 2 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                {generationPhase >= 2 ? "✓" : "○"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Creating Questions ({selectedMethod})</span>
              <span className={generationPhase >= 3 ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                {generationPhase >= 3 ? "✓" : "⏳"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Preparing Assessment</span>
              <span className={generationPhase >= 4 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                {generationPhase >= 4 ? "✓" : "○"}
              </span>
            </div>
          </div>

          {/* Real Functional Elapsed Time Timer */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 font-mono font-bold text-xs">
            Elapsed Time: 00:{generationElapsed.toString().padStart(2, '0')}
          </div>

          {generationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium space-y-2">
              <p>{generationError}</p>
              <button
                type="button"
                onClick={handleRetryGeneration}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer"
              >
                Retry Question Generation
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: ASSESSMENT PREVIEW & GUIDELINES CONFIRMATION SCREEN */}
      {flowStep === 'guidelines' && (
        <div className="saas-card p-8 border border-slate-200/90 space-y-6 bg-white shadow-sm max-w-2xl mx-auto rounded-2xl my-6">
          <div className="border-b border-slate-100 pb-4 space-y-1">
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Assessment Preview</span>
            <h3 className="text-xl font-extrabold font-outfit text-slate-950">
              {creationSource === 'RECRUITER_JOB' ? selectedJob?.title : customTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Source: {creationSource === 'RECRUITER_JOB' ? (selectedJob?.company || 'Recruiter Job') : 'Custom Job Description'}
            </p>
          </div>

          {/* Assessment Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Difficulty</span>
              <span className="font-extrabold text-indigo-700 font-outfit text-sm">{selectedDifficulty}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Method</span>
              <span className="font-extrabold text-slate-900 font-outfit text-sm">{selectedMethod}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Questions</span>
              <span className="font-extrabold text-slate-900 font-outfit text-sm">{METHOD_CONFIG[selectedMethod]?.totalCount || 20} Qs</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Duration</span>
              <span className="font-extrabold text-slate-900 font-outfit text-sm">{METHOD_CONFIG[selectedMethod]?.estimatedDuration || 30} Mins</span>
            </div>
          </div>

          {/* Assessment Structure breakdown for RANDOM */}
          {selectedMethod === 'RANDOM' && (
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 space-y-2 text-xs text-indigo-950 font-medium">
              <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 block">Assessment Structure Breakdown</span>
              <div className="grid grid-cols-3 gap-2 text-center font-bold">
                <div className="p-2 rounded-lg bg-white border border-indigo-100">Section 1 — MCQ (15)</div>
                <div className="p-2 rounded-lg bg-white border border-indigo-100">Section 2 — VOICE (3)</div>
                <div className="p-2 rounded-lg bg-white border border-indigo-100">Section 3 — TEXT (2)</div>
              </div>
            </div>
          )}

          {/* Guidelines & Mandatory Checkboxes */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold font-outfit text-slate-900 uppercase tracking-wider">Candidate Guidelines & Confirmation</h4>

            <div className="space-y-3 text-xs font-medium text-slate-700">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60">
                <input
                  type="checkbox"
                  checked={guidelinesCheckboxes.format}
                  onChange={(e) => setGuidelinesCheckboxes({ ...guidelinesCheckboxes, format: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5"
                />
                <span>I understand the assessment format.</span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60">
                <input
                  type="checkbox"
                  checked={guidelinesCheckboxes.submission}
                  onChange={(e) => setGuidelinesCheckboxes({ ...guidelinesCheckboxes, submission: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5"
                />
                <span>I understand the answer submission rules.</span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60">
                <input
                  type="checkbox"
                  checked={guidelinesCheckboxes.timer}
                  onChange={(e) => setGuidelinesCheckboxes({ ...guidelinesCheckboxes, timer: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5"
                />
                <span>I understand the timer rules.</span>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/60">
                <input
                  type="checkbox"
                  checked={guidelinesCheckboxes.ready}
                  onChange={(e) => setGuidelinesCheckboxes({ ...guidelinesCheckboxes, ready: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 mt-0.5"
                />
                <span>I am ready to start.</span>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleCancelGuidelines}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLaunchMockInterview}
              disabled={!(guidelinesCheckboxes.format && guidelinesCheckboxes.submission && guidelinesCheckboxes.timer && guidelinesCheckboxes.ready)}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Launch Mock Interview
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DISTRACTION-FREE FULL-SCREEN TEST INTERFACE */}
      {flowStep === 'testing' && currentAttempt && (
        <div
          onCopy={blockPrevent}
          onPaste={blockPrevent}
          onCut={blockPrevent}
          onContextMenu={blockPrevent}
          className={`fixed inset-0 z-50 p-4 md:p-6 overflow-y-auto flex flex-col justify-between select-none ${
            testThemeMode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
          }`}
        >
          {/* Test Header Bar */}
          <div className={`p-4 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-xl border ${
            testThemeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className={`text-base font-extrabold font-outfit truncate max-w-md ${
                  testThemeMode === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  AI Mock Interview — {currentAttempt.jobTitle}
                </h2>
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
                  <span>Difficulty: {currentAttempt.difficulty}</span>
                  <span>&bull;</span>
                  <span>Method: {currentAttempt.method}</span>
                  <span>&bull;</span>
                  <span className="text-indigo-400 font-bold">Attempt ID: {currentAttempt.attemptId}</span>
                </div>
              </div>
            </div>

            {/* Timer, Theme Switch, & Finish Now */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className={`px-3 py-1.5 rounded-xl border font-mono font-bold flex items-center gap-1.5 ${
                testThemeMode === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                <Clock className="w-4 h-4 text-amber-400" /> {formatRemainingTimer()} remaining
              </div>

              {/* Theme Switcher Icon */}
              <button
                type="button"
                onClick={() => setTestThemeMode(testThemeMode === 'dark' ? 'light' : 'dark')}
                title="Toggle Theme"
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  testThemeMode === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                    : 'bg-slate-100 border-slate-300 text-indigo-700 hover:bg-slate-200'
                }`}
              >
                {testThemeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Finish Now Button */}
              <button
                type="button"
                onClick={handleTriggerFinishNow}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Finish Now
              </button>
            </div>
          </div>

          {/* MAIN TEST WORKSPACE LAYOUT */}
          <div className="my-4 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">

            {/* LEFT: QUESTION NAVIGATOR (3 Cols) */}
            <div className={`lg:col-span-3 p-4 rounded-2xl space-y-4 shadow-xl border flex flex-col justify-between ${
              testThemeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-xs font-extrabold font-outfit uppercase tracking-wider block">Question Navigator</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">
                    {answeredCount} / {totalQuestionsCount} Submitted
                  </span>
                </div>

                {/* Question Buttons Grid */}
                <div className="grid grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
                  {currentAttempt.questions.map((q, idx) => {
                    const qId = q.id || q.questionId;
                    const isSelected = idx === currentQuestionIndex;
                    const isSubmitted = Boolean(submittedAnswers[qId]);

                    return (
                      <button
                        key={qId}
                        type="button"
                        onClick={() => handleSelectQuestion(idx)}
                        className={`p-2 rounded-xl text-xs font-bold font-mono transition-all flex flex-col items-center justify-center cursor-pointer border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-500/30'
                            : isSubmitted
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                            : testThemeMode === 'dark'
                            ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        <span className="text-[9px] mt-0.5">
                          {isSubmitted ? '✓' : isSelected ? '●' : '○'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigator Legend */}
              <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-400 space-y-1 font-medium">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-indigo-600"></span> Active ●</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-700"></span> Answered ✓</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-slate-700"></span> Unanswered ○</span>
                </div>
              </div>
            </div>

            {/* CENTER & RIGHT: QUESTION PROMPT & INPUT (9 Cols) */}
            <div className="lg:col-span-9 space-y-4 flex flex-col justify-between">
              {/* Question Prompt Container */}
              <div className={`p-6 rounded-2xl space-y-3 shadow-xl border ${
                testThemeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                    {currentAttempt.questions[currentQuestionIndex]?.sectionName || 'Question'} &bull; Q{currentQuestionIndex + 1} of {totalQuestionsCount}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentAttempt.questions[currentQuestionIndex]?.source && (
                      <span className="badge-pill bg-purple-950 text-purple-300 border-purple-800 text-[10px] font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        Source: {currentAttempt.questions[currentQuestionIndex]?.source.replace('_', ' ')}
                        {currentAttempt.questions[currentQuestionIndex]?.sourceReference ? ` (${currentAttempt.questions[currentQuestionIndex].sourceReference})` : ''}
                      </span>
                    )}
                    <span className="badge-pill bg-indigo-950 text-indigo-300 border-indigo-800 text-[10px] font-bold">
                      {currentAttempt.questions[currentQuestionIndex]?.category || 'Technical'}
                    </span>
                  </div>
                </div>

                <h3 className={`text-lg md:text-xl font-bold font-outfit leading-snug ${
                  testThemeMode === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  "{currentAttempt.questions[currentQuestionIndex]?.questionText || currentAttempt.questions[currentQuestionIndex]?.question}"
                </h3>
              </div>

              {/* MCQ QUESTION RENDERING */}
              {currentAttempt.questions[currentQuestionIndex]?.questionType === 'MCQ' && (
                <div className={`p-6 rounded-2xl space-y-4 shadow-xl flex-1 flex flex-col justify-between border ${
                  testThemeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-3">
                    <span className="text-xs font-bold font-outfit block">Select Option:</span>
                    <div className="space-y-2.5">
                      {(currentAttempt.questions[currentQuestionIndex]?.options || []).map((opt, oIdx) => {
                        const optionKey = ['A', 'B', 'C', 'D'][oIdx] || `Opt-${oIdx}`;
                        const isSel = draftMcqOption === optionKey;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => setDraftMcqOption(optionKey)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs font-semibold ${
                              isSel
                                ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/20'
                                : testThemeMode === 'dark'
                                ? 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>{opt}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold ${
                              isSel ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-500 text-slate-500'
                            }`}>
                              {optionKey}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {submittedAnswers[currentAttempt.questions[currentQuestionIndex]?.id || currentAttempt.questions[currentQuestionIndex]?.questionId]
                        ? '✓ Answer Submitted'
                        : '● Option selected — click Submit Answer to save'}
                    </span>

                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={!draftMcqOption || submitting}
                      className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send className="w-3.5 h-3.5" /> Submit Answer</>}
                    </button>
                  </div>
                </div>
              )}

              {/* VOICE QUESTION RENDERING */}
              {currentAttempt.questions[currentQuestionIndex]?.questionType === 'Voice' && (
                <div className={`p-6 rounded-2xl space-y-4 shadow-xl flex-1 flex flex-col justify-between border ${
                  testThemeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold font-outfit block">Spoken Voice Response:</span>
                      <button
                        type="button"
                        onClick={handleVoiceSim}
                        className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                          isRecording
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 shadow-sm'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" /> {isRecording ? 'Listening (Dictating...)' : '🎙 Start Recording'}
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-1 text-xs ${
                      testThemeMode === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Transcript generated from your response (Read-only)
                      </span>
                      <p className="font-mono leading-relaxed">
                        {draftVoiceTranscript || 'Click "Start Recording" to dictate your spoken answer...'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {submittedAnswers[currentAttempt.questions[currentQuestionIndex]?.id || currentAttempt.questions[currentQuestionIndex]?.questionId]
                        ? '✓ Answer Submitted'
                        : '● Click Submit Answer to save transcript'}
                    </span>

                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={!draftVoiceTranscript || submitting}
                      className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send className="w-3.5 h-3.5" /> Submit Answer</>}
                    </button>
                  </div>
                </div>
              )}

              {/* TEXT QUESTION RENDERING */}
              {currentAttempt.questions[currentQuestionIndex]?.questionType === 'Text' && (
                <div className={`p-6 rounded-2xl space-y-4 shadow-xl flex-1 flex flex-col justify-between border ${
                  testThemeMode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="space-y-3">
                    <span className="text-xs font-bold font-outfit block">Written Technical Answer:</span>
                    <textarea
                      rows={5}
                      placeholder="Type your structured technical answer here..."
                      value={draftTextAnswer}
                      onChange={(e) => setDraftTextAnswer(e.target.value)}
                      className={`w-full p-3.5 text-xs rounded-xl border resize-none focus:ring-2 focus:ring-indigo-500/20 font-medium ${
                        testThemeMode === 'dark'
                          ? 'bg-slate-950 border-slate-800 text-slate-200'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    ></textarea>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {submittedAnswers[currentAttempt.questions[currentQuestionIndex]?.id || currentAttempt.questions[currentQuestionIndex]?.questionId]
                        ? '✓ Answer Submitted'
                        : '● Click Submit Answer to save response'}
                    </span>

                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={!draftTextAnswer.trim() || submitting}
                      className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
                    >
                      {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Send className="w-3.5 h-3.5" /> Submit Answer</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* UNSUBMITTED ANSWER WARNING MODAL */}
          {showUnsubmittedWarning && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-500/50 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertTriangle className="w-6 h-6" />
                  <h4 className="text-base font-extrabold font-outfit text-white">Unsubmitted Answer Warning</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  This answer has not been submitted and will not be recorded if you leave now.
                </p>
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowUnsubmittedWarning(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Stay & Submit
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLeaveUnsubmitted}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Leave Without Saving
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FINISH NOW CONFIRMATION MODAL */}
          {showFinishConfirmModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl text-slate-100">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <h3 className="text-base font-extrabold font-outfit text-white">Finish Mock Interview?</h3>
                  <button type="button" onClick={handleCancelFinishModal} className="text-slate-400 hover:text-white font-bold text-sm">
                    ✕
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-400">Answered Questions:</span>
                    <span className="text-emerald-400 font-mono font-bold text-sm">{answeredCount}</span>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-400">Not Answered:</span>
                    <span className="text-rose-400 font-mono font-bold text-sm">{unansweredCount}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  Are you sure you want to finish this mock interview attempt? Unanswered questions will be marked as unsubmitted.
                </p>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelFinishModal}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Continue Test
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmFinishAttempt}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
                  >
                    Finish Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 5: COMPLETION RESULT POPUP SCREEN */}
      {flowStep === 'completed' && currentAttempt && (
        <div className="saas-card p-8 border border-slate-200/90 space-y-6 bg-white text-center shadow-sm max-w-xl mx-auto rounded-2xl my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black font-outfit text-slate-950">Mock Interview Completed!</h3>
            <p className="text-xs text-slate-500 font-medium">
              You answered {answeredCount} of {totalQuestionsCount} questions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-medium max-w-xs mx-auto">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <span className="block text-[10px] font-bold uppercase">Answered</span>
              <span className="font-extrabold text-lg">{answeredCount}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
              <span className="block text-[10px] font-bold uppercase">Not Answered</span>
              <span className="font-extrabold text-lg">{unansweredCount}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => { setFlowStep('idle'); setActiveModuleTab('jobs'); }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Back to AI Mock Interview
            </button>

            <button
              type="button"
              onClick={() => navigate(`/profile-review/${currentAttempt.attemptId}`)}
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Profile Review
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AIMockInterviewRoom;
