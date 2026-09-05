const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile, getProfileByUserId } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getMyProfile);
router.post('/profile', protect, upsertProfile);
router.get('/profile/:userId', protect, authorize('recruiter', 'admin'), getProfileByUserId);

module.exports = router;
