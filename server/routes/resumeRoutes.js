const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const {
  uploadAndParseResume,
  getResumeStatus,
  confirmResumeSections
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadAndParseResume);
router.get('/status/:id', protect, getResumeStatus);
router.post('/confirm', protect, confirmResumeSections);

module.exports = router;
