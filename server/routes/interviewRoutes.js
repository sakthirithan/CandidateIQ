const express = require('express');
const router = express.Router();
const {
  startInterview,
  scheduleInterview,
  getRecruiterInterviews,
  submitAnswer,
  completeInterview,
  getInterviewById
} = require('../controllers/interviewController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/start', protect, startInterview);
router.post('/schedule', protect, authorize('hr', 'recruiter', 'admin'), scheduleInterview);
router.get('/recruiter', protect, authorize('hr', 'recruiter', 'admin'), getRecruiterInterviews);
router.post('/:id/answer', protect, submitAnswer);
router.post('/:id/complete', protect, completeInterview);
router.get('/:id', protect, getInterviewById);

module.exports = router;
