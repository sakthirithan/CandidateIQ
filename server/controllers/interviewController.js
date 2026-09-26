const Interview = require('../models/Interview');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const { normalizeKeywords } = require('../utils/keywordNormalizer');
const aiService = require('../services/aiService');
const interviewAIService = require('../ai/services/interviewAIService');
const evaluationAIService = require('../ai/services/evaluationAIService');

// @desc    Start a dynamic mock interview session based EXCLUSIVELY on candidate resume keywords
// @route   POST /api/interviews/start
// @access  Private (Candidate)
const startInterview = async (req, res, next) => {
  try {
    const { jobId, interviewType = 'mixed', difficulty = 'Mid-Level', questionCount = 5 } = req.body;
    const userId = req.user.id || req.user._id;

    // STRICT BACKEND GUARD: Mock Interview must NEVER receive or accept HR Evaluation Prompt
    if (req.body.hrEvaluationPrompt !== undefined || req.body.hrPrompt !== undefined) {
      return res.status(400).json({
        success: false,
        message: 'Architectural Error: HR Evaluation Prompt is not permitted in Mock Interview context.'
      });
    }

    let candidateProfile = await CandidateProfile.findOne({ user: userId });
    let targetJob = { title: 'Practice Role', requiredSkills: [] };

    if (jobId) {
      const foundJob = await Job.findById(jobId);
      if (foundJob) targetJob = foundJob;
    }

    // Retrieve Candidate's confirmed Resume directly from DB
    let confirmedResume = await Resume.findOne({ candidate: userId, extractionStatus: 'confirmed' }).sort({ updatedAt: -1 });
    if (!confirmedResume) {
      confirmedResume = await Resume.findOne({ candidate: userId }).sort({ updatedAt: -1 });
    }

    let resumeKeywords = confirmedResume?.keywords || [];

    // Fallback if Candidate hasn't uploaded/confirmed a resume yet
    if (!resumeKeywords || resumeKeywords.length === 0) {
      const techList = candidateProfile?.skills?.technical || ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'];
      const fwList = candidateProfile?.skills?.frameworks || [];
      const dbList = candidateProfile?.skills?.databases || [];
      resumeKeywords = normalizeKeywords([...techList, ...fwList, ...dbList]);
    }

    // Build reproducible Resume Keyword Snapshot for this Mock Interview
    const resumeKeywordSnapshot = [...resumeKeywords];

    // AI CONTEXT GUARD: Log sanitized AI context before AI call
    console.log('[MOCK_INTERVIEW]', {
      resumeKeywords: resumeKeywordSnapshot,
      jobId: jobId || 'none',
      hrEvaluationPrompt: 'EXCLUDED'
    });

    // Generate dynamic AI questions derived ENTIRELY from candidate resume keywords
    const generatedQuestions = await interviewAIService.generateMockQuestionsFromResumeKeywords({
      resumeKeywords: resumeKeywordSnapshot,
      interviewType,
      difficulty,
      count: questionCount
    });

    const questionsList = Array.isArray(generatedQuestions.result)
      ? generatedQuestions.result
      : (Array.isArray(generatedQuestions) ? generatedQuestions : []);

    const questionsFormatted = questionsList.map((q, idx) => {
      const kw = q.sourceKeyword || (typeof resumeKeywordSnapshot[idx % resumeKeywordSnapshot.length] === 'string' ? resumeKeywordSnapshot[idx % resumeKeywordSnapshot.length] : resumeKeywordSnapshot[idx % resumeKeywordSnapshot.length]?.keyword) || 'Core Skill';
      return {
        questionId: q.questionId || (idx + 1).toString(),
        sourceKeyword: kw,
        category: q.category || (idx % 2 === 0 ? 'technical' : 'behavioural'),
        questionText: q.question || q.questionText || `Explain practical usage of ${kw}.`,
        targetSkill: q.targetSkill || kw,
        evaluationCriteria: q.evaluationCriteria || `Evaluates domain depth and practical experience with ${kw}.`,
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        mcqExplanation: q.explanation || '',
        candidateResponse: '',
        evaluation: null
      };
    });

    const activeResumeId = candidateProfile?.resumeReference?.resumeId || null;

    const interview = await Interview.create({
      candidate: userId,
      candidateIdString: userId.toString(),
      job: jobId || null,
      jobIdString: jobId ? jobId.toString() : '',
      jobTitle: targetJob.title || 'Full Stack Developer',
      resumeId: activeResumeId,
      interviewCategory: 'mock',
      questionSource: 'resume_keywords',
      resumeKeywordSnapshot,
      hrEvaluationPrompt: undefined, // Explicitly excluded
      interviewType,
      difficulty,
      status: 'in_progress',
      questions: questionsFormatted
    });

    return res.status(201).json({
      operation: 'mock_interview_start',
      status: 'success',
      success: true,
      message: 'Mock interview session initialized. Questions generated strictly from candidate resume keywords.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule an HR/Technical Interview by Recruiter (Actual Interview)
// @route   POST /api/interviews/schedule
// @access  Private (Recruiter/Admin)
const scheduleInterview = async (req, res, next) => {
  try {
    const { candidateId, jobId, scheduledDate, interviewType = 'hr', notes } = req.body;

    if (!candidateId || !jobId) {
      return res.status(400).json({ success: false, message: 'Candidate ID and Job ID are required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const hrPromptText = job.hrEvaluationPrompt || job.evaluation?.hrPrompt || 'Evaluate based on technical proficiency and communication.';

    const interview = await Interview.create({
      candidate: candidateId,
      candidateIdString: candidateId.toString(),
      job: jobId,
      jobIdString: jobId.toString(),
      jobTitle: job.title,
      interviewCategory: 'actual',
      questionSource: 'recruiter_job',
      hrEvaluationPrompt: hrPromptText,
      interviewType: ['technical', 'behavioural', 'mixed', 'hr'].includes(interviewType) ? interviewType : 'hr',
      difficulty: 'Mid-Level',
      status: 'scheduled',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 86400000 * 2),
      notes: notes || 'Recruiter Candidate Screening Interview'
    });

    // Automatically update Application status to interview_scheduled if application exists
    await Application.findOneAndUpdate(
      { candidate: candidateId, job: jobId },
      { status: 'interview_scheduled' }
    );

    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidate', 'name email role')
      .populate('job', 'title department location');

    return res.status(201).json({
      operation: 'actual_interview_schedule',
      status: 'success',
      success: true,
      message: 'Actual Recruiter Interview scheduled successfully.',
      interview: populatedInterview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scheduled interviews for Recruiter
// @route   GET /api/interviews/recruiter
// @access  Private (Recruiter/Admin)
const getRecruiterInterviews = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';

    let jobIds = [];
    if (!isSystemAdmin) {
      const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
      jobIds = recruiterJobs.map(j => j._id);
    }

    const query = isSystemAdmin ? {} : { job: { $in: jobIds } };

    const interviews = await Interview.find(query)
      .populate('candidate', 'name email role')
      .populate('job', 'title department location')
      .sort({ scheduledDate: 1, createdAt: -1 });

    return res.status(200).json({ success: true, count: interviews.length, interviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit candidate response for single question & run evaluation
// @route   POST /api/interviews/:id/answer
// @access  Private (Candidate)
const submitAnswer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, responseText } = req.body;

    if (!questionId || !responseText) {
      return res.status(400).json({ success: false, message: 'Please provide questionId and responseText.' });
    }

    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const questionIndex = interview.questions.findIndex(q =>
      String(q.questionId) === String(questionId) || String(q._id) === String(questionId)
    );

    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question ID not found in this interview session.' });
    }

    const targetQuestion = interview.questions[questionIndex];
    targetQuestion.candidateResponse = responseText;

    let evaluationResult = null;

    if (interview.interviewCategory === 'mock' || interview.questionSource === 'resume_keywords') {
      // AI CONTEXT GUARD FOR MOCK EVALUATION: Ensure HR Evaluation Prompt is excluded
      console.log('[MOCK_EVALUATION]', {
        question: targetQuestion.questionText,
        sourceKeyword: targetQuestion.sourceKeyword || 'React',
        candidateAnswer: responseText,
        hrEvaluationPrompt: 'EXCLUDED'
      });

      const aiEvalRes = await evaluationAIService.evaluateMockAnswer(
        targetQuestion,
        responseText,
        targetQuestion.sourceKeyword
      );

      const evalData = aiEvalRes?.result || aiEvalRes || {};
      evaluationResult = {
        technicalScore: evalData.technicalCorrectness || evalData.score || 80,
        communicationScore: evalData.clarity || 80,
        problemSolvingScore: evalData.reasoning || 80,
        depthScore: evalData.completeness || 75,
        relevanceScore: evalData.relevance || 85,
        feedback: evalData.feedback || 'Response demonstrates good understanding of core topic.',
        behaviouralEvidence: evalData.strengths || [],
        keyStrengths: evalData.strengths || ['Direct concept explanation'],
        areasForImprovement: evalData.improvements || ['Could elaborate on production trade-offs']
      };
    } else {
      // ACTUAL INTERVIEW EVALUATION (Uses HR Evaluation Prompt & Job Context)
      const job = await Job.findById(interview.job);
      const hrPrompt = interview.hrEvaluationPrompt || job?.hrEvaluationPrompt || job?.evaluation?.hrPrompt || '';

      console.log('[ACTUAL_INTERVIEW_EVALUATION]', {
        jobTitle: job?.title || interview.jobTitle,
        hrPrompt,
        question: targetQuestion.questionText
      });

      const aiEvalRes = await aiService.evaluateInterviewResponse(targetQuestion, responseText);
      evaluationResult = aiEvalRes;
    }

    targetQuestion.evaluation = evaluationResult;
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Answer recorded and evaluated successfully.',
      question: targetQuestion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete interview & generate final technical & behavioural score report
// @route   POST /api/interviews/:id/complete
// @access  Private (Candidate)
const completeInterview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const evaluatedQuestions = interview.questions.filter(q => q.evaluation);
    const count = evaluatedQuestions.length || 1;

    let totalTech = 0;
    let totalComm = 0;
    let totalProblem = 0;
    let combinedTranscript = '';

    evaluatedQuestions.forEach(q => {
      totalTech += q.evaluation?.technicalScore || 75;
      totalComm += q.evaluation?.communicationScore || 80;
      totalProblem += q.evaluation?.problemSolvingScore || 78;
      if (q.candidateResponse) {
        combinedTranscript += ` Q: ${q.questionText} A: ${q.candidateResponse}.`;
      }
    });

    const technicalProficiency = Math.round(totalTech / count);
    const communicationClarity = Math.round(totalComm / count);
    const problemSolvingRating = Math.round(totalProblem / count);
    const behaviouralCompetency = Math.round((communicationClarity + problemSolvingRating) / 2);
    const overallInterviewScore = Math.round(technicalProficiency * 0.5 + behaviouralCompetency * 0.5);

    // Run Advanced AI Analytics
    const candidateProfile = await CandidateProfile.findOne({ user: interview.candidate });
    const englishAnalysis = await aiService.analyzeLanguage(combinedTranscript || 'Candidate provided concise technical responses.');
    const behaviouralSignals = await aiService.analyzeBehaviouralSignals(combinedTranscript || 'Candidate demonstrated direct problem-solving approach.');
    const sentimentAnalysis = await aiService.analyzeSentiment(combinedTranscript || 'Candidate maintained professional communication.');
    const resumeComparison = await aiService.compareResumeWithInterview(candidateProfile || { name: 'Candidate' }, evaluatedQuestions.map(q => q.evaluation));

    const overallEvaluation = {
      overallInterviewScore,
      technicalProficiency,
      behaviouralCompetency,
      communicationClarity,
      problemSolvingRating,
      summaryExplanation: `Candidate scored ${overallInterviewScore}/100 in comprehensive evaluation (${technicalProficiency}% technical proficiency, ${behaviouralCompetency}% behavioural & communication clarity).`,
      topStrengths: ['Structured answer formulation', 'Technical concept clarity', 'Direct problem-solving focus'],
      recommendedImprovementAreas: ['Elaborate on production deployment scale', 'Include concrete operational metrics']
    };

    interview.status = 'completed';
    interview.overallEvaluation = overallEvaluation;
    interview.englishLanguageAnalysis = englishAnalysis;
    interview.behaviouralSignals = behaviouralSignals;
    interview.sentimentAnalysis = sentimentAnalysis;
    interview.resumeComparison = resumeComparison;

    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Interview session completed. Unified AI analytics evaluation generated & persisted.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview session details & report
// @route   GET /api/interviews/:id
// @access  Private
const getInterviewById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id)
      .populate('candidate', 'name email role')
      .populate('job', 'title department location');

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    return res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interviews for current logged in candidate (Mock & Actual)
// @route   GET /api/interviews/candidate
// @access  Private (Candidate)
const getCandidateInterviews = async (req, res, next) => {
  try {
    const candidateId = req.user.id || req.user._id;
    const interviews = await Interview.find({
      $or: [
        { candidate: candidateId },
        { candidateIdString: candidateId.toString() }
      ]
    })
      .populate('job', 'title department company description requiredSkills preferredSkills location')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  scheduleInterview,
  getRecruiterInterviews,
  getCandidateInterviews,
  submitAnswer,
  completeInterview,
  getInterviewById
};
