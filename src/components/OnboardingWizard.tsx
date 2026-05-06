import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  Upload, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Sparkles,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingWizardProps {
  onComplete: (data: any) => void;
  role: 'recruiter' | 'hunter';
}

export default function OnboardingWizard({ onComplete, role }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    resumeUploaded: false,
    companyName: '',
    recruiterRole: '',
    targetRole: '',
    experienceLevel: 'mid',
    locationPreference: 'remote'
  });

  const nextStep = () => setStep(s => s + 1);

  const handleFinish = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(r => setTimeout(r, 2500));
    onComplete(formData);
  };

  const steps = role === 'hunter' ? [
    {
      title: 'Initialize Profile DNA',
      desc: 'Upload your latest resume to calibrate your market intelligence.',
      icon: Upload
    },
    {
      title: 'Define Mission Radar',
      desc: 'What roles are we hunting today?',
      icon: Target
    },
    {
      title: 'Intelligence Sync',
      desc: 'Connect your target orbit with our AI search clusters.',
      icon: Zap
    }
  ] : [
    {
      title: 'Deploy Command HQ',
      desc: 'Set up your recruiter identity and mission briefs.',
      icon: Globe
    },
    {
      title: 'Target Parameters',
      desc: 'Who are you looking for?',
      icon: Target
    },
    {
      title: 'Finalize Setup',
      desc: 'Synchronize with the elite talent archive.',
      icon: CheckCircle2
    }
  ];

  const currentStepInfo = steps[step - 1];

  return (
    <div className="fixed inset-0 z-50 bg-midnight/90 backdrop-blur-xl flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-cream rounded-[3rem] shadow-2xl border border-white/20 overflow-hidden relative"
      >
        {/* Background Decorative Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-electric/10 blur-[100px] pointer-events-none" />
        
        <div className="p-12 relative z-10 flex flex-col h-full">
          <header className="mb-12 flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-midnight rounded-xl flex items-center justify-center">
                  <currentStepInfo.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-electric">Mission Onboarding</span>
                  <p className="text-[9px] font-bold text-midnight/30 uppercase tracking-widest">Step {step} of 3</p>
                </div>
              </div>
              <h2 className="text-4xl font-serif font-bold italic leading-tight">{currentStepInfo.title}</h2>
              <p className="text-midnight/50 font-medium">{currentStepInfo.desc}</p>
            </div>
            
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={cn(
                    "w-12 h-1.5 rounded-full transition-all duration-500",
                    i <= step ? "bg-indigo-electric" : "bg-midnight/5"
                  )} 
                />
              ))}
            </div>
          </header>

          <main className="flex-1 min-h-[200px]">
             <AnimatePresence mode="wait">
               {step === 1 && (
                 <motion.div 
                   key="step1"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                   {role === 'hunter' ? (
                     <div 
                       onClick={() => setFormData(prev => ({ ...prev, resumeUploaded: true }))}
                       className={cn(
                        "group border-2 border-dashed rounded-[2.5rem] p-12 transition-all cursor-pointer flex flex-col items-center justify-center gap-4",
                        formData.resumeUploaded ? "border-emerald-500/50 bg-emerald-500/5" : "border-midnight/10 hover:border-indigo-electric/40 hover:bg-indigo-electric/5"
                      )}
                     >
                       {formData.resumeUploaded ? (
                         <>
                           <CheckCircle2 className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform" />
                           <div className="text-center">
                             <p className="font-bold text-emerald-600">Resume Calibrated Successfully</p>
                             <p className="text-xs text-emerald-600/60 font-medium">Michael_Wu_Principal_Eng.pdf</p>
                           </div>
                         </>
                       ) : (
                         <>
                           <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-2 group-hover:bg-indigo-electric group-hover:text-white transition-all">
                             <Upload className="w-8 h-8" />
                           </div>
                           <p className="text-sm font-bold uppercase tracking-widest text-midnight/40 group-hover:text-indigo-electric">Drop your resume here</p>
                         </>
                       )}
                     </div>
                   ) : (
                     <div className="space-y-4">
                       <input 
                         placeholder="Agency or Corp Name" 
                         value={formData.companyName}
                         onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                         className="w-full bg-white border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium"
                       />
                       <input 
                         placeholder="Lead Recruiter Role" 
                         value={formData.recruiterRole}
                         onChange={(e) => setFormData(prev => ({ ...prev, recruiterRole: e.target.value }))}
                         className="w-full bg-white border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium"
                       />
                     </div>
                   )}
                 </motion.div>
               )}

               {step === 2 && (
                 <motion.div 
                   key="step2"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-6"
                 >
                   <div className="grid grid-cols-2 gap-4">
                      {['Principal Engineer', 'Product Lead', 'Creative Director', 'Growth Head'].map(role => (
                        <button 
                          key={role}
                          onClick={() => setFormData(prev => ({ ...prev, targetRole: role }))}
                          className={cn(
                            "p-6 rounded-3xl border-2 text-left transition-all group",
                            formData.targetRole === role ? "border-indigo-electric bg-indigo-electric/5" : "border-midnight/5 bg-white hover:border-indigo-electric/20"
                          )}
                        >
                          <p className={cn(
                            "font-bold text-sm transition-colors",
                            formData.targetRole === role ? "text-indigo-electric" : "text-midnight/60 group-hover:text-midnight"
                          )}>{role}</p>
                        </button>
                      ))}
                   </div>
                   <input 
                     value={formData.targetRole}
                     onChange={e => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                     placeholder="Or type a custom mission..." 
                     className="w-full bg-white border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium"
                    />
                 </motion.div>
               )}

               {step === 3 && (
                 <motion.div 
                   key="step3"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="flex flex-col items-center justify-center text-center space-y-8 py-8"
                 >
                   {isProcessing ? (
                     <div className="space-y-6">
                        <div className="relative w-24 h-24 mx-auto">
                          <div className="absolute inset-0 bg-indigo-electric/20 rounded-full animate-ping" />
                          <div className="absolute inset-0 bg-white rounded-full shadow-2xl flex items-center justify-center z-10 transition-transform">
                             <Loader2 className="w-10 h-10 text-indigo-electric animate-spin" />
                          </div>
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-xl font-bold text-midnight italic">Synchronizing DNA...</h4>
                           <p className="text-xs font-bold text-indigo-electric uppercase tracking-widest animate-pulse">Scanning global job orbits</p>
                        </div>
                     </div>
                   ) : (
                     <>
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                          <Sparkles className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-3xl font-serif font-bold italic">Radar Calibrated.</h4>
                          <p className="text-midnight/40 font-medium max-w-sm">We've mapped your professional DNA to 2,400+ targeted senior vacancies. Launch your mission now.</p>
                        </div>
                     </>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>
          </main>

          <footer className="mt-12 flex justify-between items-center">
            <button 
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1 || isProcessing}
              className="text-xs font-bold uppercase tracking-widest text-midnight/20 hover:text-midnight transition-colors disabled:opacity-0"
            >
              Go Back
            </button>
            
            {step < 3 ? (
              <button 
                onClick={nextStep}
                disabled={
                  (step === 1 && role === 'hunter' && !formData.resumeUploaded) || 
                  (step === 1 && role === 'recruiter' && (!formData.companyName || !formData.recruiterRole)) ||
                  (step === 2 && !formData.targetRole)
                }
                className="group flex items-center gap-3 px-8 py-4 bg-midnight text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10 disabled:opacity-50 disabled:bg-midnight"
              >
                Continue Mission <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                disabled={isProcessing}
                className="group flex items-center gap-3 px-10 py-5 bg-indigo-electric text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-midnight transition-all shadow-2xl shadow-indigo-500/30 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Launch Intelligence Orbit'} <Rocket className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
