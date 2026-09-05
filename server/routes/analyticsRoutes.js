const express = require('express');
const router = express.Router();
const {
  getCandidateIntelligenceProfile,
  getRecruiterDashboardOverview,
  compareCandidates,
  queryAIAssistant
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/candidate/:candidateId', protect, getCandidateIntelligenceProfile);
router.get('/recruiter-dashboard', protect, authorize('recruiter', 'admin'), getRecruiterDashboardOverview);
router.post('/compare', protect, authorize('recruiter', 'admin'), compareCandidates);
router.post('/ai-assistant', protect, authorize('recruiter', 'admin'), queryAIAssistant);

module.exports = router;
