const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true
    },
    department: {
      type: String,
      default: 'Engineering'
    },
    description: {
      type: String,
      required: [true, 'Please add a job description']
    },
    requiredSkills: {
      type: [String],
      required: [true, 'Please add at least one required skill']
    },
    preferredSkills: [String],
    experienceLevel: {
      type: String,
      default: '1-3 Years'
    },
    education: {
      type: String,
      default: "Bachelor's Degree in Computer Science or related field"
    },
    location: {
      type: String,
      default: 'Remote / Hybrid'
    },
    employmentType: {
      type: String,
      default: 'Full-time'
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'closed'],
      default: 'published'
    },
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    recruiterIdString: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
