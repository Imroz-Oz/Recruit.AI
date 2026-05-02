import React from 'react';
import { motion } from 'motion/react';
import { User, AppMode } from '../types';
import { Briefcase, UserCircle, ShieldCheck, Zap, ArrowRight, Linkedin } from 'lucide-react';
import { cn } from '../lib/utils';

interface ModeSelectionProps {
  user: User;
  onSelectMode: (mode: AppMode) => void;
  onConnectLinkedIn: () => void;
  isLinkedInConnected: boolean;
}

export default function ModeSelection({ user, onSelectMode, onConnectLinkedIn, isLinkedInConnected }: ModeSelectionProps) {
  // Determine if user can select hunter mode
  const canBeHunter = !user.isCompanyUser;

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]">
      <div className="max-w-5xl w-full space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-electric/5 border border-indigo-100 mb-4">
            <Zap className="w-3 h-3 text-indigo-electric fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">
              Identity Protocol Active
            </span>
          </div>
          <h1 className="text-6xl font-serif font-bold text-midnight italic">Welcome back, {user.name}</h1>
          <p className="text-midnight/50 font-medium max-w-xl mx-auto">
            Choose your interface focus for this session. Your profile data remains synchronized across both modes.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Recruiter Mode */}
          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => onSelectMode('recruiter')}
            className="group relative cursor-pointer bg-midnight p-10 rounded-[3.5rem] shadow-2xl shadow-midnight/20 overflow-hidden border border-white/5"
          >
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 bg-indigo-electric rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-serif font-bold text-white mb-4 italic">Recruit IQ</h2>
                <p className="text-white/50 leading-relaxed font-medium">
                  Enterprise-grade talent sourcing, boolean intelligence, and semantic candidate matching.
                </p>
              </div>
              
              <ul className="space-y-3 pt-4">
                {['Advanced Sourcing Builders', 'JD & Resume Intelligence', 'Team Pipeline Management'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    <div className="w-1 h-1 bg-indigo-electric rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="pt-6 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  Enter Recruiter Mode <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
            {/* Abstract Background Element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-electric/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-electric/20 transition-all" />
          </motion.div>

          {/* Job Hunter Mode */}
          <motion.div
            whileHover={canBeHunter ? { y: -8 } : {}}
            onClick={() => canBeHunter && onSelectMode('hunter')}
            className={cn(
              "group relative p-10 rounded-[3.5rem] shadow-2xl overflow-hidden border transition-all",
              canBeHunter 
                ? "cursor-pointer bg-white border-midnight/5 shadow-indigo-500/5" 
                : "cursor-not-allowed bg-warm-gray/30 border-midnight/5 opacity-80"
            )}
          >
            <div className="relative z-10 space-y-8">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all",
                canBeHunter ? "bg-coral shadow-coral/20 group-hover:scale-110" : "bg-midnight/10 shadow-none"
              )}>
                <UserCircle className={cn("w-8 h-8", canBeHunter ? "text-white" : "text-midnight/20")} />
              </div>
              <div>
                <h2 className={cn(
                  "text-4xl font-serif font-bold mb-4 italic",
                  canBeHunter ? "text-midnight" : "text-midnight/30"
                )}>Career JQ</h2>
                <p className={cn(
                  "leading-relaxed font-medium",
                  canBeHunter ? "text-midnight/60" : "text-midnight/20"
                )}>
                  Personalized job discovery, resume optimization, and AI-driven interview preparation.
                </p>
              </div>

              {canBeHunter ? (
                <ul className="space-y-3 pt-4">
                  {['Market Explorer Feed', 'Resume DNA Optimizer', 'Interview IQ Coach'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-midnight/30 text-[10px] font-bold uppercase tracking-widest">
                      <div className="w-1 h-1 bg-coral rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="pt-4 px-6 py-4 bg-midnight/5 rounded-2xl border border-midnight/5 flex items-center gap-4">
                  <ShieldCheck className="w-5 h-5 text-midnight/40" />
                  <p className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest leading-relaxed">
                    Restricted: Your account is locked to enterprise workflows.
                  </p>
                </div>
              )}

              <div className="pt-6 flex items-center justify-between font-bold">
                 {canBeHunter ? (
                   <span className="inline-flex items-center gap-2 text-coral text-xs font-bold uppercase tracking-widest">
                    Enter Hunter Mode <ArrowRight className="w-4 h-4" />
                  </span>
                 ) : (
                   <span className="text-[10px] text-midnight/20 uppercase tracking-widest">Mode Unavailable</span>
                 )}
              </div>
            </div>
            {canBeHunter && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-coral/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-coral/10 transition-all" />
            )}
          </motion.div>
        </div>

        <footer className="pt-12 border-t border-midnight/5 flex flex-col items-center gap-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-midnight/20">Optional Integrations</p>
          <button 
            onClick={onConnectLinkedIn}
            disabled={isLinkedInConnected}
            className={cn(
              "flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all font-bold text-sm",
              isLinkedInConnected 
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-white text-[#0077b5] border-[#0077b5]/20 hover:border-[#0077b5] shadow-sm hover:shadow-lg"
            )}
          >
            {isLinkedInConnected ? (
              <>
                <ShieldCheck className="w-5 h-5" />
                Professional Identity Verified
              </>
            ) : (
              <>
                <Linkedin className="w-5 h-5" />
                Connect LinkedIn Profile
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
