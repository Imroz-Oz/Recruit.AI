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
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { generateLinkedInOptimizations } from '@/src/services/aiService';

const LinkedInIntelligencePage = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [targetGoal, setTargetGoal] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [strategy, setStrategy] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      }
    };
    fetchUser();
  }, []);
  
  // Mock Stats - In a real app, these would come from the LinkedIn API or a cached sync
  const stats = [
    { label: 'Network Reach', value: '1.2k+', icon: Users, color: 'text-blue-500' },
    { label: 'Profile Views (7d)', value: '+24%', icon: Eye, color: 'text-green-500' },
    { label: 'Search Appearances', value: '82', icon: Search, color: 'text-indigo-500' },
    { label: 'Social Selling Index', value: '74/100', icon: BarChart3, color: 'text-violet' },
  ];

  const handleGenerateStrategy = async () => {
    if (!targetGoal) return;
    setIsAnalyzing(true);
    try {
      const result = await generateLinkedInOptimizations(targetGoal, targetCompany || 'Top Tech Companies');
      setStrategy(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold italic text-midnight flex items-center gap-3">
            LinkedIn Intelligence <Cpu className="w-8 h-8 text-indigo-electric animate-pulse" />
          </h1>
          <p className="text-midnight/60 font-medium mt-2">Strategic profile analysis and growth roadmap.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-electric/10 text-indigo-electric rounded-full border border-indigo-electric/20 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3" /> API Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-1 space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-midnight/5 shadow-2xl shadow-midnight/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-electric to-blue-600 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    <User className="w-12 h-12 text-midnight/20" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 bg-blue-600 rounded-full border-2 border-white">
                  <Linkedin className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-midnight mt-4">{userProfile?.displayName || userProfile?.name || 'Alex Rivera'}</h2>
              <p className="text-sm font-medium text-midnight/40 tracking-tight">{userProfile?.title || 'Full Stack Architect & AI Enthusiast'}</p>
              
              <div className="flex gap-2 mt-6">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Share2 className="w-3 h-3" /> Share Profile
                </button>
                <button className="p-2 bg-midnight/5 text-midnight rounded-xl hover:bg-midnight/10 transition-colors">
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-midnight/5 grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 bg-midnight/2 rounded-2xl">
                  <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                  <p className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest leading-none">{stat.label}</p>
                  <p className="text-lg font-bold text-midnight mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="bg-midnight rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold tracking-tight mb-4">Network Insights</h3>
              <p className="text-xs text-white/50 leading-relaxed mb-6">Your current activity is outperforming 85% of peers in your sector.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Industry Engagement</span>
                  <span className="text-xs font-bold text-indigo-electric">+12%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '75%' }}
                    className="h-full bg-indigo-electric"
                  />
                </div>
                
                <div className="flex justify-between items-end pt-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Skill Validation Rate</span>
                  <span className="text-xs font-bold text-indigo-electric">High</span>
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
          <div className="bg-white rounded-[2.5rem] p-10 border border-midnight/5 shadow-2xl shadow-midnight/5">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-electric/10 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-indigo-electric" />
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold italic text-midnight">Strategic Growth Engine</h2>
                <p className="text-sm font-medium text-midnight/40">Define your objective to unlock tailored LinkedIn optimizations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-midnight uppercase tracking-widest ml-1">Target Role / Goal</label>
                <div className="relative">
                  <input 
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    placeholder="e.g. Senior Engineering Manager" 
                    className="w-full bg-midnight/2 border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium placeholder:text-midnight/20"
                  />
                  <Zap className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400 opacity-50" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-midnight uppercase tracking-widest ml-1">Target Company (Optional)</label>
                <div className="relative">
                  <input 
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. OpenAI, Stripe, Netflix" 
                    className="w-full bg-midnight/2 border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium placeholder:text-midnight/20"
                  />
                  <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400 opacity-50" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateStrategy}
              disabled={!targetGoal || isAnalyzing}
              className="w-full group flex items-center justify-center gap-3 px-8 py-5 bg-midnight text-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-indigo-electric transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
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
                className="bg-indigo-electric/[0.03] rounded-[2.5rem] p-10 border border-indigo-electric/10 relative overflow-hidden"
              >
                <div className="absolute top-10 right-10 opacity-10">
                  <Sparkles className="w-24 h-24 text-indigo-electric" />
                </div>
                
                <h3 className="text-xl font-bold text-indigo-electric flex items-center gap-2 mb-6 uppercase tracking-tight">
                  <Sparkles className="w-5 h-5" /> Tactical Deployment Strategy
                </h3>

                <div className="prose prose-sm max-w-none text-midnight/70 leading-relaxed font-medium space-y-4">
                  {strategy.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                <div className="mt-10 flex gap-4">
                  <button className="flex-1 px-8 py-4 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-midnight/90 transition-all">
                    Apply Optimizations
                  </button>
                  <button className="px-8 py-4 bg-white border border-midnight/10 text-midnight rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-midnight/5 transition-all">
                    Export PDF
                  </button>
                </div>
              </motion.div>
            ) : !isAnalyzing && (
              <div className="h-[400px] bg-midnight/2 rounded-[2.5rem] border-2 border-dashed border-midnight/5 flex flex-center items-center justify-center text-center p-12">
                <div className="max-w-xs flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-inner flex items-center justify-center mb-6">
                    <BarChart3 className="w-8 h-8 text-midnight/20" />
                  </div>
                  <h3 className="text-lg font-bold text-midnight/40 italic">Waiting for Intelligence Protocol...</h3>
                  <p className="text-xs text-midnight/20 mt-2">Enter your professional goals above to receive a deep-dive analysis of your digital presence.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
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

export default LinkedInIntelligencePage;
