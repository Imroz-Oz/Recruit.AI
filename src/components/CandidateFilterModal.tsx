import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Filter, Target, MapPin, Briefcase, GraduationCap, DollarSign, Search, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface CandidateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export default function CandidateFilterModal({ isOpen, onClose, onApply }: CandidateFilterModalProps) {
  const [filters, setFilters] = useState({
    stage: 'all',
    location: '',
    minExp: '',
    industry: '',
    salaryMin: '',
    isInternal: false
  });

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      stage: 'all',
      location: '',
      minExp: '',
      industry: '',
      salaryMin: '',
      isInternal: false
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1e293b]/40 backdrop-blur-sm z-[110]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[120] shadow-2xl p-10 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="space-y-1">
                <h3 className="text-2xl font-serif font-bold italic text-[#0f172a]">Mission Filters</h3>
                <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30">Refine your active candidate pool</p>
              </div>
              <button onClick={onClose} className="p-3 bg-warm-gray rounded-full hover:bg-neutral-200 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide space-y-8">
              {/* Pipeline Stage */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f172a]/40 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Pipeline Stage
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['all', 'sourcing', 'submitted', 'interviewing', 'offer', 'hired'].map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setFilters({ ...filters, stage })}
                      className={cn(
                        "px-4 py-3 rounded-2xl text-base font-bold uppercase tracking-widest border transition-all",
                        filters.stage === stage 
                          ? "bg-[#1e293b] text-white border-slate-300" 
                          : "bg-white text-[#0f172a]/60 border-slate-300/5 hover:border-slate-300/20"
                      )}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f172a]/40 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Geographic Target
                </label>
                <input 
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City, State or Remote..."
                  className="w-full p-4 bg-warm-gray rounded-2xl text-base font-medium border border-transparent focus:bg-white focus:border-indigo-electric/20 transition-all outline-none"
                />
              </div>

              {/* Experience */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f172a]/40 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Professional Tenure
                </label>
                <select 
                  value={filters.minExp}
                  onChange={(e) => setFilters({ ...filters, minExp: e.target.value })}
                  className="w-full p-4 bg-warm-gray rounded-2xl text-base font-medium border border-transparent focus:bg-white focus:border-indigo-electric/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="">Any Experience Level</option>
                  <option value="1">1+ Year</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="8">8+ Years</option>
                  <option value="12">12+ Years</option>
                </select>
              </div>

              {/* Internal vs Foreign */}
              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-[0.2em] text-[#0f172a]/40 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Sourcing Channel
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 p-4 bg-warm-gray rounded-2xl cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={filters.isInternal}
                      onChange={(e) => setFilters({ ...filters, isInternal: e.target.checked })}
                      className="w-4 h-4 rounded accent-indigo-electric"
                    />
                    <span className="text-base font-bold uppercase text-[#0f172a]/60">Internal Only</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-300/5 flex gap-4">
              <button 
                onClick={handleReset}
                className="flex-1 py-4 bg-warm-gray text-[#0f172a]/40 rounded-2xl text-base font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
              >
                Reset
              </button>
              <button 
                onClick={handleApply}
                className="flex-[2] py-4 bg-[#1e293b] text-white rounded-2xl text-base font-bold uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
              >
                Apply Constraints
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
