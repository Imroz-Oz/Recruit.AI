import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Building2, 
  Users, 
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Search,
  Bell
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

export default function JobInventoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [matchingCandidates, setMatchingCandidates] = useState<any[]>([]);
  const [selectedJobForMatches, setSelectedJobForMatches] = useState<any | null>(null);

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
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(fetched);
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
        postedDate: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'recruiterJobs'), jobData);
      setJobs([{ id: docRef.id, ...jobData }, ...jobs]);
      setShowModal(false);
      setNewJob({ title: '', company: '', location: '', salary: '', description: '', requirements: '' });
      
      // Trigger matching logic
      checkForMatches({ id: docRef.id, ...jobData });
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recruiterJobs', id));
      setJobs(jobs.filter(j => j.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const checkForMatches = async (job: any) => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'candidates'),
        where('recruiterId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const allCandidates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      // Basic matching logic: search keywords in title or requirements
      const matches = allCandidates.filter(c => {
        const titleMatch = (c.title || '').toLowerCase().includes(job.title.toLowerCase());
        const skillMatch = job.requirements.some((r: string) => 
          (c.keywords || []).some((k: string) => k.toLowerCase().includes(r.toLowerCase()))
        );
        return titleMatch || skillMatch;
      });

      if (matches.length > 0) {
        setMatchingCandidates(matches);
        setSelectedJobForMatches(job);
      }
    } catch (error) {
      console.error('Matching failed:', error);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 rounded-full border border-amber-100">
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-[0.2em]">Recruiter Job Inventory</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Active Postings</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Create and manage internal vacancies for high-fidelity matching</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="px-8 py-3 bg-midnight text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-midnight/20 hover:scale-105 transition-all flex items-center gap-3"
        >
          <Plus className="w-4 h-4" /> Create Intelligence Brief
        </button>
      </header>

      {selectedJobForMatches && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-indigo-electric p-8 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-indigo-500/30"
        >
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
             <Bell className="w-8 h-8 text-white animate-bounce" />
          </div>
          <div className="flex-1 space-y-1 text-center md:text-left">
             <h3 className="text-2xl font-serif font-bold italic">Intelligence Match Detected!</h3>
             <p className="text-white/60 text-xs font-medium">We found {matchingCandidates.length} candidates in your internal archive for the **{selectedJobForMatches.title}** role.</p>
          </div>
          <button 
            onClick={() => setSelectedJobForMatches(null)}
            className="px-8 py-3 bg-white text-indigo-electric rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-100 transition-all"
          >
            Review Talent Now
          </button>
        </motion.div>
      )}

      {isLoading ? (
        <div className="py-40 flex justify-center">
          <Zap className="w-12 h-12 text-indigo-electric animate-spin opacity-20" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="py-40 text-center space-y-6 bg-white rounded-[4rem] border border-dashed border-midnight/5">
          <div className="w-20 h-20 bg-warm-gray/30 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-midnight/20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-serif font-bold text-midnight italic">No Active Briefs</h3>
            <p className="text-xs text-midnight/40 font-medium">Create your first job posting to start matching with your internal database.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-4 bg-midnight text-white rounded-full font-bold text-xs uppercase tracking-widest"
          >
            Define New Requirement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {jobs.map((job) => (
            <motion.div 
              key={job.id}
              className="bg-white p-8 rounded-[3rem] border border-midnight/5 shadow-sm hover:shadow-xl hover:shadow-midnight/5 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-warm-gray/30 rounded-[1.5rem] flex items-center justify-center text-midnight/40 group-hover:bg-midnight group-hover:text-white transition-all">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-serif font-bold text-midnight italic">{job.title}</h4>
                    <div className="flex gap-4 mt-2">
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest italic">
                         <Building2 className="w-3.5 h-3.5" /> {job.company}
                       </span>
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest italic">
                         <MapPin className="w-3.5 h-3.5" /> {job.location}
                       </span>
                       <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-electric uppercase tracking-widest italic">
                         <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 bg-warm-gray rounded-xl hover:bg-neutral-200 transition-all"><Edit3 className="w-5 h-5 text-midnight/40" /></button>
                  <button onClick={() => handleDeleteJob(job.id)} className="p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-all"><Trash2 className="w-5 h-5 text-red-400" /></button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {job.requirements.map((req: string, i: number) => (
                  <span key={i} className="px-4 py-1.5 bg-indigo-electric/5 border border-indigo-200/20 text-indigo-electric text-[9px] font-bold rounded-full uppercase tracking-widest">
                    {req}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center pt-8 border-t border-midnight/5">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-2">
                     <Users className="w-4 h-4 text-midnight/20" />
                     <span className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Matches: <span className="text-indigo-electric italic">Auto-Syncing</span></span>
                   </div>
                   <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4 text-midnight/20" />
                     <span className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Created {new Date(job.postedDate).toLocaleDateString()}</span>
                   </div>
                </div>
                <button 
                  onClick={() => checkForMatches(job)}
                  className="px-6 py-2.5 bg-midnight text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-coral transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Run Match Analysis
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-10 right-10 text-midnight/20 hover:text-midnight transition-colors"
              >
                <Trash2 className="w-8 h-8" />
              </button>

              <div className="mb-10 text-center">
                <h3 className="text-3xl font-serif font-bold italic text-midnight">New Intelligence Brief</h3>
                <p className="text-xs text-midnight/40 font-bold uppercase tracking-widest mt-2">Define the vacancy semantics</p>
              </div>

              <form onSubmit={handleCreateJob} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">Job Title</label>
                    <input 
                      required
                      value={newJob.title}
                      onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                      placeholder="e.g. Senior Neural Engineer"
                      className="w-full p-4 bg-warm-gray rounded-2xl outline-none focus:bg-white focus:border-indigo-electric border border-transparent transition-all font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">Company / Division</label>
                    <input 
                      required
                      value={newJob.company}
                      onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                      placeholder="Internal Division A"
                      className="w-full p-4 bg-warm-gray rounded-2xl outline-none focus:bg-white focus:border-indigo-electric border border-transparent transition-all font-bold text-sm" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">Location</label>
                    <input 
                      required
                      value={newJob.location}
                      onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                      placeholder="Remote / HQ"
                      className="w-full p-4 bg-warm-gray rounded-2xl outline-none focus:bg-white focus:border-indigo-electric border border-transparent transition-all font-bold text-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">Salary Range</label>
                    <input 
                      required
                      value={newJob.salary}
                      onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
                      placeholder="e.g. $140k - $180k"
                      className="w-full p-4 bg-warm-gray rounded-2xl outline-none focus:bg-white focus:border-indigo-electric border border-transparent transition-all font-bold text-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">Semantic Requirements (Comma Separated)</label>
                  <input 
                    required
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                    placeholder="Java, AWS, Microservices, Kubernetes"
                    className="w-full p-4 bg-warm-gray rounded-2xl outline-none focus:bg-white focus:border-indigo-electric border border-transparent transition-all font-bold text-sm" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">Full Intelligence Context (Description)</label>
                  <textarea 
                    required
                    value={newJob.description}
                    onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                    placeholder="Describe the mission parameters..."
                    className="w-full h-32 p-4 bg-warm-gray rounded-[2rem] outline-none focus:bg-white focus:border-indigo-electric border border-transparent transition-all font-medium text-sm resize-none" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.3em] shadow-2xl shadow-midnight/30 hover:bg-indigo-electric transition-all flex items-center justify-center gap-3"
                >
                  {isSyncing ? <Zap className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {isSyncing ? 'Synchronizing...' : 'Deploy Job Intelligence'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
