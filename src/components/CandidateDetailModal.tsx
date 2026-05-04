import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Clock, 
  Mail, 
  Globe, 
  FileText, 
  MessageSquare, 
  Lock, 
  Users, 
  Brain, 
  RotateCcw, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  Trash2,
  User,
  ExternalLink
} from 'lucide-react';
import { Candidate, Note, PipelineStage } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { generateCandidateIntelligence } from '@/src/services/aiService';

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  onUpdate: (updated: Candidate) => void;
}

export default function CandidateDetailModal({ candidate, onClose, onUpdate }: CandidateDetailModalProps) {
  const [noteText, setNoteText] = useState('');
  const [isNotePrivate, setIsNotePrivate] = useState(true);
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const stages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'sourcing', label: 'Sourcing', color: 'bg-neutral-100 text-neutral-500' },
    { id: 'submitted', label: 'Submitted', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-amber-50 text-amber-600' },
    { id: 'offer', label: 'Offer Stage', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'hired', label: 'Hired', color: 'bg-indigo-electric text-white' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-600' }
  ];

  const handleGenerateAi = async () => {
    setIsAiSummarizing(true);
    const summary = await generateCandidateIntelligence(candidate);
    setAiSummary(summary);
    setIsAiSummarizing(false);
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      authorId: 'me',
      text: noteText,
      isPrivate: isNotePrivate,
      timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    const updated = { ...candidate, notes: [newNote, ...(candidate.notes || [])] };
    onUpdate(updated);
    setNoteText('');
  };

  const updateStage = (stage: PipelineStage) => {
    onUpdate({ ...candidate, stage });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-midnight/80 backdrop-blur-xl z-[100] flex items-center justify-end"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full max-w-4xl h-full bg-cream shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="p-8 border-b border-midnight/5 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-indigo-electric text-white rounded-3xl flex items-center justify-center font-serif font-bold text-3xl italic shadow-2xl shadow-indigo-500/20 uppercase">
              {candidate.name[0]}
            </div>
            <div>
              <h2 className="text-3xl font-serif font-bold text-midnight italic">{candidate.name}</h2>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-indigo-electric font-bold text-[10px] uppercase tracking-widest">{candidate.title}</span>
                <span className="w-1 h-1 bg-midnight/10 rounded-full" />
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                  stages.find(s => s.id === candidate.stage)?.color
                )}>
                  {stages.find(s => s.id === candidate.stage)?.label}
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-neutral-100 rounded-full transition-all text-midnight/20 hover:text-midnight"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
          {/* Quick Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: MapPin, label: 'Location', val: candidate.location },
               { icon: Clock, label: 'Experience', val: `${candidate.experience} Years` },
               { icon: Mail, label: 'Email', val: candidate.email },
               { icon: Globe, label: 'Profile', val: candidate.linkedInUrl ? 'LinkedIn Connected' : 'Internal Only' },
             ].map(stat => (
               <div key={stat.label} className="bg-white p-5 rounded-2xl border border-midnight/5">
                 <stat.icon className="w-4 h-4 text-midnight/20 mb-3" />
                 <p className="text-[8px] font-bold uppercase tracking-widest text-midnight/30 mb-1">{stat.label}</p>
                 <p className="text-[11px] font-bold text-midnight truncate">{stat.val}</p>
               </div>
             ))}
          </section>

          {/* AI Intelligence */}
          <section className="bg-white p-8 rounded-[3rem] border border-midnight/5 space-y-6 relative overflow-hidden group">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-electric/10 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-electric" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-midnight">Recruiter Advisor Insights</h4>
                  <p className="text-[9px] font-bold text-midnight/30 uppercase tracking-widest">Autonomous Talent Parsing</p>
                </div>
              </div>
              <button 
                onClick={handleGenerateAi}
                disabled={isAiSummarizing}
                className="text-[9px] font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2 hover:opacity-70 transition-all"
              >
                {isAiSummarizing ? 'Analyzing Logic...' : 'Refresh DNA Map'} <RotateCcw className={cn("w-3 h-3", isAiSummarizing && "animate-spin")} />
              </button>
            </div>
            
            <div className="prose prose-sm font-medium text-midnight/70 leading-relaxed italic relative z-10">
              {isAiSummarizing ? (
                <div className="space-y-3">
                  <div className="h-4 bg-midnight/5 rounded-full animate-pulse w-full" />
                  <div className="h-4 bg-midnight/5 rounded-full animate-pulse w-[90%]" />
                  <div className="h-4 bg-midnight/5 rounded-full animate-pulse w-[75%]" />
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {aiSummary || "Activate Advisor Insights for strategic mission alignment analysis..."}
                </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-electric/5 blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </section>

          {/* Pipeline Management */}
          <section className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-midnight/30 px-2 space-x-2 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Pipeline Stage Synchronization
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {stages.map(stage => {
                const isActive = candidate.stage === stage.id;
                return (
                  <button 
                    key={stage.id}
                    onClick={() => updateStage(stage.id)}
                    className={cn(
                      "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2",
                      isActive 
                        ? (stage.id === 'rejected' ? "bg-red-500 text-white border-red-500" : "bg-midnight text-white border-midnight shadow-lg") 
                        : "bg-white text-midnight/40 border-midnight/5 hover:border-indigo-electric"
                    )}
                  >
                    {isActive ? <CheckCircle2 className="w-5 h-5 opacity-50" /> : <div className="w-5 h-5 rounded-full border-2 border-midnight/10" />}
                    <span className="text-[8px] font-bold uppercase tracking-widest">{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Internal Notes - THE USER REQUESTED SECTION */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-midnight flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-electric" /> Internal Intelligence Log
              </h4>
              <button 
                onClick={() => setIsNotePrivate(!isNotePrivate)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                  isNotePrivate ? "bg-midnight text-white" : "bg-white border border-midnight/5 text-midnight/40"
                )}
              >
                {isNotePrivate ? <Lock className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                {isNotePrivate ? 'Private Note' : 'Public to Company'}
              </button>
            </div>
            
            <div className="space-y-6 bg-white p-10 rounded-[3rem] border border-midnight/5">
              <div className="relative">
                <textarea
                  placeholder="Attach private details about pay expectations, interview sentiment, or specific role risks..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-8 bg-cream border border-transparent rounded-[2.5rem] focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-sm font-medium h-32 resize-none"
                />
                <button 
                  onClick={addNote}
                  className="absolute bottom-4 right-4 bg-indigo-electric text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-indigo-600/20"
                >
                  Encrypt & Save
                </button>
              </div>

              <div className="space-y-6">
                {(candidate.notes || []).map(note => (
                  <div key={note.id} className="p-6 bg-cream/50 border border-midnight/5 rounded-[2rem] relative group hover:bg-white transition-colors">
                     <div className="flex justify-between items-start mb-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-electric/10 rounded-xl flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-electric" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-midnight uppercase tracking-wider">Internal Recruiter</p>
                            <p className="text-[8px] font-bold text-midnight/30 uppercase tracking-widest">{note.timestamp}</p>
                          </div>
                       </div>
                       {note.isPrivate && (
                         <div className="flex items-center gap-2 px-2 py-1 bg-midnight/5 rounded-full">
                           <Lock className="w-3 h-3 text-midnight/30" />
                           <span className="text-[8px] font-bold text-midnight/20 uppercase">Encrypted</span>
                         </div>
                       )}
                     </div>
                     <p className="text-sm text-midnight/70 leading-relaxed font-medium pl-1">{note.text}</p>
                  </div>
                ))}
                {(!candidate.notes || candidate.notes.length === 0) && (
                  <div className="py-12 text-center text-midnight/20 space-y-3">
                    <MessageSquare className="w-8 h-8 mx-auto opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">No internal logs currently attached</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <footer className="pt-10 flex gap-4 flex-wrap border-t border-midnight/5">
             <button className="flex-1 py-4 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10">
               <FileText className="w-4 h-4" /> Download Resume DNA
             </button>
             <button className="flex-1 py-4 bg-white border border-midnight/5 text-midnight rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:border-indigo-electric/30 transition-all">
               <ExternalLink className="w-4 h-4" /> View Full Dossier
             </button>
             <button className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
               <Trash2 className="w-5 h-5" />
             </button>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
}
