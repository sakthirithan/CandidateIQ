import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import {
  Sidebar, Topbar, NotificationCenter, SettingsPage, SettingsModal, ErrorBoundary, GlobalSearchPalette
} from './components/common';
import {
  CandidateIQDashboard, CandidateIQProfile, ResumeIntelligence, SkillIntelligence,
  JobDiscovery, AIMockInterviewRoom, InterviewResults, InterviewEvaluationAnalytics, SkillGapIntelligence, ApplicationTracker
} from './components/candidate';

import {
  RecruiterIQDashboard, RecruiterJobManagement, CandidateIntelligenceProfile,
  RecruiterCandidateManagement, CandidateIQComparison, AIRecruitmentAssistantIQ
} from './components/recruiter';

import { LoginModal, RegisterModal, PaymentDemoModal } from './components/auth';
import { AdminManagement } from './components/admin';
import DemoModal from './components/demo/DemoModal';

import { getCurrentUser, logoutUser, initAuthStorage, updateUser } from './utils/auth';
import { mockNotificationService } from './services/mockApi/notificationService';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pendingHrUser, setPendingHrUser] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);

  useEffect(() => {
    initAuthStorage();
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const userRole = currentUser ? currentUser.role : 'guest';

  const [unreadCount, setUnreadCount] = useState(() => {
    const roleForNotif = userRole === 'hr' ? 'recruiter' : (userRole === 'admin' ? 'recruiter' : 'candidate');
    return mockNotificationService.getUnreadCount(roleForNotif);
  });

  useEffect(() => {
    const roleForNotif = userRole === 'hr' ? 'recruiter' : (userRole === 'admin' ? 'recruiter' : 'candidate');
    setUnreadCount(mockNotificationService.getUnreadCount(roleForNotif));

    const unsubscribe = mockNotificationService.subscribe(() => {
      setUnreadCount(mockNotificationService.getUnreadCount(roleForNotif));
    });
    return () => unsubscribe();
  }, [userRole]);

  const handleRoleChange = (newRole) => {
    const updated = updateUser({ role: newRole });
    if (updated) {
      setCurrentUser({ ...updated });
    }
    const nextTab = newRole === 'candidate' ? 'dashboard' : newRole === 'admin' ? 'admin-dashboard' : 'recruiter-dashboard';
    setActiveTab(nextTab);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    if (user.role === 'hr') {
      if (user.paymentStatus === 'pending') {
        setPendingHrUser(user);
        setIsPaymentModalOpen(true);
      } else {
        setActiveTab('recruiter-dashboard');
      }
    } else if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleRegisterSuccess = (user) => {
    setCurrentUser(user);
    setIsRegisterModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleRequireHrPayment = (user) => {
    setPendingHrUser(user);
    setIsRegisterModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (user) => {
    setCurrentUser(user);
    setIsPaymentModalOpen(false);
    setActiveTab('recruiter-dashboard');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      {/* Global Sidebar Shell (Hidden on Landing page) */}
      {activeTab !== 'landing' && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userRole={userRole}
          setUserRole={handleRoleChange}
          onRoleChange={handleRoleChange}
        />
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Global Topbar Header (Hidden on Landing page) */}
        {activeTab !== 'landing' && (
          <Topbar
            activeTab={activeTab}
            userRole={userRole}
            onOpenAuth={() => setIsLoginModalOpen(true)}
            onOpenNotifications={() => setIsNotifOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onNavigateToProfile={() => setActiveTab('profile')}
            onLogout={handleLogout}
            unreadCount={unreadCount}
          />
        )}

        {/* Dynamic Route View Content */}
        <main className="flex-1">
          {activeTab === 'landing' && (
            <LandingPage
              onGetStarted={() => setIsRegisterModalOpen(true)}
              onLogin={() => setIsLoginModalOpen(true)}
              onRegister={() => setIsRegisterModalOpen(true)}
              onRegisterCandidate={() => setIsRegisterModalOpen(true)}
              onRegisterRecruiter={() => setIsRegisterModalOpen(true)}
              onExploreDemo={() => setIsDemoModalOpen(true)}
              onExploreCandidateDemo={() => setIsDemoModalOpen(true)}
              onExploreRecruiterDemo={() => setIsDemoModalOpen(true)}
              onOpenWorkspace={() => {
                if (currentUser?.role === 'hr') setActiveTab('recruiter-dashboard');
                else if (currentUser?.role === 'admin') setActiveTab('admin-dashboard');
                else setActiveTab('dashboard');
              }}
              onOpenSettings={() => setIsSettingsModalOpen(true)}
              onNavigateToProfile={() => setActiveTab('profile')}
              onLogout={handleLogout}
            />
          )}

          {/* Candidate Routes */}
          {activeTab === 'dashboard' && <CandidateIQDashboard onNavigate={setActiveTab} />}
          {activeTab === 'profile' && <CandidateIQProfile />}
          {activeTab === 'resume' && <ResumeIntelligence onProfileUpdated={() => setActiveTab('dashboard')} onNavigateToProfile={() => setActiveTab('profile')} />}
          {activeTab === 'skills' && <SkillIntelligence />}
          {activeTab === 'jobs' && <JobDiscovery />}
          {activeTab === 'applications' && <ApplicationTracker />}
          {activeTab === 'interview' && (
            <AIMockInterviewRoom
              onComplete={(report) => {
                setInterviewReport(report);
                setActiveTab('interview-evaluation');
              }}
            />
          )}
          {activeTab === 'interview-results' && <InterviewResults report={interviewReport} />}
          {activeTab === 'interview-evaluation' && <InterviewEvaluationAnalytics initialReport={interviewReport} />}
          {activeTab === 'skill-gaps' && <SkillGapIntelligence />}


          {/* Recruiter Routes */}
          {activeTab === 'recruiter-dashboard' && <RecruiterIQDashboard onNavigate={setActiveTab} />}
          {activeTab === 'jobs-recruiter' && <RecruiterJobManagement />}
          {activeTab === 'candidates-recruiter' && (
            <ErrorBoundary title="Candidate Management Error">
              <RecruiterCandidateManagement onNavigate={setActiveTab} />
            </ErrorBoundary>
          )}
          {activeTab === 'candidate-intelligence' && (
            <ErrorBoundary title="Candidate Intelligence Profile Error">
              <CandidateIntelligenceProfile />
            </ErrorBoundary>
          )}
          {activeTab === 'comparison' && <CandidateIQComparison />}
          {activeTab === 'assistant' && <AIRecruitmentAssistantIQ />}


          {/* Admin Route */}
          {activeTab === 'admin-dashboard' && <AdminManagement />}

          {/* Settings Route */}
          {activeTab === 'settings' && <SettingsPage userRole={userRole} currentUser={currentUser} />}
        </main>
      </div>

      {/* Interactive Demo Sandbox Modal (No Route Redirect) */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onLaunchFullWorkspace={(role) => {
          setIsDemoModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      {/* Auth Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
          setIsRegisterModalOpen(true);
        }}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleRegisterSuccess}
        onRequireHrPayment={handleRequireHrPayment}
        onSwitchToLogin={() => {
          setIsRegisterModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* HR Demo Payment Modal */}
      <PaymentDemoModal
        isOpen={isPaymentModalOpen}
        user={pendingHrUser}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
      />

      {/* Global Notification Drawer */}
      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        userRole={userRole}
      />

      {/* Global Command/Search Palette (Module 21) */}
      <GlobalSearchPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(targetTab) => {
          setActiveTab(targetTab);
          setIsSearchOpen(false);
        }}
        userRole={userRole}
      />
    </div>
  );
}

export default App;
