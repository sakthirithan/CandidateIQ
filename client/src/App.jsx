import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import {
  Sidebar, Topbar, NotificationCenter, SettingsPage, SettingsModal
} from './components/common';
import {
  CandidateIQDashboard, CandidateIQProfile, ResumeIntelligence, SkillIntelligence,
  JobDiscovery, AIMockInterviewRoom, InterviewResults, SkillGapIntelligence, ApplicationTracker
} from './components/candidate';
import {
  RecruiterIQDashboard, RecruiterJobManagement, CandidateIntelligenceProfile,
  CandidateIQComparison, AIRecruitmentAssistantIQ
} from './components/recruiter';
import { LoginModal, RegisterModal, PaymentDemoModal } from './components/auth';
import DemoModal from './components/demo/DemoModal';

import { getCurrentUser, logoutUser, initAuthStorage, updateUser } from './utils/auth';

function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [currentUser, setCurrentUser] = useState(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingHrUser, setPendingHrUser] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);

  useEffect(() => {
    initAuthStorage();
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

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

  const userRole = currentUser ? currentUser.role : 'guest';

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
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onNavigateToProfile={() => setActiveTab('profile')}
            onLogout={handleLogout}
            unreadCount={3}
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
                setActiveTab('interview-results');
              }}
            />
          )}
          {activeTab === 'interview-results' && <InterviewResults report={interviewReport} />}
          {activeTab === 'skill-gaps' && <SkillGapIntelligence />}

          {/* Recruiter Routes */}
          {activeTab === 'recruiter-dashboard' && <RecruiterIQDashboard onNavigate={setActiveTab} />}
          {activeTab === 'jobs-recruiter' && <RecruiterJobManagement />}
          {activeTab === 'candidates-recruiter' && <CandidateIntelligenceProfile />}
          {activeTab === 'candidate-intelligence' && <CandidateIntelligenceProfile />}
          {activeTab === 'comparison' && <CandidateIQComparison />}
          {activeTab === 'assistant' && <AIRecruitmentAssistantIQ />}

          {/* Admin Route */}
          {activeTab === 'admin-dashboard' && (
            <div className="p-8 space-y-6 max-w-4xl mx-auto select-none">
              <h2 className="text-xl font-bold font-outfit text-slate-900">CandidateIQ System Operations & AI Metrics</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="saas-card p-5 bg-white border border-slate-200">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Registered Accounts</span>
                  <h3 className="text-3xl font-black mt-1 font-outfit text-slate-900">1,420</h3>
                </div>
                <div className="saas-card p-5 bg-white border border-slate-200">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gemini 2.0 API Invocations</span>
                  <h3 className="text-3xl font-black mt-1 font-outfit text-indigo-600">14,890</h3>
                </div>
                <div className="saas-card p-5 bg-white border border-slate-200">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Activated HR Licenses</span>
                  <h3 className="text-3xl font-black mt-1 font-outfit text-emerald-600">84 Active</h3>
                </div>
              </div>
            </div>
          )}

          {/* Settings Route */}
          {activeTab === 'settings' && <SettingsPage />}
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
    </div>
  );
}

export default App;
