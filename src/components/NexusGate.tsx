import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, UserCircle, Hexagon, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { User, AppMode } from '../types';
import { cn } from '../lib/utils';
import { GlassCard } from './ui/GlassCard';
import { FluidButton } from './ui/FluidButton';

interface NexusGateProps {
  user: User;
  onSelectMode: (mode: AppMode, options?: any) => void;
}

export default function NexusGate({ user, onSelectMode }: NexusGateProps) {
  const [showAdmin, setShowAdmin] = useState(false);

  // Hidden admin click sequence
  let clickCount = 0;
  let clickTimer: NodeJS.Timeout;

  const handleSecretClick = () => {
    clickCount++;
    if (clickCount >= 5) {
      setShowAdmin(true);
      clickCount = 0;
    }
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 2000);
  };

  const handleFinalize = (mode: AppMode) => {
    onSelectMode(mode, { basicDetails: { name: user.name || '', title: 'User', phone: '' } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-electric/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-[100px] bg-royal-blue/10 blur-[150px] rotate-45 pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full relative z-10"
      >
        <div className="text-center space-y-6 mb-16">
          <div 
            onClick={handleSecretClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/40 shadow-sm cursor-default select-none"
          >
            <Hexagon className="w-5 h-5 text-indigo-electric" />
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-electric bg-clip-text text-transparent bg-gradient-to-r from-indigo-electric to-royal-blue">
              The Nexus Gate
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-midnight italic tracking-tight">
            Choose Your Reality
          </h1>
          <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Welcome, {user.name}. Step into the platform that adapts to your mission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative max-w-5xl mx-auto">
          <GlassCard 
            intensity="light" 
            className="group cursor-pointer p-10 hover:shadow-2xl hover:shadow-indigo-electric/20 transition-all duration-500 hover:-translate-y-2 border-white/60"
            onClick={() => handleFinalize('recruiter')}
          >
            <div className="flex justify-between items-start mb-16 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-electric to-royal-blue rounded-[2rem] flex items-center justify-center shadow-lg shadow-indigo-electric/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <Briefcase className="w-10 h-10 text-white" />
              </div>
              <Sparkles className="w-8 h-8 text-indigo-electric/40 absolute top-0 left-24 group-hover:text-indigo-electric group-hover:animate-spin transition-colors duration-700" />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-midnight mb-6 italic">Recruit IQ</h2>
              <p className="text-slate-500 leading-relaxed font-medium text-lg mb-8">
                Command the market. Find, analyze, and engage elite talent with the intelligence of a super-recruiter.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <FluidButton variant="primary" className="pl-6 pr-4 h-12 w-full justify-between group-hover:bg-royal-blue">
                  Enter Command Center <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </FluidButton>
              </div>
            </div>
          </GlassCard>

          <GlassCard 
            intensity="light" 
            className="group cursor-pointer p-10 hover:shadow-2xl hover:shadow-coral/20 transition-all duration-500 hover:-translate-y-2 border-white/60"
            onClick={() => handleFinalize('hunter')}
          >
            <div className="flex justify-between items-start mb-16 relative">
              <div className="w-20 h-20 bg-gradient-to-br from-coral to-light-blue rounded-[2rem] flex items-center justify-center shadow-lg shadow-coral/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
                <UserCircle className="w-10 h-10 text-white" />
              </div>
              <Sparkles className="w-8 h-8 text-coral/40 absolute top-0 left-24 group-hover:text-coral group-hover:animate-spin transition-colors duration-700" />
            </div>
            <div>
              <h2 className="text-4xl font-serif font-bold text-midnight mb-6 italic">Career AI</h2>
              <p className="text-slate-500 leading-relaxed font-medium text-lg mb-8">
                Navigate your path. Outsmart the ATS, optimize your profile, and land your ideal role faster.
              </p>
              <div className="flex items-center justify-between mt-auto">
                <FluidButton variant="ghost" className="pl-6 pr-4 h-12 w-full justify-between bg-coral text-white hover:bg-coral/90">
                  Enter Hunter Mode <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </FluidButton>
              </div>
            </div>
          </GlassCard>

          <AnimatePresence>
            {showAdmin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="col-span-1 md:col-span-2 flex justify-center mt-8"
              >
                <GlassCard
                  intensity="heavy"
                  onClick={() => onSelectMode('recruiter', { orgData: { name: 'SuperAdmin HQ', domain: 'admin.app' } })}
                  className="p-8 cursor-pointer group hover:bg-gradient-to-r from-slate-900 to-midnight w-full max-w-2xl mx-auto border-gold/30 hover:border-gold/60 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center group-hover:bg-gold/30 transition-colors shrink-0">
                      <ShieldCheck className="w-8 h-8 text-gold drop-shadow-md" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-serif font-bold text-midnight group-hover:text-gold italic transition-colors">SuperAdmin Hub</h3>
                      <p className="text-slate-500 group-hover:text-slate-400">Global Control Centers & Integrations Monitoring</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-gold opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
