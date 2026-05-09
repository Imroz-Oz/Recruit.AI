import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Linkedin, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  Eye, 
  Search, 
  Sparkles, 
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Globe,
  Share2,
  Cpu,
  BarChart3
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, setDoc } from 'firebase/firestore';
import { generateLinkedInOptimizations } from '@/src/services/aiService';

import OutreachGenerator from '@/src/components/OutreachGenerator';

// ... other imports

export default function LinkedInIntelligencePage({ isConnected, onConnect, myProfile }: { isConnected: boolean; onConnect: () => void; myProfile?: any }) {
  const [userProfile, setUserProfile] = useState<any>(myProfile || null);
  const [targetGoal, setTargetGoal] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRoadmapActive, setIsRoadmapActive] = useState(false);
  const [strategy, setStrategy] = useState<{
    topSkills?: string[];
    headlineSuggestions: string[];
    summaryTwist: string;
    connectionStrategy: string;
    contentIdeas?: string[];
    networkingMessages?: {
      coldOutreach: string;
      followUp: string;
    };
    iceBreakers?: string[];
    mockConnections?: {
      name: string;
      title: string;
      linkedInMockUrl: string;
      insight: string;
    }[];
  } | null>(null);
  
  useEffect(() => {
    if (myProfile) {
      setUserProfile(myProfile);
    } else {
      const fetchUser = async () => {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        }
      };
      fetchUser();
    }
  }, [myProfile]);
  
  const [isGlowingUp, setIsGlowingUp] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock Stats - In a real app, these would come from the LinkedIn API or a cached sync
  const stats = [
    { label: 'Connections', value: '5,420', icon: Users, color: 'text-blue-500' },
    { label: 'Followers', value: '12,894', icon: Target, color: 'text-purple-500' },
    { label: 'Profile Views (7d)', value: '842', icon: Eye, color: 'text-green-500' },
    { label: 'Search Appearances', value: '156', icon: Search, color: 'text-indigo-500' },
  ];

  const handleSyncProfile = async () => {
    setIsSyncing(true);
    setTimeout(async () => {
      try {
        const syncedData = {
          headshotUrl: userProfile?.headshotUrl || auth.currentUser?.photoURL || "",
          title: userProfile?.title || "Lead Solutions Architect",
          about: userProfile?.about || "Innovative engineering leader with deep expertise in AI infrastructure and high-availability systems. Passionate about empowering teams and scaling products globally.",
          displayName: userProfile?.displayName || userProfile?.name || auth.currentUser?.email?.split('@')[0] || "Professional User"
        };
        
        setUserProfile((prev: any) => ({ ...prev, ...syncedData }));
        
        if (auth.currentUser) {
          await setDoc(doc(db, 'users', auth.currentUser.uid), syncedData, { merge: true });
        }
      } catch (err) {
        console.error("Sync Error", err);
      } finally {
        setIsSyncing(false);
      }
    }, 2000);
  };

  const handleGlowUp = async () => {
    setIsGlowingUp(true);
    // Simulate AI Glow Up process
    setTimeout(() => {
      setUserProfile(prev => ({
        ...prev,
        title: prev?.title ? `Visionary ${prev.title}` : 'Visionary Full Stack Architect & Tech Leader | Driving AI Innovation @ Scale',
        about: '🚀 Transforming complex business problems into scalable, elegant technical solutions. Specializing in high-performance distributed systems, cloud architecture, and building world-class engineering teams. Always pushing the boundaries of what is possible with AI and modern web paradigms.'
      }));
      setIsGlowingUp(false);
    }, 2500);
  };
  
  const handleGenerateStrategy = async () => {
    if (!targetGoal) return;
    setIsAnalyzing(true);
    setIsRoadmapActive(false);
    try {
      const result = await generateLinkedInOptimizations(targetGoal, targetCompany || 'Top Tech Companies');
      setStrategy(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col gap-10 p-8 max-w-7xl mx-auto w-full @container">
        <div className="text-center max-w-3xl mx-auto mt-12 space-y-6 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-electric/20 rounded-full blur-[120px] -z-10" />
          
          <div className="w-24 h-24 bg-gradient-to-br from-[#0077b5] to-indigo-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-8 border border-white/20">
            <Linkedin className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-5xl font-serif font-black italic text-[#0f172a]">
            Supercharge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0077b5] to-indigo-600">Network DNA</span>
          </h1>
          <p className="text-lg text-[#0f172a]/60 font-medium leading-relaxed">
            Connect your LinkedIn account to unlock deep professional intelligence, automated profile optimization, network velocity tracking, and strategic global sourcing capabilities.
          </p>
          
          <div className="pt-8">
            <button 
              onClick={onConnect}
              className="px-10 py-5 bg-[#0077b5] text-white rounded-2xl font-black text-base uppercase tracking-[0.2em] hover:bg-[#005582] transition-all shadow-xl shadow-blue-500/30 flex items-center gap-4 mx-auto group"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              Authenticate with LinkedIn
            </button>
            <p className="text-base text-[#0f172a]/40 mt-4 font-medium"><ShieldCheck className="w-3 h-3 inline mr-1" /> Secure OAuth 2.0 Connection. We never post without permission.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-xl shadow-midnight/5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-3">AI Profile Optimization</h3>
            <p className="text-base text-[#0f172a]/60 leading-relaxed font-medium">Get customized headline and summary generation tailored to your target company or next career evolution.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-[#1e293b] text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-midnight/30">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-white/10">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-3">Global X-Ray Sourcing</h3>
              <p className="text-base text-white/60 leading-relaxed font-medium">Activate cross-reference searching across LinkedIn data structures to find hidden candidates and connections.</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-[60px]" />
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-xl shadow-midnight/5">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-3">Network Velocity</h3>
            <p className="text-base text-[#0f172a]/60 leading-relaxed font-medium">Track your Social Selling Index (SSI) equivalents, profile reach, and algorithmic impact seamlessly.</p>
          </div>
        </div>

        {/* Mock Analysis UI snippet to build hype */}
        <div className="mt-10 bg-[#1e293b]/2 rounded-3xl p-10 border border-slate-300/5 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
           <div className="flex-1 space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/10 text-coral rounded-xl text-base font-bold uppercase tracking-widest border border-coral/20">
                <Eye className="w-3 h-3" /> Sneak Peek
              </div>
              <h3 className="text-2xl font-serif font-bold italic text-[#0f172a]">Stop guessing. Start accelerating.</h3>
              <p className="text-[#0f172a]/60 font-medium leading-relaxed">Our proprietary Engine maps your profile against millions of data points to ensure you aren't just seen, but pursued.</p>
           </div>
           
           <div className="flex-1 w-full bg-white rounded-[2rem] p-6 shadow-2xl shadow-midnight/10 border border-slate-300/5 rotate-2 hover:rotate-0 transition-transform duration-500">
             <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-300/5">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-gradient-to-br from-indigo-electric to-blue-600 rounded-xl flex items-center justify-center text-white"><Target className="w-5 h-5"/></div>
                 <div>
                   <div className="h-4 w-32 bg-[#1e293b]/5 rounded-md mb-2"></div>
                   <div className="h-3 w-20 bg-[#1e293b]/5 rounded-md"></div>
                 </div>
               </div>
               <div className="text-right">
                 <div className="text-base font-bold uppercase tracking-widest text-emerald-500 mb-1">Match Rate</div>
                 <div className="text-xl font-black text-[#0f172a] italic">94%</div>
               </div>
             </div>
             <div className="space-y-4">
                <div className="h-2 w-full bg-[#1e293b]/5 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-indigo-electric"></div></div>
                <div className="h-2 w-full bg-[#1e293b]/5 rounded-full overflow-hidden"><div className="h-full w-[60%] bg-blue-500"></div></div>
                <div className="h-2 w-full bg-[#1e293b]/5 rounded-full overflow-hidden"><div className="h-full w-[90%] bg-emerald-400"></div></div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full @container">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold italic text-[#0f172a] flex items-center gap-3">
            LinkedIn Intelligence <Cpu className="w-8 h-8 text-indigo-electric animate-pulse" />
          </h1>
          <p className="text-[#0f172a]/60 font-medium mt-2">Strategic profile analysis and growth roadmap.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-electric/10 text-indigo-electric rounded-full border border-indigo-electric/20 text-base font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" /> API Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-300/5 shadow-2xl shadow-midnight/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full p-1 bg-[#1e293b] text-white flex items-center justify-center font-serif font-bold text-5xl italic shadow-2xl shadow-midnight/30 mx-auto transition-transform group-hover:scale-105 overflow-hidden">
                  {(userProfile?.headshotUrl || (auth.currentUser?.photoURL && auth.currentUser.photoURL !== '')) ? (
                    <img 
                      src={userProfile?.headshotUrl || auth.currentUser?.photoURL} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-full bg-white"
                    />
                  ) : (
                    (userProfile?.displayName?.[0] || userProfile?.name?.[0] || auth.currentUser?.email?.[0] || '?').toUpperCase()
                  )}
                </div>
                <div className="absolute bottom-1 right-1 p-2 bg-blue-600 rounded-full border-2 border-white shadow-lg">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-[#0f172a] mt-5">{userProfile?.displayName || userProfile?.name || 'Alex Rivera'}</h2>
              <p className="text-base font-bold text-[#0f172a]/60 mt-1 leading-snug">{userProfile?.title || 'Full Stack Architect & AI Enthusiast'}</p>
              
              {userProfile?.about && (
                <p className="text-sm font-medium text-[#0f172a]/50 mt-4 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  "{userProfile.about}"
                </p>
              )}

              <div className="flex flex-col gap-3 mt-6 w-full justify-center">
                <button 
                  onClick={handleGlowUp}
                  disabled={isGlowingUp}
                  className="w-full py-3 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                >
                  {isGlowingUp ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isGlowingUp ? 'Glow Up In Progress...' : 'Glow Up Profile'}
                </button>
                <button 
                  onClick={handleSyncProfile}
                  disabled={isSyncing}
                  className="w-full py-3 bg-[#1e293b] text-white rounded-2xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0f172a] transition-all shadow-lg shadow-midnight/20 disabled:opacity-50"
                >
                  {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  {isSyncing ? 'Syncing...' : 'Sync Profile Data'}
                </button>
              </div>

              {strategy?.topSkills && (
                 <div className="mt-6 w-full text-left">
                   <p className="text-xs font-black text-[#0f172a]/40 uppercase tracking-[0.2em] mb-3 text-center">AI-Identified Core Identity</p>
                   <div className="flex flex-wrap gap-2 justify-center">
                     {strategy.topSkills.map((s, i) => (
                       <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-indigo-100">
                         {s}
                       </span>
                     ))}
                   </div>
                 </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-300/5 grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 bg-[#1e293b]/2 rounded-2xl flex flex-col items-center text-center">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-3`} />
                  <p className="text-xs font-black text-[#0f172a]/40 uppercase tracking-[0.2em]">{stat.label}</p>
                  <p className="text-xl font-black text-[#0f172a] mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="bg-[#1e293b] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold tracking-tight mb-4">Network Insights</h3>
              <p className="text-base text-white/50 leading-relaxed mb-6">Your current activity is outperforming 85% of peers in your sector.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-white/40 uppercase tracking-widest">Industry Engagement</span>
                  <span className="text-base font-bold text-indigo-electric">+12%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    className="h-full bg-indigo-electric"
                  />
                </div>
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-base font-bold text-white/40 uppercase tracking-widest">Skill Validation Rate</span>
                  <span className="text-base font-bold text-indigo-electric">High</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    className="h-full bg-indigo-electric shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                  />
                </div>
              </div>
            </div>
            {/* Visual Flair */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-electric/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Right Column: AI Analysis & Strategy */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-10 border border-slate-300/5 shadow-2xl shadow-midnight/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-electric/10 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-electric" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold italic text-[#0f172a]">Strategic Growth Engine</h2>
                <p className="text-base font-medium text-[#0f172a]/40">Define your objective to unlock tailored LinkedIn optimizations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Target Role / Goal</label>
                <div className="relative">
                  <input 
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    placeholder="e.g. Senior Engineering Manager" 
                    className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium placeholder:text-[#0f172a]/20"
                  />
                  <Zap className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Target Company (Optional)</label>
                <div className="relative">
                  <input 
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. OpenAI, Stripe, Netflix" 
                    className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium placeholder:text-[#0f172a]/20"
                  />
                  <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 opacity-50" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateStrategy}
              disabled={!targetGoal || isAnalyzing}
              className="w-full group flex items-center justify-center gap-3 px-8 py-5 bg-[#1e293b] text-white rounded-2xl font-bold text-sm uppercase tracking-[0.2em] hover:bg-indigo-electric transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Analyzing Network DNA...
                </>
              ) : (
                <>
                  Generate Tactical Roadmap <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {strategy ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6">
                      <h4 className="text-base font-black uppercase tracking-[0.3em] text-indigo-electric flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Headline Mastery
                      </h4>
                      <div className="space-y-4">
                        {strategy.headlineSuggestions.map((h, i) => (
                          <div key={i} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between group">
                            <p className="text-sm font-bold text-[#0f172a] italic">"{h}"</p>
                            <button className="text-indigo-electric opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6">
                      <h4 className="text-base font-black uppercase tracking-[0.3em] text-coral flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> About Section Twist
                      </h4>
                      <p className="text-base font-medium text-[#0f172a]/70 leading-[1.8] italic bg-coral/5 p-6 rounded-3xl border border-coral/10">
                        "{strategy.summaryTwist}"
                      </p>
                   </div>
                   
                   {strategy.contentIdeas && strategy.contentIdeas.length > 0 && (
                     <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6 md:col-span-2">
                        <h4 className="text-base font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-2">
                          <Share2 className="w-4 h-4" /> Post & Content Strategy
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {strategy.contentIdeas.map((idea, i) => (
                            <div key={i} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-start">
                               <p className="text-sm font-bold text-[#0f172a] italic leading-relaxed">"{idea}"</p>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                   
                   {strategy.networkingMessages && (
                     <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6 md:col-span-2">
                        <h4 className="text-base font-black uppercase tracking-[0.3em] text-blue-500 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> Outreach Templates
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-6 bg-blue-50 text-blue-900 rounded-3xl">
                            <h5 className="font-bold text-sm uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-200 pb-2">Cold Outreach</h5>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{strategy.networkingMessages.coldOutreach}</p>
                          </div>
                          <div className="p-6 bg-blue-50 text-blue-900 rounded-3xl">
                            <h5 className="font-bold text-sm uppercase tracking-widest text-blue-600 mb-3 border-b border-blue-200 pb-2">Follow Up</h5>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{strategy.networkingMessages.followUp}</p>
                          </div>
                        </div>
                     </div>
                   )}
                   
                   {strategy.iceBreakers && strategy.iceBreakers.length > 0 && (
                     <div className="bg-[#1e293b]/5 p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6 md:col-span-2">
                        <h4 className="text-base font-black uppercase tracking-[0.3em] text-indigo-600 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> AI Generated Icebreakers
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {strategy.iceBreakers.map((ice, i) => (
                            <div key={i} className="p-6 bg-white rounded-2xl border border-white/40 shadow-sm flex flex-col justify-start relative group">
                               <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold absolute -top-4 -left-4 shadow-sm border border-indigo-100">
                                 {i + 1}
                               </div>
                               <p className="text-sm font-bold text-[#0f172a] italic leading-relaxed">"{ice}"</p>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>

                <div className="bg-[#1e293b] text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                      <div className="md:col-span-2 space-y-6">
                        <h3 className="text-2xl font-serif font-bold italic text-indigo-200">Connection Velocity Roadmap</h3>
                        <p className="text-base text-white/50 leading-relaxed font-medium">Tactical approach to leveraging networks within {targetCompany || 'target ecosystems'}.</p>
                        
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                           <h5 className="text-base font-bold uppercase tracking-widest text-indigo-300 mb-4">Core Strategy</h5>
                           <p className="text-sm leading-relaxed italic text-white/80">{strategy.connectionStrategy}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                          <p className="text-base font-bold uppercase tracking-widest text-white/20 mb-2">Reach Acceleration</p>
                          <div className="text-3xl font-serif font-bold italic text-emerald-400">+420%</div>
                        </div>
                        <button 
                          onClick={() => setIsRoadmapActive(true)}
                          className="w-full py-4 bg-indigo-electric text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-white hover:text-[#0f172a] transition-colors"
                        >
                          Activate Roadmap
                        </button>
                      </div>
                   </div>
                   
                   <AnimatePresence>
                     {isRoadmapActive && strategy.mockConnections && (
                       <motion.div 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="relative z-10 mt-10 pt-10 border-t border-white/10 overflow-hidden"
                       >
                         <h4 className="text-xl font-bold text-white mb-6">High-Value Target Connections</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {strategy.mockConnections.map((conn, idx) => (
                              <div key={idx} className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:border-indigo-400/50 transition-colors flex flex-col items-start text-left">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold mb-4">
                                  {conn.name.charAt(0)}
                                </div>
                                <h5 className="font-bold text-white text-lg">{conn.name}</h5>
                                <p className="text-white/60 text-sm mb-4 leading-tight">{conn.title}</p>
                                <p className="text-sm text-white/50 italic mb-6 flex-1">"{conn.insight}"</p>
                                <button 
                                  onClick={() => window.open(conn.linkedInMockUrl.startsWith('http') ? conn.linkedInMockUrl : `https://${conn.linkedInMockUrl}`, '_blank')}
                                  className="w-full py-2 bg-white/10 hover:bg-white text-white hover:text-[#0f172a] rounded-lg text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                  <Linkedin className="w-3 h-3" /> Connect
                                </button>
                              </div>
                           ))}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                   <div className="absolute top-0 right-0 w-56 h-64 bg-indigo-electric/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                </div>
              </motion.div>
            ) : !isAnalyzing && (
              <div className="h-[400px] bg-[#1e293b]/2 rounded-3xl border-2 border-dashed border-slate-300/5 flex flex-col items-center justify-center text-center p-12">
                <div className="max-w-xs flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-inner flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-[#0f172a]/20" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a]/40 italic">Waiting for Intelligence Protocol...</h3>
                  <p className="text-base text-[#0f172a]/20 mt-2">Enter your professional goals above to receive a deep-dive analysis of your digital presence.</p>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* New Section: Smart Outreach Engine */}
          <div className="mt-8">
            <OutreachGenerator myProfile={userProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Generic User Icon for fallback
const User = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/>
  </svg>
);


