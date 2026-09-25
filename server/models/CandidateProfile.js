const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userIdString: {
      type: String
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
        year: String,
        cgpa: String,
        description: String
      }
    ],
    experience: [
      {
        company: String,
        organization: String,
        position: String,
        role: String,
        duration: String,
        startDate: String,
        endDate: String,
        description: String,
        responsibilities: [String],
        technologies: [String]
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
        title: String,
        description: String,
        technologies: [String],
        role: String,
        url: String
      }
    ],
    certifications: [
      {
        name: String,
        title: String,
        issuer: String,
        organization: String,
        date: String,
        year: String
      }
    ],
    customSections: [
      {
        sectionId: { type: String, required: true },
        sectionType: { type: String, default: 'custom' },
        title: { type: String, required: true },
        content: String,
        items: [mongoose.Schema.Types.Mixed],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
      }
    ],
    skillAnalysis: {
      totalSkills: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 85 },
      topSkills: [String],
      inferredLevels: mongoose.Schema.Types.Mixed
    },
    resumeReference: {
      resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
      fileName: String,
      fileUrl: String,
      uploadedAt: Date,
      parsedAt: Date,
      updatedAt: Date,
      status: { type: String, default: 'confirmed' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
