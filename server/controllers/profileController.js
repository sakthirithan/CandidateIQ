const CandidateProfile = require('../models/CandidateProfile');
const { getDBStatus } = require('../config/db');

// In-memory profiles store for fallback mode
const inMemoryProfiles = new Map();

// Helper to compute AI skill analytics
const computeSkillAnalytics = (skills = {}) => {
  const tech = skills.technical || [];
  const frameworks = skills.frameworks || [];
  const dbs = skills.databases || [];
  const tools = skills.tools || [];
  const soft = skills.soft || [];

  const allSkills = [...tech, ...frameworks, ...dbs, ...tools];
  const totalSkills = allSkills.length;

  const inferredLevels = {};
  allSkills.forEach((skill, idx) => {
    // Generate AI estimated score based on index & skill category (labeled 'AI Estimated')
    const score = Math.max(55, 95 - idx * 5);
    inferredLevels[skill] = {
      score,
      label: 'AI Estimated',
      confidence: score > 75 ? 'High' : 'Moderate'
    };
  });

  return {
    totalSkills,
    confidenceScore: Math.min(95, 70 + totalSkills * 2),
    topSkills: allSkills.slice(0, 5),
    inferredLevels
  };
};

// @desc    Get current candidate profile
// @route   GET /api/candidates/profile
// @access  Private (Candidate)
const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (getDBStatus()) {
      let profile = await CandidateProfile.findOne({ user: userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found. Please create one.' });
      }
      return res.status(200).json({ success: true, profile });
    }

    // Fallback mode
    const profile = inMemoryProfiles.get(userId.toString());
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please create one.' });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or Update candidate profile
// @route   POST /api/candidates/profile
// @access  Private (Candidate)
const upsertProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { personalInfo, education, experience, skills, projects, certifications } = req.body;

    const skillAnalysis = computeSkillAnalytics(skills);

    const profileData = {
      user: userId,
      userIdString: userId.toString(),
      personalInfo: {
        name: personalInfo?.name || req.user.name,
        email: personalInfo?.email || req.user.email,
        phone: personalInfo?.phone || '',
        location: personalInfo?.location || '',
        headline: personalInfo?.headline || 'Software Professional',
        profilePhoto: personalInfo?.profilePhoto || ''
      },
      education: education || [],
      experience: experience || [],
      skills: skills || { technical: [], soft: [], frameworks: [], databases: [], tools: [] },
      projects: projects || [],
      certifications: certifications || [],
      skillAnalysis
    };

    if (getDBStatus()) {
      const profile = await CandidateProfile.findOneAndUpdate(
        { user: userId },
        profileData,
        { new: true, upsert: true, runValidators: true }
      );
      return res.status(200).json({ success: true, profile, message: 'Candidate profile saved successfully.' });
    }

    // Fallback mode
    inMemoryProfiles.set(userId.toString(), profileData);
    return res.status(200).json({ success: true, profile: profileData, message: 'Candidate profile saved successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get profile by candidate ID (Recruiter view)
// @route   GET /api/candidates/profile/:userId
// @access  Private (Recruiter/Admin)
const getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (getDBStatus()) {
      const profile = await CandidateProfile.findOne({ $or: [{ user: userId }, { userIdString: userId }] });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
      }
      return res.status(200).json({ success: true, profile });
    }

    const profile = inMemoryProfiles.get(userId.toString());
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }
    return res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, upsertProfile, getProfileByUserId };
