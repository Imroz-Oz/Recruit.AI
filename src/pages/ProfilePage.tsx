import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2,
  ExternalLink,
  Sparkles,
  Save,
  X,
  Zap,
  Tag,
  Wand2,
  Link2,
  Loader2,
  AlertCircle,
  Fingerprint
} from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User as UserType, IndustryType, EngagementType, TaxType } from '@/src/types';
import { cn, maskEmail } from '@/src/lib/utils';
import { generateProfessionalSummary } from '@/src/services/aiService';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { getLinkedInAuthUrl, updateLinkedInConnectionStatus } from '@/src/services/linkedinService';

interface ProfilePageProps {
  user: UserType;
  onUpdateUser: (updatedUser: UserType) => void;
  onNavigatePage?: (page: any) => void;
}

export default function ProfilePage({ user: initialUser, onUpdateUser, onNavigatePage }: ProfilePageProps) {
  const [user, setUser] = useState<UserType>(initialUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isSyncingLinkedIn, setIsSyncingLinkedIn] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    title: user.title || '',
    bio: user.bio || '',
    location: user.location || '',
    skills: user.skills ? user.skills.join(', ') : '',
    industryTypes: user.industryTypes || [] as IndustryType[],
    engagementTypes: user.engagementTypes || [] as EngagementType[],
    taxTypes: user.taxTypes || [] as TaxType[],
    headshotUrl: user.headshotUrl || '',
    backgroundUrl: user.backgroundUrl || ''
  });

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Diagnostic logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[LinkedIn Profile Sync] Received Message:', event.data);
      }

      if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS' && event.data.profile) {
        const { profile } = event.data;
        const updatedData = {
          name: `${profile.firstName} ${profile.lastName}`,
          linkedInConnected: true,
          email: profile.email || user.email // Optional: update email if empty
        };
        
        setIsSyncingLinkedIn(true);
        try {
          if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, updatedData);
          } else if (localStorage.getItem('isDemoLoggedIn') === 'true') {
            // Handle Demo session update
            const demoUser = JSON.parse(localStorage.getItem('demoUser') || '{}');
            const updatedDemoUser = { ...demoUser, ...updatedData };
            localStorage.setItem('demoUser', JSON.stringify(updatedDemoUser));
          }
          
          const newUser = { ...user, ...updatedData };
          onUpdateUser(newUser);
          setUser(newUser);
          
          setEditForm(prev => ({
            ...prev,
            name: updatedData.name
          }));
          
          alert('LinkedIn Identity successfully synchronized via OpenID Connect.');
        } catch (error) {
          console.error('Failed to update profile after LinkedIn sync:', error);
        } finally {
          setIsSyncingLinkedIn(false);
        }
      } else if (event.data?.type === 'LINKEDIN_AUTH_ERROR') {
        setIsSyncingLinkedIn(false);
        alert(`LinkedIn Authentication failed: ${event.data.error || 'Unknown error'}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, onUpdateUser]);

  const handleSyncLinkedIn = async () => {
    setIsSyncingLinkedIn(true);
    try {
      // Try real sync first if configured
      if (auth.currentUser && process.env.VITE_LINKEDIN_CLIENT_ID) {
        const url = await getLinkedInAuthUrl();
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const authWindow = window.open(url, 'LinkedIn Auth', `width=${width},height=${height},left=${left},top=${top}`);
        if (!authWindow) alert('Popup blocked. Please enable popups.');
      } else {
        // AI Studio Demo Fallback
        const updatedData = { linkedInConnected: true };
        if (auth.currentUser) {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), updatedData);
        }
        const newUser = { ...user, ...updatedData };
        onUpdateUser(newUser);
        setUser(newUser);
        localStorage.setItem('linkedinProfile', JSON.stringify({ name: user.name, connectedAt: new Date().toISOString() }));
      }
    } catch (error) {
      console.error('LinkedIn sync failed:', error);
    } finally {
      setIsSyncingLinkedIn(false);
    }
  };

  const accountSince = new Date(auth.currentUser?.metadata.creationTime || Date.now()).toLocaleDateString();
  const lastLogin = new Date(auth.currentUser?.metadata.lastSignInTime || Date.now()).toLocaleDateString();

  const handleMagicSummary = async () => {
    setIsGeneratingAI(true);
    const summary = await generateProfessionalSummary({
      title: editForm.title || (user.role === 'corp' ? 'Corporate Recruiter' : 'Intelligence Candidate'),
      bio: editForm.bio,
      skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s !== '')
    });
    if (summary) {
      setEditForm(prev => ({ ...prev, bio: summary }));
    }
    setIsGeneratingAI(false);
  };

  const [isRegeneratingTag, setIsRegeneratingTag] = useState(false);

  const handleRegenerateFunTag = async () => {
    if (!auth.currentUser) return;
    
    // Check constraints
    const isGod = user.userLevel === 'universal';
    const isPaid = user.userPlan === 'pro' || user.userPlan === 'enterprise';
    
    if (!isGod) {
       if (!isPaid) {
          alert('Generating custom fun tags is a premium feature. Please upgrade your plan.');
          return;
       }
       
       // check if used recently (once an year)
       const history = user.funNameTagHistory || [];
       if (history.length > 0) {
           const lastDate = new Date(history[history.length - 1].date);
           const daysSince = (new Date().getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
           if (daysSince < 365) {
               alert(`You can only generate a new fun tag once a year. Please wait ${Math.ceil(365 - daysSince)} more days.`);
               return;
           }
       }
    }

    setIsRegeneratingTag(true);
    try {
      const { generateFunNameTag } = await import('@/src/services/aiService');
      const history = user.funNameTagHistory || [];
      const result = await generateFunNameTag(user, history.map(h => h.tag), isGod);
      if (result?.tag) {
         const newHistory = [...history, { tag: result.tag, date: new Date().toISOString() }];
         await updateDoc(doc(db, 'users', auth.currentUser.uid), {
             funNameTag: result.tag,
             funNameTagHistory: newHistory
         });
         const updatedUser = { ...user, funNameTag: result.tag, funNameTagHistory: newHistory };
         setUser(updatedUser);
         onUpdateUser(updatedUser);
      }
    } catch (error) {
      console.error('Failed to regenerate tag:', error);
      alert('Failed to regenerate tag via AI.');
    } finally {
      setIsRegeneratingTag(false);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const updatedData = {
        name: editForm.name,
        title: editForm.title,
        bio: editForm.bio,
        location: editForm.location,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        industryTypes: editForm.industryTypes,
        engagementTypes: editForm.engagementTypes,
        taxTypes: editForm.taxTypes,
        headshotUrl: editForm.headshotUrl,
        backgroundUrl: editForm.backgroundUrl
      };
      
      try {
        await updateDoc(userRef, updatedData);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
      
      onUpdateUser({
        ...user,
        ...updatedData
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
            <User className="w-3.5 h-3.5 text-indigo-electric" />
            <span className="text-base font-bold text-indigo-electric uppercase tracking-[0.2em]">Secure Profile</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-[#0f172a] italic">Professional Identity</h2>
          <p className="text-[#0f172a]/40 text-base font-bold uppercase tracking-widest">Manage your global intelligence credentials</p>
        </div>
        
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={cn(
            "px-8 py-3 rounded-full font-bold text-base uppercase tracking-[0.2em] shadow-xl transition-all flex items-center gap-3",
            isEditing 
              ? "bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700" 
              : "bg-[#1e293b] text-white shadow-midnight/20 hover:scale-105"
          )}
        >
          {isSaving ? <Zap className="w-4 h-4 animate-spin" /> : (isEditing ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />)}
          {isSaving ? 'Synchronizing...' : (isEditing ? 'Save Parameters' : 'Modify Credentials')}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-3xl border border-slate-300/5 shadow-sm text-center space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-electric" />
            
            {isEditing ? (
               <div className="space-y-4">
                 <div className="w-24 h-24 bg-[#1e293b] text-white rounded-3xl flex items-center justify-center font-serif font-bold text-4xl italic shadow-2xl shadow-midnight/30 mx-auto transition-transform group-hover:scale-105 overflow-hidden">
                  {editForm.headshotUrl ? <img src={editForm.headshotUrl} alt="headshot" className="w-full h-full object-cover" /> : (editForm.name[0] || '?')}
                </div>
                <div className="space-y-3">
                  <input 
                    value={editForm.headshotUrl}
                    onChange={(e) => setEditForm({...editForm, headshotUrl: e.target.value})}
                    placeholder="Profile Picture URL"
                    className="w-full p-3 bg-warm-gray rounded-xl text-base font-bold text-center outline-none focus:bg-white focus:border-indigo-electric/20 transition-all text-xs"
                  />
                  <input 
                    value={editForm.backgroundUrl}
                    onChange={(e) => setEditForm({...editForm, backgroundUrl: e.target.value})}
                    placeholder="App Background URL"
                    className="w-full p-3 bg-warm-gray rounded-xl text-base font-bold text-center outline-none focus:bg-white focus:border-indigo-electric/20 transition-all text-xs"
                  />
                  <input 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Full Name"
                    className="w-full p-3 bg-warm-gray rounded-xl text-base font-bold text-center outline-none focus:bg-white focus:border-indigo-electric/20 transition-all"
                  />
                  <input 
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    placeholder="Professional Title"
                    className="w-full p-3 bg-warm-gray rounded-xl text-base font-medium text-center outline-none focus:bg-white focus:border-indigo-electric/10 transition-all text-[#0f172a]/60"
                  />
                </div>
               </div>
            ) : (
              <>
                <div className="w-24 h-24 bg-[#1e293b] text-white rounded-3xl flex items-center justify-center font-serif font-bold text-4xl italic shadow-2xl shadow-midnight/30 mx-auto transition-transform group-hover:scale-105 overflow-hidden">
                  {user.headshotUrl ? <img src={user.headshotUrl} alt="headshot" className="w-full h-full object-cover" /> : (user.name?.[0] || user.email[0].toUpperCase())}
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl font-serif font-bold italic text-[#0f172a]">{user.name || 'Anonymous User'}</h3>
                  <p className="text-base font-medium text-[#0f172a]/40 italic">{user.title || (user.role === 'corp' ? 'Corporate Recruiter' : 'Intelligence Candidate')}</p>
                  {user.funNameTag && (
                    <div className="mt-2 flex flex-col items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-coral/10 text-coral border border-coral/20 rounded-md">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold uppercase tracking-widest">{user.funNameTag}</span>
                      </div>
                      <button 
                        onClick={handleRegenerateFunTag}
                        disabled={isRegeneratingTag}
                        className="text-[10px] uppercase font-bold tracking-widest text-[#0f172a]/30 hover:text-indigo-electric transition-colors"
                      >
                         {isRegeneratingTag ? 'Regenerating...' : 'Regenerate Fun Tag via AI'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="flex justify-center gap-4 pt-4">
              <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-base font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            {isEditing && (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: user.name || '',
                    title: user.title || '',
                    bio: user.bio || '',
                    location: user.location || '',
                    skills: user.skills ? user.skills.join(', ') : '',
                    industryTypes: user.industryTypes || [],
                    engagementTypes: user.engagementTypes || [],
                    taxTypes: user.taxTypes || []
                  });
                }}
                className="text-base font-bold text-[#0f172a]/30 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2 mx-auto"
              >
                <X className="w-3 h-3" /> Abort Changes
              </button>
            )}
          </div>

            <div className="bg-white p-10 rounded-3xl border border-slate-300/5 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#0077B5]" /> Network Integration
                </h4>
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  user.linkedInConnected ? "bg-emerald-500 animate-pulse" : "bg-[#1e293b]/10"
                )} />
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#0077B5] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-[#0f172a] italic">LinkedIn Protocol</p>
                  <p className="text-base font-medium text-[#0f172a]/40">{user.linkedInConnected ? 'Verified Connectivity' : 'Unlinked Asset'}</p>
                </div>
              </div>

              <button 
                onClick={handleSyncLinkedIn}
                disabled={isSyncingLinkedIn}
                className={cn(
                  "w-full py-4 rounded-2xl text-base font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                  user.linkedInConnected 
                    ? "bg-white border-2 border-slate-300/5 text-[#0f172a] hover:bg-neutral-50" 
                    : "bg-[#0077B5] text-white hover:bg-[#004182] shadow-xl shadow-blue-500/20"
                )}
              >
                {isSyncingLinkedIn ? <Loader2 className="w-4 h-4 animate-spin" /> : (user.linkedInConnected ? <Zap className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />)}
                {isSyncingLinkedIn ? 'Synchronizing Intelligence...' : (user.linkedInConnected ? 'Re-Sync Deep Profile' : 'Connect LinkedIn Account')}
              </button>

              {user.linkedInConnected && (
                <div className="pt-2">
                  <div className="p-4 bg-indigo-electric/5 border border-indigo-electric/10 rounded-2xl">
                    <p className="text-base font-bold text-indigo-electric uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Intelligence Available
                    </p>
                    <p className="text-base text-[#0f172a]/40 mb-3 leading-relaxed">Your professional DNA is being analyzed in real-time.</p>
                    <button 
                      onClick={() => {
                        if (onNavigatePage) {
                          onNavigatePage('linkedin-intelligence');
                        }
                      }}
                      className="w-full py-2 bg-indigo-electric text-white rounded-xl text-base font-bold uppercase tracking-widest hover:bg-indigo-700 transition-colors"
                    >
                      View LinkedIn IQ Insights
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#1e293b] p-10 rounded-3xl text-white space-y-6 shadow-2xl shadow-midnight/30">
            <h4 className="text-base font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-400" /> Operational DNA
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-start text-base">
                <span className="text-white/60 uppercase tracking-widest text-base mt-1">Industries</span>
                <div className="text-right flex flex-col items-end gap-1">
                  {user.industryTypes && user.industryTypes.length > 0 ? user.industryTypes.map((it, idx) => (
                    <span key={idx} className="font-bold text-indigo-400 uppercase tracking-widest block">{it}</span>
                  )) : <span className="font-bold text-indigo-400 uppercase tracking-widest">Default</span>}
                </div>
              </div>
              <div className="flex justify-between items-start text-base">
                <span className="text-white/60 uppercase tracking-widest text-base mt-1">Engagement</span>
                <div className="text-right flex flex-col items-end gap-1">
                  {user.engagementTypes && user.engagementTypes.length > 0 ? user.engagementTypes.map((et, idx) => (
                    <span key={idx} className="font-bold text-emerald-400 uppercase tracking-widest block">{et.replace('-', ' ')}</span>
                  )) : <span className="font-bold text-emerald-400 uppercase tracking-widest">Standard</span>}
                </div>
              </div>
              <div className="flex justify-between items-start text-base">
                <span className="text-white/60 uppercase tracking-widest text-base mt-1">Tax Models</span>
                <div className="text-right flex flex-col items-end gap-1">
                  {user.taxTypes && user.taxTypes.length > 0 ? user.taxTypes.map((tt, idx) => (
                    <span key={idx} className="font-bold text-amber-400 uppercase tracking-widest block">{tt}</span>
                  )) : <span className="font-bold text-amber-400 uppercase tracking-widest">Universal</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-3xl text-white space-y-6 shadow-2xl shadow-midnight/30">
            <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Security Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-base">
                <span className="text-white/60">Encryption</span>
                <span className="font-bold text-emerald-400">AES-256 Active</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-white/60">Database Link</span>
                <span className="font-bold text-indigo-400">Encrypted Cloud</span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-white/60">IP Masking</span>
                <span className="font-bold text-amber-400">Node Cluster</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[4rem] border border-slate-300/5 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h5 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/20">Credentials</h5>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#0f172a]/40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-[#0f172a]/20 uppercase tracking-widest">Email Address</p>
                      <p className="text-base font-bold text-[#0f172a] italic">{maskEmail(user.email)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Fingerprint className="w-5 h-5 text-[#0f172a]/40" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <p className="text-base font-bold text-[#0f172a]/20 uppercase tracking-widest">Calibration Parameters</p>
                      {isEditing ? (
                           <div className="grid grid-cols-1 gap-4">
                             <div className="space-y-2">
                               <p className="text-base font-bold text-[#0f172a]/40 uppercase tracking-widest ml-1">Industries</p>
                               <div className="flex flex-wrap gap-2">
                                 {['it', 'engineering', 'healthcare', 'light-industrial', 'non-it', 'other'].map((it) => (
                                   <button
                                     key={it}
                                     type="button"
                                     onClick={() => {
                                       const current = editForm.industryTypes;
                                       const next = current.includes(it as IndustryType)
                                         ? current.filter(i => i !== it)
                                         : [...current, it as IndustryType];
                                       setEditForm({ ...editForm, industryTypes: next });
                                     }}
                                     className={cn(
                                       "px-3 py-1.5 rounded-lg text-base font-bold uppercase tracking-widest transition-all border",
                                       editForm.industryTypes.includes(it as IndustryType)
                                         ? "bg-[#1e293b] text-white border-slate-300"
                                         : "bg-warm-gray text-[#0f172a]/40 border-transparent hover:border-slate-300/10"
                                     )}
                                   >
                                     {it.replace('-', ' ')}
                                   </button>
                                 ))}
                               </div>
                             </div>

                             <div className="space-y-2">
                               <p className="text-base font-bold text-[#0f172a]/40 uppercase tracking-widest ml-1">Engagements</p>
                               <div className="flex flex-wrap gap-2">
                                 {['contract', 'direct-hire', 'contract-to-hire'].map((et) => (
                                   <button
                                     key={et}
                                     type="button"
                                     onClick={() => {
                                       const current = editForm.engagementTypes;
                                       const next = current.includes(et as EngagementType)
                                         ? current.filter(i => i !== et)
                                         : [...current, et as EngagementType];
                                       setEditForm({ ...editForm, engagementTypes: next });
                                     }}
                                     className={cn(
                                       "px-3 py-1.5 rounded-lg text-base font-bold uppercase tracking-widest transition-all border",
                                       editForm.engagementTypes.includes(et as EngagementType)
                                         ? "bg-emerald-500 text-white border-emerald-500"
                                         : "bg-warm-gray text-[#0f172a]/40 border-transparent hover:border-slate-300/10"
                                     )}
                                   >
                                     {et.replace('-', ' ')}
                                   </button>
                                 ))}
                               </div>
                             </div>

                             <div className="space-y-2">
                               <p className="text-base font-bold text-[#0f172a]/40 uppercase tracking-widest ml-1">Tax Models</p>
                               <div className="flex flex-wrap gap-2">
                                 {['w2', 't4', 'c2c', '1099'].map((tt) => (
                                   <button
                                     key={tt}
                                     type="button"
                                     onClick={() => {
                                       const current = editForm.taxTypes;
                                       const next = current.includes(tt as TaxType)
                                         ? current.filter(i => i !== tt)
                                         : [...current, tt as TaxType];
                                       setEditForm({ ...editForm, taxTypes: next });
                                     }}
                                     className={cn(
                                       "px-3 py-1.5 rounded-lg text-base font-bold uppercase tracking-widest transition-all border",
                                       editForm.taxTypes.includes(tt as TaxType)
                                         ? "bg-amber-500 text-white border-amber-500"
                                         : "bg-warm-gray text-[#0f172a]/40 border-transparent hover:border-slate-300/10"
                                     )}
                                   >
                                     {tt}
                                   </button>
                                 ))}
                               </div>
                             </div>
                        </div>
                      ) : (
                        <p className="text-base font-bold text-[#0f172a] italic">
                          {user.industryTypes?.map(it => it.toUpperCase()).join(', ') || 'N/A'} | {user.engagementTypes?.map(et => et.toUpperCase()).join(', ') || 'N/A'} | {user.taxTypes?.map(tt => tt.toUpperCase()).join(', ') || 'N/A'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-[#0f172a]/40" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-bold text-[#0f172a]/20 uppercase tracking-widest">Location</p>
                      {isEditing ? (
                        <input 
                          value={editForm.location}
                          onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                          placeholder="e.g. San Francisco, CA"
                          className="w-full mt-1 p-2 bg-warm-gray rounded-lg text-base font-bold outline-none focus:bg-white focus:border-indigo-electric/20"
                        />
                      ) : (
                        <p className="text-base font-bold text-[#0f172a] italic">{user.location || 'Not Specified'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Clock className="w-5 h-5 text-[#0f172a]/40" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#0f172a]/20 uppercase tracking-widest">Active Since</p>
                      <p className="text-base font-bold text-[#0f172a] italic">{accountSince}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h5 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/20">Bio & Intelligence</h5>
                  {isEditing && (
                    <button
                      onClick={handleMagicSummary}
                      disabled={isGeneratingAI}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric text-white rounded-full text-base font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50"
                    >
                      {isGeneratingAI ? <Sparkles className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                      {isGeneratingAI ? 'Processing...' : 'Magic Summary'}
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Professional summary..."
                    className="w-full h-32 p-4 bg-warm-gray rounded-2xl text-base font-medium outline-none focus:bg-white focus:border-indigo-electric/20 resize-none"
                  />
                ) : (
                  <p className="text-base text-[#0f172a]/60 font-medium leading-relaxed italic">
                    {user.bio || 'Provide a professional bio to enhance your discovery profile across the network.'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-slate-300/5">
              <h5 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/20 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" /> Expertise DNA
              </h5>
              {isEditing ? (
                <input 
                  value={editForm.skills}
                  onChange={(e) => setEditForm({...editForm, skills: e.target.value})}
                  placeholder="React, TypeScript, Cloud Architecture (Comma Separated)"
                  className="w-full p-4 bg-warm-gray rounded-2xl text-base font-bold outline-none focus:bg-white focus:border-indigo-electric/20"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? user.skills.map((skill, i) => (
                    <span key={i} className="px-5 py-2 bg-warm-gray/30 rounded-xl text-base font-bold text-[#0f172a]/60">
                      {skill}
                    </span>
                  )) : (
                    <p className="text-base font-bold text-[#0f172a]/30 italic">No skills listed yet.</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-10 border-t border-slate-300/5 flex gap-4">
              {!isEditing && (
                <>
                  <button className="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                    <ExternalLink className="w-4 h-4" /> Share Discovery Profile
                  </button>
                  <button className="flex-1 py-4 bg-warm-gray text-[#0f172a]/60 rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-3">
                    <Building2 className="w-4 h-4" /> Company Insights
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Advanced Analytics (Only for non-free or company users) */}
          {(user.userPlan !== 'free' || user.isCompanyUser || user.userLevel === 'universal') ? (
            <div className="bg-white p-12 rounded-[3rem] border border-slate-300/5 shadow-2xl shadow-midnight/5 flex flex-col gap-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[80px]" />
               
               <div className="flex items-center justify-between z-10 relative">
                 <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="text-base font-bold uppercase tracking-widest">Advanced Analysis</span>
                    </div>
                    <h4 className="text-2xl font-serif font-bold italic text-[#0f172a]">Performance & Activity Insights</h4>
                    <p className="text-[#0f172a]/60 text-base font-medium">Deep AI review of your resume and recent engagement history.</p>
                 </div>
                 <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2">
                   <Zap className="w-4 h-4" /> Generate Report
                 </button>
               </div>
               
               {/* Mock output block */}
               <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <h5 className="font-bold text-[#0f172a] mb-2 uppercase tracking-widest text-xs opacity-50">Market Fit</h5>
                   <p className="font-serif italic text-lg text-[#0f172a]/80">Your profile aligns heavily with Series B-C Fintech startups looking for architectural scale.</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <h5 className="font-bold text-[#0f172a] mb-2 uppercase tracking-widest text-xs opacity-50">Engagement</h5>
                   <p className="font-serif italic text-lg text-[#0f172a]/80">Top 12% in platform response rate. High signal in System Design conversations.</p>
                 </div>
                 <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                   <h5 className="font-bold text-[#0f172a] mb-2 uppercase tracking-widest text-xs opacity-50">Next Optimal Move</h5>
                   <p className="font-serif italic text-lg text-[#0f172a]/80">Pivot your keyword focus slightly towards "MLOps" to catch the emerging Enterprise gap.</p>
                 </div>
               </div>
            </div>
          ) : (
            <div className="bg-indigo-electric p-12 rounded-[3rem] text-white flex items-center justify-between shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
               <div className="space-y-2 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-base font-bold uppercase tracking-widest">Pro Insight</span>
                  </div>
                  <h4 className="text-2xl font-serif font-bold italic">Upgrade to Elite Intelligence</h4>
                  <p className="text-white/60 text-base font-medium">Unlock deep AI analysis on your resume, activity, and communication performance.</p>
               </div>
               <button className="px-10 py-5 bg-white text-indigo-electric rounded-full font-bold text-base uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10 relative z-10">Go Elite</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
