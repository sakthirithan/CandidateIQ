const Interview = require('../models/Interview');
const CandidateProfile = require('../models/CandidateProfile');
const Job = require('../models/Job');
const aiService = require('../services/aiService');
const { getDBStatus } = require('../config/db');

// In-memory interviews store
const inMemoryInterviews = new Map();

// @desc    Start a dynamic mock interview session
// @route   POST /api/interviews/start
// @access  Private (Candidate)
const startInterview = async (req, res, next) => {
  try {
    const { jobId, interviewType = 'mixed', difficulty = 'Mid-Level', questionCount = 5 } = req.body;
    const userId = req.user.id || req.user._id;

    let candidateProfile;
    let targetJob = { title: 'Software Developer', requiredSkills: ['JavaScript', 'React', 'Node.js'] };

    if (getDBStatus()) {
      candidateProfile = await CandidateProfile.findOne({ user: userId });
      if (jobId) {
        const foundJob = await Job.findById(jobId);
        if (foundJob) targetJob = foundJob;
      }
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

    const interviewData = {
      candidate: userId,
      candidateIdString: userId.toString(),
      job: jobId || null,
      jobIdString: jobId ? jobId.toString() : '',
      jobTitle: targetJob.title || 'Full Stack Developer',
      interviewType,
      difficulty,
      status: 'in_progress',
      questions: questionsFormatted,
      createdAt: new Date()
    };

    if (getDBStatus()) {
      const interview = await Interview.create(interviewData);
      return res.status(201).json({
        success: true,
        message: 'Mock interview session initialized. Questions dynamically generated.',
        interview
      });
    }

    interviewData.id = `int_${Date.now()}`;
    inMemoryInterviews.set(interviewData.id, interviewData);

    return res.status(201).json({
      success: true,
      message: 'Mock interview session initialized. Questions dynamically generated.',
      interview: interviewData
    });
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

    let interview;
    if (getDBStatus()) {
      interview = await Interview.findById(id);
    } else {
      interview = inMemoryInterviews.get(id);
    }

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

    if (getDBStatus()) {
      await interview.save();
    } else {
      inMemoryInterviews.set(id, interview);
    }

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

    let interview;
    if (getDBStatus()) {
      interview = await Interview.findById(id);
    } else {
      interview = inMemoryInterviews.get(id);
    }

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found.' });
    }

    const evaluatedQuestions = interview.questions.filter(q => q.evaluation);
    const count = evaluatedQuestions.length || 1;

    let totalTech = 0;
    let totalComm = 0;
    let totalProblem = 0;

    evaluatedQuestions.forEach(q => {
      totalTech += q.evaluation.technicalScore || 75;
      totalComm += q.evaluation.communicationScore || 80;
      totalProblem += q.evaluation.problemSolvingScore || 78;
    });

    const technicalProficiency = Math.round(totalTech / count);
    const communicationClarity = Math.round(totalComm / count);
    const problemSolvingRating = Math.round(totalProblem / count);
    const behaviouralCompetency = Math.round((communicationClarity + problemSolvingRating) / 2);
    const overallInterviewScore = Math.round(technicalProficiency * 0.5 + behaviouralCompetency * 0.5);

    const overallEvaluation = {
      overallInterviewScore,
      technicalProficiency,
      behaviouralCompetency,
      communicationClarity,
      problemSolvingRating,
      summaryExplanation: `Candidate scored ${overallInterviewScore}/100 in mock evaluation (${technicalProficiency}% technical proficiency, ${behaviouralCompetency}% behavioural & communication clarity).`,
      topStrengths: ['Structured answer formulation', 'Technical concept clarity', 'Direct problem-solving focus'],
      recommendedImprovementAreas: ['Elaborate on production deployment scale', 'Include concrete operational metrics']
    };

    interview.status = 'completed';
    interview.overallEvaluation = overallEvaluation;

    if (getDBStatus()) {
      await interview.save();
    } else {
      inMemoryInterviews.set(id, interview);
    }

    return res.status(200).json({
      success: true,
      message: 'Interview session completed. Unified analytics evaluation generated.',
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

    if (getDBStatus()) {
      const interview = await Interview.findById(id);
      if (!interview) return res.status(404).json({ success: false, message: 'Interview session not found.' });
      return res.status(200).json({ success: true, interview });
    }

    const interview = inMemoryInterviews.get(id);
    if (!interview) return res.status(404).json({ success: false, message: 'Interview session not found.' });
    return res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

module.exports = { startInterview, submitAnswer, completeInterview, getInterviewById };
