const Interview = require('../models/Interview');
const MockInterviewWorkspace = require('../models/MockInterviewWorkspace');
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
 * Manages user-created persistent Mock Interview Workspace Cards (max 10 active cards)
 * and multi-attempt interview execution loops.
 */

// @desc    Create Mock Interview Workspace Card (Max 10 active cards per user)
// @route   POST /api/mock-interviews
// @access  Private (Candidate)
const createMockInterviewWorkspace = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;
    const { resumeId, jobDetails, configuration } = req.body;

    // 1. Enforce Server-Side Maximum 10 Active Cards Limit
    const activeCount = await MockInterviewWorkspace.countDocuments({
      userId: candidateId,
      isDeleted: false
    });

    if (activeCount >= 10) {
      return res.status(409).json({
        success: false,
        code: 'MOCK_INTERVIEW_LIMIT_REACHED',
        message: 'Maximum 10 mock interviews allowed. Delete an existing mock interview to create a new one.',
        activeCount,
        maxLimit: 10,
        slotsAvailable: 0
      });
    }

    // 2. Validate Inputs
    if (!jobDetails || !jobDetails.jobTitle || !jobDetails.company || !jobDetails.jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Job Title, Company, and Job Description are required fields.'
      });
    }

    if (jobDetails.jobDescription.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: 'Job Description must be at least 15 characters long.'
      });
    }

    // 3. Resolve & Validate Resume Ownership
    let targetResumeId = resumeId;
    let targetResumeName = 'Candidate_Resume.pdf';

    if (targetResumeId) {
      const resDoc = await Resume.findOne({ _id: targetResumeId, candidate: candidateId });
      if (resDoc) {
        targetResumeName = resDoc.originalName || resDoc.fileName || 'Candidate_Resume.pdf';
      }
    }

    if (!targetResumeId) {
      const resDoc = await Resume.findOne({ candidate: candidateId }).sort({ updatedAt: -1 });
      if (resDoc) {
        targetResumeId = resDoc._id;
        targetResumeName = resDoc.originalName || resDoc.fileName || 'Candidate_Resume.pdf';
      }
    }

    if (!targetResumeId) {
      return res.status(400).json({
        success: false,
        message: 'Please select or upload a resume to create a Mock Interview.'
      });
    }

    // 4. Create MockInterviewWorkspace Card
    const workspace = await MockInterviewWorkspace.create({
      userId: candidateId,
      resumeId: targetResumeId,
      resumeName: targetResumeName,
      jobDetails: {
        jobTitle: jobDetails.jobTitle.trim(),
        company: jobDetails.company.trim(),
        role: (jobDetails.role || '').trim(),
        jobDescription: jobDetails.jobDescription.trim()
      },
      configuration: {
        interviewType: configuration?.interviewType || 'Technical',
        difficulty: configuration?.difficulty || 'Medium',
        mode: configuration?.mode || 'Voice',
        questionCount: configuration?.questionCount || 10
      },
      status: 'READY'
    });

    const newActiveCount = activeCount + 1;

    return res.status(201).json({
      success: true,
      message: 'Mock Interview card created successfully.',
      workspace,
      activeCount: newActiveCount,
      slotsAvailable: Math.max(0, 10 - newActiveCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Candidate's Active Mock Interview Workspace Cards
// @route   GET /api/mock-interviews
// @access  Private (Candidate)
const getCandidateMockInterviews = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;

    // Query active workspaces (isDeleted !== true)
    let workspaces = await MockInterviewWorkspace.find({
      userId: candidateId,
      isDeleted: false
    }).sort({ updatedAt: -1 });

    const activeCount = workspaces.length;

    return res.status(200).json({
      success: true,
      count: activeCount,
      maxLimit: 10,
      slotsAvailable: Math.max(0, 10 - activeCount),
      workspaces
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Mock Interview Workspace Card Details
// @route   PATCH /api/mock-interviews/:id
// @access  Private (Candidate)
const updateMockInterviewWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;
    const { resumeId, jobDetails, configuration } = req.body;

    const workspace = await MockInterviewWorkspace.findOne({ _id: id, userId: candidateId, isDeleted: false });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Mock Interview card not found.' });
    }

    if (jobDetails) {
      if (jobDetails.jobTitle) workspace.jobDetails.jobTitle = jobDetails.jobTitle.trim();
      if (jobDetails.company) workspace.jobDetails.company = jobDetails.company.trim();
      if (jobDetails.role !== undefined) workspace.jobDetails.role = jobDetails.role.trim();
      if (jobDetails.jobDescription) workspace.jobDetails.jobDescription = jobDetails.jobDescription.trim();
    }

    if (configuration) {
      if (configuration.interviewType) workspace.configuration.interviewType = configuration.interviewType;
      if (configuration.difficulty) workspace.configuration.difficulty = configuration.difficulty;
      if (configuration.mode) workspace.configuration.mode = configuration.mode;
      if (configuration.questionCount) workspace.configuration.questionCount = configuration.questionCount;
    }

    if (resumeId) {
      const resDoc = await Resume.findOne({ _id: resumeId, candidate: candidateId });
      if (resDoc) {
        workspace.resumeId = resumeId;
        workspace.resumeName = resDoc.originalName || resDoc.fileName || 'Candidate_Resume.pdf';
      }
    }

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: 'Mock Interview card updated.',
      workspace
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete Mock Interview Workspace Card (Releases 1 slot)
// @route   DELETE /api/mock-interviews/:id
// @access  Private (Candidate)
const deleteMockInterviewWorkspace = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const workspace = await MockInterviewWorkspace.findOne({ _id: id, userId: candidateId });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Mock Interview card not found.' });
    }

    workspace.isDeleted = true;
    await workspace.save();

    const activeCount = await MockInterviewWorkspace.countDocuments({ userId: candidateId, isDeleted: false });

    return res.status(200).json({
      success: true,
      message: 'Mock Interview card deleted successfully. Slot released.',
      activeCount,
      slotsAvailable: Math.max(0, 10 - activeCount)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Launch New Interview Attempt for Workspace Card
// @route   POST /api/mock-interviews/:id/attempts
// @access  Private (Candidate)
const createMockInterviewAttempt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const workspace = await MockInterviewWorkspace.findOne({ _id: id, userId: candidateId, isDeleted: false });
    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Mock Interview card not found.' });
    }

    // Load Resume Data
    let resumeRecord = null;
    if (workspace.resumeId) {
      resumeRecord = await Resume.findById(workspace.resumeId);
    }
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

    const jobData = {
      jobId: workspace._id.toString(),
      title: workspace.jobDetails.jobTitle,
      company: workspace.jobDetails.company,
      role: workspace.jobDetails.role,
      description: workspace.jobDetails.jobDescription,
      requiredSkills: resumeData.skills,
      preferredSkills: [],
      experienceLevel: 'Mid-Level',
      location: 'Remote'
    };

    const modeUpper = (workspace.configuration.mode || 'Voice').toUpperCase();
    let qCount = workspace.configuration.questionCount || 10;
    let sectionsConfig = [];

    if (modeUpper === 'MCQ') {
      qCount = 40;
      sectionsConfig = [{ type: 'mcq', count: 40 }];
    } else if (modeUpper === 'VOICE') {
      qCount = 5;
      sectionsConfig = [{ type: 'voice', count: 5 }];
    } else if (modeUpper === 'TEXT') {
      qCount = 10;
      sectionsConfig = [{ type: 'text', count: 10 }];
    } else { // RANDOM mode
      qCount = 30;
      sectionsConfig = [
        { type: 'mcq', count: 20 },
        { type: 'voice', count: 3 },
        { type: 'text', count: 7 }
      ];
    }

    const config = {
      difficulty: (workspace.configuration.difficulty || 'Medium').toLowerCase(),
      assessmentMethod: (workspace.configuration.interviewType || 'Technical').toLowerCase(),
      totalQuestions: qCount,
      sections: sectionsConfig
    };

    // Generate AI Questions tailored to Resume + Job Details
    const generatedAI = await GenerateQuestionsService.generateStructuredInterview({
      resumeData,
      jobData,
      configuration: config
    });

    const mcqQuestions = generatedAI.questions.mcq || [];
    const voiceQuestions = generatedAI.questions.voice || [];
    const textQuestions = generatedAI.questions.text || [];
    const totalQuestions = mcqQuestions.length + voiceQuestions.length + textQuestions.length;

    const flatQuestions = [
      ...mcqQuestions.map((q) => ({
        questionId: q.questionId,
        sourceKeyword: q.topic || 'MCQ',
        category: 'mcq',
        questionText: q.question,
        targetSkill: (q.expectedSkills && q.expectedSkills[0]) || 'Technical',
        options: (q.options || []).map((opt, idx) => ({ id: String.fromCharCode(65 + idx), text: opt })),
        correctAnswer: q.correctAnswer,
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

    // Create Attempt preserving configuration snapshot
    const attempt = await Interview.create({
      candidate: candidateId,
      candidateIdString: candidateId.toString(),
      workspaceId: workspace._id,
      jobTitle: workspace.jobDetails.jobTitle,
      resumeId: workspace.resumeId,
      interviewCategory: 'mock',
      questionSource: 'resume_keywords',
      interviewType: workspace.configuration.interviewType,
      difficulty: workspace.configuration.difficulty,
      status: 'ready',
      configurationSnapshot: {
        resumeId: workspace.resumeId,
        resumeName: workspace.resumeName,
        jobDetails: { ...workspace.jobDetails },
        configuration: { ...workspace.configuration }
      },
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
      questions: flatQuestions
    });

    // Update parent card workspace metrics
    workspace.attemptCount += 1;
    workspace.latestAttemptId = attempt._id;
    workspace.status = 'IN_PROGRESS';
    await workspace.save();

    return res.status(201).json({
      success: true,
      message: 'Interview attempt created.',
      attemptId: attempt._id,
      attempt,
      workspace
    });
  } catch (error) {
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
      return res.status(404).json({ success: false, message: 'Mock Interview attempt not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    interview.status = 'in_progress';
    interview.startedAt = interview.startedAt || new Date();
    await interview.save();

    const sanitizedDoc = interview.toObject();
    if (sanitizedDoc.mock_interview_questions?.mcq) {
      sanitizedDoc.mock_interview_questions.mcq = sanitizedDoc.mock_interview_questions.mcq.map((q) => {
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
    const { selectedOption, textAnswer, voiceTranscript, answer, durationSeconds, voiceMetrics } = req.body;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview attempt not found.' });
    }

    if (interview.candidateIdString !== candidateId.toString() && interview.candidate.toString() !== candidateId.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this interview session.' });
    }

    if (interview.mock_interview_questions?.mcq) {
      const mcqItem = interview.mock_interview_questions.mcq.find((q) => String(q.questionId) === String(questionId));
      if (mcqItem) {
        mcqItem.userAnswer = selectedOption || answer || mcqItem.userAnswer;
        mcqItem.isAnswered = true;
        mcqItem.answeredAt = new Date();
      }
    }

    if (interview.mock_interview_questions?.voice) {
      const voiceItem = interview.mock_interview_questions.voice.find((q) => String(q.questionId) === String(questionId));
      if (voiceItem) {
        voiceItem.transcript = voiceTranscript || answer || voiceItem.transcript;
        voiceItem.answer = answer || voiceTranscript || voiceItem.answer;
        voiceItem.userAnswer = answer || voiceTranscript || voiceItem.userAnswer;
        voiceItem.durationSeconds = durationSeconds || voiceItem.durationSeconds || 0;
        if (voiceMetrics) voiceItem.voiceMetrics = voiceMetrics;
        voiceItem.isAnswered = true;
        voiceItem.answeredAt = new Date();
      }
    }

    if (interview.mock_interview_questions?.text) {
      const textItem = interview.mock_interview_questions.text.find((q) => String(q.questionId) === String(questionId));
      if (textItem) {
        textItem.userAnswer = textAnswer || answer || textItem.userAnswer;
        textItem.isAnswered = true;
        textItem.answeredAt = new Date();
      }
    }

    if (interview.questions) {
      const flatItem = interview.questions.find((q) => String(q.questionId) === String(questionId) || String(q._id) === String(questionId));
      if (flatItem) {
        flatItem.candidateResponse = textAnswer || voiceTranscript || selectedOption || answer || flatItem.candidateResponse;
      }
    }

    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer persisted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete Mock Interview & Sync Workspace Metrics
// @route   POST /api/mock-interviews/:id/complete
// @access  Private (Candidate)
const completeMockInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.user.id || req.user._id;

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Mock Interview attempt not found.' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    await interview.save();

    const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
    const evaluation = await evaluateMockInterview(interview, true);

    const score = evaluation?.overallScore ?? evaluation?.overallInterviewScore ?? 75;

    // Sync Parent Workspace Metrics
    if (interview.workspaceId) {
      const workspace = await MockInterviewWorkspace.findById(interview.workspaceId);
      if (workspace) {
        if (workspace.initialScore === null) {
          workspace.initialScore = score;
        }
        workspace.latestScore = score;
        workspace.bestScore = Math.max(workspace.bestScore ?? score, score);
        workspace.improvementScore = Math.max(0, workspace.latestScore - (workspace.initialScore || score));
        workspace.status = score >= 75 ? 'IMPROVED' : 'NEEDS_IMPROVEMENT';
        await workspace.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Mock Interview completed and workspace updated.',
      evaluation,
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate Mock Interview
// @route   POST /api/mock-interviews/:id/evaluate
// @access  Private (Candidate)
const evaluateMockInterviewController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.body || {};

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview attempt not found.' });
    }

    const { evaluateMockInterview } = require('../services/ai/mockInterview/mockInterviewEvaluator');
    const evaluation = await evaluateMockInterview(interview, Boolean(force));

    return res.status(200).json({
      success: true,
      evaluation,
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Mock Interview Document by ID (Workspace ID or Attempt ID)
// @route   GET /api/mock-interviews/:id
// @access  Private (Candidate)
const getMockInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Try finding by MockInterviewWorkspace ID
    const workspace = await MockInterviewWorkspace.findById(id);
    if (workspace) {
      const attempts = await Interview.find({
        $or: [{ workspaceId: id }, { workspaceId: workspace._id }]
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        workspace,
        attempts: attempts || []
      });
    }

    // 2. Try finding by Interview Attempt ID
    const interview = await Interview.findById(id);
    if (interview) {
      let parentWorkspace = null;
      let attempts = [interview];

      if (interview.workspaceId) {
        parentWorkspace = await MockInterviewWorkspace.findById(interview.workspaceId);
        attempts = await Interview.find({
          $or: [{ workspaceId: interview.workspaceId }, { workspaceId: interview.workspaceId.toString() }]
        }).sort({ createdAt: -1 });
      }

      return res.status(200).json({
        success: true,
        workspace: parentWorkspace,
        interview,
        attempts: attempts.length > 0 ? attempts : [interview]
      });
    }

    return res.status(404).json({ success: false, message: 'Mock Interview document not found.' });
  } catch (error) {
    next(error);
  }
};

// SSE stream stubs
const getGenerationProgressStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.write(`event: generation-progress\ndata: ${JSON.stringify({ progress: 100, stage: 'COMPLETED' })}\n\n`);
  res.end();
};

const getEvaluationProgressStream = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.write(`event: evaluation-progress\ndata: ${JSON.stringify({ progress: 100, stage: 'COMPLETED' })}\n\n`);
  res.end();
};

const evaluateSingleQuestionController = async (req, res) => {
  return res.status(200).json({ success: true });
};

module.exports = {
  createMockInterviewWorkspace,
  getCandidateMockInterviews,
  updateMockInterviewWorkspace,
  deleteMockInterviewWorkspace,
  createMockInterviewAttempt,
  startMockInterview,
  submitQuestionAnswer,
  completeMockInterview,
  getMockInterviewById,
  getGenerationProgressStream,
  getEvaluationProgressStream,
  evaluateMockInterviewController,
  evaluateSingleQuestionController
};
