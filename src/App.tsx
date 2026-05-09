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
import CompanyPageBuilder from './pages/CompanyPageBuilder';
import JobInventoryPage from './pages/JobInventoryPage';
import ProfilePage from './pages/ProfilePage';
import LinkedInIntelligencePage from './pages/LinkedInIntelligencePage';
import MessageBuddyPage from './pages/MessageBuddyPage';
import ScaleUpPlanPage from './pages/ScaleUpPlanPage';
import TasksPage from './pages/TasksPage';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import { Page, User, AppMode, SearchMode, IndustryType, EngagementType, TaxType } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Bot, Loader2, ArrowLeft } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreErrorHandler';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [pageHistory, setPageHistory] = useState<Page[]>([]);
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
      } else if (window.location.hash === '#/linkedin-intelligence') {
        setCurrentPage('linkedin-intelligence');
      } else if (window.location.hash === '#/admin') {
        setCurrentPage('admin');
      } else if (window.location.hash === '#/superadmin') {
        setCurrentPage('superadmin');
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
    const updatedUser = { 
      ...user, 
      onboardingCompleted: true,
      title: data.title,
      domain: data.domain,
      skills: data.skills,
      yearsOfExperience: data.yearsOfExperience,
      headshotUrl: data.headshotUrl,
      name: data.name || user.name
    };
    setUser(updatedUser);
    
    // Update in Firestore
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { 
          onboardingCompleted: true,
          title: data.title,
          domain: data.domain,
          skills: data.skills,
          yearsOfExperience: data.yearsOfExperience,
          headshotUrl: data.headshotUrl,
          name: data.name || user.name
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  useEffect(() => {
    // Safety timeout for loading state
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth check timed out. Forcing loading to false.");
        setLoading(false);
      }
    }, 5000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      try {
        if (firebaseUser) {
          // Fetch user metadata from Firestore
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            return;
          }
          
          let userData: User;
          if (userDoc.exists()) {
            const profile = userDoc.data();
            const isCompany = firebaseUser.email?.includes('@agency.com') || firebaseUser.email?.includes('@corp.com') || firebaseUser.email?.includes('.ai');
            const isGod = ['king007.2311@gmail.com', 'moimroz231997@gmail.com'].includes(firebaseUser.email || '');
            userData = {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
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
              industryTypes: profile.industryTypes,
              engagementTypes: profile.engagementTypes,
              taxTypes: profile.taxTypes,
              onboardingCompleted: profile.onboardingCompleted,
              organizationId: profile.organizationId,
              userLevel: isGod ? 'universal' : (profile.userLevel || 'member'),
              userPlan: profile.userPlan || 'free',
              funNameTag: profile.funNameTag,
              funNameTagHistory: profile.funNameTagHistory || [],
              backgroundUrl: profile.backgroundUrl,
              headshotUrl: profile.headshotUrl,
              createdAt: profile.createdAt,
              linkedInConnected: profile.linkedInConnected
            };

            // AI Tag Generation Logic
            if (userData.linkedInConnected && userData.createdAt) {
              const createdDate = new Date(userData.createdAt);
              const now = new Date();
              const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
              
              if (daysSinceCreation > 7 || isGod) {
                 const history = userData.funNameTagHistory || [];
                 // Filter to tags in last 300 days
                 const recentTags = history.filter(h => (now.getTime() - new Date(h.date).getTime()) / (1000 * 3600 * 24) <= 300);
                 
                 // If less than 5 tags in 300 days and no tags in last 14 days, generate new one
                 const daysSinceLastTag = history.length > 0 ? (now.getTime() - new Date(history[history.length - 1].date).getTime()) / (1000 * 3600 * 24) : Infinity;

                 if ((recentTags.length < 5 && daysSinceLastTag > 14) || (isGod && !userData.funNameTag)) {
                   import('./services/aiService').then(async ({ generateFunNameTag }) => {
                     const result = await generateFunNameTag(userData, history.map(h => h.tag), isGod);
                     if (result?.tag) {
                       const newHistory = [...history, { tag: result.tag, date: now.toISOString() }];
                       await updateDoc(doc(db, 'users', firebaseUser.uid), {
                         funNameTag: result.tag,
                         funNameTagHistory: newHistory
                       });
                       setUser(curr => curr ? { ...curr, funNameTag: result.tag, funNameTagHistory: newHistory } : curr);
                     }
                   }).catch(console.error);
                 }
              }
            }

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
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              isLoggedIn: true,
              role: role,
              isCompanyUser: role === 'corp',
              selectedMode: selectedMode,
              onboardingCompleted: false,
              userLevel: (['king007.2311@gmail.com', 'moimroz231997@gmail.com'].includes(firebaseUser.email || '') ? 'universal' : 'member'),
              userPlan: 'free'
            };

            try {
              await setDoc(doc(db, 'users', firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: role,
                selectedMode: selectedMode || null,
                onboardingCompleted: false,
                userLevel: userData.userLevel,
                userPlan: 'free',
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
      } catch (globalErr) {
        console.error("Auth state processing error:", globalErr);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const handleLogin = (email: string, linkedinProfile?: any) => {
    const isCompany = email.includes('@agency.com') || email.includes('@corp.com') || email.includes('.ai') || linkedinProfile;
    const role = isCompany ? 'corp' : 'candidate';
    
    const userData: User = {
      id: linkedinProfile?.id || `demo-${Date.now()}`,
      uid: linkedinProfile?.id || auth.currentUser?.uid || `demo-${Date.now()}`,
      email: email,
      name: linkedinProfile?.localizedFirstName ? `${linkedinProfile.localizedFirstName} ${linkedinProfile.localizedLastName}` : (linkedinProfile?.name || email.split('@')[0] || 'User'),
      isLoggedIn: true,
      role: role as 'corp' | 'candidate',
      isCompanyUser: (role === 'corp'),
      onboardingCompleted: true, // Mark as completed for LinkedIn users to jump straight in
      selectedMode: isCompany ? 'recruiter' : 'hunter',
      headshotUrl: linkedinProfile?.profilePicture?.displayImage || linkedinProfile?.picture || auth.currentUser?.photoURL || undefined
    };

    setUser(userData);
    if (linkedinProfile) {
      setIsLinkedInConnected(true);
      localStorage.setItem('linkedinProfile', JSON.stringify(linkedinProfile));
    }
    localStorage.setItem('isDemoLoggedIn', 'true');
    localStorage.setItem('demoUser', JSON.stringify(userData));
  };

  const handleSelectAppMode = async (mode: AppMode, options?: { 
    orgData?: { name: string, domain: string },
    basicDetails?: { name: string, title: string, phone: string },
    industryTypes?: IndustryType[],
    engagementTypes?: EngagementType[],
    taxTypes?: TaxType[]
  }) => {
    if (user) {
      const updates: any = { 
        selectedMode: mode,
        industryTypes: options?.industryTypes,
        engagementTypes: options?.engagementTypes,
        taxTypes: options?.taxTypes,
      };

      if (options?.basicDetails) {
        if (options.basicDetails.name) updates.name = options.basicDetails.name;
        if (options.basicDetails.title) updates.title = options.basicDetails.title;
        if (options.basicDetails.phone) updates.phone = options.basicDetails.phone;
      }
      
      if (options?.orgData) {
        updates.role = 'corp';
        updates.userLevel = 'admin';
        updates.isCompanyUser = true;
      }

      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      navigateTo('dashboard');
      
      // Persist selection
      if (auth.currentUser) {
        try {
          const firestoreUpdates: any = {
            selectedMode: mode,
            industryTypes: options?.industryTypes || [],
            engagementTypes: options?.engagementTypes || [],
            taxTypes: options?.taxTypes || [],
            onboardingCompleted: true,
            ...(options?.basicDetails?.name ? { name: options.basicDetails.name } : {}),
            ...(options?.basicDetails?.title ? { title: options.basicDetails.title } : {}),
            ...(options?.basicDetails?.phone ? { phone: options.basicDetails.phone } : {})
          };
          
          if (options?.orgData) {
            // Create Organization document
            const orgRef = doc(collection(db, 'organizations'));
            await setDoc(orgRef, {
              name: options.orgData.name,
              domain: options.orgData.domain,
              ownerId: auth.currentUser.uid,
              createdAt: new Date().toISOString(),
              plan: 'free',
              status: 'active'
            });
            
            firestoreUpdates.organizationId = orgRef.id;
            firestoreUpdates.role = 'corp';
            firestoreUpdates.userLevel = 'admin';
            firestoreUpdates.isCompanyUser = true;
          }
          
          await setDoc(doc(db, 'users', auth.currentUser.uid), firestoreUpdates, { merge: true });
        } catch (err) {
          console.error("Error saving user mode preferences to firestore:", err);
        }
      }
    }
  };

  const handleSelectSearchMode = (mode: SearchMode) => {
    setSearchMode(mode);
    if (mode === 'candidate-for-job') {
      navigateTo('sourcing');
    } else {
      navigateTo('intelligence');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('isDemoLoggedIn');
      localStorage.removeItem('demoUser');
      localStorage.removeItem('linkedinProfile');
      setUser(null);
      setCurrentPage('dashboard');
      setPageHistory([]);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const navigateTo = (page: Page) => {
    if (page !== currentPage) {
      setPageHistory(prev => [...prev, currentPage]);
      setCurrentPage(page);
    }
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const prevPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(prevPage);
    }
  };

  const handleConnectLinkedIn = async () => {
    const newState = !isLinkedInConnected;
    
    if (newState) {
      // Simulate LinkedIn Auth Process
      setIsLinkedInConnected(true);
      localStorage.setItem('isLinkedInConnected', 'true');
      
      if (user) {
        const mockHeadshotUrl = auth.currentUser?.photoURL || undefined;
        const updatedUser = { ...user, linkedInConnected: true, headshotUrl: mockHeadshotUrl };
        setUser(updatedUser);
        
        if (auth.currentUser) {
          try {
            const updates: any = { linkedInConnected: true };
            if (mockHeadshotUrl) updates.headshotUrl = mockHeadshotUrl;
            await setDoc(doc(db, 'users', auth.currentUser.uid), updates, { merge: true });
          } catch (err) {
            console.error('LinkedIn state update error:', err);
          }
        }
      }
      localStorage.setItem('linkedinProfile', JSON.stringify({ 
        name: user?.name || 'LinkedIn User', 
        connectedAt: new Date().toISOString(),
        headline: 'Strategic Professional',
        connections: '500+'
      }));
    } else {
      setIsLinkedInConnected(false);
      localStorage.setItem('isLinkedInConnected', 'false');
      
      if (user) {
        const updatedUser = { ...user, linkedInConnected: false };
        setUser(updatedUser);
        
        if (auth.currentUser) {
          try {
            await setDoc(doc(db, 'users', auth.currentUser.uid), { linkedInConnected: false }, { merge: true });
          } catch (err) {
            console.error('LinkedIn state update error:', err);
          }
        }
      }
      localStorage.removeItem('linkedinProfile');
    }
  };

  const handleReverseMarket = (candidate: any) => {
    setSelectedCandidateForMarket(candidate);
    navigateTo('job-feed');
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
    return <PrivacyPolicyPage onBack={user ? () => handleBack() : undefined} />;
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
        return <DashboardPage onSelectMode={handleSelectSearchMode} onNavigatePage={navigateTo} appMode={user.selectedMode || 'recruiter'} user={user} />;
      case 'sourcing':
        return <SourcingPage isLinkedInConnected={isLinkedInConnected} onConnectLinkedIn={() => navigateTo('linkedin-intelligence')} />;
      case 'tasks':
        return <TasksPage userLevel={user.userLevel || 'member'} />;
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
        return <PrivacyPolicyPage onBack={user ? () => handleBack() : undefined} />;
      case 'company-page-builder':
        return <CompanyPageBuilder />;
      case 'history':
        return <AnalyticsPage />;
      case 'assistant':
        return <AssistantPage appMode={user.selectedMode || 'recruiter'} />;
      case 'linkedin-intelligence':
        return <LinkedInIntelligencePage isConnected={isLinkedInConnected} onConnect={handleConnectLinkedIn} myProfile={user} />;
      case 'message-buddy':
        return <MessageBuddyPage userLevel={user.userLevel || 'member'} userPlan={user.userPlan || 'free'} myProfile={user} />;
      case 'admin':
        if (user?.userLevel !== 'admin' && user?.userLevel !== 'admin_head' && user?.userLevel !== 'universal') {
          return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h2 className="text-3xl font-serif font-bold italic text-[#0f172a]">Access Denied</h2>
              <p className="text-base text-[#0f172a]/40 mt-2">You need admin privileges to access team management.</p>
            </div>
          );
        }
        return <AdminPage />;
      case 'scale-up':
        return <ScaleUpPlanPage userLevel={user?.userLevel || 'member'} />;
      case 'superadmin':
        if (user?.userLevel !== 'universal') {
          return (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <h2 className="text-3xl font-serif font-bold italic text-[#0f172a]">Access Denied</h2>
              <p className="text-base text-[#0f172a]/40 mt-2">You do not have permission to access the control center.</p>
            </div>
          );
        }
        return <SuperAdminPage />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={(updated) => setUser(updated)} onNavigatePage={navigateTo} />;
      default:
        return <DashboardPage onSelectMode={handleSelectSearchMode} onNavigatePage={navigateTo} appMode={user.selectedMode || 'recruiter'} />;
    }
  };

  return (
    <div 
      className={cn(
        "flex min-h-screen selection:bg-violet/30 transition-colors duration-700 bg-cover bg-center bg-no-repeat bg-fixed relative",
        !user.backgroundUrl && (user.userLevel === 'universal' ? 'bg-amber-50/50' : user.selectedMode === 'recruiter' ? 'bg-indigo-50/30' : 'bg-rose-50/20')
      )}
      style={{
        backgroundImage: user.backgroundUrl ? `url(${user.backgroundUrl})` : `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')`, // A premium abstract cartoon-like/royal visual or superhero abstract style if default.
      }}
    >
      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] pointer-events-none" /> {/* Overlay to make sure text is readable */}
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={navigateTo} 
        isLinkedInConnected={isLinkedInConnected}
        onConnectLinkedIn={() => navigateTo('linkedin-intelligence')}
        onLogout={handleLogout}
        appMode={user.selectedMode}
        userLevel={user.userLevel}
        userPlan={user.userPlan}
        userName={user.name}
        funNameTag={user.funNameTag}
        onBack={handleBack}
        canGoBack={pageHistory.length > 0}
        onSwitchMode={() => {
          setPageHistory(prev => [...prev, currentPage]);
          const newMode = user.selectedMode === 'recruiter' ? 'hunter' : 'recruiter';
          handleSelectAppMode(newMode);
        }}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <main className={cn(
        "flex-1 p-12 overflow-y-auto relative transition-all duration-500",
        sidebarCollapsed ? "ml-20" : "ml-56"
      )}>
        {/* Global Navigation Bar */}
        <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {pageHistory.length > 0 && (
              <button 
                onClick={handleBack}
                className="group flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-300/5 shadow-sm hover:shadow-md hover:border-slate-300/10 transition-all text-[#0f172a]/60 hover:text-[#0f172a]"
              >
                <div className="w-6 h-6 rounded-lg bg-warm-gray flex items-center justify-center group-hover:bg-[#1e293b] group-hover:text-white transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
                <span className="text-base font-bold uppercase tracking-widest">Back</span>
              </button>
            )}
            <div className="h-4 w-[1px] bg-[#1e293b]/10 mx-2" />
            <h2 className="text-base font-bold uppercase tracking-[0.3em] text-[#0f172a]/40">
              {currentPage.replace('-', ' ')}
            </h2>
          </div>
        </div>

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
          onClick={() => navigateTo('assistant')}
          className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-electric text-white rounded-3xl shadow-2xl shadow-indigo-electric/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden border border-white/20"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Bot className="w-8 h-8 relative z-10" />
        </button>
      </main>
    </div>
  );
}

