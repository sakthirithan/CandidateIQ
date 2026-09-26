const Interview = require('../models/Interview');
const CandidateProfile = require('../models/CandidateProfile');
const User = require('../models/User');

/**
 * Service to aggregate dynamic Candidate Interview Journey & progression analytics
 */
async function getCandidateInterviewJourney(candidateId) {
  const user = await User.findById(candidateId).select('name email role').lean();
  if (!user) {
    throw new Error('Candidate user not found');
  }

  // Fetch all interviews associated with candidate
  const interviews = await Interview.find({
    $or: [
      { candidate: candidateId },
      { candidateIdString: candidateId.toString() }
    ]
  }).sort({ createdAt: -1 }).lean();

  if (!interviews || interviews.length === 0) {
    return {
      candidateId,
      hasInterviews: false,
      interviews: [],
      performanceTrend: {
        hasTrend: false,
        trendMessage: 'No completed interviews yet. Start your first AI mock interview to build your interview journey.'
      },
      summaryMetrics: {
        totalAttempts: 0,
        completedCount: 0,
        averageOverallScore: 0,
        averageTechnicalScore: 0,
        averageCommunicationScore: 0
      }
    };
  }

  const journeyList = interviews.map(inv => {
    // Combine questions from sections
    const mcqs = inv.mock_interview_questions?.mcq || [];
    const voices = inv.mock_interview_questions?.voice || [];
    const texts = inv.mock_interview_questions?.text || [];
    const standardQuestions = inv.questions || [];

    const totalQuestions = (mcqs.length + voices.length + texts.length) || inv.progress?.totalQuestions || standardQuestions.length || 0;

    const answeredMcqs = mcqs.filter(q => q.isAnswered).length;
    const answeredVoices = voices.filter(q => q.isAnswered).length;
    const answeredTexts = texts.filter(q => q.isAnswered).length;
    const answeredQuestions = (answeredMcqs + answeredVoices + answeredTexts) || inv.progress?.answeredQuestions || 0;

    // Collect question-by-question details
    const questionPerformance = [];
    const skillsDemonstratedSet = new Set();

    mcqs.forEach((q, idx) => {
      if (q.expectedSkills) q.expectedSkills.forEach(s => skillsDemonstratedSet.add(s));
      const score = q.evaluation?.score !== undefined ? q.evaluation.score : (q.userAnswer === q.correctAnswer ? 10 : 0);
      questionPerformance.push({
        questionId: q.questionId || `mcq_${idx}`,
        questionText: q.question,
        answerType: 'mcq',
        candidateResponse: q.userAnswer || 'Not answered',
        correctAnswer: q.correctAnswer,
        isAnswered: q.isAnswered,
        topic: q.topic || 'General Technical',
        score,
        feedback: q.evaluation?.feedback || (q.userAnswer === q.correctAnswer ? 'Correct answer selected' : `Selected ${q.userAnswer || 'none'}`)
      });
    });

    voices.forEach((q, idx) => {
      if (q.expectedSkills) q.expectedSkills.forEach(s => skillsDemonstratedSet.add(s));
      const evalData = q.evaluation || {};
      const score = evalData.technicalScore !== undefined ? evalData.technicalScore : (evalData.overallScore || 0);
      questionPerformance.push({
        questionId: q.questionId || `voice_${idx}`,
        questionText: q.question,
        answerType: 'voice',
        transcript: q.transcript || q.userAnswer || '',
        candidateResponse: q.transcript || q.userAnswer || 'No voice transcript recorded',
        isAnswered: q.isAnswered,
        topic: q.topic || 'Technical / Scenario',
        score,
        feedback: evalData.feedback || 'Voice response evaluated by CandidateIQ evaluator'
      });
    });

    texts.forEach((q, idx) => {
      if (q.expectedSkills) q.expectedSkills.forEach(s => skillsDemonstratedSet.add(s));
      const evalData = q.evaluation || {};
      const score = evalData.technicalScore !== undefined ? evalData.technicalScore : (evalData.overallScore || 0);
      questionPerformance.push({
        questionId: q.questionId || `text_${idx}`,
        questionText: q.question,
        answerType: 'text',
        candidateResponse: q.userAnswer || 'Not answered',
        isAnswered: q.isAnswered,
        topic: q.topic || 'System Design',
        score,
        feedback: evalData.feedback || 'Text answer evaluated'
      });
    });

    standardQuestions.forEach((q, idx) => {
      if (q.targetSkill) skillsDemonstratedSet.add(q.targetSkill);
      const evalData = q.evaluation || {};
      const score = evalData.technicalScore !== undefined ? evalData.technicalScore : 0;
      questionPerformance.push({
        questionId: q.questionId || `std_${idx}`,
        questionText: q.questionText || q.question,
        answerType: q.voiceMeta ? 'voice' : (q.options?.length ? 'mcq' : 'text'),
        candidateResponse: q.candidateResponse || q.voiceMeta?.transcript || 'Not answered',
        isAnswered: !!q.candidateResponse || !!q.voiceMeta?.transcript,
        topic: q.targetSkill || 'Technical Question',
        score,
        feedback: evalData.feedback || 'Evaluated question response'
      });
    });

    // Extract overall scores from MongoDB evaluation object
    const overallEval = inv.overallEvaluation || {};
    const evalData = inv.evaluation || {};

    const overallScore = overallEval.overallInterviewScore || evalData.overallScore || 0;
    const technicalScore = overallEval.technicalProficiency || evalData.technicalScore || 0;
    const communicationScore = overallEval.communicationClarity || evalData.communicationScore || 0;
    const behaviouralScore = overallEval.behaviouralCompetency || evalData.behaviouralScore || 0;

    return {
      interviewId: inv._id.toString(),
      interviewCategory: inv.interviewCategory || 'mock',
      interviewType: inv.interviewType || 'mixed',
      title: inv.jobTitle || (inv.interviewCategory === 'actual' ? 'Recruiter Technical Interview' : 'AI Technical Practice Interview'),
      difficulty: inv.difficulty || 'Mid-Level',
      status: inv.status || 'completed',
      scheduledDate: inv.scheduledDate || null,
      startedAt: inv.startedAt || inv.createdAt,
      completedAt: inv.completedAt || inv.updatedAt,
      questionCount: totalQuestions,
      answeredCount: answeredQuestions,
      scores: {
        overallScore,
        technicalScore,
        communicationScore,
        behaviouralScore
      },
      skillsDemonstrated: Array.from(skillsDemonstratedSet),
      topStrengths: overallEval.topStrengths || evalData.strengths || [],
      recommendedImprovementAreas: overallEval.recommendedImprovementAreas || evalData.improvements || [],
      questionPerformance
    };
  });

  // Calculate Performance Trend across completed interviews
  const completedList = journeyList.filter(i => i.status === 'completed' && i.scores.overallScore > 0);
  completedList.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));

  let performanceTrend = {
    hasTrend: false,
    trendMessage: 'Complete at least 2 evaluated interviews to see your performance trend.'
  };

  if (completedList.length >= 2) {
    const first = completedList[0];
    const latest = completedList[completedList.length - 1];
    const overallDelta = latest.scores.overallScore - first.scores.overallScore;
    const technicalDelta = latest.scores.technicalScore - first.scores.technicalScore;

    performanceTrend = {
      hasTrend: true,
      dataPoints: completedList.map(i => ({
        date: new Date(i.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        overallScore: i.scores.overallScore,
        technicalScore: i.scores.technicalScore,
        communicationScore: i.scores.communicationScore
      })),
      overallDelta,
      technicalDelta,
      trendDirection: overallDelta >= 0 ? 'improving' : 'declining',
      trendMessage: overallDelta >= 0
        ? `Your interview performance improved by +${overallDelta} points across recent sessions!`
        : `Your score changed by ${overallDelta} points. Review suggested feedback to optimize results.`
    };
  }

  const completedCount = completedList.length;
  const avgOverall = completedCount > 0 ? Math.round(completedList.reduce((a, b) => a + b.scores.overallScore, 0) / completedCount) : 0;
  const avgTech = completedCount > 0 ? Math.round(completedList.reduce((a, b) => a + b.scores.technicalScore, 0) / completedCount) : 0;
  const avgComm = completedCount > 0 ? Math.round(completedList.reduce((a, b) => a + b.scores.communicationScore, 0) / completedCount) : 0;

  return {
    candidateId,
    hasInterviews: journeyList.length > 0,
    interviews: journeyList,
    performanceTrend,
    summaryMetrics: {
      totalAttempts: journeyList.length,
      completedCount,
      averageOverallScore: avgOverall,
      averageTechnicalScore: avgTech,
      averageCommunicationScore: avgComm
    }
  };
}

/**
 * Service to get single interview detailed evaluation by ID
 */
async function getInterviewDetailById(candidateId, interviewId) {
  const interview = await Interview.findById(interviewId).lean();
  if (!interview) {
    throw new Error('Interview record not found');
  }

  // Security check: Candidate must own this interview
  if (interview.candidate?.toString() !== candidateId.toString() && interview.candidateIdString !== candidateId.toString()) {
    throw new Error('Unauthorized access to interview record');
  }

  return interview;
}

module.exports = {
  getCandidateInterviewJourney,
  getInterviewDetailById
};
