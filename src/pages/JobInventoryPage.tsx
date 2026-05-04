import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Building2, 
  Users, 
  Sparkles,
  Zap,
  CheckCircle2,
  Search,
  Filter,
  BarChart3,
  Target,
  Edit3
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';
import { analyzeCandidateMatch } from '@/src/services/aiService';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { Job, Note } from '@/src/types';
import JobDetailModal from '@/src/components/JobDetailModal';

export default function JobInventoryPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Job Form
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    description: '',
    requirements: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'recruiterJobs'),
        where('recruiterId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
      setJobs(fetched);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'recruiterJobs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSyncing(true);
    try {
      const jobData = {
        ...newJob,
        recruiterId: auth.currentUser.uid,
        requirements: newJob.requirements.split(',').map(r => r.trim()),
        createdAt: serverTimestamp(),
        postedDate: new Date().toISOString(),
        notes: []
      };
      const docRef = await addDoc(collection(db, 'recruiterJobs'), jobData);
      setJobs([{ id: docRef.id, ...jobData } as Job, ...jobs]);
      setShowCreateModal(false);
      setNewJob({ title: '', company: '', location: '', salary: '', description: '', requirements: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'recruiterJobs');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateJob = async (updated: Job) => {
    setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
    setSelectedJob(updated);
    try {
      await updateDoc(doc(db, 'recruiterJobs', updated.id), {
        ...updated,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `recruiterJobs/${updated.id}`);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recruiterJobs', id));
      setJobs(jobs.filter(j => j.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `recruiterJobs/${id}`);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end border-b border-midnight/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet/5 border border-violet/10 rounded-full">
            <Target className="w-4 h-4 text-violet" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet">
              Active Mission Control
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-midnight italic">Brief <span className="text-violet">Inventory.</span></h2>
          <p className="text-midnight/40 text-sm font-medium max-w-lg leading-relaxed">
            Architect and deploy strategic mission parameters for high-fidelity talent alignment.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-10 py-4 bg-midnight text-white rounded-2xl font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-midnight/20 hover:scale-105 hover:bg-violet transition-all flex items-center gap-4"
        >
          <Plus className="w-5 h-5 border-2 border-white/20 rounded-full" /> Create Intelligence Brief
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Missions', val: jobs.length, icon: Briefcase, color: 'text-violet' },
          { label: 'Candidate Match Rate', val: '84%', icon: Sparkles, color: 'text-coral' },
          { label: 'Market Velocity', val: 'Optimal', icon: BarChart3, color: 'text-emerald-500' }
        ].map(stat => (
          <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-sm flex items-center gap-6">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-cream shadow-inner", stat.color)}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 mb-1">{stat.label}</p>
              <p className="text-3xl font-serif font-bold text-midnight italic">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active intelligence briefs..." 
            className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl text-sm font-medium border border-midnight/5 outline-none focus:border-violet/40 shadow-sm transition-all"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-midnight/20" />
        </div>
        <button className="px-8 bg-white border border-midnight/5 rounded-3xl flex items-center justify-center gap-3 hover:border-violet/30 transition-all shadow-sm">
           <Filter className="w-5 h-5 text-midnight/20" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 font-serif italic">Global Filters</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center gap-6">
           <Zap className="w-16 h-16 text-violet animate-spin opacity-20" />
           <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/20 animate-pulse">Synchronizing Mission Data...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="py-40 text-center space-y-8 bg-white rounded-[4rem] border border-dashed border-midnight/10 shadow-inner">
          <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center mx-auto shadow-xl">
            <Search className="w-12 h-12 text-midnight/10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-serif font-bold text-midnight italic">Archive Empty.</h3>
            <p className="text-sm text-midnight/40 font-medium italic">Your strategic mission inventory is currently void of any briefs.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-12 py-4 bg-midnight text-white rounded-full font-bold text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-violet transition-all"
          >
            Deploy First Brief
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredJobs.map((job) => (
            <motion.div 
              key={job.id}
              layoutId={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedJob(job)}
              className="bg-white p-10 rounded-[4rem] border border-midnight/5 shadow-sm hover:shadow-2xl hover:shadow-violet/10 transition-all group relative overflow-hidden cursor-pointer"
            >
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 bg-cream group-hover:bg-midnight rounded-[2.5rem] flex items-center justify-center text-midnight/40 group-hover:text-white transition-all shadow-xl shadow-midnight/5 group-hover:scale-110">
                    <Building2 className="w-10 h-10" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-4 bg-warm-gray rounded-2xl hover:bg-neutral-200 transition-all text-midnight/40"><Edit3 className="w-5 h-5" /></button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteJob(job.id); }} 
                      className="p-4 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-3xl font-serif font-bold text-midnight italic group-hover:text-violet transition-colors leading-tight mb-4">{job.title}</h4>
                  <div className="flex flex-wrap gap-6">
                     <span className="flex items-center gap-2 text-[11px] font-bold text-midnight/40 uppercase tracking-widest italic">
                       <Building2 className="w-4 h-4" /> {job.company}
                     </span>
                     <span className="flex items-center gap-2 text-[11px] font-bold text-midnight/40 uppercase tracking-widest italic">
                       <MapPin className="w-4 h-4" /> {job.location}
                     </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {job.requirements.slice(0, 4).map((req: string, i: number) => (
                    <span key={i} className="px-5 py-2 bg-cream border border-midnight/5 text-midnight text-[9px] font-bold rounded-2xl uppercase tracking-widest">
                      {req}
                    </span>
                  ))}
                  {job.requirements.length > 4 && (
                    <span className="px-5 py-2 bg-violet/5 text-violet text-[9px] font-bold rounded-2xl uppercase tracking-widest">
                      +{job.requirements.length - 4} More
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-midnight/5">
                  <div className="flex -space-x-3">
                     {[1, 2, 3, 4].map(i => (
                       <div key={i} className="w-10 h-10 rounded-2xl border-4 border-white bg-warm-gray text-[10px] flex items-center justify-center font-bold shadow-md">AI</div>
                     ))}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Mission Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Strategic Match Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet/5 rounded-full blur-[80px] translate-x-1/3 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-cream w-full max-w-2xl rounded-[4rem] p-16 shadow-2xl relative border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowCreateModal(false)}
                className="absolute top-12 right-12 p-3 bg-white border border-midnight/5 rounded-2xl text-midnight/20 hover:text-red-500 transition-all hover:border-red-100"
              >
                <Trash2 className="w-6 h-6" />
              </button>

              <div className="mb-12 text-center">
                <div className="w-20 h-20 bg-midnight text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-midnight/20">
                  <Briefcase className="w-10 h-10" />
                </div>
                <h3 className="text-4xl font-serif font-bold italic text-midnight">Intelligence Brief.</h3>
                <p className="text-[11px] text-midnight/30 font-bold uppercase tracking-[0.2em] mt-3">Define the vacancy semantics for the recruitment loop</p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 px-1 italic">Role Designation</label>
                    <input 
                      required
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      placeholder="e.g. Lead Neural Architect"
                      className="w-full p-5 bg-white border border-midnight/5 rounded-2xl outline-none focus:border-violet/40 transition-all font-bold text-sm shadow-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 px-1 italic">Company Entity</label>
                    <input 
                      required
                      value={newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      placeholder="e.g. Core Labs"
                      className="w-full p-5 bg-white border border-midnight/5 rounded-2xl outline-none focus:border-violet/40 transition-all font-bold text-sm shadow-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 px-1 italic">Geographical Constraints</label>
                    <input 
                      required
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="e.g. Remote / Switzerland"
                      className="w-full p-5 bg-white border border-midnight/5 rounded-2xl outline-none focus:border-violet/40 transition-all font-bold text-sm shadow-sm" 
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 px-1 italic">Comp Range</label>
                    <input 
                      required
                      value={newJob.salary}
                      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="e.g. $180k - $240k"
                      className="w-full p-5 bg-white border border-midnight/5 rounded-2xl outline-none focus:border-violet/40 transition-all font-bold text-sm shadow-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 px-1 italic">Semantic Skillset (Comma Encoded)</label>
                  <input 
                    required
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="Python, NLP, Transformers, PyTorch"
                    className="w-full p-5 bg-white border border-midnight/5 rounded-2xl outline-none focus:border-violet/40 transition-all font-bold text-sm shadow-sm" 
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 px-1 italic">Mission Strategic Brief (Description)</label>
                  <textarea 
                    required
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Describe the technical depth and cultural mission..."
                    className="w-full h-36 p-8 bg-white border border-midnight/5 rounded-[3rem] outline-none focus:border-violet/40 transition-all font-medium text-sm resize-none shadow-sm" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-6 bg-midnight text-white rounded-[2.5rem] font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-midnight/30 hover:bg-violet transition-all flex items-center justify-center gap-4 group"
                >
                  {isSyncing ? <Zap className="w-6 h-6 animate-spin text-white/50" /> : <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                  {isSyncing ? 'Synchronizing Intelligence...' : 'Deploy Mission Brief'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)}
            onUpdate={handleUpdateJob}
            onDelete={handleDeleteJob}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
