import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, Upload, Target, ArrowRight, CheckCircle2, UserCircle,
  Sparkles, Zap, Globe, Loader2, Image as ImageIcon, Camera
} from 'lucide-react';
import { cn } from '../lib/utils';
import { generateHeadshot } from '../services/aiService';

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  role: 'recruiter' | 'hunter';
}

export default function OnboardingWizard({ onComplete, role }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    domain: '',
    yearsOfExperience: '',
    skills: '',
    headshotUrl: '',
    mission: ''
  });

  const nextStep = () => setStep(s => s + 1);

  const handleGenerateHeadshot = async () => {
    if (!formData.title || !formData.domain) {
      alert("Please enter title and domain first to generate a customized sketch.");
      return;
    }
    setIsGeneratingImage(true);
    const result = await generateHeadshot({
      title: formData.title,
      domain: formData.domain,
      skills: formData.skills,
      yearsOfExperience: formData.yearsOfExperience
    });
    if (result) {
      setFormData(prev => ({ ...prev, headshotUrl: result }));
    }
    setIsGeneratingImage(false);
  };

  const handleFinish = async () => {
    setIsProcessing(true);
    // Simulate final AI calibration
    await new Promise(r => setTimeout(r, 2000));
    onComplete({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  const steps = [
    {
      title: 'Identity Synchronization',
      desc: 'Define your professional trajectory and baseline data.',
      icon: UserCircle
    },
    {
      title: 'Expertise Matrix',
      desc: 'Mapping your historical domain knowledge.',
      icon: Target
    },
    {
      title: 'Visual Identity Calibration',
      desc: 'Upload a headshot or let AI construct your professional sketch.',
      icon: Camera
    }
  ];

  const currentStepInfo = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 bg-[#1e293b]/90 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-cream rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-56 h-64 bg-indigo-electric/10 blur-[100px] pointer-events-none" />
        
        <div className="p-10 md:p-12 relative z-10 flex flex-col h-full">
          <header className="mb-10 flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1e293b] rounded-xl flex items-center justify-center">
                  <currentStepInfo.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold uppercase tracking-[0.3em] text-indigo-electric">Core Onboarding</span>
                  <p className="text-sm font-bold text-[#0f172a]/30 uppercase tracking-widest">Step {step} of 3</p>
                </div>
              </div>
              <h2 className="text-4xl font-serif font-bold italic leading-tight">{currentStepInfo.title}</h2>
              <p className="text-[#0f172a]/50 font-medium">{currentStepInfo.desc}</p>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={cn(
                    "w-12 h-1.5 rounded-full transition-all duration-500",
                    i <= step ? "bg-indigo-electric" : "bg-[#1e293b]/5"
                  )} 
                />
              ))}
            </div>
          </header>

          <main className="flex-1 min-h-[250px]">
             <AnimatePresence mode="wait">
               {step === 1 && (
                 <motion.div 
                   key="step1"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-5"
                 >
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Display Name</label>
                     <input 
                       placeholder="Alex Doe" 
                       value={formData.name}
                       onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                       className="w-full bg-white border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-bold text-[#0f172a]"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Current Title or Core Role</label>
                     <input 
                       placeholder="e.g. Lead Talent Architect or VP of Engineering" 
                       value={formData.title}
                       onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                       className="w-full bg-white border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-bold text-[#0f172a]"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Primary Industry Domain</label>
                     <input 
                       placeholder="e.g. Enterprise AI, Fintech, BioTech" 
                       value={formData.domain}
                       onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                       className="w-full bg-white border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-bold text-[#0f172a]"
                     />
                   </div>
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div 
                   key="step2"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-5"
                 >
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Years of Experience</label>
                     <input 
                       type="number"
                       placeholder="e.g. 5" 
                       value={formData.yearsOfExperience}
                       onChange={(e) => setFormData(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                       className="w-full bg-white border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-bold text-[#0f172a]"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">Key Skills (Comma separated)</label>
                     <textarea 
                       placeholder="e.g. Sourcing, Boolean Search, Full-Cycle Recruitment, TypeScript" 
                       value={formData.skills}
                       onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                       className="w-full bg-white border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-bold text-[#0f172a] min-h-[100px]"
                     />
                   </div>
                 </motion.div>
               )}

               {step === 3 && (
                 <motion.div 
                   key="step3"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex flex-col items-center justify-center space-y-6"
                 >
                   {isProcessing ? (
                     <div className="space-y-6 text-center py-8">
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 bg-indigo-electric/20 rounded-full animate-ping" />
                          <div className="absolute inset-0 bg-white rounded-full shadow-2xl flex items-center justify-center z-10">
                             <Loader2 className="w-10 h-10 text-indigo-electric animate-spin" />
                          </div>
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-xl font-bold text-[#0f172a] italic">Calibrating Node Data...</h4>
                           <p className="text-sm font-bold text-indigo-electric uppercase tracking-widest animate-pulse">Establishing Mission Control</p>
                        </div>
                     </div>
                   ) : (
                     <>
                        <div className="flex flex-col md:flex-row gap-6 w-full">
                           <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-indigo-300 transition-colors cursor-pointer group">
                             <div className="w-16 h-16 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 rounded-2xl flex items-center justify-center mb-2 transition-all">
                               <Upload className="w-8 h-8" />
                             </div>
                             <div className="text-center">
                               <p className="font-bold text-[#0f172a]">Upload Photo</p>
                               <p className="text-xs font-medium text-[#0f172a]/40 mt-1">JPEG, PNG up to 5MB</p>
                             </div>
                           </div>
                           
                           <div className="flex flex-col items-center justify-center font-bold text-[#0f172a]/30 uppercase tracking-widest text-xs">
                             OR
                           </div>
                           
                           <button 
                             onClick={handleGenerateHeadshot}
                             disabled={isGeneratingImage}
                             className="flex-1 flex flex-col items-center justify-center gap-4 border-2 border-indigo-200 bg-indigo-50/50 rounded-3xl p-8 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                           >
                             <div className="w-16 h-16 bg-indigo-electric text-white shadow-xl shadow-indigo-600/20 rounded-2xl flex items-center justify-center mb-2">
                               {isGeneratingImage ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8" />}
                             </div>
                             <div className="text-center">
                               <p className="font-bold text-indigo-900">AI Sketch Generator</p>
                               <p className="text-xs font-medium text-indigo-700/60 mt-1">Professional Cartoonish Avatar</p>
                             </div>
                           </button>
                        </div>
                        
                        {formData.headshotUrl && (
                          <div className="mt-4 flex flex-col items-center">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mb-3">Your Digital Identity</h4>
                            <img src={formData.headshotUrl} alt="Identity" className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover" />
                          </div>
                        )}
                     </>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </main>

          <footer className="mt-8 flex justify-between items-center border-t border-slate-100 pt-6">
            <button 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || isProcessing || isGeneratingImage}
              className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/30 hover:text-[#0f172a] transition-colors disabled:opacity-0"
            >
              Go Back
            </button>
            
            {step < 3 ? (
              <button 
                onClick={nextStep}
                disabled={
                  (step === 1 && (!formData.name || !formData.title || !formData.domain)) || 
                  (step === 2 && (!formData.yearsOfExperience || !formData.skills))
                }
                className="group flex items-center gap-2 px-8 py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-lg disabled:opacity-50 disabled:bg-[#1e293b]"
              >
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                disabled={isProcessing || isGeneratingImage}
                className="group flex items-center gap-2 px-8 py-4 bg-indigo-electric text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 disabled:opacity-50"
              >
                {isProcessing ? 'Saving...' : 'Complete Initialization'} <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
