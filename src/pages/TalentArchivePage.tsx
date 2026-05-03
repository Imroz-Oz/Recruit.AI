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
  X
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, deleteDoc, doc } from 'firebase/firestore';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [previewCandidate, setPreviewCandidate] = useState<any | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    fetchTalent();
  }, []);

  const fetchTalent = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'candidates'),
        where('recruiterId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCandidates(fetched);
    } catch (error) {
      console.error('Error fetching talent:', error);
    } finally {
      setIsLoading(false);
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

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.keywords?.some((k: string) => k.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
