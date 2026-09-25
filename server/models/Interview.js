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
      enum: ['technical', 'behavioural', 'mixed', 'hr'],
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
        questionId: Number,
        category: String,
        questionText: String,
        targetSkill: String,
        evaluationCriteria: String,
        candidateResponse: String,
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
      summaryExplanation: String,
      topStrengths: [String],
      recommendedImprovementAreas: [String]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
