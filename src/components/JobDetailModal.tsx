import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  DollarSign, 
  Building2, 
  Briefcase, 
  FileText, 
  Users, 
  Zap, 
  Sparkles, 
  Calendar,
  Lock,
  User,
  Trash2,
  Edit3,
  CheckCircle2,
  Brain
} from 'lucide-react';
import { Job, Note } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onUpdate: (updated: Job) => void;
  onDelete?: (id: string) => void;
}

export default function JobDetailModal({ job, onClose, onUpdate, onDelete }: JobDetailModalProps) {
  const [noteText, setNoteText] = useState('');
  const [isNotePrivate, setIsNotePrivate] = useState(true);

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      authorId: 'me',
      text: noteText,
      isPrivate: isNotePrivate,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const updated = { ...job, notes: [newNote, ...(job.notes || [])] };
    onUpdate(updated);
    setNoteText('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#1e293b]/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-5xl h-[85vh] bg-cream rounded-[4rem] shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-10 border-b border-slate-300/5 bg-white flex justify-between items-start shrink-0">
          <div className="flex gap-8">
            <div className="w-20 h-20 bg-[#1e293b] text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-black/20">
              <Building2 className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-3 py-1 bg-violet/10 text-violet rounded-full text-base font-bold uppercase tracking-widest border border-violet/20">
                  Mission Brief ID: {job.id.slice(0, 8)}
                </div>
                <span className="text-[#0f172a]/20 text-base font-bold uppercase tracking-widest">Posted {new Date(job.postedDate).toLocaleDateString()}</span>
              </div>
              <h2 className="text-4xl font-serif font-bold text-[#0f172a] italic">{job.title}</h2>
              <div className="flex gap-6 mt-4">
                 <span className="flex items-center gap-2 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest italic">
                   <Building2 className="w-4 h-4" /> {job.company}
                 </span>
                 <span className="flex items-center gap-2 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest italic">
                   <MapPin className="w-4 h-4" /> {job.location}
                 </span>
                 <span className="flex items-center gap-2 text-base font-bold text-indigo-electric uppercase tracking-widest italic">
                   <DollarSign className="w-4 h-4" /> {job.salary || 'Competitive'}
                 </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="p-4 bg-warm-gray rounded-2xl hover:bg-neutral-200 transition-all text-[#0f172a]/60"><Edit3 className="w-6 h-6" /></button>
             {onDelete && (
                <button 
                  onClick={() => { onDelete(job.id); onClose(); }} 
                  className="p-4 bg-red-50 rounded-2xl hover:bg-red-500 hover:text-white transition-all text-red-500"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
             )}
             <button 
              onClick={onClose}
              className="p-4 bg-white border border-slate-300/5 rounded-2xl hover:bg-neutral-100 transition-all text-[#0f172a]/20 hover:text-[#0f172a] ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-0 divide-x divide-midnight/5 scrollbar-hide">
          {/* Left Column: Mission Parameters */}
          <div className="lg:col-span-2 p-12 space-y-12">
            <section className="space-y-6">
              <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet" /> Strategic Context
              </h4>
              <div className="prose prose-midnight max-w-none">
                <p className="text-lg font-medium text-[#0f172a]/70 leading-relaxed italic">
                  {job.description}
                </p>
              </div>
            </section>

            <section className="space-y-6">
               <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
                <Zap className="w-4 h-4 text-coral" /> Semantic Requirements
              </h4>
              <div className="flex flex-wrap gap-3">
                {job.requirements.map((req, i) => (
                  <span key={i} className="px-6 py-2.5 bg-white border border-slate-300/5 text-[#0f172a] text-base font-bold rounded-2xl uppercase tracking-widest shadow-sm">
                    {req}
                  </span>
                ))}
              </div>
            </section>

            {/* Internal Notes Section */}
            <section className="space-y-6 pt-12 border-t border-slate-300/5">
              <div className="flex justify-between items-center px-2">
                <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a] flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-electric" /> Internal Briefing Notes
                </h4>
                <div className="flex gap-2">
                   <button 
                    onClick={() => setIsNotePrivate(!isNotePrivate)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-base font-bold uppercase tracking-widest transition-all",
                      isNotePrivate ? "bg-[#1e293b] text-white" : "bg-white border border-slate-300/5 text-[#0f172a]/40"
                    )}
                  >
                    {isNotePrivate ? <Lock className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                    {isNotePrivate ? 'Internal Only' : 'Shared with Team'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    placeholder="Add mission-critical notes: e.g., 'Urgently needs backfill', 'Client prefers local talent', 'Strategic role for Q3'..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full p-8 bg-white border border-slate-300/5 rounded-3xl focus:border-indigo-electric/20 outline-none transition-all text-base font-medium h-32 resize-none shadow-sm"
                  />
                  <button 
                    onClick={addNote}
                    className="absolute bottom-4 right-4 bg-indigo-electric text-white px-8 py-3 rounded-2xl text-base font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Post Note
                  </button>
                </div>

                <div className="space-y-4">
                  {(job.notes || []).map(note => (
                    <div key={note.id} className="p-6 bg-white border border-slate-300/5 rounded-[2rem] relative group hover:border-indigo-electric/20 transition-all">
                       <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#1e293b]/5 rounded-xl flex items-center justify-center">
                              <User className="w-4 h-4 text-[#0f172a]/30" />
                            </div>
                            <div>
                              <p className="text-base font-bold text-[#0f172a] uppercase tracking-wider">Strategic Sourcing Lead</p>
                              <p className="text-base font-bold text-[#0f172a]/30 uppercase tracking-widest">{note.timestamp}</p>
                            </div>
                         </div>
                       </div>
                       <p className="text-base text-[#0f172a]/70 leading-relaxed font-medium">{note.text}</p>
                    </div>
                  ))}
                  {(!job.notes || job.notes.length === 0) && (
                    <div className="py-12 text-center text-[#0f172a]/20 space-y-3">
                      <Sparkles className="w-8 h-8 mx-auto opacity-20" />
                      <p className="text-base font-bold uppercase tracking-[0.2em]">Deploy strategic notes to help align the sourcing mission</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Mission Intelligence & Matches */}
          <div className="p-12 bg-white/50 space-y-12 h-fill">
            <section className="space-y-6">
               <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a] italic">Market Analysis</h4>
               <div className="space-y-4">
                 {[
                   { label: 'Market Velocity', val: 'Fast', color: 'text-emerald-500' },
                   { label: 'Scarcity Index', val: '8.4/10', color: 'text-amber-500' },
                   { label: 'Network Overlap', val: '24 Profiles', color: 'text-indigo-electric' },
                 ].map(metric => (
                   <div key={metric.label} className="p-5 bg-white border border-slate-300/5 rounded-2xl flex justify-between items-center group hover:border-indigo-electric/20 transition-all">
                      <span className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40">{metric.label}</span>
                      <span className={cn("text-lg font-serif font-bold italic", metric.color)}>{metric.val}</span>
                   </div>
                 ))}
               </div>
            </section>

            <section className="space-y-8">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a] italic">Intelligence Matches</h4>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-base font-bold uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live Analysis
                </div>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 bg-white border border-slate-300/5 rounded-[2rem] hover:border-violet/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-base font-bold text-violet uppercase tracking-widest">Neural Match 9{2+i}%</span>
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="font-serif font-bold text-[#0f172a] italic">Candidate ID #0{i}64</div>
                    <p className="text-base font-bold text-[#0f172a]/30 uppercase mt-1">Staff Architect • Seattle, WA</p>
                  </div>
                ))}
              </div>
              
              <button className="w-full py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-[0.2em] hover:bg-violet transition-all shadow-xl shadow-midnight/10">
                Launch Full Scout Mission
              </button>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
