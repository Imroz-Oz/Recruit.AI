import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Clock, Mail, Globe, FileText, MessageSquare, Lock, Users, Brain, RotateCcw, 
  DollarSign, Calendar, CheckCircle2, Trash2, User, ExternalLink, Briefcase, Target, 
  TrendingUp, Zap, ChevronRight, Save, Phone, Sparkles, Rocket
} from 'lucide-react';
import { Candidate, PipelineStage } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { generateCandidateIntelligence } from '@/src/services/aiService';

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdate: (updated: Candidate) => void;
}

export default function CandidateDetailModal({ candidate, onClose, onUpdate }: CandidateDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'submittal' | 'interview' | 'offer'>('profile');
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  // Form states for automation
  const [formData, setFormData] = useState<Partial<Candidate>>({ ...candidate });

  const handleUpdate = () => {
    // Automated Status Triggers
    let newStage = formData.stage || candidate.stage;

    // 1. If submittal details are filled, move to 'submitted'
    if (newStage === 'sourcing' && formData.clientName && formData.jobId) {
      newStage = 'submitted';
    }

    // 2. If interview details are filled, move to 'interviewing'
    if ((newStage === 'submitted' || newStage === 'sourcing') && formData.interviewDate) {
      newStage = 'interviewing';
    }

    // 3. If start date or offer date, move to 'offer' or 'hired'
    if (formData.startDate) {
      newStage = 'hired';
    } else if (formData.offerDate && newStage !== 'hired') {
      newStage = 'offer';
    }

    const updatedCandidate = { ...formData, stage: newStage } as Candidate;
    onUpdate(updatedCandidate);
  };

  const handleGenerateAi = async () => {
    setIsAiSummarizing(true);
    const summary = await generateCandidateIntelligence(candidate);
    setAiSummary(summary);
    setIsAiSummarizing(false);
  };

  const stages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'sourcing', label: 'Sourcing', color: 'bg-neutral-100 text-neutral-500' },
    { id: 'submitted', label: 'Submitted', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-amber-50 text-amber-600' },
    { id: 'offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'hired', label: 'Hired', color: 'bg-indigo-electric text-white' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#1e293b]/80 backdrop-blur-xl z-[150] flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-5xl h-full bg-cream shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header */}
        <header className="p-8 border-b border-slate-300/5 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#1e293b] text-white rounded-2xl flex items-center justify-center font-serif font-bold text-2xl italic shadow-2xl shadow-midnight/20">
              {candidate.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-serif font-bold text-[#0f172a] italic">{candidate.name}</h2>
                <div className={cn(
                  "px-3 py-1 rounded-full text-base font-bold uppercase tracking-widest",
                  stages.find(s => s.id === candidate.stage)?.color
                )}>
                  {stages.find(s => s.id === candidate.stage)?.label}
                </div>
              </div>
              <p className="text-indigo-electric font-bold text-base uppercase tracking-widest mt-1">{candidate.title} • {candidate.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleUpdate}
              className="px-6 py-3 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Dossier
            </button>
            <button onClick={onClose} className="p-3 hover:bg-neutral-100 rounded-full transition-all text-[#0f172a]/20 hover:text-[#0f172a]">
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex px-8 bg-white border-b border-slate-300/5 shrink-0 overflow-x-auto scrollbar-hide">
          {[
            { id: 'profile', label: 'Candidate Profile', icon: User },
            { id: 'submittal', label: 'Client Submittal', icon: Target },
            { id: 'interview', label: 'Interview Process', icon: Calendar },
            { id: 'offer', label: 'Offer & Start', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-5 text-base font-bold uppercase tracking-widest flex items-center gap-3 border-b-2 transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-indigo-electric text-indigo-electric" 
                  : "border-transparent text-[#0f172a]/30 hover:text-[#0f172a]/60"
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </nav>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div 
                key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {/* Basic Details Info */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                       <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 px-1">Email Contact</label>
                       <input 
                         type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})}
                         className="w-full p-4 bg-white border border-slate-300/5 rounded-2xl text-base font-medium outline-none focus:border-indigo-electric/30 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 px-1">Phone Number</label>
                       <input 
                         type="text" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full p-4 bg-white border border-slate-300/5 rounded-2xl text-base font-medium outline-none focus:border-indigo-electric/30 transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 px-1">Expected Pay</label>
                       <div className="relative">
                         <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/20" />
                         <input 
                           type="text" value={formData.expectedPay || ''} onChange={e => setFormData({...formData, expectedPay: e.target.value})}
                           className="w-full pl-10 pr-4 py-4 bg-white border border-slate-300/5 rounded-2xl text-base font-medium outline-none focus:border-indigo-electric/30 transition-all"
                           placeholder="e.g. 150k/yr"
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 px-1">Years Exp</label>
                       <input 
                         type="number" value={formData.experience || 0} onChange={e => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                         className="w-full p-4 bg-white border border-slate-300/5 rounded-2xl text-base font-medium outline-none focus:border-indigo-electric/30 transition-all"
                       />
                    </div>
                 </div>

                 {/* Advanced Notes */}
                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 text-base font-bold uppercase tracking-widest text-[#0f172a] px-1">
                       <Lock className="w-3 h-3 text-coral" /> Private Intelligence Notes
                     </div>
                     <textarea 
                       value={formData.privateNotes || ''} onChange={e => setFormData({...formData, privateNotes: e.target.value})}
                       placeholder="Confidential notes visible ONLY to you..."
                       className="w-full h-40 p-6 bg-white border border-slate-300/5 rounded-[2rem] text-base font-medium resize-none outline-none focus:border-coral/30"
                     />
                   </div>
                   <div className="space-y-4">
                     <div className="flex items-center gap-2 text-base font-bold uppercase tracking-widest text-[#0f172a] px-1">
                       <Users className="w-3 h-3 text-indigo-electric" /> Shared Internal Notes
                     </div>
                     <textarea 
                       value={formData.internalNotes || ''} onChange={e => setFormData({...formData, internalNotes: e.target.value})}
                       placeholder="Collaborative notes visible to all recruiters in your org..."
                       className="w-full h-40 p-6 bg-white border border-slate-300/5 rounded-[2rem] text-base font-medium resize-none outline-none focus:border-indigo-electric/30"
                     />
                   </div>
                 </div>

                 {/* AI Insights */}
                 <div className="bg-[#1e293b] p-10 rounded-3xl text-white space-y-6 relative overflow-hidden group">
                    <div className="relative z-10 flex justify-between items-start">
                       <div className="flex gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-indigo-electric" />
                          </div>
                          <div>
                            <h4 className="text-base font-serif font-bold italic tracking-wide">Recruiter Advisor Intelligence</h4>
                            <p className="text-base font-bold text-white/40 uppercase tracking-widest">Autonomous Profile Optimization</p>
                          </div>
                       </div>
                       <button onClick={handleGenerateAi} className="text-base font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all">
                         Analyze Genetic Match
                       </button>
                    </div>
                    <div className="relative z-10 text-base font-medium text-white/70 italic leading-relaxed">
                       {aiSummary || "Run intelligence scan to identify hidden profile strengths and career trajectory anomalies..."}
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === 'submittal' && (
               <motion.div 
                 key="submittal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                 className="space-y-12"
               >
                 <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-[#0f172a] italic">Client Submission Blueprint</h3>
                    <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 italic">Filling these fields will automatically update stage to 'SUBMITTED'</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6 bg-white p-10 rounded-3xl border border-slate-300/5">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2"><Briefcase className="w-4 h-4" /> Mission Targets</h4>
                       <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-[#0f172a]/40 px-1">Target Client Name</label>
                            <input 
                              type="text" value={formData.clientName || ''} onChange={e => setFormData({...formData, clientName: e.target.value})}
                              className="w-full p-4 bg-warm-gray border border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-electric/30 outline-none transition-all"
                              placeholder="e.g. Quantum Dynamics Corp"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-[#0f172a]/40 px-1">Target Job ID / Requisition</label>
                            <input 
                              type="text" value={formData.jobId || ''} onChange={e => setFormData({...formData, jobId: e.target.value})}
                              className="w-full p-4 bg-warm-gray border border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-electric/30 outline-none transition-all"
                              placeholder="e.g. JD-2024-88A"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 bg-white p-10 rounded-3xl border border-slate-300/5">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2"><DollarSign className="w-4 h-4" /> Financial Projections</h4>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-[#0f172a]/40 px-1">Candidate Pay Rate</label>
                            <input 
                              type="text" value={formData.payRate || ''} onChange={e => setFormData({...formData, payRate: e.target.value})}
                              className="w-full p-4 bg-warm-gray border border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-electric/30 outline-none transition-all"
                              placeholder="$85/hr"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-[#0f172a]/40 px-1">Client Bill Rate</label>
                            <input 
                              type="text" value={formData.billRate || ''} onChange={e => setFormData({...formData, billRate: e.target.value})}
                              className="w-full p-4 bg-warm-gray border border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-electric/30 outline-none transition-all"
                              placeholder="$120/hr"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-[#0f172a]/40 px-1">Additional Bonus</label>
                            <input 
                              type="text" value={formData.bonus || ''} onChange={e => setFormData({...formData, bonus: e.target.value})}
                              className="w-full p-4 bg-warm-gray border border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-electric/30 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-[#0f172a]/40 px-1">Per Diem / Stipend</label>
                            <input 
                              type="text" value={formData.perDiem || ''} onChange={e => setFormData({...formData, perDiem: e.target.value})}
                              className="w-full p-4 bg-warm-gray border border-transparent rounded-2xl text-base font-medium focus:bg-white focus:border-indigo-electric/30 outline-none transition-all"
                            />
                          </div>
                       </div>
                    </div>
                 </div>
               </motion.div>
            )}

            {activeTab === 'interview' && (
               <motion.div 
                 key="interview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                 className="space-y-12"
               >
                 <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-[#0f172a] italic">Tactical Interview Scheduler</h3>
                    <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 italic">Coordinate field activities and capture mission sentiment</p>
                 </div>

                 <div className="bg-white p-12 rounded-[4rem] border border-slate-300/5 flex flex-col items-center text-center space-y-8">
                    <div className="w-20 h-20 bg-amber-50 rounded-[2rem] flex items-center justify-center">
                       <Calendar className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="max-w-md space-y-4">
                       <label className="text-base font-bold text-[#0f172a] block">Select Engagement Timestamp</label>
                       <input 
                         type="datetime-local" 
                         value={formData.interviewDate || ''} 
                         onChange={e => setFormData({...formData, interviewDate: e.target.value})}
                         className="w-full p-5 bg-warm-gray rounded-3xl text-base font-bold border-2 border-transparent focus:border-amber-500 transition-all outline-none"
                       />
                       <p className="text-base font-medium text-[#0f172a]/40 tracking-[0.05em] leading-relaxed">
                         Note: Setting this date will automatically elevate the candidate to <span className="text-amber-600 font-bold">'INTERVIEWING'</span> status.
                       </p>
                    </div>

                    <div className="w-full pt-8 space-y-4">
                       <label className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/30 block text-left px-4">Post-Engagement Debrief</label>
                       <textarea 
                         value={formData.interviewNotes || ''} onChange={e => setFormData({...formData, interviewNotes: e.target.value})}
                         placeholder="Capturing candidate sentiment, technical proficiency, and mission risk factors..."
                         className="w-full h-40 p-8 bg-warm-gray border border-transparent rounded-3xl text-base font-medium resize-none outline-none focus:bg-white focus:border-amber-500/20 transition-all"
                       />
                    </div>
                 </div>
               </motion.div>
            )}

            {activeTab === 'offer' && (
               <motion.div 
                 key="offer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                 className="space-y-12"
               >
                 <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-[#0f172a] italic">Mission Close: Offer & Start</h3>
                    <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 italic">Finalize the deployment and finalize contract details</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-100 space-y-6">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-800 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Offer Details</h4>
                       <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-emerald-800/40 px-1">Offer Release Date</label>
                            <input 
                              type="date" value={formData.offerDate || ''} onChange={e => setFormData({...formData, offerDate: e.target.value})}
                              className="w-full p-4 bg-white border border-emerald-100 rounded-2xl text-base font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-emerald-800/40 px-1">Total Compensation Package</label>
                            <input 
                              type="text" value={formData.totalPackage || ''} onChange={e => setFormData({...formData, totalPackage: e.target.value})}
                              className="w-full p-4 bg-white border border-emerald-100 rounded-2xl text-base font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                              placeholder="e.g. $185k + 10% Bonus"
                            />
                          </div>
                       </div>
                    </div>

                    <div className="bg-indigo-50 p-10 rounded-3xl border border-indigo-100 space-y-6">
                       <h4 className="text-sm font-bold uppercase tracking-widest text-indigo-800 flex items-center gap-2"><Rocket className="w-4 h-4" /> Deployment Start</h4>
                       <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-base font-bold uppercase text-indigo-800/40 px-1">Official Start Date</label>
                            <input 
                              type="date" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})}
                              className="w-full p-4 bg-white border border-indigo-100 rounded-2xl text-base font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                          <p className="text-base italic text-indigo-400 leading-relaxed font-bold px-1">
                            Setting a start date marks this lifecycle as <span className="text-indigo-electric uppercase">'COMPLETED / STARTED'</span> and will reflect in your performance analytics.
                          </p>
                       </div>
                    </div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
