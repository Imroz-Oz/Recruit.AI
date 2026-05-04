import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ChevronRight, 
  MoreHorizontal, 
  Building2, 
  Globe, 
  Brain, 
  Search,
  CheckCircle2,
  Filter,
  X
} from 'lucide-react';
import { Candidate, PipelineStage } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { generatePipelineBriefing } from '@/src/services/aiService';
import CandidateDetailModal from '@/src/components/CandidateDetailModal';
import CandidateFilterModal from '@/src/components/CandidateFilterModal';

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
  }, []);

  const stages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'sourcing', label: 'Sourcing', color: 'bg-neutral-100 text-neutral-500' },
    { id: 'submitted', label: 'Submitted', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'interviewing', label: 'Interviewing', color: 'bg-amber-50 text-amber-600' },
    { id: 'offer', label: 'Offer Stage', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'hired', label: 'Hired', color: 'bg-indigo-electric text-white' },
    { id: 'rejected', label: 'Rejected', color: 'bg-red-50 text-red-600' }
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
    <div className="h-full space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end border-b border-midnight/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-electric/5 border border-indigo-electric/10 rounded-full">
            <Users className="w-4 h-4 text-indigo-electric" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">
              Recruiter Sourcing Loop
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-midnight italic">Engagement <span className="text-indigo-electric">Flow.</span></h2>
          <p className="text-midnight/40 text-sm font-medium max-w-lg leading-relaxed">
            Manage your internal talent pipeline with mission-critical intelligence and real-time mission status.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="px-6 py-3 bg-white border border-midnight/5 rounded-2xl font-bold text-[10px] uppercase tracking-widest text-midnight hover:border-indigo-electric/30 transition-all flex items-center gap-3 shadow-sm"
          >
            <Filter className={cn("w-4 h-4 text-midnight/20", activeFilters && "text-coral")} /> Advanced Filter
          </button>
          <button className="px-8 py-3 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-midnight/10 hover:bg-indigo-electric transition-all">
            Export Active Pipeline
          </button>
        </div>
      </header>

      {/* AI Pipeline Briefing */}
      <div className="bg-midnight p-10 rounded-[3.5rem] text-white flex items-center justify-between gap-12 relative overflow-hidden group shadow-2xl">
        <div className="flex items-center gap-8 relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/10">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">Strategic Pipeline Briefing</p>
            {isBriefingLoading ? (
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-electric rounded-full animate-bounce" />
                <span className="text-lg font-serif italic text-white/40">Advisor is analyzing current pipeline...</span>
              </div>
            ) : (
              <p className="text-2xl font-serif font-bold italic leading-tight text-white/90">
                {pipelineBriefing || "Initializing deployment intelligence for your active missions..."}
              </p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 relative z-10">
           <button className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 backdrop-blur-md">
             Optimize Workflow
           </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-electric/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      </div>

      {/* Controls */}
        <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within your mission pipeline..." 
            className="w-full pl-14 pr-6 py-5 bg-white rounded-3xl text-sm font-medium border border-midnight/5 outline-none focus:border-indigo-electric/40 shadow-sm transition-all"
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/20" />
        </div>
        
        {activeFilters && (
          <button 
            onClick={() => setActiveFilters(null)}
            className="px-4 py-2 bg-coral/10 text-coral rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-coral/20 transition-all"
          >
            Clear Constraints <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Grid of Candidates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map(candidate => (
          <motion.div 
            key={candidate.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setSelectedCandidate(candidate)}
            className="bg-white p-8 rounded-[3rem] border border-midnight/5 shadow-sm hover:shadow-2xl hover:shadow-midnight/5 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-indigo-electric/10 text-indigo-electric rounded-2xl flex items-center justify-center font-serif font-bold text-xl italic group-hover:bg-indigo-electric group-hover:text-white transition-all">
                  {candidate.name[0]}
                </div>
                <div className={cn(
                  "px-3 py-1 bg-neutral-100 rounded-full text-[9px] font-bold uppercase tracking-widest",
                  stages.find(s => s.id === candidate.stage)?.color
                )}>
                  {stages.find(s => s.id === candidate.stage)?.label}
                </div>
              </div>
              
              <div>
                <h4 className="text-2xl font-serif font-bold text-midnight italic group-hover:text-indigo-electric transition-colors">{candidate.name}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 mt-1">{candidate.title}</p>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-xs font-medium text-midnight/60">
                   <Building2 className="w-4 h-4 text-midnight/20" />
                   {candidate.submissionDetails?.clientName || "Open Candidate"}
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-midnight/60">
                   <Globe className="w-4 h-4 text-midnight/20" />
                   {candidate.location}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-midnight/5 flex justify-between items-center">
               <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-warm-gray text-[8px] flex items-center justify-center font-bold">AI</div>
                 ))}
               </div>
               <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                 View Dossier <ChevronRight className="w-3.5 h-3.5" />
               </span>
            </div>
          </motion.div>
        ))}
      </div>

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
