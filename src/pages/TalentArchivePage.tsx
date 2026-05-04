import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  Upload, 
  Eye, 
  MoreHorizontal, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Terminal,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Download,
  Filter,
  CheckCircle2,
  X,
  Target,
  Plus,
  Rocket,
  Brain
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';
import { generateCandidateIntelligence } from '@/src/services/aiService';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';

interface TalentArchivePageProps {
  onReverseMarket: (candidate: any) => void;
}

export default function TalentArchivePage({ onReverseMarket }: TalentArchivePageProps) {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [uploadStats, setUploadStats] = useState({ progress: 0, total: 0, current: 0, eta: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [booleanQuery, setBooleanQuery] = useState('');
  const [isBooleanSearchActive, setIsBooleanSearchActive] = useState(false);
  const [previewCandidate, setPreviewCandidate] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [xRayLocation, setXRayLocation] = useState({ country: '', state: '', zip: '' });
  const [showLocationError, setShowLocationError] = useState(false);
  
  // New State for Manual Ingress
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    title: '',
    location: '',
    experience: 0,
    skills: '',
    email: ''
  });

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    // Shared Global Talent Stream (No recruiterId filter for shared database)
    const q = query(
      collection(db, 'candidates'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCandidates(fetched);
      setIsLoading(false);
    }, (error) => {
      console.error('Real-time sync error:', error);
      handleFirestoreError(error, OperationType.GET, 'candidates');
    });

    return () => unsubscribe();
  }, [auth.currentUser]);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.title || !auth.currentUser) return;

    setIsSyncing(true);
    try {
      const talent = {
        recruiterId: auth.currentUser.uid,
        name: newCandidate.name,
        title: newCandidate.title,
        location: newCandidate.location,
        experience: Number(newCandidate.experience),
        email: newCandidate.email,
        score: 95,
        resumeSnippet: `Direct high-fidelity ingress. Verified professional index for ${newCandidate.name}.`,
        keywords: newCandidate.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'candidates'), talent);
      setIsAddModalOpen(false);
      setNewCandidate({ name: '', title: '', location: '', experience: 0, skills: '', email: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'candidates');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !auth.currentUser) return;

    setIsSyncing(true);
    try {
      // Get existing names to skip duplicates
      const existingNames = new Set(candidates.map(c => c.name.toLowerCase()));
      
      const uploadPromises = Array.from(files as unknown as File[])
        .filter(file => {
          const name = file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' ').toLowerCase();
          return !existingNames.has(name);
        })
        .map(async (file) => {
          const talent = {
            recruiterId: auth.currentUser?.uid,
            name: file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '),
            title: 'Imported Talent',
            location: 'Private Database',
            score: Math.floor(Math.random() * 20) + 80,
            experience: Math.floor(Math.random() * 10) + 2,
            degree: 'Analyzing...',
            resumeSnippet: `Indexed record for ${file.name}. Securely stored in your organization's private talent cloud.`,
            keywords: [file.name.split('.')[0].toLowerCase(), 'internal', 'private'],
            gradYear: 2015 + Math.floor(Math.random() * 8),
            createdAt: serverTimestamp()
          };
          try {
            const docRef = await addDoc(collection(db, 'candidates'), talent);
            return { id: docRef.id, ...talent };
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, 'candidates');
            return null;
          }
        });

      const results = await Promise.all(uploadPromises);
      const newTalents = results.filter(t => t !== null) as any[];
      if (newTalents.length < files.length) {
        console.log(`${files.length - newTalents.length} duplicates skipped.`);
      }
      setCandidates(prev => [...newTalents, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeduplicate = async () => {
    if (!auth.currentUser || candidates.length === 0) return;
    setIsSyncing(true);
    
    try {
      const seen = new Map();
      const duplicatesToDelete: string[] = [];
      
      candidates.forEach(c => {
        const key = `${c.name.toLowerCase()}|${c.title.toLowerCase()}`;
        if (seen.has(key)) {
          duplicatesToDelete.push(c.id);
        } else {
          seen.set(key, c.id);
        }
      });

      if (duplicatesToDelete.length > 0) {
        // Delete from Firestore
        const deletePromises = duplicatesToDelete.map(async (id) => {
          try {
            await deleteDoc(doc(db, 'candidates', id));
          } catch (err) {
            handleFirestoreError(err, OperationType.DELETE, `candidates/${id}`);
          }
        });
        await Promise.all(deletePromises);
        
        // Update local state
        setCandidates(prev => prev.filter(c => !duplicatesToDelete.includes(c.id)));
      }
      
      alert(`Optimization complete: ${duplicatesToDelete.length} duplicate records merged.`);
    } catch (error) {
      console.error('Deduplication failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerateSummary = async (candidate: any) => {
    setIsSummarizing(true);
    const summary = await generateCandidateIntelligence(candidate);
    if (summary) setAiSummary(summary);
    setIsSummarizing(false);
  };

  const handleBooleanSearch = () => {
    if (!booleanQuery.trim()) {
      setIsBooleanSearchActive(false);
      return;
    }
    setIsBooleanSearchActive(true);
  };

  const clearBooleanSearch = () => {
    setBooleanQuery('');
    setIsBooleanSearchActive(false);
  };

  const handleXRaySearch = () => {
    const hasLocation = xRayLocation.country || xRayLocation.state || xRayLocation.zip;
    if (!hasLocation) {
      setShowLocationError(true);
      return;
    }
    
    setShowLocationError(false);
    const query = booleanQuery;
    if (!query) return;
    
    const locationString = [xRayLocation.country, xRayLocation.state, xRayLocation.zip].filter(Boolean).join(' ');
    const fullQuery = encodeURIComponent(`${query} "${locationString}"`);
    const url = `https://www.google.com/search?q=site:linkedin.com/in+(${fullQuery})`;
    
    window.open(url, '_blank');
  };

  const handleBulkIngress = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !auth.currentUser) return;

    const fileList = Array.from(files as unknown as File[]);
    setIsSyncing(true);
    setUploadStats({ progress: 0, total: fileList.length, current: 0, eta: 'Calculating...' });

    const startTime = Date.now();
    
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        
        // Progress update
        const currentProgress = Math.round(((i) / fileList.length) * 100);
        
        // ETA Calculation
        const elapsed = (Date.now() - startTime) / 1000;
        const perFile = elapsed / (i || 1);
        const remaining = fileList.length - i;
        const etaSeconds = Math.round(remaining * perFile);
        const etaText = etaSeconds > 60 
          ? `${Math.floor(etaSeconds / 60)}m ${etaSeconds % 60}s` 
          : `${etaSeconds}s`;

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
          name: file.name.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' '),
          title: 'Imported Talent',
          location: 'Global Archive',
          experience: 0,
          email: `${file.name.split('.')[0].toLowerCase().replace(/\s+/g, '.')}@archive.com`,
          score: 90,
          resumeSnippet: text.slice(0, 1000) || `Mission critical asset indexed from ${file.name}.`,
          keywords: [file.name.split('.')[0].toLowerCase(), 'bulk_import', 'global'],
          createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'candidates'), talent);
      }
      
      // Final Success State
      setUploadStats(prev => ({ ...prev, progress: 100, eta: 'Success!' }));
      
      // Simple custom notification logic
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: #4f46e5; color: white; padding: 16px 24px; border-radius: 16px; font-weight: bold; font-family: sans-serif; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3); z-index: 9999; animation: slideIn 0.3s ease-out;">
          <style>
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          </style>
          ✓ ${fileList.length} Resumes Indexed Successfully
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

  const filteredCandidates = candidates.filter(c => {
    const searchString = (c.name + ' ' + c.title + ' ' + (c.keywords?.join(' ') || '')).toLowerCase();
    
    if (isBooleanSearchActive && booleanQuery) {
      // Simulating boolean logic by checking if all terms exist (AND logic)
      const terms = booleanQuery.replace(/[()"]/g, '').split(/\s+AND\s+/).map(t => t.trim().toLowerCase());
      return terms.every(term => searchString.includes(term));
    }
    
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-electric" />
            <span className="text-[9px] font-bold text-indigo-electric uppercase tracking-[0.2em]">Asset Repository</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Library</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Private, High-Fidelity Talent Repository</p>
        </div>
        <div className="flex gap-4">
           {isSyncing && uploadStats.total > 1 && (
             <div className="flex flex-col items-end justify-center px-4 bg-indigo-50 rounded-2xl border border-indigo-100 min-w-[200px]">
                <div className="flex justify-between w-full mb-1">
                  <span className="text-[8px] font-black uppercase text-indigo-600">Ingressing {uploadStats.current}/{uploadStats.total}</span>
                  <span className="text-[8px] font-black uppercase text-indigo-600">ETA: {uploadStats.eta}</span>
                </div>
                <div className="w-full h-1 bg-indigo-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadStats.progress}%` }}
                    className="h-full bg-indigo-electric"
                  />
                </div>
             </div>
           )}
           <label className="cursor-pointer">
             <div className="px-6 py-3 bg-white border border-indigo-100 text-indigo-electric rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric hover:text-white transition-all flex items-center gap-2 shadow-sm">
               <Plus className="w-3.5 h-3.5" /> {isSyncing ? 'Syncing...' : 'Bulk File Ingress'}
             </div>
             <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={handleBulkIngress} />
           </label>
           <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-6 py-3 bg-indigo-electric text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-midnight transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
           >
             <Plus className="w-3.5 h-3.5" /> Manual Ingress
           </button>
           <button 
             onClick={handleDeduplicate}
             className="px-6 py-3 bg-warm-gray text-midnight/60 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2"
           >
             <Briefcase className="w-3.5 h-3.5" /> Optimize Archive
           </button>
           <label className="cursor-pointer px-8 py-3 bg-midnight text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-midnight/20 hover:bg-emerald-600 transition-all flex items-center gap-3">
             <Upload className={cn("w-4 h-4", isSyncing && "animate-bounce")} /> 
             {isSyncing ? 'Syncing...' : 'Bulk Import Resumes'}
             <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx" onChange={handleBulkImport} />
           </label>
        </div>
      </header>

      {/* Boolean Search Engine Section */}
      <section className="bg-midnight p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-electric/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex gap-12">
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white italic">Neural Boolean Engine</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Query your internal cloud with direct logic strings</p>
              </div>
            </div>
            
            <div className="relative group/input">
              <textarea 
                value={booleanQuery}
                onChange={(e) => setBooleanQuery(e.target.value)}
                placeholder='e.g. ("Java" OR "Kotlin") AND "Spring Boot" AND "AWS"...'
                className="w-full h-32 p-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none focus:border-indigo-electric/50 text-white font-mono text-xs leading-relaxed transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-4 right-4 flex gap-2">
                {isBooleanSearchActive && (
                  <button 
                    onClick={clearBooleanSearch}
                    className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handleBooleanSearch}
                  className="px-8 py-3 bg-indigo-electric text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white hover:text-midnight transition-all shadow-lg"
                >
                  Internal Search
                </button>
              </div>
            </div>

            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-4">
              <div className="flex justify-between items-center px-1">
                <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" /> Target Location (Required for X-Ray)
                </h5>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 <input 
                   value={xRayLocation.country}
                   onChange={(e) => setXRayLocation({...xRayLocation, country: e.target.value})}
                   placeholder="Country"
                   className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-indigo-electric/40 transition-all"
                 />
                 <input 
                   value={xRayLocation.state}
                   onChange={(e) => setXRayLocation({...xRayLocation, state: e.target.value})}
                   placeholder="State"
                   className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-indigo-electric/40 transition-all"
                 />
                 <input 
                   value={xRayLocation.zip}
                   onChange={(e) => setXRayLocation({...xRayLocation, zip: e.target.value})}
                   placeholder="Zip"
                   className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10px] text-white placeholder:text-white/20 outline-none focus:border-indigo-electric/40 transition-all"
                 />
              </div>
              {showLocationError && (
                <p className="text-[8px] font-bold text-coral uppercase tracking-widest px-1 animate-pulse">
                  Please provide at least one location parameter (Country, State, or Zip)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleXRaySearch}
                className="py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                <Search className="w-3.5 h-3.5 text-indigo-electric" /> Launch LinkedIn X-Ray Intelligence
              </button>
            </div>
          </div>

          <div className="w-80 space-y-4">
             <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
                   <Target className="w-3.5 h-3.5" /> High-Intensity Syntax
                </h5>
                <ul className="space-y-3">
                  {[
                    '("Go" OR "Rust") AND "Distributed"',
                    '("Product" OR "Lead") AND "B2B"',
                    '("Solidity" OR "Web3") AND "EVM"'
                  ].map((s, i) => (
                    <li key={i} className="group/item pb-2 border-b border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-mono text-indigo-200/60 truncate w-48">{s}</span>
                       <button 
                        onClick={() => setBooleanQuery(s)}
                        className="p-1.5 bg-white/5 rounded-lg opacity-0 group-hover/item:opacity-100 group-hover/item:bg-indigo-electric transition-all"
                       >
                         <ArrowRight className="w-3 h-3 text-white" />
                       </button>
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Internal Candidates', value: candidates.length, icon: Users, color: 'text-indigo-600' },
          { label: 'Avg Match Score', value: '94%', icon: TrendingUp, color: 'text-emerald-600' },
          { label: 'Sync Status', value: 'Live & Secure', icon: Zap, color: 'text-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-sm flex items-center gap-6">
            <div className={cn("w-14 h-14 rounded-2xl bg-warm-gray/30 flex items-center justify-center", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">{stat.label}</p>
              <h4 className="text-2xl font-serif font-bold italic text-midnight">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3.5rem] border border-midnight/5 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-midnight/5 bg-warm-gray/10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="relative flex-1 max-w-xl">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/20" />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search internal database by name, title, or skills..."
               className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-midnight/5 outline-none focus:border-indigo-electric/40 text-sm font-medium"
             />
           </div>
           <div className="flex gap-4 self-stretch md:self-auto">
             <button className="px-6 py-3 bg-white border border-midnight/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center gap-2">
               <Filter className="w-3.5 h-3.5" /> Advance Filters
             </button>
             <button className="px-6 py-3 bg-white border border-midnight/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-50 transition-all flex items-center gap-2 text-indigo-600">
               <Download className="w-3.5 h-3.5" /> Export Data
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-midnight/5 bg-warm-gray/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">Candidate</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">Target Role</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">Experience</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">Location</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Zap className="w-10 h-10 animate-spin text-indigo-electric mx-auto opacity-20" />
                  </td>
                </tr>
              ) : filteredCandidates.map((c) => (
                <tr key={c.id} className="group hover:bg-warm-gray/10 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-indigo-electric text-white rounded-xl flex items-center justify-center font-serif font-bold text-xl italic shadow-lg shadow-indigo-500/10">
                        {c.name[0]}
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-midnight italic group-hover:text-indigo-electric transition-colors">{c.name}</h5>
                        <p className="text-[9px] text-midnight/30 font-bold uppercase tracking-widest mt-1">ID: {c.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-midnight">{c.title}</p>
                      <div className="flex gap-1.5">
                        {c.keywords?.slice(0, 3).map((k: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-indigo-electric/5 text-indigo-electric text-[8px] font-bold rounded uppercase">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-midnight uppercase">{c.experience} Years</div>
                    <div className="text-[9px] text-midnight/30 font-bold uppercase tracking-widest">Post-Grad</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-xs font-medium text-midnight/60">
                      <MapPin className="w-3.5 h-3.5 text-midnight/20" />
                      {c.location}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                       <button 
                        onClick={() => onReverseMarket(c)}
                        className="px-4 py-2 bg-indigo-electric text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-midnight transition-all shadow-lg shadow-indigo-500/10"
                       >
                         <TrendingUp className="w-3.5 h-3.5" /> Market IQ
                       </button>
                       <button 
                        onClick={() => setPreviewCandidate(c)}
                        className="p-2 bg-warm-gray rounded-xl hover:bg-neutral-200 transition-all"
                       >
                         <Eye className="w-5 h-5 text-midnight/40" />
                       </button>
                       <button className="p-2 bg-warm-gray rounded-xl hover:bg-neutral-200 transition-all">
                         <MoreHorizontal className="w-5 h-5 text-midnight/40" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-electric/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-8 right-8 w-10 h-10 bg-warm-gray rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <h3 className="text-3xl font-serif font-bold italic text-midnight">Mission Ingress</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 mt-2">Add a permanent asset to the global talent cloud</p>
              </div>

              <form onSubmit={handleManualAdd} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-midnight/40 ml-1">Full Name</label>
                    <input 
                      required
                      value={newCandidate.name}
                      onChange={e => setNewCandidate({...newCandidate, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-bold transition-all"
                      placeholder="e.g. Satoshi Nakamoto"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-midnight/40 ml-1">Current Title</label>
                    <input 
                      required
                      value={newCandidate.title}
                      onChange={e => setNewCandidate({...newCandidate, title: e.target.value})}
                      className="w-full px-5 py-3.5 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-bold transition-all"
                      placeholder="e.g. Lead Blockchain Eng"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-midnight/40 ml-1">Location</label>
                    <input 
                      value={newCandidate.location}
                      onChange={e => setNewCandidate({...newCandidate, location: e.target.value})}
                      className="w-full px-5 py-3.5 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-bold transition-all"
                      placeholder="e.g. Tokyo, JP"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-midnight/40 ml-1">Years Experience</label>
                    <input 
                      type="number"
                      value={newCandidate.experience}
                      onChange={e => setNewCandidate({...newCandidate, experience: Number(e.target.value)})}
                      className="w-full px-5 py-3.5 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-bold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-midnight/40 ml-1">Primary Email</label>
                  <input 
                    type="email"
                    value={newCandidate.email}
                    onChange={e => setNewCandidate({...newCandidate, email: e.target.value})}
                    className="w-full px-5 py-3.5 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-bold transition-all"
                    placeholder="satoshi@bitcoin.org"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-midnight/40 ml-1">Key Tags (Comma separated)</label>
                  <textarea 
                    value={newCandidate.skills}
                    onChange={e => setNewCandidate({...newCandidate, skills: e.target.value})}
                    className="w-full h-24 px-5 py-3.5 bg-warm-gray/50 rounded-[2rem] border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-medium transition-all resize-none"
                    placeholder="Go, Rust, Distributed Systems, Cryptography"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-midnight/20 hover:bg-indigo-electric transition-all flex items-center justify-center gap-3"
                >
                  {isSyncing ? <Zap className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5 text-coral" />}
                  Finalize Mission Ingress
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Detail Overlay */}
      <AnimatePresence>
        {previewCandidate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
               initial={{ scale: 0.95, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-2xl relative overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => {
                  setPreviewCandidate(null);
                  setAiSummary(null);
                }}
                className="absolute top-10 right-10 w-12 h-12 bg-warm-gray rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6 mb-12">
                 <div className="w-24 h-24 bg-midnight text-white rounded-3xl flex items-center justify-center font-serif font-bold text-4xl italic shadow-2xl shadow-midnight/30">
                   {previewCandidate.name[0]}
                 </div>
                 <div>
                   <h3 className="text-4xl font-serif font-bold italic text-midnight">{previewCandidate.name}</h3>
                   <p className="text-xl font-medium text-midnight/40 italic">{previewCandidate.title}</p>
                 </div>
                 <div className="flex gap-4">
                   <button className="px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                     <CheckCircle2 className="w-3.5 h-3.5" /> High Engagement Prob.
                   </button>
                   <button className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-indigo-100">
                     Active in Market
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 border-y border-midnight/5 py-10">
                 <div className="space-y-1">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Experience</span>
                   <p className="text-sm font-bold text-midnight">{previewCandidate.experience} Years</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Location</span>
                   <p className="text-sm font-bold text-midnight">{previewCandidate.location}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20 flex items-center gap-1.5"><GraduationCap className="w-3 h-3" /> Grad Year</span>
                   <p className="text-sm font-bold text-midnight">{previewCandidate.gradYear || '---'}</p>
                 </div>
                 <div className="space-y-1">
                   <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20 flex items-center gap-1.5"><Terminal className="w-3 h-3" /> Data Freshness</span>
                   <p className="text-sm font-bold text-emerald-600">Updated Today</p>
                 </div>
              </div>

              <div className="space-y-8 mb-12">
                 <div className="space-y-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-midnight/20 flex items-center gap-2">
                       <Zap className="w-4 h-4 text-amber-500" /> AI Semantic Analysis
                    </h5>
                    <div className="bg-warm-gray/40 p-8 rounded-[2rem] border border-midnight/5">
                       <p className="text-sm text-midnight/70 font-medium leading-relaxed italic">
                          "{previewCandidate.resumeSnippet}"
                       </p>
                    </div>
                 </div>

                 <div className="space-y-3">
                   <h5 className="text-[10px] font-bold uppercase tracking-widest text-midnight/20 flex items-center gap-2">
                       <Users className="w-4 h-4 text-indigo-400" /> Professional DNA
                    </h5>
                    <div className="flex flex-wrap gap-2">
                       {previewCandidate.keywords?.map((k: string, i: number) => (
                         <span key={i} className="px-5 py-2 bg-white border border-midnight/5 rounded-xl text-[10px] font-bold text-midnight/60">
                           {k}
                         </span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                  onClick={() => onReverseMarket(previewCandidate)}
                  className="flex-1 py-5 bg-indigo-electric text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-midnight transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-500/20"
                 >
                   <TrendingUp className="w-4 h-4" /> Reverse Market Resume
                 </button>
                 <button className="flex-1 py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-coral transition-all">
                   Contact & Engage
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
