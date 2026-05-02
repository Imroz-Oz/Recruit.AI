import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ChevronRight, 
  MoreHorizontal, 
  Calendar, 
  DollarSign, 
  Building2, 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Lock,
  Globe,
  User
} from 'lucide-react';
import { Candidate, PipelineStage, SubmissionDetails, Note } from '@/src/types';
import { cn } from '@/src/lib/utils';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([
    {
      id: '1',
      name: 'Alex Rivera',
      title: 'Senior Backend Engineer',
      email: 'alex@example.com',
      location: 'San Jose, CA',
      experience: 8,
      skills: ['Go', 'Kubernetes', 'gRPC'],
      isInternal: true,
      stage: 'sourcing',
      notes: []
    },
    {
      id: '2',
      name: 'Sarah Chen',
      title: 'Staff Architect',
      email: 'sarah@example.com',
      location: 'Remote',
      experience: 12,
      skills: ['Distributed Systems', 'Java', 'AWS'],
      isInternal: false,
      stage: 'submitted',
      submissionDetails: {
        payRate: '$120/hr',
        billRate: '$165/hr',
        duration: '12 Months',
        clientName: 'FinTech Corp',
        jobId: 'FT-992'
      },
      notes: []
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isNotePrivate, setIsNotePrivate] = useState(true);
  const [noteText, setNoteText] = useState('');

  const stages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'sourcing', label: 'Sourcing', color: 'bg-neutral-100 text-neutral-500' },
    { id: 'submitted', label: 'Submitted to Client', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-amber-50 text-amber-600' },
    { id: 'offer', label: 'Offer Stage', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-600' }
  ];

  const handleMoveStage = (candidateId: string, nextStage: PipelineStage) => {
    setSelectedCandidate(prev => {
      if (prev?.id === candidateId) {
        return { ...prev, stage: nextStage };
      }
      return prev;
    });
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: nextStage } : c));
  };

  const addNote = () => {
    if (!selectedCandidate || !noteText.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      authorId: 'me',
      text: noteText,
      isPrivate: isNotePrivate,
      timestamp: new Date().toLocaleTimeString()
    };
    const updated = { ...selectedCandidate, notes: [newNote, ...selectedCandidate.notes] };
    setSelectedCandidate(updated);
    setCandidates(prev => prev.map(c => c.id === selectedCandidate.id ? updated : c));
    setNoteText('');
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Active Pipeline</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest mt-2">Manage submissions, interviews, and offers</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-midnight text-white rounded-full font-bold text-xs uppercase tracking-widest shadow-xl shadow-midnight/10">
            Export Tracker
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        {/* Candidates List */}
        <div className="lg:col-span-1 bg-white rounded-[3rem] border border-midnight/5 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-midnight/5 bg-warm-gray/30">
             <div className="relative">
              <input 
                placeholder="Filter pipeline..." 
                className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-midnight/5 outline-none focus:border-indigo-electric/40"
              />
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/20" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
             {candidates.map(candidate => (
               <div 
                 key={candidate.id}
                 onClick={() => setSelectedCandidate(candidate)}
                 className={cn(
                   "p-5 rounded-2xl border transition-all cursor-pointer group",
                   selectedCandidate?.id === candidate.id 
                    ? "bg-midnight text-white border-midnight shadow-xl" 
                    : "bg-white border-midnight/5 hover:border-indigo-electric/20"
                 )}
               >
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-serif font-bold italic">{candidate.name}</h4>
                   <span className={cn(
                     "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                     stages.find(s => s.id === candidate.stage)?.color
                   )}>
                     {stages.find(s => s.id === candidate.stage)?.label}
                   </span>
                 </div>
                 <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-4", selectedCandidate?.id === candidate.id ? "text-white/60" : "text-midnight/40")}>
                   {candidate.title}
                 </p>
                 <div className="flex items-center gap-3">
                   {candidate.submissionDetails?.clientName && (
                     <div className="flex items-center gap-1.5">
                       <Building2 className="w-3 h-3 opacity-30" />
                       <span className="text-[9px] font-bold">{candidate.submissionDetails.clientName}</span>
                     </div>
                   )}
                   <div className="flex-1" />
                   <ChevronRight className="w-4 h-4 opacity-10 group-hover:opacity-100 transition-all" />
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Candidate Detail View */}
        <div className="lg:col-span-2 space-y-8 flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {selectedCandidate ? (
              <motion.div 
                key={selectedCandidate.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col flex-1 space-y-8 min-h-0"
              >
                <div className="bg-white p-10 rounded-[3.5rem] border border-midnight/5 shadow-sm space-y-10 overflow-y-auto scrollbar-hide">
                  <section className="flex justify-between items-start">
                    <div className="flex gap-6">
                      <div className="w-20 h-20 bg-indigo-electric text-white rounded-3xl flex items-center justify-center font-serif font-bold text-3xl italic shadow-2xl shadow-indigo-500/20">
                        {selectedCandidate.name[0]}
                      </div>
                      <div>
                        <h3 className="text-3xl font-serif font-bold text-midnight italic">{selectedCandidate.name}</h3>
                        <p className="text-indigo-electric font-bold text-xs uppercase tracking-widest mt-1">{selectedCandidate.title}</p>
                        <div className="flex gap-4 mt-4 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> {selectedCandidate.location}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {selectedCandidate.experience} Years Exp</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-warm-gray rounded-full hover:bg-neutral-200 transition-all"><MessageSquare className="w-5 h-5" /></button>
                      <button className="p-3 bg-warm-gray rounded-full hover:bg-neutral-200 transition-all"><MoreHorizontal className="w-5 h-5" /></button>
                    </div>
                  </section>

                  <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stages.filter(s => s.id !== 'rejected').map(stage => {
                      const isActive = selectedCandidate.stage === stage.id;
                      return (
                        <button 
                          key={stage.id}
                          onClick={() => handleMoveStage(selectedCandidate.id, stage.id)}
                          className={cn(
                            "p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2",
                            isActive 
                              ? "bg-midnight text-white border-midnight shadow-lg" 
                              : "bg-white text-midnight/40 border-midnight/5 hover:border-indigo-electric"
                          )}
                        >
                          {isActive ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <div className="w-5 h-5 rounded-full border-2 border-midnight/10" />}
                          <span className="text-[9px] font-bold uppercase tracking-widest">{stage.label}</span>
                        </button>
                      );
                    })}
                  </section>

                  {/* Submission Specifics */}
                  {(selectedCandidate.stage !== 'sourcing') && (
                    <section className="bg-warm-gray/30 p-8 rounded-[2.5rem] border border-midnight/5 space-y-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-midnight mb-6 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" /> Submission Intelligence
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-midnight/30 uppercase tracking-widest">Client Name</label>
                          <p className="text-sm font-bold">{selectedCandidate.submissionDetails?.clientName || '---'}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-midnight/30 uppercase tracking-widest">Job ID</label>
                          <p className="text-sm font-bold">{selectedCandidate.submissionDetails?.jobId || '---'}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-midnight/30 uppercase tracking-widest">Pay Rate</label>
                          <p className="text-sm font-bold">{selectedCandidate.submissionDetails?.payRate || '---'}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-midnight/30 uppercase tracking-widest">Bill Rate / Margin</label>
                          <p className="text-sm font-bold text-indigo-600">{selectedCandidate.submissionDetails?.billRate || 'Direct'}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-midnight/30 uppercase tracking-widest">Assignment Start</label>
                          <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 italic">
                            <Calendar className="w-3.5 h-3.5" /> {selectedCandidate.submissionDetails?.startDate || 'TBD'}
                          </p>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-white border border-midnight/5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-midnight/40 hover:text-midnight transition-colors">
                        Update Submission Details
                      </button>
                    </section>
                  )}

                  {/* Notes & Activity */}
                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-midnight flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" /> Recruiter Log
                      </h4>
                      <div className="flex gap-2">
                         <button 
                          onClick={() => setIsNotePrivate(!isNotePrivate)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all",
                            isNotePrivate ? "bg-midnight text-white" : "bg-neutral-100 text-midnight/40"
                          )}
                        >
                          {isNotePrivate ? <Lock className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          {isNotePrivate ? 'Private' : 'Company Public'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="relative">
                        <textarea
                          placeholder="Add details about pay, geo-preference, shift needs, or interview feedback..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          className="w-full p-6 bg-warm-gray border border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-sm font-medium h-24"
                        />
                        <button 
                          onClick={addNote}
                          className="absolute bottom-4 right-4 bg-midnight text-white px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-electric transition-all"
                        >
                          Save Note
                        </button>
                      </div>
                      <div className="space-y-4 pt-4">
                        {selectedCandidate.notes.map(note => (
                          <div key={note.id} className="p-5 bg-white border border-midnight/5 rounded-[2rem] relative shadow-sm">
                             <div className="flex justify-between items-start mb-3">
                               <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-midnight/40" />
                                  </div>
                                  <span className="text-[9px] font-bold text-midnight uppercase tracking-wider">You • {note.timestamp}</span>
                               </div>
                               {note.isPrivate && <Lock className="w-3 h-3 text-midnight/20" />}
                             </div>
                             <p className="text-sm text-midnight/70 leading-relaxed font-medium">{note.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30 select-none">
                <Users className="w-20 h-20 mb-6" />
                <h3 className="text-2xl font-serif font-bold italic">Select a Candidate</h3>
                <p className="text-sm font-medium mt-2">Choose a profile from the pipeline to manage their matching intelligence and submission workflow.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
