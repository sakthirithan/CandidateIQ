const express = require('express');
const router = express.Router();
const {
  createMockInterview,
  startMockInterview,
  submitQuestionAnswer,
  completeMockInterview,
  getMockInterviewById,
  getGenerationProgressStream,
  getEvaluationProgressStream,
  getCandidateMockInterviews,
  evaluateMockInterviewController,
  evaluateSingleQuestionController
} = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCandidateMockInterviews);
router.post('/', protect, createMockInterview);
router.get('/:id/generation-progress', protect, getGenerationProgressStream);
router.get('/:id/evaluation-progress', protect, getEvaluationProgressStream);
router.post('/:id/start', protect, startMockInterview);
router.patch('/:id/questions/:questionId/answer', protect, submitQuestionAnswer);
router.post('/:id/questions/:questionId/evaluate', protect, evaluateSingleQuestionController);
router.post('/:id/complete', protect, completeMockInterview);
router.post('/:id/evaluate', protect, evaluateMockInterviewController);
router.get('/:id', protect, getMockInterviewById);

module.exports = router;
