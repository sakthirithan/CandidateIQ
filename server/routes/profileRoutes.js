const express = require('express');
const router = express.Router();
const { getMyProfile, upsertProfile, getProfileByUserId, getAllProfiles } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getMyProfile);
router.get('/profiles', protect, authorize('recruiter', 'admin'), getAllProfiles);
router.post('/profile', protect, upsertProfile);
router.get('/profile/:userId', protect, authorize('recruiter', 'admin'), getProfileByUserId);

module.exports = router;
