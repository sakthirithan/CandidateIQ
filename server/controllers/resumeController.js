const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const CandidateProfile = require('../models/CandidateProfile');
const resumeAIService = require('../ai/services/resumeAIService');
const { computeSkillAnalytics } = require('./profileController');

// @desc    Upload resume, validate, parse full document, and generate dynamic section preview
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
const uploadAndParseResume = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_FILE_PROVIDED', message: 'Please upload a resume file.' }
      });
    }

    let extractedText = '';

    // File Extraction
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        extractedText = parsed.text;
      } catch (pdfErr) {
        console.warn('[PDF Parse Warning]', pdfErr.message);
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else {
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: { code: 'EMPTY_TEXT_EXTRACTED', message: 'Could not extract readable text from uploaded resume.' }
      });
    }

    // Save initial Resume record
    const resumeRecord = await Resume.create({
      candidate: userId,
      candidateIdString: userId.toString(),
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      rawText: extractedText,
      extractionStatus: 'detecting_sections'
    });

    // Run Full AI Document Parsing
    const aiResponse = await resumeAIService.extractFullResumeIntelligence(extractedText);
    const parsedResult = aiResponse.result || {};

    const extractedSections = (parsedResult.sections || []).map((sec, idx) => ({
      id: sec.id || `sec_${idx + 1}_${Date.now()}`,
      sectionType: sec.sectionType || 'custom',
      title: sec.title || 'Resume Section',
      selected: sec.selected !== false,
      confidence: sec.confidence || 0.95,
      content: sec.content || null,
      items: sec.items || [],
      source: sec.source || { pages: [1] }
    }));

    // Update Resume record status to awaiting_confirmation
    resumeRecord.extractionStatus = 'awaiting_confirmation';
    resumeRecord.extractedCandidate = parsedResult.candidate || {};
    resumeRecord.extractedSections = extractedSections;
    resumeRecord.processingMetadata = {
      pageCount: 1,
      totalSectionsDetected: extractedSections.length,
      resumeQualityScore: parsedResult.metadata?.resumeQualityScore || 85,
      latencyMs: aiResponse.processingTimeMs || 0
    };
    await resumeRecord.save();

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully. Please review and confirm which sections to add to your CandidateIQ profile.',
      resumeId: resumeRecord._id,
      status: resumeRecord.extractionStatus,
      candidateInfo: parsedResult.candidate,
      sections: extractedSections,
      metadata: resumeRecord.processingMetadata
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get status & extracted sections of a uploaded resume
// @route   GET /api/resumes/status/:id
// @access  Private (Candidate)
const getResumeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resumeRecord = await Resume.findById(id);

    if (!resumeRecord) {
      return res.status(404).json({ success: false, message: 'Resume record not found.' });
    }

    return res.status(200).json({
      success: true,
      resumeId: resumeRecord._id,
      status: resumeRecord.extractionStatus,
      sections: resumeRecord.extractedSections,
      metadata: resumeRecord.processingMetadata
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate confirms & edits selected sections to persist directly into existing CandidateProfile in MongoDB
// @route   POST /api/resumes/confirm
// @access  Private (Candidate)
const confirmResumeSections = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { resumeId, selectedSections, candidateInfo } = req.body;

    if (!selectedSections || !Array.isArray(selectedSections)) {
      return res.status(400).json({ success: false, message: 'Please provide an array of selectedSections.' });
    }

    let resumeRecord = null;
    if (resumeId) {
      resumeRecord = await Resume.findById(resumeId);
    }

    // Always resolve the candidate using authenticated user ID (never create duplicate profile documents)
    let profile = await CandidateProfile.findOne({ user: userId });
    if (!profile) {
      profile = new CandidateProfile({
        user: userId,
        userIdString: userId.toString(),
        personalInfo: {
          name: candidateInfo?.fullName || req.user.name || 'Candidate',
          email: candidateInfo?.email || req.user.email || 'candidate@example.com',
          phone: candidateInfo?.phone || '',
          location: candidateInfo?.location || '',
          headline: candidateInfo?.headline || 'Software Professional'
        }
      });
    }

    // Process selected sections
    const activeSelected = selectedSections.filter(sec => sec.selected !== false);

    const newSkills = { technical: [], soft: [], frameworks: [], databases: [], tools: [] };
    const newEducation = [];
    const newExperience = [];
    const newProjects = [];
    const newCertifications = [];
    const newCustomSections = [];

    let hasSkillsSection = false;
    let hasEducationSection = false;
    let hasExperienceSection = false;
    let hasProjectsSection = false;
    let hasCertificationsSection = false;
    let hasCustomSection = false;

    activeSelected.forEach(sec => {
      const type = (sec.sectionType || 'custom').toLowerCase();
      const items = sec.items || [];

      if (type === 'personal_info' && candidateInfo) {
        if (candidateInfo.fullName) profile.personalInfo.name = candidateInfo.fullName;
        if (candidateInfo.email) profile.personalInfo.email = candidateInfo.email;
        if (candidateInfo.phone) profile.personalInfo.phone = candidateInfo.phone;
        if (candidateInfo.location) profile.personalInfo.location = candidateInfo.location;
        if (candidateInfo.headline) profile.personalInfo.headline = candidateInfo.headline;
      } else if (type === 'skills') {
        hasSkillsSection = true;
        items.forEach(it => {
          const vals = Array.isArray(it.values) ? it.values : (it.name ? [it.name] : []);
          const cat = (it.category || '').toLowerCase();
          if (cat.includes('framework')) newSkills.frameworks.push(...vals);
          else if (cat.includes('database')) newSkills.databases.push(...vals);
          else if (cat.includes('tool')) newSkills.tools.push(...vals);
          else if (cat.includes('soft')) newSkills.soft.push(...vals);
          else newSkills.technical.push(...vals);
        });
      } else if (type === 'education') {
        hasEducationSection = true;
        items.forEach(it => {
          newEducation.push({
            degree: it.degree || 'Degree',
            institution: it.institution || it.university || 'University',
            graduationYear: it.year || it.graduationYear || '2024',
            cgpa: it.cgpa || '',
            description: it.description || ''
          });
        });
      } else if (type === 'experience') {
        hasExperienceSection = true;
        items.forEach(it => {
          newExperience.push({
            company: it.company || it.organization || 'Company',
            position: it.position || it.role || 'Position',
            duration: it.duration || `${it.startDate || ''} - ${it.endDate || ''}`,
            description: it.description || '',
            responsibilities: it.responsibilities || [],
            technologies: it.technologies || []
          });
        });
      } else if (type === 'projects') {
        hasProjectsSection = true;
        items.forEach(it => {
          newProjects.push({
            name: it.name || it.title || 'Project',
            description: it.description || '',
            technologies: it.technologies || [],
            role: it.role || '',
            url: it.url || ''
          });
        });
      } else if (type === 'certifications') {
        hasCertificationsSection = true;
        items.forEach(it => {
          newCertifications.push({
            name: it.name || it.title || 'Certification',
            issuer: it.issuer || it.organization || '',
            date: it.year || it.date || ''
          });
        });
      } else {
        hasCustomSection = true;
        newCustomSections.push({
          sectionId: sec.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          sectionType: type,
          title: sec.title || 'Custom Section',
          content: sec.content || '',
          items: items
        });
      }
    });

    // Cleanly replace previous resume-derived data to prevent stale duplicate entries on re-upload
    if (hasEducationSection) profile.education = newEducation;
    if (hasExperienceSection) profile.experience = newExperience;
    if (hasProjectsSection) profile.projects = newProjects;
    if (hasCertificationsSection) profile.certifications = newCertifications;
    if (hasSkillsSection) profile.skills = newSkills;
    if (hasCustomSection) profile.customSections = newCustomSections;

    profile.skillAnalysis = computeSkillAnalytics(profile.skills);

    if (resumeRecord) {
      profile.resumeReference = {
        resumeId: resumeRecord._id,
        fileName: resumeRecord.fileName,
        fileUrl: resumeRecord.fileUrl || '',
        uploadedAt: resumeRecord.createdAt,
        parsedAt: new Date(),
        updatedAt: new Date(),
        status: 'confirmed'
      };
      resumeRecord.extractionStatus = 'confirmed';
      await resumeRecord.save();
    }

    await profile.save();

    return res.status(200).json({
      operation: 'resume_confirm',
      status: 'success',
      success: true,
      message: 'Resume data successfully updated into candidate profile.',
      profile,
      candidate: profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadAndParseResume,
  getResumeStatus,
  confirmResumeSections
};
