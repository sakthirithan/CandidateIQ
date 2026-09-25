const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateIdString: String,
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    jobIdString: String,
    jobTitle: String,
    interviewType: {
      type: String,
      enum: ['technical', 'behavioural', 'mixed', 'hr', 'mcq'],
      default: 'mixed'
    },
    difficulty: {
      type: String,
      enum: ['Junior', 'Mid-Level', 'Senior'],
      default: 'Mid-Level'
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'in_progress'
    },
    scheduledDate: Date,
    notes: String,
    questions: [
      {
        questionId: mongoose.Schema.Types.Mixed,
        category: String,
        questionText: String,
        targetSkill: String,
        evaluationCriteria: String,
        candidateResponse: String,
        options: [
          {
            id: String,
            text: String
          }
        ],
        correctAnswer: String,
        mcqExplanation: String,
        voiceMeta: {
          audioUrl: String,
          durationSeconds: Number,
          transcript: String,
          confidence: Number
        },
        evaluation: {
          technicalScore: Number,
          communicationScore: Number,
          problemSolvingScore: Number,
          depthScore: Number,
          relevanceScore: Number,
          feedback: String,
          behaviouralEvidence: [String],
          keyStrengths: [String],
          areasForImprovement: [String]
        }
      }
    ],
    overallEvaluation: {
      overallInterviewScore: Number,
      technicalProficiency: Number,
      behaviouralCompetency: Number,
      communicationClarity: Number,
      problemSolvingRating: Number,
      mcqScore: Number,
      voiceScore: Number,
      summaryExplanation: String,
      topStrengths: [String],
      recommendedImprovementAreas: [String]
    },
    englishLanguageAnalysis: {
      grammarScore: Number,
      vocabularyScore: Number,
      fluencyScore: Number,
      coherenceScore: Number,
      clarityScore: Number,
      observations: [String]
    },
    behaviouralSignals: {
      directness: Number,
      responsiveness: Number,
      logicalStructure: Number,
      problemSolvingApproach: Number,
      adaptabilityDemonstrated: Number,
      projectOwnership: Number,
      observations: [String]
    },
    sentimentAnalysis: {
      overall: String,
      confidence: Number,
      engagement: String,
      observations: [String]
    },
    resumeComparison: {
      matchedClaims: [String],
      areasRequiringFurtherValidation: [String],
      technicalConsistency: Number,
      experienceConsistency: Number,
      explanation: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
