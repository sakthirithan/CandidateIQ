const pdfParse = require('pdf-parse');
const aiService = require('../services/aiService');
const profileController = require('./profileController');

// @desc    Upload resume & extract structured candidate data
// @route   POST /api/resumes/upload
// @access  Private (Candidate)
const uploadAndParseResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a resume file.' });
    }

    let extractedText = '';

    // If PDF format
    if (req.file.mimetype === 'application/pdf' || req.file.originalname.endsWith('.pdf')) {
      try {
        const parsed = await pdfParse(req.file.buffer);
        extractedText = parsed.text;
      } catch (pdfErr) {
        console.warn('[PDF Parse Warning]', pdfErr.message);
        extractedText = req.file.buffer.toString('utf-8');
      }
    } else {
      // Plain text or fallback
      extractedText = req.file.buffer.toString('utf-8');
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(422).json({ success: false, message: 'Could not extract text from uploaded resume. Please check file content.' });
    }

    // Pass extracted text to AI Intelligence Service
    const structuredProfile = await aiService.parseResumeText(extractedText);

    return res.status(200).json({
      success: true,
      message: 'Resume parsed successfully. Please review and confirm your extracted profile details.',
      extractedData: structuredProfile,
      rawTextPreview: extractedText.substring(0, 300) + '...'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadAndParseResume };
