const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  upsertProfile,
  getProfileByUserId,
  getAllProfiles,
  updateCustomSection,
  deleteCustomSection
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/profile', protect, getMyProfile);
router.get('/profiles', protect, authorize('recruiter', 'hr', 'admin'), getAllProfiles);
router.post('/profile', protect, upsertProfile);
router.get('/profile/:userId', protect, authorize('recruiter', 'hr', 'admin'), getProfileByUserId);
router.patch('/profile/sections/:sectionId', protect, updateCustomSection);
router.delete('/profile/sections/:sectionId', protect, deleteCustomSection);

module.exports = router;
