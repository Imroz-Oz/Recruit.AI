/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import IntelligenceHubPage from './pages/IntelligenceHubPage';
import PersonalIQPage from './pages/PersonalIQPage';
import SourcingPage from './pages/SourcingPage';
import HistoryPage from './pages/HistoryPage';
import AssistantPage from './pages/AssistantPage';
import CandidatesPage from './pages/CandidatesPage';
import NetworkPage from './pages/NetworkPage';
import AuthPage from './pages/AuthPage';
import ModeSelection from './components/ModeSelection';
import JobFeedPage from './pages/JobFeedPage';
import ResumeVaultPage from './pages/ResumeVaultPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import TalentArchivePage from './pages/TalentArchivePage';
import JobInventoryPage from './pages/JobInventoryPage';
import ProfilePage from './pages/ProfilePage';
import { Page, User, AppMode, SearchMode } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Bot, Loader2 } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null);
  const [selectedCandidateForMarket, setSelectedCandidateForMarket] = useState<any | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user metadata from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        let userData: User;
        if (userDoc.exists()) {
          const profile = userDoc.data();
          const isCompany = firebaseUser.email?.includes('@agency.com') || firebaseUser.email?.includes('@corp.com') || firebaseUser.email?.includes('.ai');
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            isLoggedIn: true,
            role: profile.role || (isCompany ? 'corp' : 'candidate'),
            isCompanyUser: isCompany || profile.role === 'recruiter',
            selectedMode: profile.selectedMode
          };
        } else {
          // Initialize user in Firestore
          const isCompany = firebaseUser.email?.includes('@agency.com') || firebaseUser.email?.includes('@corp.com') || firebaseUser.email?.includes('.ai');
          const role = isCompany ? 'recruiter' : 'candidate';
          
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            isLoggedIn: true,
            role: isCompany ? 'corp' : 'candidate', // Keep 'corp' for UI compatibility but 'recruiter' in DB
            isCompanyUser: isCompany
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role,
            createdAt: new Date().toISOString()
          });
        }
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (email: string) => {
    // This is now handled by onAuthStateChanged after signInWithPopup in AuthPage
  };

  const handleSelectAppMode = async (mode: AppMode) => {
    if (user) {
      const updatedUser = { ...user, selectedMode: mode };
      setUser(updatedUser);
      setCurrentPage('dashboard');
      
      // Persist selection
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { selectedMode: mode }, { merge: true });
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
        return <TalentArchivePage onReverseMarket={handleReverseMarket} />;
      case 'interview-prep':
        return <InterviewPrepPage />;
      case 'history':
        return <HistoryPage />;
      case 'assistant':
        return <AssistantPage appMode={user.selectedMode || 'recruiter'} />;
      case 'profile':
        return <ProfilePage user={user} />;
      default:
        return <DashboardPage onSelectMode={handleSelectSearchMode} onNavigatePage={setCurrentPage} appMode={user.selectedMode || 'recruiter'} />;
    }
  };

  return (
    <div className={cn(
      "flex min-h-screen selection:bg-indigo-electric/30",
      user.selectedMode === 'recruiter' ? 'bg-cream' : 'bg-warm-gray/20'
    )}>
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isLinkedInConnected={isLinkedInConnected}
        onConnectLinkedIn={handleConnectLinkedIn}
        appMode={user.selectedMode}
        onSwitchMode={() => setUser({ ...user, selectedMode: undefined })}
      />
      
      <main className="flex-1 ml-64 p-12 overflow-y-auto relative">
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

        {/* Floating Copilot Trigger */}
        <button 
          onClick={() => setCurrentPage('assistant')}
          className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-electric text-white rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Bot className="w-8 h-8 relative z-10" />
        </button>
      </main>
    </div>
  );
}

