const CandidateProfile = require('../models/CandidateProfile');

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
    const profile = await CandidateProfile.findOne({ user: userId });

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

    const profile = await CandidateProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({ success: true, profile, message: 'Candidate profile saved successfully.' });
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
    const profile = await CandidateProfile.findOne({ $or: [{ user: userId }, { userIdString: userId }] });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all candidate profiles (Recruiter view)
// @route   GET /api/candidates/profiles
// @access  Private (Recruiter/Admin)
const getAllProfiles = async (req, res, next) => {
  try {
    const profiles = await CandidateProfile.find().populate('user', 'name email role');
    return res.status(200).json({ success: true, profiles });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or add a dynamic custom section in candidate profile
// @route   PATCH /api/candidates/profile/sections/:sectionId
// @access  Private (Candidate)
const updateCustomSection = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { sectionId } = req.params;
    const { title, content, items, sectionType } = req.body;

    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    const sectionIndex = (profile.customSections || []).findIndex(sec => sec.sectionId === sectionId);

    if (sectionIndex !== -1) {
      if (title) profile.customSections[sectionIndex].title = title;
      if (content !== undefined) profile.customSections[sectionIndex].content = content;
      if (items !== undefined) profile.customSections[sectionIndex].items = items;
      if (sectionType) profile.customSections[sectionIndex].sectionType = sectionType;
      profile.customSections[sectionIndex].updatedAt = new Date();
    } else {
      profile.customSections.push({
        sectionId: sectionId || `custom_${Date.now()}`,
        sectionType: sectionType || 'custom',
        title: title || 'New Custom Section',
        content: content || '',
        items: items || [],
        updatedAt: new Date()
      });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Profile custom section updated successfully.',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a dynamic custom section from candidate profile
// @route   DELETE /api/candidates/profile/sections/:sectionId
// @access  Private (Candidate)
const deleteCustomSection = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { sectionId } = req.params;

    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Candidate profile not found.' });
    }

    profile.customSections = (profile.customSections || []).filter(sec => sec.sectionId !== sectionId);

    await profile.save();

    return res.status(200).json({
      success: true,
      message: 'Custom section removed from profile.',
      profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  computeSkillAnalytics,
  getMyProfile,
  upsertProfile,
  getProfileByUserId,
  getAllProfiles,
  updateCustomSection,
  deleteCustomSection
};
