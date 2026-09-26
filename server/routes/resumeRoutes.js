const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadAndParseResume,
  getResumeStatus,
  confirmResumeSections,
  getCandidateResumeKeywords
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadAndParseResume);
router.get('/status/:id', protect, getResumeStatus);
router.post('/confirm', protect, confirmResumeSections);
router.get('/keywords', protect, getCandidateResumeKeywords);

module.exports = router;
