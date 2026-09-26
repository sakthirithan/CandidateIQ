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
    experience: {
      min: {
        type: Number,
        min: [0, 'Minimum experience must be non-negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum experience must be non-negative'],
        default: 0
      },
      unit: {
        type: String,
        enum: ['years', 'months'],
        default: 'years'
      }
    },
    salary: {
      min: {
        type: Number,
        min: [0, 'Minimum salary must be non-negative'],
        default: 0
      },
      max: {
        type: Number,
        min: [0, 'Maximum salary must be non-negative'],
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['year', 'month'],
        default: 'year'
      }
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
    recruiterIdString: String,
    hrEvaluationPrompt: {
      type: String,
      default: ''
    },
    evaluation: {
      hrPrompt: {
        type: String,
        default: ''
      }
    },
    keywords: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
