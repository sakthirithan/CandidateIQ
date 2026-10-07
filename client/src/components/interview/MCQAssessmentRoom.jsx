import React, { useState, useEffect } from 'react';
import AssessmentHeader from './AssessmentHeader';
import QuestionNavigator from './QuestionNavigator';
import QuestionNavigatorMobile from './QuestionNavigatorMobile';
import QuestionCard from './QuestionCard';
import AnswerOptions from './AnswerOptions';
import AssessmentFooter from './AssessmentFooter';
import AssessmentCompletionDialog from './AssessmentCompletionDialog';

export default function MCQAssessmentRoom({
  assessmentTitle = 'React & JavaScript Technical Assessment',
  questions = [],
  initialAnswers = {},
  durationMinutes = 20,
  onSaveAnswer,
  onCompleteAssessment,
  onCloseAssessment,
  loading = false,
  submitting = false
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map of submitted answers: { [qId]: { questionId, selectedOption, optionText, submittedAt } }
  const [submittedAnswers, setSubmittedAnswers] = useState(initialAnswers || {});

  // Draft selection for current question before clicking next/auto-save
  const [draftOption, setDraftOption] = useState('');

  // Flagged questions map: { [qId]: true/false }
  const [flaggedQuestions, setFlaggedQuestions] = useState({});

  // Mobile drawer open state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Completion confirmation dialog state
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);

  // Countdown timer state
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes ? durationMinutes * 60 : null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || null;
  const currentQId = currentQuestion ? (currentQuestion.id || currentQuestion.questionId || `q_${currentIndex}`) : null;

  // Sync draftOption whenever currentIndex or questions change
  useEffect(() => {
    if (currentQId && submittedAnswers[currentQId]) {
      const existing = submittedAnswers[currentQId];
      setDraftOption(existing.selectedOption || existing.option || existing.answer || '');
    } else {
      setDraftOption('');
    }
  }, [currentIndex, currentQId, submittedAnswers]);

  // Countdown Timer effect
  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when timer expires
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Keyboard navigation shortcuts (ArrowLeft, ArrowRight, A, B, C, D)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in an input/textarea or dialog is open
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || isCompletionDialogOpen) return;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentIndex < totalQuestions - 1) {
        handleNext();
      } else if (['a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].includes(e.key) && currentQuestion?.options) {
        const optionLetter = e.key.toUpperCase();
        const letterIndex = ['A', 'B', 'C', 'D'].indexOf(optionLetter);
        if (letterIndex >= 0 && currentQuestion.options[letterIndex]) {
          handleSelectOption(optionLetter, currentQuestion.options[letterIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalQuestions, currentQuestion, isCompletionDialogOpen]);

  // Handle option click/select
  const handleSelectOption = (letter, text) => {
    setDraftOption(letter);

    // Auto-save selection into submittedAnswers dictionary
    const updatedAns = {
      ...submittedAnswers,
      [currentQId]: {
        questionId: currentQId,
        questionType: 'MCQ',
        selectedOption: letter,
        option: text,
        answer: letter,
        submittedAt: new Date().toISOString()
      }
    };
    setSubmittedAnswers(updatedAns);

    if (onSaveAnswer) {
      onSaveAnswer(currentQId, letter, text, updatedAns);
    }
  };

  // Handle flag toggle
  const handleToggleFlag = () => {
    if (!currentQId) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQId]: !prev[currentQId]
    }));
  };

  // Handle previous question
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Handle next question
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompletionDialogOpen(true);
    }
  };

  // Final submission action
  const handleFinalSubmit = () => {
    setIsCompletionDialogOpen(false);
    if (onCompleteAssessment) {
      onCompleteAssessment(submittedAnswers);
    }
  };

  const answeredCount = Object.keys(submittedAnswers).filter(
    (k) => submittedAnswers[k]?.selectedOption || submittedAnswers[k]?.option || submittedAnswers[k]?.answer
  ).length;

  const isSavedCurrent = Boolean(
    submittedAnswers[currentQId]?.selectedOption || submittedAnswers[currentQId]?.option
  );

  return (
    <div className="mcq-app-canvas min-h-screen flex flex-col justify-between">
      {/* Top Sticky Header */}
      <AssessmentHeader
        title={assessmentTitle}
        currentQuestion={currentIndex + 1}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
        remainingSeconds={remainingSeconds}
        onCompleteClick={() => setIsCompletionDialogOpen(true)}
        onToggleMobileNav={() => setIsMobileNavOpen(true)}
        submitting={submitting}
      />

      {/* Main 3-Column Layout Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 my-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Question Navigator Sidebar (3 cols ~25%) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-20">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentIndex}
              submittedAnswers={submittedAnswers}
              flaggedQuestions={flaggedQuestions}
              onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />
          </aside>

          {/* CENTER & RIGHT: Question Display & Answer Options (9 cols ~75%) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Question Card */}
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={totalQuestions}
              isFlagged={Boolean(flaggedQuestions[currentQId])}
              onToggleFlag={handleToggleFlag}
            />

            {/* Answer Options Card */}
            <AnswerOptions
              options={currentQuestion?.options || []}
              selectedOption={draftOption}
              onSelectOption={handleSelectOption}
              disabled={submitting}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation Footer */}
      <AssessmentFooter
        currentIndex={currentIndex}
        totalQuestions={totalQuestions}
        hasSelection={Boolean(draftOption)}
        isSaved={isSavedCurrent}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={() => setIsCompletionDialogOpen(true)}
        isFlagged={Boolean(flaggedQuestions[currentQId])}
        onToggleFlag={handleToggleFlag}
      />

      {/* Mobile Drawer Navigator */}
      <QuestionNavigatorMobile
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        submittedAnswers={submittedAnswers}
        flaggedQuestions={flaggedQuestions}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
      />

      {/* Completion Confirmation Modal */}
      <AssessmentCompletionDialog
        isOpen={isCompletionDialogOpen}
        onClose={() => setIsCompletionDialogOpen(false)}
        onSubmit={handleFinalSubmit}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        flaggedCount={Object.keys(flaggedQuestions).filter((k) => flaggedQuestions[k]).length}
        submitting={submitting}
      />
    </div>
  );
}
