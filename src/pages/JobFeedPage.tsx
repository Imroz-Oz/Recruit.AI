import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Filter, 
  Zap,
  Star,
  ExternalLink,
  Globe,
  ChevronDown,
  Sparkles,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '@/src/lib/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query } from 'firebase/firestore';

import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string; // FTE, Contract, C2H
  posted: string;
  tags: string[];
  matchScore: number;
  source: string;
}

const JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    company: 'Linear',
    location: 'Remote (US)',
    salary: '$180k - $240k',
    type: 'FTE',
    posted: '2h ago',
    tags: ['Product Design', 'Systems', 'Motion'],
    matchScore: 98,
    source: 'LinkedIn'
  },
  {
    id: '2',
    title: 'Lead Frontend Engineer',
    company: 'Vercel',
    location: 'Global Remote',
    salary: '$210k - $280k',
    type: 'FTE',
    posted: '5h ago',
    tags: ['React', 'Next.js', 'Typescript'],
    matchScore: 94,
    source: 'Vercel Careers'
  },
  {
    id: '3',
    title: 'Design Systems Architect',
    company: 'Stripe',
    location: 'NYC / Seattle',
    salary: '$200k+',
    type: 'Contract',
    posted: '1d ago',
    tags: ['Design Systems', 'Figma', 'React'],
    matchScore: 89,
    source: 'Indeed'
  },
  {
    id: '4',
    title: 'Senior AI Engineer',
    company: 'Anthropic',
    location: 'San Francisco',
    salary: '$250k - $400k',
    type: 'FTE',
    posted: '3h ago',
    tags: ['ML', 'LLMs', 'Python'],
    matchScore: 85,
    source: 'TechCrunch Jobs'
  },
  {
    id: '5',
    title: 'UI/UX Contractor',
    company: 'Airbnb',
    location: 'Remote',
    salary: '$120/hr',
    type: 'Contract',
    posted: '6h ago',
    tags: ['UI', 'UX', 'Mobile'],
    matchScore: 78,
    source: 'Greenhouse'
  }
];

export default function JobFeedPage({ preSearchCandidate }: { preSearchCandidate?: any }) {
  const [searchQuery, setSearchQuery] = useState(preSearchCandidate ? preSearchCandidate.title : '');
  const [filterType, setFilterType] = useState('All Market');
  const [industry, setIndustry] = useState('All Sectors');
  const [salaryRange, setSalaryRange] = useState('Any');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [jobUrl, setJobUrl] = useState('');
  const [portalAnalysis, setPortalAnalysis] = useState<any | null>(null);

  const handlePortalMatch = async () => {
    if (!jobUrl.trim() || !preSearchCandidate) {
      if (!preSearchCandidate) alert("Please select a candidate from Library/Vault to perform Reverse Market Match.");
      return;
    }
    setIsAiScanning(true);
    try {
      let content = jobUrl;
      // If it looks like a URL, we can attempt to extract it, but since we don't have a backend proxy configured for external scraping, 
      // we'll instruct the user to paste the raw text. For this demo, we'll try to extract directly from the pasted content.
      
      const { extractJobDetailsFromText, analyzeCandidateMatch } = await import('../services/aiService');
      const extractedJD = await extractJobDetailsFromText(content);
      
      const candidateContext = {
        name: preSearchCandidate.name,
        title: preSearchCandidate.title,
        resumeSnippet: preSearchCandidate.resumeSnippet,
        skills: preSearchCandidate.skills
      };
      
      const data = await analyzeCandidateMatch(extractedJD, candidateContext);
      
      // Adapt AI response Format for JobFeedPage UI
      setPortalAnalysis({
        score: data.score,
        recommendations: [
          data.insight || "AI analyzed the core capabilities against JD requirements.",
          "Consider emphasizing leadership examples based on the parsed description."
        ]
      });
    } catch (error) {
      console.error("Portal Match Error:", error);
      alert("Failed to analyze job details. Please try pasting the text instead.");
    } finally {
      setIsAiScanning(false);
    }
  };

  const performAiScan = async () => {
    setIsAiScanning(true);
    await new Promise(r => setTimeout(r, 4000));
    setIsAiScanning(false);
  };

  useEffect(() => {
    if (preSearchCandidate) {
      setSearchQuery(preSearchCandidate.title);
    }
  }, [preSearchCandidate]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!auth.currentUser) return;
      setIsSyncing(true);
      const path = `users/${auth.currentUser.uid}/savedJobs`;
      try {
        const q = query(collection(db, 'users', auth.currentUser.uid, 'savedJobs'));
        const querySnapshot = await getDocs(q);
        const ids = new Set(querySnapshot.docs.map(doc => doc.id));
        setSavedJobIds(ids);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setIsSyncing(false);
      }
    };
    fetchSavedJobs();
  }, []);

  const toggleSaveJob = async (job: Job) => {
    if (!auth.currentUser) return;
    
    const isSaved = savedJobIds.has(job.id);
    const newSavedIds = new Set(savedJobIds);
    
    const path = `users/${auth.currentUser.uid}/savedJobs/${job.id}`;
    try {
      if (isSaved) {
        newSavedIds.delete(job.id);
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'savedJobs', job.id));
      } else {
        newSavedIds.add(job.id);
        await setDoc(doc(db, 'users', auth.currentUser.uid, 'savedJobs', job.id), {
          ...job,
          savedAt: new Date().toISOString()
        });
      }
      setSavedJobIds(newSavedIds);
    } catch (error) {
      handleFirestoreError(error, isSaved ? OperationType.DELETE : OperationType.WRITE, path);
    }
  };

  const filteredJobs = JOBS.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'All Market' || 
                        (filterType === 'Contract' && job.type === 'Contract') ||
                        (filterType === 'FTE' && job.type === 'FTE') ||
                        (filterType === 'C2H' && job.type === 'C2H');
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-300/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-100">
            <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-base font-bold uppercase tracking-[0.2em] text-emerald-600">
              Live Market Feed Active
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">Opportunity Orbit</h2>
          <p className="text-[#0f172a]/50 font-medium max-w-xl italic">
            Elite-tier selection orbit mapped to your unique professional DNA across the global enterprise landscape.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          <button 
            onClick={performAiScan}
            disabled={isAiScanning}
            className={cn(
              "px-8 py-3 rounded-2xl font-bold text-base uppercase tracking-widest flex items-center gap-3 transition-all relative overflow-hidden",
              isAiScanning ? "bg-indigo-electric text-white" : "bg-white border-2 border-slate-300/5 text-[#0f172a] hover:border-indigo-electric/30 shadow-sm"
            )}
          >
             {isAiScanning ? (
               <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning Global Orbits...
               </>
             ) : (
               <>
                <Sparkles className="w-4 h-4 text-indigo-electric" />
                AI Market Pulse
               </>
             )}
             {isAiScanning && (
               <motion.div 
                 initial={{ x: '-100%' }}
                 animate={{ x: '100%' }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-0 bg-white/20 skew-x-12"
               />
             )}
          </button>

          <div className="px-6 py-3 bg-white rounded-2xl border border-slate-300/5 shadow-sm flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Candidate DNA Match</p>
              <p className="text-base font-serif font-bold text-emerald-600">High Resolution</p>
            </div>
            <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-600 fill-current" />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isAiScanning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-indigo-electric/5 via-white to-coral/5 p-12 rounded-[4rem] border border-indigo-100 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl shadow-indigo-500/5">
              <div className="flex flex-wrap justify-center gap-6 text-base font-bold uppercase tracking-[0.3em] text-[#0f172a]/20">
                 <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> LinkedIn Recruiter API</span>
                 <span className="flex items-center gap-2"><Globe className="w-4 h-4" /> Greenhouse Enterprise</span>
                 <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Lever Sourcing Hub</span>
                 <span className="flex items-center gap-2"><Search className="w-4 h-4" /> Indeed Direct</span>
              </div>
              <div className="w-full max-w-xl h-2 bg-[#1e293b]/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4, ease: "easeInOut" }}
                  className="h-full bg-indigo-electric"
                />
              </div>
              <p className="text-xl font-serif font-bold italic text-indigo-electric animate-pulse">Decrypting matching missions from 8,400+ boards...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/20 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles, skills, or companies..." 
              className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-slate-300/5 outline-none focus:border-emerald-500/20 shadow-sm text-base font-medium"
            />
          </div>
          <div className="flex gap-2">
            {['All Market', 'FTE', 'Contract', 'C2H'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={cn(
                  "px-6 py-4 rounded-2xl border text-base font-bold transition-all whitespace-nowrap",
                  filterType === filter 
                    ? "bg-[#1e293b] text-white border-slate-300" 
                    : "bg-white text-[#0f172a]/50 border-slate-300/5 hover:border-emerald-500/20"
                )}
              >
                {filter}
              </button>
            ))}
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "p-4 rounded-2xl border transition-all",
                showAdvanced ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-[#0f172a]/40 border-slate-300/5"
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-slate-300/5 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#0f172a]/20" />
                  <select className="flex-1 bg-transparent text-base font-bold text-[#0f172a]/60 outline-none appearance-none">
                    <option>All Locations</option>
                    <option>Remote Only</option>
                    <option>San Francisco, CA</option>
                    <option>New York, NY</option>
                    <option>Austin, TX</option>
                  </select>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-300/5 flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-[#0f172a]/20" />
                  <select 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="flex-1 bg-transparent text-base font-bold text-[#0f172a]/60 outline-none appearance-none"
                  >
                    <option>All Sectors</option>
                    <option>Software / Tech</option>
                    <option>Fintech</option>
                    <option>Healthcare</option>
                    <option>E-commerce</option>
                  </select>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-300/5 flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-[#0f172a]/20" />
                  <select 
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="flex-1 bg-transparent text-base font-bold text-[#0f172a]/60 outline-none appearance-none"
                  >
                    <option>Any Salary</option>
                    <option>$100k - $150k</option>
                    <option>$150k - $200k</option>
                    <option>$200k+</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={job.id}
              className="group bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-warm-gray/10 rounded-2xl flex items-center justify-center font-serif font-bold text-xl text-[#0f172a]/30 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {job.company[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#0f172a] group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{job.title}</h3>
                    <p className="text-base font-medium text-[#0f172a]/60">{job.company} • {job.location}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-base font-bold uppercase tracking-widest flex items-center gap-1.5",
                    job.matchScore > 90 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    <Sparkles className="w-3 h-3" />
                    {job.matchScore}% Match
                  </div>
                  <p className="text-base font-bold text-[#0f172a]/20 uppercase tracking-widest">{job.posted}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-warm-gray/10 rounded-full text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-300/5">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[#0f172a]/40 font-bold text-base uppercase tracking-widest">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-[#0f172a]/40 font-bold text-base uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {job.type}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-xl text-base font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all">
                    Apply Now <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => toggleSaveJob(job)}
                    className={cn(
                      "p-3 rounded-xl transition-all",
                      savedJobIds.has(job.id) 
                        ? "bg-amber-50 text-amber-500" 
                        : "bg-warm-gray/10 text-[#0f172a]/30 hover:text-amber-500 hover:bg-amber-50"
                    )}
                  >
                    <Star className={cn("w-5 h-5", savedJobIds.has(job.id) && "fill-current")} />
                  </button>
                </div>
              </div>
              
              {/* Abstract hover reveal */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform" />
            </motion.div>
          )) : (
            <div className="bg-white/50 border-2 border-dashed border-slate-300/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-4">
              <Globe className="w-12 h-12 text-[#0f172a]/10 mb-4" />
              <p className="text-xl font-serif font-bold text-[#0f172a]/30 italic">No direct matches found in this sector.</p>
              <button 
                onClick={() => {setFilterType('All Market'); setSearchQuery('');}}
                className="text-base font-bold uppercase tracking-widest text-emerald-600 underline underline-offset-4"
              >
                Reset Market Filters
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="bg-[#1e293b] p-8 rounded-3xl text-white shadow-2xl shadow-midnight/40 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-2xl font-serif font-bold italic">AI Market Pulse</h4>
              <p className="text-white/50 text-base leading-relaxed font-medium">
                Your current visibility is high. Senior Designer roles are trending in your sector with a 12% salary bounce this week.
              </p>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl text-base font-bold uppercase tracking-[0.2em] transition-all">
                View Talent Trends
              </button>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-electric/20 rounded-full blur-[60px] translate-y-1/2 translate-x-1/2" />
          </div>

          {preSearchCandidate && (
             <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6 animate-in slide-in-from-right duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-serif font-bold text-lg italic">
                    {preSearchCandidate.name[0]}
                  </div>
                  <div>
                    <h5 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Target Candidate</h5>
                    <p className="text-base font-bold text-[#0f172a] tracking-tight">{preSearchCandidate.name}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-base font-black uppercase tracking-[0.2em] text-[#0f172a]/40 ml-1">Analyze Job Description / URL</label>
                  <div className="relative group/url">
                    <textarea 
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="Paste Raw Job Details or URL..."
                      className="w-full px-5 py-4 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-emerald-500/20 outline-none text-base font-bold transition-all min-h-[100px] resize-y"
                    />
                    <button 
                      onClick={handlePortalMatch}
                      disabled={isAiScanning}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1e293b] text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-all disabled:opacity-50"
                    >
                      {isAiScanning ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {portalAnalysis && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4 pt-4 border-t border-slate-300/5"
                    >
                      <div className="flex items-center justify-between">
                         <span className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40">Match Score</span>
                         <span className={cn(
                           "text-xl font-serif font-bold italic",
                           portalAnalysis.score > 80 ? "text-emerald-500" : "text-amber-500"
                         )}>{portalAnalysis.score}%</span>
                      </div>
                      <div className="space-y-2">
                        {portalAnalysis.recommendations.slice(0, 2).map((rec: string, i: number) => (
                          <div key={i} className="flex gap-2 p-3 bg-warm-gray/30 rounded-xl">
                            <Sparkles className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-base font-medium leading-relaxed text-[#0f172a]/60">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          )}

          <div className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm space-y-6">
            <h4 className="text-base font-bold uppercase tracking-[0.3em] text-[#0f172a]/20">Saved Searches</h4>
            <div className="space-y-4">
              {['Remote Design Ops', 'Lead Frontend Europe', 'Webflow SaaS'].map((search, i) => (
                <button key={i} className="w-full flex items-center justify-between p-4 bg-warm-gray/5 rounded-2xl hover:bg-emerald-50 transition-all text-left group">
                  <span className="text-base font-bold text-[#0f172a]/60 group-hover:text-emerald-600">{search}</span>
                  <ChevronDown className="w-4 h-4 text-[#0f172a]/20 -rotate-90" />
                </button>
              ))}
            </div>
            <button className="w-full py-3 text-base font-bold uppercase tracking-widest text-emerald-600 underline">
              Browse More Categories
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
