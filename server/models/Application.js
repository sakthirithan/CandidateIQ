const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    jobIdString: String,
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    candidateIdString: String,
    candidateProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CandidateProfile'
    },
    status: {
      type: String,
      enum: ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected'],
      default: 'applied'
    },
    matchAnalysis: {
      overallMatch: Number,
      technicalMatch: Number,
      experienceMatch: Number,
      educationMatch: Number,
      strongMatches: [String],
      missingSkills: [String],
      explanation: String,
      recommendation: String
    },
    overallScore: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
