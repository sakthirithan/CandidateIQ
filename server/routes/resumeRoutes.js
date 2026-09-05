const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadAndParseResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, upload.single('resume'), uploadAndParseResume);

module.exports = router;
