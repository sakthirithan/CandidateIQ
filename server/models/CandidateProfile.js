const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userIdString: {
      type: String // Fallback string representation for in-memory or custom ID
    },
    personalInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      headline: { type: String, default: '' },
      profilePhoto: { type: String, default: '' }
    },
    education: [
      {
        degree: String,
        institution: String,
        graduationYear: String,
        cgpa: String
      }
    ],
    experience: [
      {
        company: String,
        position: String,
        duration: String,
        responsibilities: [String]
      }
    ],
    skills: {
      technical: [String],
      soft: [String],
      frameworks: [String],
      databases: [String],
      tools: [String]
    },
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        role: String,
        url: String
      }
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: String
      }
    ],
    skillAnalysis: {
      totalSkills: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 85 },
      topSkills: [String],
      inferredLevels: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
