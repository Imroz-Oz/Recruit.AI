import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ChevronRight, 
  Building2, 
  Globe, 
  Brain, 
  Search,
  CheckCircle2,
  Filter,
  X,
  LayoutGrid,
  Columns,
  Sparkles,
  Target,
  Rocket
} from 'lucide-react';
import { Candidate, PipelineStage } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { generatePipelineBriefing } from '@/src/services/aiService';
import CandidateDetailModal from '@/src/components/CandidateDetailModal';
import CandidateFilterModal from '@/src/components/CandidateFilterModal';

export default function CandidatesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'board'>('board');
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
      clientName: 'FinTech Corp',
      jobId: 'FT-992',
      notes: []
    },
    {
      id: '3',
      name: 'Michael Scott',
      title: 'Regional Manager',
      email: 'michael.scott@dundermifflin.com',
      location: 'Scranton, PA',
      experience: 20,
      skills: ['Sales', 'Management', 'Improve'],
      isInternal: true,
      stage: 'interviewing',
      interviewDate: '2024-06-15T10:00',
      notes: []
    }
  ]);

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [pipelineBriefing, setPipelineBriefing] = useState<string | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<any>(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      setIsBriefingLoading(true);
      const briefing = await generatePipelineBriefing(candidates);
      setPipelineBriefing(briefing);
      setIsBriefingLoading(false);
    };
    fetchBriefing();
  }, [candidates]);

  const stages: { id: PipelineStage; label: string; color: string; icon: any }[] = [
    { id: 'sourcing', label: 'Sourcing', color: 'text-neutral-400', icon: Search },
    { id: 'submitted', label: 'Submitted', color: 'text-indigo-electric', icon: Target },
    { id: 'interviewing', label: 'Interviewing', color: 'text-amber-500', icon: Users },
    { id: 'offer', label: 'Offer', color: 'text-emerald-500', icon: Sparkles },
    { id: 'hired', label: 'Hired', color: 'text-indigo-600', icon: Rocket }
  ];

  const handleUpdateCandidate = (updated: Candidate) => {
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
    setSelectedCandidate(updated);
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         c.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!activeFilters) return matchesSearch;

    const matchesStage = activeFilters.stage === 'all' || c.stage === activeFilters.stage;
    const matchesLocation = !activeFilters.location || c.location.toLowerCase().includes(activeFilters.location.toLowerCase());
    const matchesExp = !activeFilters.minExp || c.experience >= parseInt(activeFilters.minExp);
    const matchesInternal = !activeFilters.isInternal || c.isInternal;

    return matchesSearch && matchesStage && matchesLocation && matchesExp && matchesInternal;
  });

  return (
    <div className="h-full space-y-12 animate-in fade-in duration-700 pb-20 scrollbar-hide overflow-y-auto">
      <header className="flex justify-between items-end border-b border-slate-300/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-electric/5 border border-indigo-electric/10 rounded-full">
            <Users className="w-4 h-4 text-indigo-electric" />
            <span className="text-base font-bold uppercase tracking-[0.2em] text-indigo-electric">
              Mission Control Flow v2.0
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">Deployment <span className="text-indigo-electric">Pipeline.</span></h2>
          <p className="text-[#0f172a]/40 text-base font-medium max-w-lg leading-relaxed italic">
            Monitor and automate your talent lifecycle with neural status synchronization.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-300/5 p-1.5 rounded-2xl flex gap-1 shadow-sm">
             <button 
               onClick={() => setViewMode('board')}
               className={cn(
                 "p-2 rounded-xl transition-all",
                 viewMode === 'board' ? "bg-[#1e293b] text-white" : "text-[#0f172a]/20 hover:text-[#0f172a]/40"
               )}
             >
               <Columns className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setViewMode('grid')}
               className={cn(
                 "p-2 rounded-xl transition-all",
                 viewMode === 'grid' ? "bg-[#1e293b] text-white" : "text-[#0f172a]/20 hover:text-[#0f172a]/40"
               )}
             >
               <LayoutGrid className="w-4 h-4" />
             </button>
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="px-6 py-3 bg-white border border-slate-300/5 rounded-2xl font-bold text-base uppercase tracking-widest text-[#0f172a] hover:border-indigo-electric/30 transition-all flex items-center gap-3 shadow-sm"
          >
            <Filter className={cn("w-4 h-4 text-[#0f172a]/20", activeFilters && "text-coral")} /> Filters
          </button>
        </div>
      </header>

      {/* AI Intelligence Briefing */}
      <div className="bg-[#1e293b] p-10 rounded-[3.5rem] text-white flex items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2 flex-1">
            <p className="text-base font-bold uppercase tracking-[0.3em] text-white/30">Autonomous Pipeline Advisor</p>
            {isBriefingLoading ? (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-electric rounded-full animate-bounce" />
                <span className="text-lg font-serif italic text-white/40">Synthesizing mission performance...</span>
              </div>
            ) : (
              <p className="text-xl font-serif font-bold italic leading-tight text-white/90 max-w-3xl">
                {pipelineBriefing || "Initializing deployment intelligence for your active missions..."}
              </p>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-electric/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      </div>

      {viewMode === 'board' ? (
        <div className="flex gap-6 overflow-x-auto pb-10 scrollbar-hide px-2">
           {stages.map(stage => {
             const stageCandidates = filteredCandidates.filter(c => c.stage === stage.id);
             return (
               <div key={stage.id} className="flex-shrink-0 w-80 space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <div className="flex items-center gap-3">
                        <stage.icon className={cn("w-4 h-4", stage.color)} />
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f172a]">{stage.label}</h4>
                        <span className="bg-[#1e293b]/5 text-[#0f172a]/40 px-2 py-0.5 rounded-full text-base font-black">{stageCandidates.length}</span>
                     </div>
                  </div>

                  <div className="space-y-4 min-h-[500px] p-2 rounded-3xl bg-[#1e293b]/5 border-2 border-dashed border-slate-300/5">
                     {stageCandidates.map(candidate => (
                       <motion.div 
                         key={candidate.id}
                         layoutId={candidate.id}
                         onClick={() => setSelectedCandidate(candidate)}
                         className="bg-white p-6 rounded-[2rem] border border-slate-300/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                       >
                          <div className="flex items-center gap-4 mb-4">
                             <div className="w-10 h-10 bg-warm-gray rounded-xl flex items-center justify-center font-serif font-bold italic text-[#0f172a]/40 group-hover:bg-[#1e293b] group-hover:text-white transition-all text-base">
                               {candidate.name[0]}
                             </div>
                             <div>
                                <h5 className="text-base font-serif font-bold text-[#0f172a] italic group-hover:text-indigo-electric transition-colors truncate w-40">{candidate.name}</h5>
                                <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 truncate w-40">{candidate.title}</p>
                             </div>
                          </div>
                          
                          {candidate.clientName && (
                            <div className="flex items-center gap-2 mb-4 px-2 py-1.5 bg-indigo-50 rounded-lg">
                               <Building2 className="w-3 h-3 text-indigo-400" />
                               <span className="text-base font-bold text-indigo-600 uppercase tracking-tighter truncate">{candidate.clientName}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-300/5">
                             <div className="flex -space-x-1.5">
                               {[1, 2].map(i => (
                                 <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-indigo-electric/10 text-[6px] flex items-center justify-center font-black text-indigo-electric uppercase">AI</div>
                               ))}
                             </div>
                             <ChevronRight className="w-4 h-4 text-[#0f172a]/10 group-hover:text-[#0f172a] group-hover:translate-x-1 transition-all" />
                          </div>
                       </motion.div>
                     ))}
                     {stageCandidates.length === 0 && (
                       <div className="h-40 flex items-center justify-center text-[#0f172a]/10 italic text-base font-bold uppercase tracking-widest">
                         No assets in stage
                       </div>
                     )}
                  </div>
               </div>
             );
           })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map(candidate => (
            <motion.div 
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedCandidate(candidate)}
              className="bg-white p-8 rounded-3xl border border-slate-300/5 shadow-sm hover:shadow-2xl hover:shadow-midnight/5 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-electric/10 text-indigo-electric rounded-2xl flex items-center justify-center font-serif font-bold text-xl italic group-hover:bg-indigo-electric group-hover:text-white transition-all shadow-lg shadow-indigo-500/10">
                  {candidate.name[0]}
                </div>
                <div className={cn(
                  "px-3 py-1 bg-neutral-100 rounded-full text-base font-bold uppercase tracking-widest",
                  stages.find(s => s.id === candidate.stage)?.color
                )}>
                  {stages.find(s => s.id === candidate.stage)?.label}
                </div>
              </div>
              
              <div>
                <h4 className="text-2xl font-serif font-bold text-[#0f172a] italic group-hover:text-indigo-electric transition-colors">{candidate.name}</h4>
                <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40 mt-1">{candidate.title}</p>
              </div>

              <div className="space-y-3 pt-6">
                <div className="flex items-center gap-3 text-base font-bold text-[#0f172a]/60 uppercase tracking-widest">
                   <Building2 className="w-4 h-4 text-[#0f172a]/20" />
                   {candidate.clientName || "Open Talent Pool"}
                </div>
                <div className="flex items-center gap-3 text-base font-bold text-[#0f172a]/60 uppercase tracking-widest">
                   <Globe className="w-4 h-4 text-[#0f172a]/20" />
                   {candidate.location}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-300/5 flex justify-between items-center">
                 <div className="flex -space-x-2">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-warm-gray text-[7px] flex items-center justify-center font-bold text-[#0f172a]/40 uppercase">IQ</div>
                   ))}
                 </div>
                 <span className="text-base font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                   Optimize Dossier <ChevronRight className="w-3.5 h-3.5" />
                 </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal 
            candidate={selectedCandidate} 
            onClose={() => setSelectedCandidate(null)}
            onUpdate={handleUpdateCandidate}
          />
        )}
      </AnimatePresence>

      <CandidateFilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        onApply={setActiveFilters}
      />
    </div>
  );
}
