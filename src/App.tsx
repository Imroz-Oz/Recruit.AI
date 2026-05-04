/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import OnboardingWizard from './components/OnboardingWizard';
import DashboardPage from './pages/DashboardPage';
import IntelligenceHubPage from './pages/IntelligenceHubPage';
import PersonalIQPage from './pages/PersonalIQPage';
import SourcingPage from './pages/SourcingPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AssistantPage from './pages/AssistantPage';
import CandidatesPage from './pages/CandidatesPage';
import NetworkPage from './pages/NetworkPage';
import AuthPage from './pages/AuthPage';
import ModeSelection from './components/ModeSelection';
import JobFeedPage from './pages/JobFeedPage';
import ResumeVaultPage from './pages/ResumeVaultPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import TalentArchivePage from './pages/TalentArchivePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import JobInventoryPage from './pages/JobInventoryPage';
import ProfilePage from './pages/ProfilePage';
import { Page, User, AppMode, SearchMode } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Bot, Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null);
  const [selectedCandidateForMarket, setSelectedCandidateForMarket] = useState<any | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (user?.linkedInConnected !== undefined) {
      setIsLinkedInConnected(user.linkedInConnected);
    }
  }, [user]);

  useEffect(() => {
    const handleLocation = () => {
      if (window.location.hash === '#/privacy') {
        setCurrentPage('privacy');
      }
    };

    // Check on mount
    handleLocation();

    // Listen for hash changes
    window.addEventListener('hashchange', handleLocation);
    return () => window.removeEventListener('hashchange', handleLocation);
  }, []);

  const completeOnboarding = async (data: any) => {
    if (!user) return;
    const updatedUser = { ...user, onboardingCompleted: true };
    setUser(updatedUser);
    
    // Update in Firestore
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { onboardingCompleted: true }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user metadata from Firestore
        let userDoc;
        try {
          userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
          return;
        }
        
        let userData: User;
        if (userDoc.exists()) {
          const profile = userDoc.data();
          const isCompany = firebaseUser.email?.includes('@agency.com') || firebaseUser.email?.includes('@corp.com') || firebaseUser.email?.includes('.ai');
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: profile.name || profile.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            isLoggedIn: true,
            role: profile.role || (isCompany ? 'corp' : 'candidate'),
            isCompanyUser: isCompany || profile.role === 'recruiter',
            selectedMode: profile.selectedMode,
            title: profile.title,
            bio: profile.bio,
            location: profile.location,
            skills: profile.skills,
            onboardingCompleted: profile.onboardingCompleted
          };
        } else {
          // Initialize user in Firestore
          const storedRole = localStorage.getItem('intendedRole');
          const isCompany = firebaseUser.email?.includes('@agency.com') || firebaseUser.email?.includes('@corp.com') || firebaseUser.email?.includes('.ai');
          
          let role: 'corp' | 'candidate' = isCompany ? 'corp' : 'candidate';
          if (storedRole === 'recruiter') role = 'corp';
          if (storedRole === 'hunter') role = 'candidate';
          
          const selectedMode = storedRole === 'recruiter' ? 'recruiter' : storedRole === 'hunter' ? 'hunter' : undefined;

          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            isLoggedIn: true,
            role: role,
            isCompanyUser: role === 'corp',
            selectedMode: selectedMode,
            onboardingCompleted: false
          };

          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: role,
              selectedMode: selectedMode || null,
              onboardingCompleted: false,
              createdAt: new Date().toISOString()
            });
            localStorage.removeItem('intendedRole');
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
          }
        }
        setUser(userData);
      } else {
        // Check for Demo/LinkedIn Session
        const isDemo = localStorage.getItem('isDemoLoggedIn') === 'true';
        const demoUserJson = localStorage.getItem('demoUser');
        if (isDemo && demoUserJson) {
          setUser(JSON.parse(demoUserJson));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (email: string, linkedinProfile?: any) => {
    const isCompany = email.includes('@agency.com') || email.includes('@corp.com') || email.includes('.ai') || linkedinProfile;
    const role = isCompany ? 'corp' : 'candidate';
    
    const userData: User = {
      id: linkedinProfile?.id || `demo-${Date.now()}`,
      email: email,
      name: linkedinProfile?.name || email.split('@')[0] || 'User',
      isLoggedIn: true,
      role: role as 'corp' | 'candidate',
      isCompanyUser: (role === 'corp'),
      onboardingCompleted: true, // Mark as completed for LinkedIn users to jump straight in
      selectedMode: isCompany ? 'recruiter' : 'hunter'
    };

    setUser(userData);
    if (linkedinProfile) {
      setIsLinkedInConnected(true);
      localStorage.setItem('linkedinProfile', JSON.stringify(linkedinProfile));
    }
    localStorage.setItem('isDemoLoggedIn', 'true');
    localStorage.setItem('demoUser', JSON.stringify(userData));
  };

  const handleSelectAppMode = async (mode: AppMode) => {
    if (user) {
      const updatedUser = { ...user, selectedMode: mode };
      setUser(updatedUser);
      setCurrentPage('dashboard');
      
      // Persist selection
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', auth.currentUser.uid), { selectedMode: mode }, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
        }
      }
    }
  };

  const handleSelectSearchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    if (mode === 'candidate-for-job') {
      setCurrentPage('sourcing');
    } else {
      setCurrentPage('intelligence');
    }
  };

  const handleConnectLinkedIn = () => {
    setIsLinkedInConnected(!isLinkedInConnected);
  };

  const handleReverseMarket = (candidate: any) => {
    setSelectedCandidateForMarket(candidate);
    setCurrentPage('job-feed');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-electric animate-spin" />
      </div>
    );
  }

  // Handle public pages like Privacy Policy without needing a user
  if (currentPage === 'privacy') {
    return <PrivacyPolicyPage onBack={user ? () => setCurrentPage('dashboard') : undefined} />;
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  if (!user.selectedMode) {
    return (
      <ModeSelection 
        user={user} 
        onSelectMode={handleSelectAppMode} 
        isLinkedInConnected={isLinkedInConnected}
        onConnectLinkedIn={handleConnectLinkedIn}
      />
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onSelectMode={handleSelectSearchMode} onNavigatePage={setCurrentPage} appMode={user.selectedMode || 'recruiter'} />;
      case 'sourcing':
        return <SourcingPage isLinkedInConnected={isLinkedInConnected} />;
      case 'candidates':
        return <CandidatesPage />;
      case 'intelligence':
        return <IntelligenceHubPage />;
      case 'network':
        return <NetworkPage />;
      case 'postings':
        return <JobInventoryPage />;
      case 'personal-iq':
        return <PersonalIQPage />;
      case 'job-feed':
        return <JobFeedPage preSearchCandidate={selectedCandidateForMarket} />;
      case 'resume-vault':
        return user.selectedMode === 'hunter' 
          ? <ResumeVaultPage /> 
          : <TalentArchivePage onReverseMarket={handleReverseMarket} />;
      case 'interview-prep':
        return <InterviewPrepPage />;
      case 'privacy':
        return <PrivacyPolicyPage onBack={user ? () => setCurrentPage('dashboard') : undefined} />;
      case 'history':
        return <AnalyticsPage />;
      case 'assistant':
        return <AssistantPage appMode={user.selectedMode || 'recruiter'} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={(updated) => setUser(updated)} />;
      default:
        return <DashboardPage onSelectMode={handleSelectSearchMode} onNavigatePage={setCurrentPage} appMode={user.selectedMode || 'recruiter'} />;
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen selection:bg-violet/30",
      user.selectedMode === 'recruiter' ? 'bg-cream' : 'bg-slate-50'
    )}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isLinkedInConnected={isLinkedInConnected}
        onConnectLinkedIn={handleConnectLinkedIn}
        appMode={user.selectedMode}
        onSwitchMode={() => setUser({ ...user, selectedMode: undefined })}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        "flex-1 p-12 overflow-y-auto relative transition-all duration-500",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="max-w-7xl mx-auto"
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        {user.isLoggedIn && user.onboardingCompleted === false && (
          <OnboardingWizard 
            onComplete={completeOnboarding} 
            role={user.selectedMode || 'hunter'} 
          />
        )}

        {/* Floating Copilot Trigger */}
        <button 
          onClick={() => setCurrentPage('assistant')}
          className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-electric text-white rounded-3xl shadow-2xl shadow-indigo-electric/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden border border-white/20"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Bot className="w-8 h-8 relative z-10" />
        </button>
      </main>
    </div>
  );
}

