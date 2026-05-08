import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  Upload,
  Cpu,
  RefreshCw,
  Eye,
  Download,
  Search,
  Database,
  History,
  Terminal,
  Filter,
  Plus,
  Briefcase,
  Building,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Candidate } from '@/src/types';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where, getDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { generateRoleIntelligenceBrief } from '@/src/services/aiService';

interface ResumeVaultPageProps {
  userRole?: string;
}

export default function ResumeVaultPage({ userRole = 'recruiter' }: ResumeVaultPageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  // Recruiter Specific State
  const [booleanQuery, setBooleanQuery] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [roleNotes, setRoleNotes] = useState('');
  
  const [aiBrief, setAiBrief] = useState<any>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [showAiBrief, setShowAiBrief] = useState(false);
  
  const [isSearchingInternal, setIsSearchingInternal] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadStats, setUploadStats] = useState({ progress: 0, total: 0, current: 0, eta: '' });
  const [xRayLocation, setXRayLocation] = useState({ country: '', state: '', zip: '' });
  const [showLocationError, setShowLocationError] = useState(false);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  // Real-time listener for the vault
  useEffect(() => {
    if (!auth.currentUser) return;

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const fetchOrgAndCandidates = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
        if (!isMounted) return;
        const orgId = userDoc.data()?.organizationId || 'global';

        const q = query(
          collection(db, 'candidates'),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Candidate));
          setAllCandidates(fetched);
        }, (error) => {
          console.error("fetch candidates error:", error);
          if (error instanceof Error) {
            handleFirestoreError(error, OperationType.GET, 'candidates');
          }
        });
      } catch (err) {
        console.error("fetchOrg error:", err);
      }
    };

    fetchOrgAndCandidates();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [auth.currentUser]);

  const handleIngress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !auth.currentUser) return;

    const fileList = Array.from(files as unknown as File[]);
    setIsSyncing(true);
    setUploadStats({ progress: 0, total: fileList.length, current: 0, eta: 'Calculating...' });

    const startTime = Date.now();
    
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const orgId = userDoc.data()?.organizationId || 'global';

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Progress update
        const currentProgress = Math.round(((i) / fileList.length) * 100);
        
        // ETA
        const elapsed = (Date.now() - startTime) / 1000;
        const perFile = elapsed / (i || 1);
        const remaining = fileList.length - i;
        const etaSeconds = Math.round(remaining * perFile);
        const etaText = etaSeconds > 60 ? `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s` : `${etaSeconds}s`;

        setUploadStats({ 
          progress: currentProgress, 
          total: fileList.length, 
          current: i + 1,
          eta: i === 0 ? 'Starting...' : etaText
        });

        const reader = new FileReader();
        const textPromise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string || '');
          reader.readAsText(file);
        });
        
        const text = await textPromise;
        const talent = {
          recruiterId: auth.currentUser?.uid,
          organizationId: orgId,
          name: file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '),
          title: 'Imported Talent',
          email: `${file.name.split('.')[0].toLowerCase().replace(/\s+/g, '.')}@imported.com`,
          location: 'Global Vault',
          score: 90,
          resumeSnippet: text.slice(0, 500) || `Mission critical asset indexed from ${file.name}.`,
          keywords: [file.name.split('.')[0].toLowerCase(), 'vault', 'imported'],
          createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'candidates'), talent);
      }
      
      setUploadStats(prev => ({ ...prev, progress: 100, eta: 'Success!' }));

      // Success Notification
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #6366f1; color: white; padding: 16px 24px; border-radius: 16px; font-weight: bold; font-family: sans-serif; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); z-index: 9999; animation: slideIn 0.3s ease-out;">
          <style>@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }</style>
          ✓ ${fileList.length} Intelligence Assets Synchronized
        </div>
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);

      setTimeout(() => setIsSyncing(false), 2000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'candidates');
      setIsSyncing(false);
    }
  };

  const handleGenerateAIBrief = async () => {
    if (!jobDescription && !companyName && !roleNotes) return;
    setIsGeneratingBrief(true);
    setShowAiBrief(true);
    try {
      const response = await generateRoleIntelligenceBrief(jobDescription, companyName, roleNotes);
      setAiBrief(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleBooleanSearch = () => {
    let combinedQuery = booleanQuery;
    if (jobDescription.trim()) combinedQuery += ` AND ${jobDescription}`;
    if (companyName.trim()) combinedQuery += ` AND ${companyName}`;
    if (additionalDetails.trim()) combinedQuery += ` AND ${additionalDetails}`;
    
    if (!combinedQuery.trim()) {
      setFilteredCandidates([]);
      return;
    }
    
    setIsSearchingInternal(true);
    
    setTimeout(() => {
      const terms = combinedQuery.replace(/[()"]/g, '').split(/\s+AND\s+/).map(t => t.trim().toLowerCase());
      const results = allCandidates.filter(c => {
        const searchString = (c.name + ' ' + c.title + ' ' + (c.keywords?.join(' ') || '')).toLowerCase();
        return terms.every(term => searchString.includes(term));
      });
      setFilteredCandidates(results);
      setIsSearchingInternal(false);
    }, 1500); // giving slightly more time to simulate robust AI search
  };

  const handleXRaySearch = () => {
    const hasLocation = xRayLocation.country || xRayLocation.state || xRayLocation.zip;
    if (!hasLocation) {
      setShowLocationError(true);
      return;
    }
    
    setShowLocationError(false);
    if (!booleanQuery) return;
    
    const locationString = [xRayLocation.country, xRayLocation.state, xRayLocation.zip].filter(Boolean).join(' ');
    const fullQuery = encodeURIComponent(`${booleanQuery} "${locationString}"`);
    const url = `https://www.google.com/search?q=site:linkedin.com/in+(${fullQuery})`;
    
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full scrollbar-hide overflow-y-auto">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-electric/5 border border-indigo-electric/10">
          <Database className="w-4 h-4 text-indigo-electric" />
          <span className="text-base font-bold uppercase tracking-[0.2em] text-indigo-electric">
            Recruiter Enterprise Vault v4.0
          </span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">The <span className="text-indigo-electric">Talent</span> Archive</h2>
        <p className="text-[#0f172a]/50 font-medium max-w-xl mx-auto italic">
          Access the secure repository of internal assets using advanced boolean logic and semantic neural search.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Boolean Control Panel */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-slate-300/5 shadow-sm space-y-8 sticky top-8">
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                       <Terminal className="w-4 h-4 text-indigo-electric" />
                       <span className="text-base font-bold uppercase tracking-widest text-[#0f172a]">Mission Logic</span>
                    </div>
                    <div className="flex items-center gap-3">
                       {isSyncing && uploadStats.total > 0 && (
                         <div className="flex flex-col items-end mr-2">
                            <span className="text-[7px] font-black text-indigo-electric uppercase">ETA: {uploadStats.eta}</span>
                            <div className="w-16 h-1 bg-indigo-100 rounded-full mt-1 overflow-hidden">
                               <motion.div 
                                 animate={{ width: `${uploadStats.progress}%` }}
                                 className="h-full bg-indigo-electric"
                               />
                            </div>
                         </div>
                       )}
                       <label className="cursor-pointer">
                          <div className="px-3 py-1.5 bg-indigo-electric/5 text-indigo-electric rounded-full border border-indigo-100 text-base font-bold uppercase tracking-widest hover:bg-indigo-electric hover:text-white transition-all flex items-center gap-2">
                            <Plus className="w-3 h-3" /> {isSyncing ? 'Syncing...' : 'Add Resume'}
                          </div>
                          <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleIngress} />
                       </label>
                    </div>
                 </div>
                 <div className="space-y-3">
                   <div className="space-y-1">
                     <label className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 ml-2">Job Description (Optional)</label>
                     <textarea 
                       value={jobDescription}
                       onChange={(e) => setJobDescription(e.target.value)}
                       placeholder="Paste full JD here..."
                       className="w-full h-24 p-4 bg-warm-gray/10 rounded-2xl text-sm font-medium border-2 border-transparent focus:border-indigo-electric/20 outline-none transition-all resize-none italic"
                     />
                   </div>
                   
                   <div className="space-y-1">
                     <label className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 ml-2">Company Name (Optional)</label>
                     <input 
                       value={companyName}
                       onChange={(e) => setCompanyName(e.target.value)}
                       placeholder="e.g. Acme Corp"
                       className="w-full p-4 bg-warm-gray/10 rounded-2xl text-sm font-medium border-2 border-transparent focus:border-indigo-electric/20 outline-none transition-all"
                     />
                   </div>

                   <div className="space-y-1">
                     <label className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 ml-2">Additional Parameters</label>
                     <input 
                       value={additionalDetails}
                       onChange={(e) => setAdditionalDetails(e.target.value)}
                       placeholder="e.g. Top 10% university, relocation open"
                       className="w-full p-4 bg-warm-gray/10 rounded-2xl text-sm font-medium border-2 border-transparent focus:border-indigo-electric/20 outline-none transition-all"
                     />
                   </div>

                   <div className="space-y-1">
                     <label className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 ml-2">Boolean Logic Override (Optional)</label>
                     <textarea 
                       value={booleanQuery}
                       onChange={(e) => setBooleanQuery(e.target.value)}
                       placeholder='("Java" AND "Spring") OR "Go"'
                       className="w-full h-20 p-4 bg-warm-gray/10 rounded-2xl text-sm font-mono border-2 border-transparent focus:border-indigo-electric/20 outline-none transition-all resize-none italic"
                     />
                   </div>
                 </div>

                 {/* Separate note section */}
                 <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 space-y-2">
                   <label className="text-sm font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                     <FileText className="w-4 h-4" /> Role Notes & Brief
                   </label>
                   <textarea
                     value={roleNotes}
                     onChange={(e) => setRoleNotes(e.target.value)}
                     placeholder="High level notes on what the firing manager actually wants..."
                     className="w-full h-20 p-3 bg-white/50 rounded-xl text-sm font-medium border border-transparent focus:border-emerald-200 outline-none transition-all resize-none shadow-inner text-emerald-900 placeholder:text-emerald-900/30"
                   />
                 </div>

                 <div className="flex gap-4">
                   <button 
                     onClick={handleGenerateAIBrief}
                     disabled={isGeneratingBrief || (!jobDescription && !companyName && !roleNotes)}
                     className="flex-1 py-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isGeneratingBrief ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                     Generate AI Role Intelligence
                   </button>
                   <button 
                     onClick={handleBooleanSearch}
                     disabled={isSearchingInternal}
                     className="flex-1 py-5 bg-[#1e293b] text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-midnight/30 hover:bg-indigo-electric transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                   >
                     {isSearchingInternal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                     Execute Internal Search
                   </button>
                 </div>

                 <AnimatePresence>
                   {showAiBrief && aiBrief && (
                     <motion.div 
                       initial={{ opacity: 0, height: 0 }}
                       animate={{ opacity: 1, height: 'auto' }}
                       exit={{ opacity: 0, height: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="bg-[#1e293b]/5 rounded-3xl p-6 border border-slate-300/10 space-y-6">
                         <div className="flex justify-between items-start">
                           <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                             <Sparkles className="w-4 h-4" /> AI Role Intelligence Brief
                           </h4>
                           <button onClick={() => setShowAiBrief(false)} className="text-[#0f172a]/30 hover:text-[#0f172a]">
                             <ChevronUp className="w-5 h-5" />
                           </button>
                         </div>
                         
                         <div className="space-y-2">
                           <p className="text-sm font-medium leading-relaxed text-[#0f172a]">
                             {aiBrief.coreBrief}
                           </p>
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                             <p className="text-xs font-bold uppercase tracking-widest text-[#0f172a]/30 mb-2">Market Insights</p>
                             <ul className="space-y-1">
                               <li className="flex justify-between text-xs">
                                 <span className="font-medium text-[#0f172a]/60">Demand Level</span>
                                 <span className={cn("font-bold", aiBrief.marketInsights?.demandLevel === 'High' ? 'text-coral' : 'text-emerald-500')}>{aiBrief.marketInsights?.demandLevel}</span>
                               </li>
                               <li className="flex justify-between text-xs">
                                 <span className="font-medium text-[#0f172a]/60">Avg Time to Hire</span>
                                 <span className="font-bold text-[#0f172a]">{aiBrief.marketInsights?.avgTimeToHire}</span>
                               </li>
                               <li className="flex justify-between text-xs">
                                 <span className="font-medium text-[#0f172a]/60">Compensation</span>
                                 <span className="font-bold text-[#0f172a]">{aiBrief.marketInsights?.compensationEstimate}</span>
                               </li>
                             </ul>
                           </div>
                           
                           <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                             <p className="text-xs font-bold uppercase tracking-widest text-[#0f172a]/30 mb-2">Top Skills Match</p>
                             <div className="flex flex-wrap gap-1.5">
                               {aiBrief.topSkills?.map((skill: string, idx: number) => (
                                 <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                   {skill}
                                 </span>
                               ))}
                             </div>
                           </div>
                         </div>

                         <div className="space-y-3">
                           <p className="text-xs font-bold uppercase tracking-widest text-[#0f172a]/30">Target Companies (Talent Density)</p>
                           <div className="grid grid-cols-1 gap-2">
                             {aiBrief.targetCompanies?.map((comp: any, idx: number) => (
                               <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                                 <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                     <Building className="w-3.5 h-3.5 text-slate-400" />
                                   </div>
                                   <div>
                                     <p className="text-xs font-bold text-[#0f172a]">{comp.name}</p>
                                     <p className="text-[10px] font-medium text-[#0f172a]/50 mt-0.5">{comp.why}</p>
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   <p className="text-xs font-black text-indigo-600">{comp.talentCount}</p>
                                   <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Talent</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

                 <div className="pt-4 space-y-4">
                    <div className="flex flex-col gap-3">
                       <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 px-1 flex items-center gap-2">
                         <Filter className="w-3 h-3" /> Search Location (X-Ray)
                       </label>
                       <div className="grid grid-cols-2 gap-2">
                          <input 
                            placeholder="State" 
                            className="bg-warm-gray/10 p-3 rounded-xl text-base outline-none" 
                            value={xRayLocation.state}
                            onChange={(e) => setXRayLocation({...xRayLocation, state: e.target.value})}
                          />
                          <input 
                            placeholder="Zip" 
                            className="bg-warm-gray/10 p-3 rounded-xl text-base outline-none" 
                            value={xRayLocation.zip}
                            onChange={(e) => setXRayLocation({...xRayLocation, zip: e.target.value})}
                          />
                       </div>
                       <input 
                         placeholder="Country" 
                         className="bg-warm-gray/10 p-3 rounded-xl text-base outline-none" 
                         value={xRayLocation.country}
                         onChange={(e) => setXRayLocation({...xRayLocation, country: e.target.value})}
                       />
                       {showLocationError && (
                         <p className="text-base font-bold text-coral uppercase text-center animate-pulse">Location Required</p>
                       )}
                    </div>
                    <button 
                      onClick={handleXRaySearch}
                      className="w-full py-4 bg-white border-2 border-slate-300/5 text-[#0f172a] rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-indigo-electric hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" /> Launch X-Ray
                    </button>
                 </div>
              </div>

              <div className="pt-8 border-t border-slate-300/5 space-y-6">
                 <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 px-1">Recent Mission Queries</h4>
                 <div className="space-y-3">
                    {[
                      '("Fullstack" AND "React") NOT "Agency"',
                      '"AWS" AND "Kubernetes" AND ($150k)',
                      '("Mobile" OR "iOS") AND "SwiftUI"'
                    ].map((q, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-warm-gray/5 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                         <History className="w-3 h-3 text-[#0f172a]/20 group-hover:text-indigo-electric" />
                         <span className="text-base font-medium text-[#0f172a]/50 truncate italic">{q}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>

        {/* Results Container */}
        <div className="lg:col-span-8 space-y-8">
           <AnimatePresence mode="wait">
             {isSearchingInternal ? (
               <motion.div 
                 key="searching"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="h-[600px] bg-white rounded-[3.5rem] border-2 border-dashed border-slate-300/5 flex flex-col items-center justify-center space-y-8"
               >
                 <div className="relative">
                   <div className="w-24 h-24 rounded-full border-8 border-slate-300/5" />
                   <div className="absolute inset-0 rounded-full border-8 border-indigo-electric border-t-transparent animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Database className="w-8 h-8 text-indigo-electric animate-pulse" />
                   </div>
                 </div>
                 <div className="text-center space-y-2">
                   <p className="text-2xl font-serif font-bold text-[#0f172a] italic">Crawling Internal Vault</p>
                   <p className="text-base font-bold text-[#0f172a]/30 uppercase tracking-[0.4em]">Resolving Boolean Constraints...</p>
                 </div>
               </motion.div>
             ) : filteredCandidates.length > 0 ? (
               <motion.div 
                 key="results"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-4"
               >
                 <div className="flex justify-between items-center px-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40">{filteredCandidates.length} Match Found In Archive</h4>
                    <button className="text-base font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                       <Filter className="w-3 h-3" /> Sort Archive
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {filteredCandidates.map(res => (
                     <div key={res.id} className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-[#1e293b] text-white rounded-2xl flex items-center justify-center font-serif font-bold italic text-lg shadow-xl shadow-midnight/10">
                              {res.name?.[0] || '?'}
                            </div>
                           <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-base font-bold uppercase tracking-widest">
                             94% Neural Match
                           </div>
                        </div>
                        <div>
                          <h5 className="text-xl font-serif font-bold text-[#0f172a] italic group-hover:text-indigo-electric transition-colors">{res.name}</h5>
                          <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40 mt-1">{res.title}</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-300/5 flex justify-between items-center">
                           <div className="flex gap-1">
                             {res.skills.slice(0, 3).map(s => (
                               <span key={s} className="px-2 py-1 bg-warm-gray text-base font-bold uppercase tracking-tighter text-[#0f172a]/50 rounded-lg">{s}</span>
                             ))}
                           </div>
                           <ArrowRight className="w-4 h-4 text-[#0f172a]/20 group-hover:text-indigo-electric group-hover:translate-x-1 transition-all" />
                        </div>
                     </div>
                   ))}
                 </div>
               </motion.div>
             ) : (
               <motion.div 
                 key="empty"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="h-[600px] bg-white/50 border-2 border-dashed border-slate-300/5 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-20"
               >
                 <div className="w-24 h-24 bg-[#1e293b]/5 rounded-full flex items-center justify-center mb-8">
                   <Search className="w-10 h-10 opacity-20" />
                 </div>
                 <h3 className="text-3xl font-serif font-bold text-[#0f172a] italic">System Idle</h3>
                 <p className="text-base font-medium text-[#0f172a]/40 mt-4 max-w-sm italic">
                   Input your boolean logic query to begin parsing the secure resume repository for internal candidates.
                 </p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
