const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
const GenerateQuestionsService = require('../services/ai/mockInterview/generateQuestionsService');
const InterviewFinalEvaluator = require('../services/interview/InterviewFinalEvaluator');
const { ConfigurationInputSchema } = require('../services/ai/mockInterview/mockInterviewSchemas');
const { GENERATION_STAGES } = require('../services/ai/mockInterview/generationStages');
const progressEmitter = require('../services/ai/mockInterview/generationProgressEmitter');

/**
 * Mock Interview Controller for CandidateIQ
 * Manages single-document Mongoose persistence for AI Mock Interviews with real-time SSE progress streaming.
 */

// @desc    Create AI Mock Interview Document (Context Collection -> AI Generation -> Single MongoDB Doc)
// @route   POST /api/mock-interviews
// @access  Private (Candidate)
const createMockInterview = async (req, res, next) => {
  const mockInterviewId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const startedAtIso = new Date().toISOString();

  try {
    const candidateId = req.user.id || req.user._id;
    const { jobId, configuration: rawConfig } = req.body;

    // Helper to emit progress
    const notifyStage = (stageObj, customMsg = null) => {
      progressEmitter.updateProgress(mockInterviewId, {
        stage: stageObj.stage,
        progress: stageObj.progress,
        message: customMsg || stageObj.message,
        startedAt: startedAtIso
      });
    };

    notifyStage(GENERATION_STAGES.INITIALIZING);

    // 1. Validate Candidate Configuration
    const configResult = ConfigurationInputSchema.safeParse(rawConfig || {});
    const configuration = configResult.success ? configResult.data : {
      difficulty: 'medium',
      assessmentMethod: 'random',
      totalQuestions: 20,
      sections: [{ type: 'mcq', count: 15 }, { type: 'voice', count: 3 }, { type: 'text', count: 2 }]
    };

    // 2. Fetch Selected Recruiter Job from Database
    notifyStage(GENERATION_STAGES.LOADING_JOB);
    let jobRecord = null;
    if (jobId && jobId.length === 24) {
      jobRecord = await Job.findById(jobId);
    }
    if (!jobRecord) {
      jobRecord = await Job.findOne({ status: 'published' }).sort({ createdAt: -1 });
    }

    const jobData = {
      jobId: jobRecord?._id ? jobRecord._id.toString() : null,
      title: jobRecord?.title || 'Senior Full Stack Software Engineer',
      department: jobRecord?.department || 'Engineering',
      company: jobRecord?.company || 'CandidateIQ Enterprise',
      description: jobRecord?.description || jobRecord?.jobDescription || 'Full Stack Engineer requisition.',
      requiredSkills: jobRecord?.requiredSkills || ['React', 'Node.js', 'MongoDB', 'REST API'],
      preferredSkills: jobRecord?.preferredSkills || ['AWS', 'Docker', 'TypeScript'],
      experienceLevel: jobRecord?.experienceLevel || '3-5 Years',
      location: jobRecord?.location || 'Remote'
    };

    // 3. Fetch Candidate's Current Parsed Resume JSON from Database
    notifyStage(GENERATION_STAGES.LOADING_RESUME);
    let resumeRecord = await Resume.findOne({ candidate: candidateId, extractionStatus: 'confirmed' }).sort({ updatedAt: -1 });
    if (!resumeRecord) {
      resumeRecord = await Resume.findOne({ candidate: candidateId }).sort({ updatedAt: -1 });
    }

    const userRecord = await User.findById(candidateId).select('name headline summary bio skills experience projects');

    const resumeData = {
      resumeId: resumeRecord?._id ? resumeRecord._id.toString() : null,
      name: userRecord?.name || resumeRecord?.extractedData?.name || 'Candidate',
      headline: userRecord?.headline || resumeRecord?.extractedData?.headline || 'Software Engineer',
      summary: userRecord?.summary || resumeRecord?.extractedData?.summary || '',
      skills: resumeRecord?.keywords || resumeRecord?.extractedData?.skills || userRecord?.skills || ['React', 'Node.js', 'MongoDB'],
      projects: resumeRecord?.extractedData?.projects || userRecord?.projects || [],
      experiences: resumeRecord?.extractedData?.experiences || userRecord?.experience || []
    };

    // 4. Context Analysis & Topic Extraction
    notifyStage(GENERATION_STAGES.ANALYZING_RESUME);
    notifyStage(GENERATION_STAGES.ANALYZING_JOB);
    notifyStage(GENERATION_STAGES.EXTRACTING_TOPICS);
    notifyStage(GENERATION_STAGES.BUILDING_CONTEXT);

    // 5. Generate AI Structured Questions
    notifyStage(GENERATION_STAGES.GENERATING_QUESTIONS);
    const generatedAI = await GenerateQuestionsService.generateStructuredInterview({
      resumeData,
      jobData,
      configuration
    });

    notifyStage(GENERATION_STAGES.VALIDATING_QUESTIONS);
    const mcqQuestions = generatedAI.questions.mcq || [];
    const voiceQuestions = generatedAI.questions.voice || [];
    const textQuestions = generatedAI.questions.text || [];
    const totalQuestions = mcqQuestions.length + voiceQuestions.length + textQuestions.length;

    notifyStage(GENERATION_STAGES.PREPARING_ASSESSMENT);

    // 6. Build Unified Flat Questions Array
    const flatQuestions = [
      ...mcqQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'MCQ',
        category: 'mcq',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Technical',
        options: (q.options || []).map((opt, idx) => ({ id: String.fromCharCode(65 + idx), text: opt })),
        correctAnswer: q.correctAnswer,
        mcqExplanation: '',
        candidateResponse: ''
      })),
      ...voiceQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'Voice',
        category: 'voice',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Architecture & Communication',
        candidateResponse: ''
      })),
      ...textQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'Text',
        category: 'text',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Problem Solving',
        candidateResponse: ''
      }))
    ];

    // 7. Persist ONE Single MongoDB Document
    notifyStage(GENERATION_STAGES.SAVING_INTERVIEW);
    notifyStage(GENERATION_STAGES.SAVING_QUESTIONS);

    const mockInterview = await Interview.create({
      candidate: candidateId,
      candidateIdString: candidateId.toString(),
      job: jobRecord?._id || null,
      jobIdString: jobRecord?._id ? jobRecord._id.toString() : '',
      jobTitle: jobData.title,
      resumeId: resumeRecord?._id || null,
      interviewCategory: 'mock',
      questionSource: 'recruiter_job',
      interviewType: configuration.assessmentMethod || 'mixed',
      difficulty: configuration.difficulty || 'Medium',
      status: 'ready',
      configuration,
      sourceSnapshot: {
        resume: resumeData,
        job: jobData
      },
      mock_interview_questions: {
        mcq: mcqQuestions,
        voice: voiceQuestions,
        text: textQuestions
      },
      progress: {
        currentQuestionIndex: 0,
        answeredQuestions: 0,
        totalQuestions
      },
      metadata: {
        generationModel: 'gemini-1.5-flash / groq',
        generationVersion: 'mock-interview-v1',
        generatedAt: new Date()
      },
      questions: flatQuestions
    });

    // 8. DB Verification Read-Back
    const verifyDoc = await Interview.findById(mockInterview._id);
    if (!verifyDoc) {
      throw new Error('Database verification failed: Document write could not be confirmed.');
    }

    notifyStage(GENERATION_STAGES.COMPLETED);

    return res.status(201).json({
      success: true,
      message: 'AI Mock Interview created and verified in MongoDB.',
      mockInterviewId: mockInterview._id,
      interview: mockInterview,
      questionCounts: {
        mcq: mcqQuestions.length,
        voice: voiceQuestions.length,
        text: textQuestions.length,
        total: totalQuestions
      }
    });
  } catch (error) {
    progressEmitter.updateProgress(mockInterviewId, {
      stage: 'FAILED',
      progress: 0,
      message: error.message || 'Unable to generate mock interview.'
    });
    next(error);
  }
};



// @desc    Start AI Mock Interview (Transition ready -> in_progress)
// @route   POST /api/mock-interviews/:id/start
// @access  Private (Candidate)
const startMockInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    interview.status = 'in_progress';
    interview.startedAt = interview.startedAt || new Date();
    await interview.save();

    // Sanitize response to hide correctAnswer during active test
    const sanitizedDoc = interview.toObject();
    if (sanitizedDoc.mock_interview_questions?.mcq) {
      sanitizedDoc.mock_interview_questions.mcq = sanitizedDoc.mock_interview_questions.mcq.map((q) => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }
    if (sanitizedDoc.questions) {
      sanitizedDoc.questions = sanitizedDoc.questions.map((q) => {
        const { correctAnswer, ...rest } = q;
        return rest;
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mock interview session started.',
      interview: sanitizedDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit single question answer (MCQ / Text / Voice transcript)
// @route   PATCH /api/mock-interviews/:id/questions/:questionId/answer
// @access  Private (Candidate)
const submitQuestionAnswer = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const candidateId = req.user.id || req.user._id;
    const { selectedOption, textAnswer, voiceTranscript, answer, durationSeconds } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    let foundInStructured = false;

    // 1. Check MCQ Section
    if (interview.mock_interview_questions?.mcq) {
      const mcqItem = interview.mock_interview_questions.mcq.find((q) => String(q.questionId) === String(questionId));
      if (mcqItem) {
        mcqItem.userAnswer = selectedOption || answer || mcqItem.userAnswer;
        mcqItem.isAnswered = true;
        mcqItem.answeredAt = new Date();
        foundInStructured = true;
      }
    }

    // 2. Check Voice Section
    if (interview.mock_interview_questions?.voice) {
      const voiceItem = interview.mock_interview_questions.voice.find((q) => String(q.questionId) === String(questionId));
      if (voiceItem) {
        voiceItem.transcript = voiceTranscript || answer || voiceItem.transcript;
        voiceItem.answer = answer || voiceTranscript || voiceItem.answer;
        voiceItem.userAnswer = answer || voiceTranscript || voiceItem.userAnswer;
        voiceItem.durationSeconds = durationSeconds || voiceItem.durationSeconds || 0;
        voiceItem.isAnswered = true;
        voiceItem.answeredAt = new Date();
        foundInStructured = true;
      }
    }

    // 3. Check Text Section
    if (interview.mock_interview_questions?.text) {
      const textItem = interview.mock_interview_questions.text.find((q) => String(q.questionId) === String(questionId));
      if (textItem) {
        textItem.userAnswer = textAnswer || answer || textItem.userAnswer;
        textItem.isAnswered = true;
        textItem.answeredAt = new Date();
        foundInStructured = true;
      }
    }

    // 4. Also update flat questions array for backward compatibility
    if (interview.questions) {
      const flatItem = interview.questions.find((q) => String(q.questionId) === String(questionId) || String(q._id) === String(questionId));
      if (flatItem) {
        flatItem.candidateResponse = textAnswer || voiceTranscript || selectedOption || answer || flatItem.candidateResponse;
        if (durationSeconds) {
          flatItem.voiceMeta = flatItem.voiceMeta || {};
          flatItem.voiceMeta.durationSeconds = durationSeconds;
          flatItem.voiceMeta.transcript = voiceTranscript || answer;
        }
      }
    }

    // 5. Recalculate Progress
    let mcqAnswered = (interview.mock_interview_questions?.mcq || []).filter((q) => q.isAnswered).length;
    let voiceAnswered = (interview.mock_interview_questions?.voice || []).filter((q) => q.isAnswered).length;
    let textAnswered = (interview.mock_interview_questions?.text || []).filter((q) => q.isAnswered).length;
    let flatAnswered = (interview.questions || []).filter((q) => q.candidateResponse).length;

    const totalAnswered = Math.max(mcqAnswered + voiceAnswered + textAnswered, flatAnswered);
    const totalQuestions = interview.progress?.totalQuestions || interview.questions?.length || 1;

    interview.progress = {
      currentQuestionIndex: Math.min(totalAnswered, totalQuestions - 1),
      answeredQuestions: totalAnswered,
      totalQuestions
    };

    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Question answer persisted successfully to MongoDB.',
      progress: interview.progress
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete Mock Interview & Generate Evaluation Summary
// @route   POST /api/mock-interviews/:id/complete
// @access  Private (Candidate)
const completeMockInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    // Trigger full Mock Interview Evaluation (MCQ + Voice + Text)
    const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
    const evaluation = await evaluateMockInterview(interview, true);

    return res.status(200).json({
      success: true,
      message: 'Mock Interview completed and evaluated successfully.',
      evaluation,
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate Mock Interview via AI Evaluation Pipeline
// @route   POST /api/mock-interviews/:id/evaluate
// @access  Private (Candidate)
const evaluateMockInterviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.body || {};
    const candidateId = req.user.id || req.user._id;

    console.log(`[EVALUATION] Starting evaluation request for MockInterview: ${id}`);

    const interview = await Interview.findById(id);
    if (!interview) {
      console.warn(`[EVALUATION] Document not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: {
          code: 'MOCK_INTERVIEW_NOT_FOUND',
          message: 'Mock Interview session not found in database.'
        }
      });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      console.warn(`[EVALUATION] Unauthorized evaluation attempt for document ${id} by user ${candidateId}`);
      return res.status(403).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED_INTERVIEW',
          message: 'You do not have permission to evaluate this interview session.'
        }
      });
    }

    const mcqQuestions = interview.mock_interview_questions?.mcq || [];
    const voiceQuestions = interview.mock_interview_questions?.voice || [];
    const textQuestions = interview.mock_interview_questions?.text || [];
    const totalQuestions = mcqQuestions.length + voiceQuestions.length + textQuestions.length || interview.questions?.length || 0;

    const answeredMcqs = mcqQuestions.filter(q => q.isAnswered).length;
    const answeredVoice = voiceQuestions.filter(q => q.transcript || q.answer || q.userAnswer).length;
    const answeredText = textQuestions.filter(q => q.userAnswer || q.answer).length;
    const totalAnswered = answeredMcqs + answeredVoice + answeredText;

    console.log('[EVALUATION] Context inspection:', {
      mockInterviewId: interview._id.toString(),
      candidateId: interview.candidate.toString(),
      status: interview.status,
      questionCount: totalQuestions,
      answeredCount: totalAnswered,
      mcqCount: mcqQuestions.length,
      voiceCount: voiceQuestions.length,
      textCount: textQuestions.length,
      voiceTranscriptsAvailable: answeredVoice,
      textAnswersAvailable: answeredText,
      AI_KEY_CONFIGURED: Boolean(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY)
    });

    if (totalQuestions > 0 && totalAnswered === 0) {
      console.warn('[EVALUATION] Candidate has 0 submitted answers.');
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_ANSWERS',
          message: 'No candidate answers were recorded for this interview session.'
        }
      });
    }

    const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
    const evaluation = await evaluateMockInterview(interview, Boolean(force));

    return res.status(200).json({
      success: true,
      message: 'Mock Interview evaluation generated successfully.',
      evaluation,
      interview
    });
  } catch (error) {
    console.error('[EVALUATION] Pipeline Execution Error:', error);

    let errorCode = 'AI_PROVIDER_ERROR';
    if (error.message.includes('not configured') || error.message.includes('API_KEY')) {
      errorCode = 'AI_AUTH_ERROR';
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorCode = 'AI_RATE_LIMIT';
    } else if (error.message.includes('empty response')) {
      errorCode = 'AI_RESPONSE_EMPTY';
    } else if (error.message.includes('schema') || error.message.includes('Zod')) {
      errorCode = 'AI_SCHEMA_VALIDATION_ERROR';
    } else if (error.name === 'ValidationError') {
      errorCode = 'DATABASE_ERROR';
    }

    return res.status(500).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'The evaluation pipeline encountered an error.'
      }
    });
  }
};

// @desc    Get Candidate's Mock Interviews (Lightweight list for Profile Review)
// @route   GET /api/mock-interviews
// @access  Private (Candidate)
const getCandidateMockInterviews = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;

    // Strictly query only interviewCategory === 'mock'
    const interviews = await Interview.find({
      $or: [
        { candidate: candidateId },
        { candidateIdString: candidateId.toString() }
      ],
      interviewCategory: 'mock'
    }).sort({ createdAt: -1 });

    const summaryList = interviews.map((inv) => {
      const mcqCount = inv.mock_interview_questions?.mcq?.length || 0;
      const voiceCount = inv.mock_interview_questions?.voice?.length || 0;
      const textCount = inv.mock_interview_questions?.text?.length || 0;
      const totalQuestions = mcqCount + voiceCount + textCount || inv.progress?.totalQuestions || inv.questions?.length || 0;

      const mcqAns = (inv.mock_interview_questions?.mcq || []).filter(q => q.isAnswered).length;
      const voiceAns = (inv.mock_interview_questions?.voice || []).filter(q => q.isAnswered).length;
      const textAns = (inv.mock_interview_questions?.text || []).filter(q => q.isAnswered).length;
      const answeredQuestions = mcqAns + voiceAns + textAns || inv.progress?.answeredQuestions || 0;

      return {
        id: inv._id,
        _id: inv._id,
        sessionId: inv._id,
        jobTitle: inv.jobTitle || 'AI Mock Interview',
        company: inv.sourceSnapshot?.job?.company || 'CandidateIQ Enterprise',
        difficulty: inv.difficulty || 'Medium',
        method: (inv.interviewType || 'RANDOM').toUpperCase(),
        status: inv.status,
        questionCount: totalQuestions,
        answeredCount: answeredQuestions,
        score: inv.evaluation?.overallScore ?? inv.overallEvaluation?.overallInterviewScore ?? null,
        technicalScore: inv.evaluation?.technicalScore ?? inv.overallEvaluation?.technicalProficiency ?? null,
        communicationScore: inv.evaluation?.communicationScore ?? inv.overallEvaluation?.communicationClarity ?? null,
        reasoningScore: inv.evaluation?.reasoningScore ?? inv.overallEvaluation?.problemSolvingRating ?? null,
        behaviouralScore: inv.evaluation?.behaviouralScore ?? inv.overallEvaluation?.behaviouralCompetency ?? null,
        createdAt: inv.createdAt,
        completedAt: inv.completedAt,
        evaluationStatus: inv.evaluation?.status || (inv.status === 'completed' ? 'pending' : 'unevaluated')
      };
    });

    return res.status(200).json({
      success: true,
      count: summaryList.length,
      interviews: summaryList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Mock Interview Document by ID
// @route   GET /api/mock-interviews/:id
// @access  Private (Candidate)
const getMockInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id).populate('job', 'title department company description location');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    const sanitizedDoc = interview.toObject();
    if (sanitizedDoc.status === 'in_progress') {
      if (sanitizedDoc.mock_interview_questions?.mcq) {
        sanitizedDoc.mock_interview_questions.mcq = sanitizedDoc.mock_interview_questions.mcq.map((q) => {
          const { correctAnswer, ...rest } = q;
          return rest;
        });
      }
    }

    return res.status(200).json({
      success: true,
      interview: sanitizedDoc
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream Real-Time Generation Progress via SSE
// @route   GET /api/mock-interviews/:id/generation-progress
// @access  Private (Candidate)
const getGenerationProgressStream = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = (req.user?.id || req.user?._id)?.toString();

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    if (interview.candidateIdString !== candidateId && interview.candidate?.toString() !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to generation progress stream.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    const cached = progressEmitter.getProgress(id);
    if (cached) {
      res.write(`event: generation-progress\ndata: ${JSON.stringify(cached)}\n\n`);
    } else if (interview.generation) {
      const dbPayload = {
        mockInterviewId: id,
        stage: interview.generation.stage || 'COMPLETED',
        progress: interview.generation.progress || 100,
        message: interview.generation.message || 'Interview ready',
        completedStages: interview.generation.completedStages || [],
        startedAt: interview.generation.startedAt
      };
      res.write(`event: generation-progress\ndata: ${JSON.stringify(dbPayload)}\n\n`);
    }

    const eventName = `progress:${id}`;
    const listener = (data) => {
      res.write(`event: generation-progress\ndata: ${JSON.stringify(data)}\n\n`);
      if (data.stage === 'COMPLETED' || data.stage === 'FAILED') {
        setTimeout(() => {
          try { res.end(); } catch (e) {}
        }, 500);
      }
    };

    progressEmitter.on(eventName, listener);

    req.on('close', () => {
      progressEmitter.removeListener(eventName, listener);
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stream Real-Time Evaluation Progress via SSE
// @route   GET /api/mock-interviews/:id/evaluation-progress
// @access  Private (Candidate)
const getEvaluationProgressStream = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = (req.user?.id || req.user?._id)?.toString();

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    if (interview.candidateIdString !== candidateId && interview.candidate?.toString() !== candidateId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to evaluation progress stream.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders();

    const cached = progressEmitter.getProgress(id);
    if (cached) {
      res.write(`event: evaluation-progress\ndata: ${JSON.stringify(cached)}\n\n`);
    }

    const eventName = `progress:${id}`;
    const listener = (data) => {
      res.write(`event: evaluation-progress\ndata: ${JSON.stringify(data)}\n\n`);
      if (data.stage === 'COMPLETED' || data.type === 'evaluation_completed') {
        setTimeout(() => {
          try { res.end(); } catch (e) {}
        }, 500);
      }
    };

    progressEmitter.on(eventName, listener);

    req.on('close', () => {
      progressEmitter.removeListener(eventName, listener);
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Re-evaluate a single question independently
// @route   POST /api/mock-interviews/:id/questions/:questionId/evaluate
// @access  Private (Candidate)
const evaluateSingleQuestionController = async (req, res, next) => {
  try {
    const { id, questionId } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    const { evaluateSingleQuestion, evaluateMCQ } = require('../services/ai/mockInterview/mockInterviewEvaluator');

    let targetItem = null;
    let targetType = 'voice';

    if (interview.mock_interview_questions?.mcq) {
      targetItem = interview.mock_interview_questions.mcq.find(q => String(q.questionId) === String(questionId));
      if (targetItem) targetType = 'mcq';
    }
    if (!targetItem && interview.mock_interview_questions?.voice) {
      targetItem = interview.mock_interview_questions.voice.find(q => String(q.questionId) === String(questionId));
      if (targetItem) targetType = 'voice';
    }
    if (!targetItem && interview.mock_interview_questions?.text) {
      targetItem = interview.mock_interview_questions.text.find(q => String(q.questionId) === String(questionId));
      if (targetItem) targetType = 'text';
    }

    if (!targetItem) {
      return res.status(404).json({ success: false, message: `Question ${questionId} not found in mock interview.` });
    }

    let evalRes;
    if (targetType === 'mcq') {
      evalRes = evaluateMCQ(targetItem);
    } else {
      const resumeData = interview.sourceSnapshot?.resume || {};
      const jobData = interview.sourceSnapshot?.job || {};
      evalRes = await evaluateSingleQuestion({ questionItem: targetItem, type: targetType, resumeData, jobData });
    }

    targetItem.evaluationStatus = 'completed';
    targetItem.evaluation = evalRes;

    interview.markModified('mock_interview_questions');
    await interview.save();

    return res.status(200).json({
      success: true,
      message: `Question ${questionId} re-evaluated successfully.`,
      questionId,
      evaluation: evalRes
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMockInterview,
  startMockInterview,
  submitQuestionAnswer,
  completeMockInterview,
  getMockInterviewById,
  getGenerationProgressStream,
  getEvaluationProgressStream,
  getCandidateMockInterviews,
  evaluateMockInterviewController,
  evaluateSingleQuestionController
};
