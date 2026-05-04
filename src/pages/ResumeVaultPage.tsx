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
  Plus
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Candidate } from '@/src/types';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

interface ResumeVaultPageProps {
  userRole?: string;
}

export default function ResumeVaultPage({ userRole = 'recruiter' }: ResumeVaultPageProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  // Recruiter Specific State
  const [booleanQuery, setBooleanQuery] = useState('');
  const [isSearchingInternal, setIsSearchingInternal] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [xRayLocation, setXRayLocation] = useState({ country: '', state: '', zip: '' });
  const [showLocationError, setShowLocationError] = useState(false);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  // Real-time listener for the vault
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'candidates'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Candidate));
      setAllCandidates(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'candidates');
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleIngress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !auth.currentUser) return;

    setIsSyncing(true);
    try {
      const results = await Promise.all(Array.from(files as unknown as File[]).map(async (file) => {
        const reader = new FileReader();
        const textPromise = new Promise<string>((resolve) => {
          reader.onload = (ev) => resolve(ev.target?.result as string || '');
          reader.readAsText(file);
        });
        
        const text = await textPromise;
        const talent = {
          recruiterId: auth.currentUser?.uid,
          name: file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '),
          title: 'Imported Talent',
          email: `${file.name.split('.')[0].toLowerCase().replace(/\s+/g, '.')}@imported.com`,
          location: 'Global Vault',
          score: 90,
          resumeSnippet: text.slice(0, 500) || `Mission critical asset indexed from ${file.name}.`,
          keywords: [file.name.split('.')[0].toLowerCase(), 'vault', 'imported'],
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'candidates'), talent);
        return { id: docRef.id, ...talent };
      }));
      
      console.log('Ingressed:', results.length, 'candidates');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'candidates');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBooleanSearch = () => {
    if (!booleanQuery.trim()) {
      setFilteredCandidates([]);
      return;
    }
    setIsSearchingInternal(true);
    
    setTimeout(() => {
      const terms = booleanQuery.replace(/[()"]/g, '').split(/\s+AND\s+/).map(t => t.trim().toLowerCase());
      const results = allCandidates.filter(c => {
        const searchString = (c.name + ' ' + c.title + ' ' + (c.keywords?.join(' ') || '')).toLowerCase();
        return terms.every(term => searchString.includes(term));
      });
      setFilteredCandidates(results);
      setIsSearchingInternal(false);
    }, 1000);
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
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">
            Recruiter Enterprise Vault v4.0
          </span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-midnight italic">The <span className="text-indigo-electric">Talent</span> Archive</h2>
        <p className="text-midnight/50 font-medium max-w-xl mx-auto italic">
          Access the secure repository of internal assets using advanced boolean logic and semantic neural search.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Boolean Control Panel */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-white p-10 rounded-[3.5rem] border border-midnight/5 shadow-sm space-y-8 sticky top-8">
              <div className="space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                       <Terminal className="w-4 h-4 text-indigo-electric" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-midnight">Mission Logic</span>
                    </div>
                    <label className="cursor-pointer">
                       <div className="px-3 py-1.5 bg-indigo-electric/5 text-indigo-electric rounded-full border border-indigo-100 text-[8px] font-bold uppercase tracking-widest hover:bg-indigo-electric hover:text-white transition-all flex items-center gap-2">
                         <Plus className="w-3 h-3" /> {isSyncing ? 'Syncing...' : 'Add Resume'}
                       </div>
                       <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleIngress} />
                    </label>
                 </div>
                 <textarea 
                   value={booleanQuery}
                   onChange={(e) => setBooleanQuery(e.target.value)}
                   placeholder='("Java" AND "Spring Boot") OR ("Go" AND "Distributed") NOT "Junior"'
                   className="w-full h-40 p-6 bg-warm-gray/10 rounded-[2.5rem] text-sm font-mono border-2 border-transparent focus:border-indigo-electric/20 outline-none transition-all resize-none italic"
                 />
                 <button 
                   onClick={handleBooleanSearch}
                   disabled={isSearchingInternal}
                   className="w-full py-5 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-midnight/30 hover:bg-indigo-electric transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isSearchingInternal ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                   Execute Internal Search
                 </button>

                 <div className="pt-4 space-y-4">
                    <div className="flex flex-col gap-3">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-midnight/30 px-1 flex items-center gap-2">
                         <Filter className="w-3 h-3" /> Search Location (X-Ray)
                       </label>
                       <div className="grid grid-cols-2 gap-2">
                          <input 
                            placeholder="State" 
                            className="bg-warm-gray/10 p-3 rounded-xl text-[10px] outline-none" 
                            value={xRayLocation.state}
                            onChange={(e) => setXRayLocation({...xRayLocation, state: e.target.value})}
                          />
                          <input 
                            placeholder="Zip" 
                            className="bg-warm-gray/10 p-3 rounded-xl text-[10px] outline-none" 
                            value={xRayLocation.zip}
                            onChange={(e) => setXRayLocation({...xRayLocation, zip: e.target.value})}
                          />
                       </div>
                       <input 
                         placeholder="Country" 
                         className="bg-warm-gray/10 p-3 rounded-xl text-[10px] outline-none" 
                         value={xRayLocation.country}
                         onChange={(e) => setXRayLocation({...xRayLocation, country: e.target.value})}
                       />
                       {showLocationError && (
                         <p className="text-[8px] font-bold text-coral uppercase text-center animate-pulse">Location Required</p>
                       )}
                    </div>
                    <button 
                      onClick={handleXRaySearch}
                      className="w-full py-4 bg-white border-2 border-midnight/5 text-midnight rounded-2xl font-bold text-[9px] uppercase tracking-widest hover:bg-indigo-electric hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" /> Launch X-Ray
                    </button>
                 </div>
              </div>

              <div className="pt-8 border-t border-midnight/5 space-y-6">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 px-1">Recent Mission Queries</h4>
                 <div className="space-y-3">
                    {[
                      '("Fullstack" AND "React") NOT "Agency"',
                      '"AWS" AND "Kubernetes" AND ($150k)',
                      '("Mobile" OR "iOS") AND "SwiftUI"'
                    ].map((q, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-warm-gray/5 rounded-2xl cursor-pointer hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 group">
                         <History className="w-3 h-3 text-midnight/20 group-hover:text-indigo-electric" />
                         <span className="text-[10px] font-medium text-midnight/50 truncate italic">{q}</span>
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
                 className="h-[600px] bg-white rounded-[3.5rem] border-2 border-dashed border-midnight/5 flex flex-col items-center justify-center space-y-8"
               >
                 <div className="relative">
                   <div className="w-24 h-24 rounded-full border-8 border-midnight/5" />
                   <div className="absolute inset-0 rounded-full border-8 border-indigo-electric border-t-transparent animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Database className="w-8 h-8 text-indigo-electric animate-pulse" />
                   </div>
                 </div>
                 <div className="text-center space-y-2">
                   <p className="text-2xl font-serif font-bold text-midnight italic">Crawling Internal Vault</p>
                   <p className="text-[10px] font-bold text-midnight/30 uppercase tracking-[0.4em]">Resolving Boolean Constraints...</p>
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
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-midnight/40">{filteredCandidates.length} Match Found In Archive</h4>
                    <button className="text-[10px] font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full">
                       <Filter className="w-3 h-3" /> Sort Archive
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {filteredCandidates.map(res => (
                     <div key={res.id} className="bg-white p-8 rounded-[3rem] border border-midnight/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 bg-midnight text-white rounded-2xl flex items-center justify-center font-serif font-bold italic text-lg shadow-xl shadow-midnight/10">
                              {res.name?.[0] || '?'}
                            </div>
                           <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] font-bold uppercase tracking-widest">
                             94% Neural Match
                           </div>
                        </div>
                        <div>
                          <h5 className="text-xl font-serif font-bold text-midnight italic group-hover:text-indigo-electric transition-colors">{res.name}</h5>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 mt-1">{res.title}</p>
                        </div>
                        <div className="mt-6 pt-6 border-t border-midnight/5 flex justify-between items-center">
                           <div className="flex gap-1">
                             {res.skills.slice(0, 3).map(s => (
                               <span key={s} className="px-2 py-1 bg-warm-gray text-[8px] font-bold uppercase tracking-tighter text-midnight/50 rounded-lg">{s}</span>
                             ))}
                           </div>
                           <ArrowRight className="w-4 h-4 text-midnight/20 group-hover:text-indigo-electric group-hover:translate-x-1 transition-all" />
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
                 className="h-[600px] bg-white/50 border-2 border-dashed border-midnight/5 rounded-[3.5rem] flex flex-col items-center justify-center text-center p-20"
               >
                 <div className="w-24 h-24 bg-midnight/5 rounded-full flex items-center justify-center mb-8">
                   <Search className="w-10 h-10 opacity-20" />
                 </div>
                 <h3 className="text-3xl font-serif font-bold text-midnight italic">System Idle</h3>
                 <p className="text-sm font-medium text-midnight/40 mt-4 max-w-sm italic">
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
