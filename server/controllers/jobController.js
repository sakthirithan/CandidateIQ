const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const aiService = require('../services/aiService');

// @desc    Create a job posting
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
const createJob = async (req, res, next) => {
  try {
    const { title, department, description, requiredSkills, preferredSkills, experienceLevel, education, location, employmentType, status } = req.body;

    if (!title || !description || !requiredSkills || (Array.isArray(requiredSkills) && requiredSkills.length === 0)) {
      return res.status(400).json({ success: false, message: 'Please provide job title, description, and required skills.' });
    }

    const userId = req.user.id || req.user._id;

    const job = await Job.create({
      title: title.trim(),
      department: department || 'Engineering',
      description: description.trim(),
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim()),
      preferredSkills: Array.isArray(preferredSkills) ? preferredSkills : (preferredSkills ? preferredSkills.split(',').map(s => s.trim()) : []),
      experienceLevel: experienceLevel || '1-3 Years',
      education: education || "Bachelor's Degree",
      location: location || 'Remote',
      employmentType: employmentType || 'Full-time',
      status: status || 'published',
      recruiter: userId,
      recruiterIdString: userId.toString()
    });

    return res.status(201).json({ success: true, job, message: 'Job posting created successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all published jobs (with candidate-specific metadata if authenticated)
// @route   GET /api/jobs
// @access  Public / Optional Auth
const getJobs = async (req, res, next) => {
  try {
    const candidateId = req.user?.id || req.user?._id;
    const jobs = await Job.find({ status: 'published' }).sort({ createdAt: -1 });

    if (!candidateId) {
      return res.status(200).json({ success: true, count: jobs.length, jobs });
    }

    const candidateApps = await Application.find({ candidate: candidateId });
    const jobsWithState = jobs.map((j) => {
      const app = candidateApps.find((a) => a.job.toString() === j._id.toString());
      return {
        job: j,
        candidateState: {
          isApplied: Boolean(app),
          applicationId: app?._id || null,
          appliedAt: app?.createdAt || null,
          status: app?.status || null
        }
      };
    });

    return res.status(200).json({ success: true, count: jobsWithState.length, jobs: jobsWithState });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recruiter's jobs (Recruiter Dashboard)
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter/Admin)
const getRecruiterJobs = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';

    const query = isSystemAdmin ? {} : { recruiter: recruiterId };
    const jobs = await Job.find(query).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: jobs.length, jobs });
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
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    return res.status(200).json({ success: true, job });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job posting
// @route   PATCH /api/jobs/:id
// @access  Private (Recruiter/Admin)
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = job.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to update this job.' });
    }

    const { title, department, description, requiredSkills, preferredSkills, experienceLevel, education, location, employmentType, status } = req.body;

    if (title) job.title = title.trim();
    if (department) job.department = department.trim();
    if (description) job.description = description.trim();
    if (requiredSkills) job.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim());
    if (preferredSkills) job.preferredSkills = Array.isArray(preferredSkills) ? preferredSkills : preferredSkills.split(',').map(s => s.trim());
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (education) job.education = education;
    if (location) job.location = location;
    if (employmentType) job.employmentType = employmentType;
    if (status && ['published', 'draft', 'closed'].includes(status)) job.status = status;

    await job.save();

    return res.status(200).json({ success: true, job, message: 'Job updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found.' });
    }

    const userId = req.user.id || req.user._id;
    const isOwner = job.recruiter.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to delete this job.' });
    }

    await Job.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Job deleted successfully.' });
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

    // Duplicate application check
    const existingApp = await Application.findOne({ candidate: userId, job: id });
    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job position.',
        application: existingApp
      });
    }

    const targetJob = await Job.findById(id);
    if (!targetJob) {
      return res.status(404).json({ success: false, message: 'Target job posting not found.' });
    }

    const candidateProfile = await CandidateProfile.findOne({ user: userId });
    const profileToMatch = candidateProfile?.skills ? candidateProfile : {
      personalInfo: { name: req.user.name, email: req.user.email },
      skills: { technical: ['React', 'Node.js', 'JavaScript', 'MongoDB'], frameworks: ['Express'], databases: ['MongoDB'], tools: ['Git'] },
      experience: [{ company: 'Tech Projects', position: 'Developer', duration: '1 Year' }],
      education: [{ degree: 'B.Tech CS', institution: 'Engineering College', year: '2024' }]
    };

    // Run AI Matching Engine
    const matchAnalysis = await aiService.analyzeJobMatch(profileToMatch, targetJob);

    const application = await Application.create({
      job: targetJob._id,
      jobIdString: targetJob._id.toString(),
      candidate: userId,
      candidateIdString: userId.toString(),
      candidateProfile: candidateProfile?._id || null,
      status: 'applied',
      matchAnalysis,
      overallScore: matchAnalysis.overallMatch || 80
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Candidate-Job matching analysis computed.',
      application
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

    const applicants = await Application.find({ $or: [{ job: id }, { jobIdString: id }] })
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .sort({ overallScore: -1 });

    return res.status(200).json({ success: true, count: applicants.length, applicants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all recruiter applications across all recruiter jobs
// @route   GET /api/jobs/recruiter/applications
// @access  Private (Recruiter/Admin)
const getRecruiterApplications = async (req, res, next) => {
  try {
    const recruiterId = req.user.id || req.user._id;
    const isSystemAdmin = req.user.role === 'admin';

    let jobIds = [];
    if (!isSystemAdmin) {
      const recruiterJobs = await Job.find({ recruiter: recruiterId }).select('_id');
      jobIds = recruiterJobs.map(j => j._id);
    }

    const query = isSystemAdmin ? {} : { job: { $in: jobIds } };

    const applications = await Application.find(query)
      .populate('job', 'title department location employmentType status')
      .populate('candidate', 'name email role')
      .populate('candidateProfile')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status (e.g. shortlist, reject, under_review)
// @route   PATCH /api/jobs/applications/:id/status
// @access  Private (Recruiter/Admin)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'under_review', 'interview_scheduled', 'shortlisted', 'rejected', 'selected', 'withdrawn'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Please provide a valid application status (${validStatuses.join(', ')})` });
    }

    const application = await Application.findById(id).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application record not found.' });
    }

    application.status = status;
    await application.save();

    const updatedApp = await Application.findById(id)
      .populate('job', 'title department location employmentType status')
      .populate('candidate', 'name email role')
      .populate('candidateProfile');

    return res.status(200).json({
      success: true,
      message: `Application status updated to ${status.toUpperCase()}`,
      application: updatedApp
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getRecruiterJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplicants,
  getRecruiterApplications,
  updateApplicationStatus
};
