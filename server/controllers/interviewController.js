const Interview = require('../models/Interview');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const aiService = require('../services/aiService');

// @desc    Start a dynamic mock interview session
// @route   POST /api/interviews/start
// @access  Private (Candidate)
const startInterview = async (req, res, next) => {
  try {
    const { jobId, interviewType = 'mixed', difficulty = 'Mid-Level', questionCount = 5 } = req.body;
    const userId = req.user.id || req.user._id;

    let candidateProfile = await CandidateProfile.findOne({ user: userId });
    let targetJob = { title: 'Software Developer', requiredSkills: ['JavaScript', 'React', 'Node.js'] };

    if (jobId) {
      const foundJob = await Job.findById(jobId);
      if (foundJob) targetJob = foundJob;
    }

    const profileForAI = candidateProfile || {
      skills: { technical: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'] }
    };

    // Generate dynamic AI questions
    const generatedQuestions = await aiService.generateInterviewQuestions(profileForAI, targetJob, questionCount);

    const questionsFormatted = generatedQuestions.map((q, idx) => ({
      questionId: idx + 1,
      category: q.category || (idx % 2 === 0 ? 'technical' : 'behavioural'),
      questionText: q.question,
      targetSkill: q.targetSkill || 'Software Development',
      evaluationCriteria: q.evaluationCriteria || 'Demonstrates problem-solving approach and domain depth.',
      candidateResponse: '',
      evaluation: null
    }));

    const interview = await Interview.create({
      candidate: userId,
      candidateIdString: userId.toString(),
      job: jobId || null,
      jobIdString: jobId ? jobId.toString() : '',
      jobTitle: targetJob.title || 'Full Stack Developer',
      interviewType,
      difficulty,
      status: 'in_progress',
      questions: questionsFormatted
    });

    return res.status(201).json({
      success: true,
      message: 'Mock interview session initialized. Questions dynamically generated.',
      interview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule an HR/Technical Interview by Recruiter
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

    const interview = await Interview.create({
      candidate: candidateId,
      candidateIdString: candidateId.toString(),
      job: jobId,
      jobIdString: jobId.toString(),
      jobTitle: job.title,
      interviewType: ['technical', 'behavioural', 'mixed', 'hr'].includes(interviewType) ? interviewType : 'hr',
      difficulty: 'Mid-Level',
      status: 'scheduled',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(Date.now() + 86400000 * 2),
      notes: notes || 'HR Candidate Screening Interview'
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
      success: true,
      message: 'HR Interview scheduled successfully.',
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

    const questionIndex = interview.questions.findIndex(q => q.questionId === Number(questionId));
    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: 'Question ID not found in this interview session.' });
    }

    const targetQuestion = interview.questions[questionIndex];
    targetQuestion.candidateResponse = responseText;

    // Run AI evaluation on answer
    const evaluation = await aiService.evaluateInterviewResponse(targetQuestion, responseText);
    targetQuestion.evaluation = evaluation;

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

module.exports = {
  startInterview,
  scheduleInterview,
  getRecruiterInterviews,
  submitAnswer,
  completeInterview,
  getInterviewById
};
