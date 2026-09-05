const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const aiService = require('../services/aiService');
const { getDBStatus } = require('../config/db');

// In-memory fallback stores
const inMemoryJobs = [];
const inMemoryApplications = [];

// Seed default initial jobs for instant rich UI demonstration
const seedDefaultJobs = () => {
  if (inMemoryJobs.length === 0) {
    inMemoryJobs.push(
      {
        id: 'job_101',
        title: 'Full Stack MERN Developer',
        department: 'Engineering',
        description: 'We are seeking a Full Stack MERN Developer to build high-performance web applications using React.js, Node.js, Express, and MongoDB.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'REST APIs'],
        preferredSkills: ['TypeScript', 'Docker', 'AWS'],
        experienceLevel: '1-3 Years',
        education: "Bachelor's Degree in CS/IT",
        location: 'Hybrid (Bangalore / Remote)',
        employmentType: 'Full-time',
        status: 'published',
        recruiterIdString: 'mem_recruiter_1',
        createdAt: new Date()
      },
      {
        id: 'job_102',
        title: 'AI & Data Science Engineer',
        department: 'AI Research',
        description: 'Looking for an AI/ML Engineer experienced in Python, Machine Learning models, NLP, LLM integrations, and data processing.',
        requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'NLP', 'PyTorch', 'SQL'],
        preferredSkills: ['Docker', 'FastAPI', 'LangChain'],
        experienceLevel: '2+ Years',
        education: "Bachelor's/Master's in CS/Data Science",
        location: 'Remote',
        employmentType: 'Full-time',
        status: 'published',
        recruiterIdString: 'mem_recruiter_1',
        createdAt: new Date()
      }
    );
  }
};
seedDefaultJobs();

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
const createJob = async (req, res, next) => {
  try {
    const { title, department, description, requiredSkills, preferredSkills, experienceLevel, education, location, employmentType } = req.body;

    if (!title || !description || !requiredSkills || requiredSkills.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide job title, description, and required skills.' });
    }

    const userId = req.user.id || req.user._id;

    if (getDBStatus()) {
      const job = await Job.create({
        title,
        department,
        description,
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
        preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []),
        experienceLevel,
        education,
        location,
        employmentType,
        recruiter: userId,
        recruiterIdString: userId.toString()
      });
      return res.status(201).json({ success: true, job, message: 'Job posting published successfully.' });
    }

    // Fallback mode
    const fallbackJob = {
      id: `job_${Date.now()}`,
      title,
      department: department || 'Engineering',
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []),
      experienceLevel: experienceLevel || '1-3 Years',
      education: education || "Bachelor's Degree",
      location: location || 'Remote',
      employmentType: employmentType || 'Full-time',
      status: 'published',
      recruiterIdString: userId.toString(),
      createdAt: new Date()
    };

    inMemoryJobs.push(fallbackJob);
    return res.status(201).json({ success: true, job: fallbackJob, message: 'Job posting published successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    if (getDBStatus()) {
      const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, count: jobs.length, jobs });
    }

    return res.status(200).json({ success: true, count: inMemoryJobs.length, jobs: inMemoryJobs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const job = await Job.findById(id);
      if (!job) return res.status(404).json({ success: false, message: 'Job posting not found.' });
      return res.status(200).json({ success: true, job });
    }

    const job = inMemoryJobs.find(j => j.id === id || j._id === id);
    if (!job) return res.status(404).json({ success: false, message: 'Job posting not found.' });
    return res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply to job & run AI Candidate-Job Matching Engine
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidate)
const applyToJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    let candidateProfile;
    let targetJob;

    if (getDBStatus()) {
      targetJob = await Job.findById(id);
      candidateProfile = await CandidateProfile.findOne({ user: userId });
    } else {
      targetJob = inMemoryJobs.find(j => j.id === id || j._id === id);
      // Fetch profile from profile controller's in-memory store via fallback getter
      candidateProfile = require('./profileController').getMyProfile;
    }

    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Target job posting not found.' });
    }

    // Default profile fallback if candidate hasn't saved explicit custom profile yet
    const profileToMatch = candidateProfile?.skills ? candidateProfile : {
      personalInfo: { name: req.user.name, email: req.user.email },
      skills: { technical: ['React', 'Node.js', 'JavaScript', 'MongoDB'], frameworks: ['Express'], databases: ['MongoDB'], tools: ['Git'] },
      experience: [{ company: 'Tech Projects', position: 'Developer', duration: '1 Year' }],
      education: [{ degree: 'B.Tech CS', institution: 'Engineering College', year: '2024' }]
    };

    // Run AI Matching Engine
    const matchAnalysis = await aiService.analyzeJobMatch(profileToMatch, targetJob);

    const applicationData = {
      job: targetJob._id || targetJob.id,
      jobIdString: (targetJob._id || targetJob.id).toString(),
      candidate: userId,
      candidateIdString: userId.toString(),
      status: 'applied',
      matchAnalysis,
      overallScore: matchAnalysis.overallMatch || 80,
      createdAt: new Date()
    };

    if (getDBStatus()) {
      const application = await Application.create(applicationData);
      return res.status(201).json({
        success: true,
        message: 'Application submitted successfully. Candidate-Job matching analysis computed.',
        application
      });
    }

    applicationData.id = `app_${Date.now()}`;
    inMemoryApplications.push(applicationData);

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Candidate-Job matching analysis computed.',
      application: applicationData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a specific job (Recruiter Dashboard)
// @route   GET /api/jobs/:id/applicants
// @access  Private (Recruiter/Admin)
const getJobApplicants = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getDBStatus()) {
      const applicants = await Application.find({ $or: [{ job: id }, { jobIdString: id }] })
        .populate('candidate', 'name email role')
        .populate('candidateProfile')
        .sort({ overallScore: -1 });
      return res.status(200).json({ success: true, count: applicants.length, applicants });
    }

    const applicants = inMemoryApplications.filter(a => a.jobIdString === id || a.job === id);
    return res.status(200).json({ success: true, count: applicants.length, applicants });
  } catch (error) {
    next(error);
  }
};

module.exports = { createJob, getJobs, getJobById, applyToJob, getJobApplicants };
