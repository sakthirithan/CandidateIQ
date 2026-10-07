const express = require('express');
const router = express.Router();
const {
  createMockInterviewWorkspace,
  getCandidateMockInterviews,
  getMockInterviewById,
  updateMockInterviewWorkspace,
  deleteMockInterviewWorkspace,
  createMockInterviewAttempt,
  startMockInterview,
  submitQuestionAnswer,
  completeMockInterview,
  getGenerationProgressStream,
  getEvaluationProgressStream,
  evaluateMockInterviewController,
  evaluateSingleQuestionController
} = require('../controllers/mockInterviewController');
const { protect } = require('../middleware/authMiddleware');

// Mock Interview Workspace Card routes
router.get('/', protect, getCandidateMockInterviews);
router.post('/', protect, createMockInterviewWorkspace);
router.get('/:id', protect, getMockInterviewById);
router.patch('/:id', protect, updateMockInterviewWorkspace);
router.delete('/:id', protect, deleteMockInterviewWorkspace);

// Interview Attempt routes under Workspace Card
router.post('/:id/attempts', protect, createMockInterviewAttempt);
router.get('/:id/generation-progress', protect, getGenerationProgressStream);
router.get('/:id/evaluation-progress', protect, getEvaluationProgressStream);
router.post('/:id/start', protect, startMockInterview);
router.patch('/:id/questions/:questionId/answer', protect, submitQuestionAnswer);
router.post('/:id/questions/:questionId/evaluate', protect, evaluateSingleQuestionController);
router.post('/:id/complete', protect, completeMockInterview);
router.post('/:id/evaluate', protect, evaluateMockInterviewController);

module.exports = router;
