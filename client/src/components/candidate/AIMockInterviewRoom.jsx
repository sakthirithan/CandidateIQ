import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { mockInterviewService } from '../../services/mockApi/interviewService';
import { mockJobService } from '../../services/mockApi/jobService';
import {
  Play, Send, Mic, Clock, Sparkles, MessageSquare, CheckCircle2, AlertCircle,
  Video, VideoOff, MicOff, Bot, Pause, RotateCcw, Briefcase, Award, Check, FileText
} from 'lucide-react';

function AIMockInterviewRoom({ onComplete }) {
  // Session State: 'Not Started' | 'In Progress' | 'Paused' | 'Completed'
  const [interviewState, setInterviewState] = useState('Not Started');

  // Setup Options
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('Senior MERN Stack & AI Engineer');
  const [interviewType, setInterviewType] = useState('Technical'); // 'Technical' | 'Behavioural' | 'Mixed'
  const [difficulty, setDifficulty] = useState('Intermediate'); // 'Beginner' | 'Intermediate' | 'Advanced'

  // Active Session Data
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responseText, setResponseText] = useState('');
  const [recordedAnswers, setRecordedAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    let timer;
    if (interviewState === 'In Progress') {
      timer = setInterval(() => setSecondsElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [interviewState]);

  const loadJobs = async () => {
    try {
      const jobs = await mockJobService.getJobs();
      setAvailableJobs(jobs);
      if (jobs.length > 0) setSelectedJobTitle(jobs[0].title);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Flow Step: Start Interview Session
  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newSession = await mockInterviewService.startInterviewSession({
        targetJobTitle: selectedJobTitle,
        interviewType,
        difficulty
      });
      setSession(newSession);
      setCurrentQuestionIndex(0);
      setResponseText('');
      setRecordedAnswers([]);
      setSecondsElapsed(0);
      setInterviewState('In Progress');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Flow Step: Submit Answer & Record Data
  const handleSendResponse = async (e) => {
    e.preventDefault();
    if (!responseText.trim() || !session) return;

    const currentQ = session.questions[currentQuestionIndex];

    try {
      setSubmitting(true);

      // Record Answer in mockInterviewService with questionId, answer, timestamp, questionType
      const recordedEntry = await mockInterviewService.recordAnswer(session.sessionId, {
        questionId: currentQ.questionId,
        answer: responseText.trim(),
        questionType: currentQ.category || interviewType
      });

      const updatedAnswers = [...recordedAnswers, recordedEntry];
      setRecordedAnswers(updatedAnswers);

      // Advance to next question or complete session
      if (currentQuestionIndex + 1 < session.questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setResponseText('');
      } else {
        handleFinishSession(updatedAnswers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Pause & Resume Handlers
  const handlePauseSession = async () => {
    await mockInterviewService.pauseInterviewSession(session.sessionId);
    setInterviewState('Paused');
  };

  const handleResumeSession = async () => {
    await mockInterviewService.resumeInterviewSession(session.sessionId);
    setInterviewState('In Progress');
  };

  // 4. Finish Session
  const handleFinishSession = async (finalAnswers = recordedAnswers) => {
    setSubmitting(true);
    const completedSession = await mockInterviewService.completeInterviewSession(session.sessionId);
    setInterviewState('Completed');
    setSubmitting(false);

    if (onComplete) {
      onComplete({
        overallScore: 87,
        technicalScore: 90,
        communicationScore: 85,
        confidenceScore: 86,
        recordedAnswersCount: finalAnswers.length,
        summary: `Candidate completed ${finalAnswers.length} evaluation questions for ${selectedJobTitle} (${interviewType} - ${difficulty}).`
      });
    }
  };

  // Voice speech simulation
  const handleVoiceSim = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setResponseText("I architect global state using React Context for user sessions, combined with custom hooks and useMemo to prevent unnecessary component re-renders.");
        setIsRecording(false);
      }, 1500);
    }
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 select-none max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="saas-card p-6 md:p-8 border border-slate-200/90 flex flex-wrap justify-between items-center gap-6 bg-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold font-outfit text-slate-950 tracking-tight">AI Dynamic Mock Interview Room</h2>
            <span className={`badge-pill text-[10px] ${
              interviewState === 'In Progress' ? 'badge-success' :
              interviewState === 'Paused' ? 'badge-warning' :
              interviewState === 'Completed' ? 'badge-indigo' : 'badge-ai'
            }`}>
              <Sparkles className="w-3 h-3 text-indigo-600" /> State: {interviewState}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Practice job-aligned interview questions with automated answer recording & Gemini AI scorecards.</p>
        </div>
      </div>

      {/* STEP 1: INTERVIEW SETUP SCREEN (Not Started) */}
      {interviewState === 'Not Started' && (
        <div className="saas-card p-6 md:p-8 border border-slate-200/90 space-y-6 bg-white shadow-sm">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold font-outfit text-slate-950">Interview Session Setup</h3>
            <p className="text-xs text-slate-500 font-medium">Configure target job requisition, evaluation domain type, and difficulty level before launching.</p>
          </div>

          <form onSubmit={handleStartSession} className="space-y-6">
            {/* Target Job Requisition Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Target Job Requisition
              </label>
              <select
                value={selectedJobTitle}
                onChange={(e) => setSelectedJobTitle(e.target.value)}
                className="input-saas w-full text-xs font-semibold"
              >
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.title}>{j.title} ({j.department})</option>
                ))}
                {availableJobs.length === 0 && <option value="Senior MERN Stack & AI Engineer">Senior MERN Stack & AI Engineer</option>}
              </select>
            </div>

            {/* Interview Type Selector (Technical / Behavioural / Mixed) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Interview Evaluation Domain</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: 'Technical', label: 'Technical', desc: 'Coding, system design & architectural algorithms' },
                  { key: 'Behavioural', label: 'Behavioural', desc: 'STAR framework, leadership & situation handling' },
                  { key: 'Mixed', label: 'Mixed Suite', desc: 'Balanced combination of technical & situational skills' }
                ].map((typeItem) => (
                  <div
                    key={typeItem.key}
                    onClick={() => setInterviewType(typeItem.key)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      interviewType === typeItem.key
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-slate-950 font-outfit">{typeItem.label}</span>
                      {interviewType === typeItem.key && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{typeItem.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Difficulty Level</label>
              <div className="flex flex-wrap gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-white" /> Start AI Interview Session
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: INTERVIEW IN PROGRESS & PAUSED SCREENS */}
      {(interviewState === 'In Progress' || interviewState === 'Paused') && session && (
        <div className="space-y-6">
          {/* Header Controls & Timer */}
          <div className="saas-card p-4 border border-slate-200/80 flex flex-wrap justify-between items-center gap-4 text-xs font-semibold text-slate-700 bg-white shadow-xs">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold font-outfit text-slate-950">
                <Clock className="w-4 h-4 text-indigo-600" /> Elapsed: {formatTimer(secondsElapsed)}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600 font-medium">
                Question {currentQuestionIndex + 1} of {session.questions.length}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {interviewState === 'In Progress' ? (
                <button
                  onClick={handlePauseSession}
                  className="btn-secondary text-xs flex items-center gap-1 text-amber-700 border-amber-200 bg-amber-50"
                >
                  <Pause className="w-3.5 h-3.5" /> Pause Session
                </button>
              ) : (
                <button
                  onClick={handleResumeSession}
                  className="btn-primary text-xs flex items-center gap-1 bg-emerald-600 text-white"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Resume Session
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 rounded-xl text-xs font-bold transition-all border ${isVideoOn ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2 rounded-xl text-xs font-bold transition-all border ${isMicOn ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold uppercase tracking-wider text-[10px]">
                {session.questions[currentQuestionIndex]?.category}
              </span>
            </div>
          </div>

          {/* Paused Alert Banner */}
          {interviewState === 'Paused' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex justify-between items-center font-medium shadow-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Interview Session is currently PAUSED. Click Resume when ready to answer.</span>
              </div>
              <button onClick={handleResumeSession} className="btn-primary text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold">
                Resume Now
              </button>
            </div>
          )}

          {/* Question Card */}
          {interviewState === 'In Progress' && (
            <>
              <div className="saas-card p-6 md:p-8 border border-indigo-200 space-y-4 bg-gradient-to-r from-white via-indigo-50/30 to-purple-50/20 relative overflow-hidden shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-indigo-600/20">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                      Target Skill: {session.questions[currentQuestionIndex]?.targetSkill}
                    </span>
                    <h3 className="text-lg md:text-xl font-bold font-outfit text-slate-950 leading-snug">
                      "{session.questions[currentQuestionIndex]?.questionText}"
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Criteria: {session.questions[currentQuestionIndex]?.evaluationCriteria}
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer Response Form */}
              <form onSubmit={handleSendResponse} className="space-y-4">
                <div className="saas-card p-6 border border-slate-200/80 space-y-4 bg-white shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold font-outfit text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-600" /> Candidate Response Text
                    </span>
                    <button
                      type="button"
                      onClick={handleVoiceSim}
                      className={`text-xs font-semibold px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all ${
                        isRecording
                          ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" /> {isRecording ? 'Listening (Dictating)...' : 'Simulate Voice Speech'}
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    required
                    placeholder="Type or speak your structured technical answer..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="input-saas w-full resize-none text-xs leading-relaxed"
                  ></textarea>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Recorded Answers: {recordedAnswers.length} of {session.questions.length}
                    </span>

                    <button
                      type="submit"
                      disabled={submitting || !responseText.trim()}
                      className="btn-primary text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {submitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" /> Submit Answer & Record Data
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      )}

      {/* STEP 3: INTERVIEW COMPLETED SCREEN */}
      {interviewState === 'Completed' && session && (
        <div className="saas-card p-8 border border-slate-200/90 space-y-6 bg-white text-center shadow-sm max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black font-outfit text-slate-950">AI Interview Session Completed</h3>
            <p className="text-xs text-slate-500 font-medium">
              Recorded responses stored for {session.targetJobTitle} ({session.interviewType} - {session.difficulty}).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recorded Answers Log</span>
            <div className="text-center font-bold text-indigo-900 text-sm">
              ✓ {recordedAnswers.length} Answer Objects Stored with Timestamps
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Overall AI Evaluation Score: 87 / 100</p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setInterviewState('Not Started')}
              className="btn-secondary text-xs"
            >
              Start Another Interview
            </button>
            <button
              onClick={() => {
                if (onComplete) {
                  onComplete({
                    overallScore: 87,
                    recordedAnswersCount: recordedAnswers.length
                  });
                }
              }}
              className="btn-primary text-xs font-bold"
            >
              View Interview Scorecard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIMockInterviewRoom;
