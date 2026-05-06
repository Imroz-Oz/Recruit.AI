import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, AppMode, IndustryType, EngagementType, TaxType } from '../types';
import { 
  Briefcase, UserCircle, ShieldCheck, Zap, ArrowRight, Linkedin, Building2, Globe, Rocket, 
  ArrowLeft, Cpu, Construction, Stethoscope, Factory, FileText, Scale, Fingerprint, Sparkles, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ModeSelectionProps {
  user: User;
  onSelectMode: (mode: AppMode, options?: { 
    orgData?: { name: string, domain: string },
    industryTypes?: IndustryType[],
    engagementTypes?: EngagementType[],
    taxTypes?: TaxType[]
  }) => void;
  onConnectLinkedIn: () => void;
  isLinkedInConnected: boolean;
}

type OnboardingStep = 'industry' | 'engagement' | 'identity' | 'org-setup';

export default function ModeSelection({ user, onSelectMode, onConnectLinkedIn, isLinkedInConnected }: ModeSelectionProps) {
  const [step, setStep] = useState<OnboardingStep>('industry');
  const [formData, setFormData] = useState({
    industryTypes: [] as IndustryType[],
    engagementTypes: [] as EngagementType[],
    taxTypes: [] as TaxType[],
    appMode: '' as AppMode,
  });
  const [orgForm, setOrgForm] = useState({ name: '', domain: '' });

  const aiInsights = useMemo(() => {
    const insights: Record<string, string> = {
      'it': "Market is shifting toward AI-native engineering. 42% of roles now require prompt engineering skills.",
      'non-it': "Steady growth in infrastructure and renewable energy verticals. Demand for Project Managers up 18%.",
      'engineering': "Mechanical and electrical silos are merging. Hybrid 'MEP' profiles are in high demand.",
      'healthcare': "Massive shift toward telemedicine and digital health records. Specialized compliance roles are peaking.",
      'light-industrial': "Automation is reshaping the floor. Skillsets are shifting from manual labor to machine supervision.",
      'contract': "Agility is key. 60% of modern tech stacks are built by elastic contract teams.",
      'direct-hire': "Long-term IP retention is a priority. Retention bonuses are trending up in your industry.",
      'c2c': "Elite solo agencies are capturing high-margin advisory roles. Ensure your SOWs are airtight.",
    };
    return insights;
  }, []);

  const industries: { id: IndustryType; label: string; icon: any; description: string }[] = [
    { id: 'it', label: 'IT & Digital', icon: Cpu, description: 'Software, Cloud, Cyber, & Data' },
    { id: 'engineering', label: 'Engineering', icon: Construction, description: 'Mechanical, Electrical, Civil' },
    { id: 'healthcare', label: 'Healthcare', icon: Stethoscope, description: 'Clinical, Pharma, Biotech' },
    { id: 'light-industrial', label: 'Light Industrial', icon: Factory, description: 'Supply Chain, Logistics, MFC' },
  ];

  const engagements: { id: EngagementType; label: string; icon: any }[] = [
    { id: 'contract', label: 'Contract', icon: Zap },
    { id: 'direct-hire', label: 'Direct Hire', icon: ShieldCheck },
    { id: 'contract-to-hire', label: 'Contract-To-Hire', icon: Rocket },
  ];

  const taxes: { id: TaxType; label: string; description: string }[] = [
    { id: 'w2', label: 'W2', description: 'Standard Employment' },
    { id: 't4', label: 'T4', description: 'Canadian Statutory' },
    { id: 'c2c', label: 'C2C', description: 'Corp-to-Corp / B2B' },
    { id: '1099', label: '1099', description: 'Independent Contractor' },
  ];

  const handleNext = () => {
    if (step === 'industry') setStep('engagement');
    else if (step === 'engagement') setStep('identity');
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgForm.name && orgForm.domain) {
      onSelectMode('recruiter', {
        orgData: orgForm,
        industryTypes: formData.industryTypes,
        engagementTypes: formData.engagementTypes,
        taxTypes: formData.taxTypes
      });
    }
  };

  const handleFinalize = (mode: AppMode) => {
    if (mode === 'recruiter') {
      setStep('org-setup');
    } else {
      onSelectMode('hunter', {
        industryTypes: formData.industryTypes,
        engagementTypes: formData.engagementTypes,
        taxTypes: formData.taxTypes
      });
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.08),transparent_50%)]">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-12 max-w-xs mx-auto">
          {(['industry', 'engagement', 'identity'] as const).map((s, i) => (
            <div 
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500",
                step === s || (i < 2 && step === 'identity') || (i < 1 && step === 'engagement') || step === 'org-setup'
                  ? "bg-midnight" 
                  : "bg-midnight/10"
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'industry' && (
            <motion.div
              key="industry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-electric/5 border border-indigo-100 mb-4">
                  <Fingerprint className="w-3 h-3 text-indigo-electric" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">
                    Industry Vector Alignment
                  </span>
                </div>
                <h1 className="text-6xl font-serif font-bold text-midnight italic">Choose your sector</h1>
                <p className="text-midnight/50 font-medium max-w-xl mx-auto">
                  Your mission interface will be calibrated based on your primary industry of operation.
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {industries.map((ind) => (
                  <motion.div
                    key={ind.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const current = formData.industryTypes;
                      const next = current.includes(ind.id) 
                        ? current.filter(id => id !== ind.id)
                        : [...current, ind.id];
                      setFormData({ ...formData, industryTypes: next });
                    }}
                    className={cn(
                      "group relative p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all",
                      formData.industryTypes.includes(ind.id) 
                        ? "bg-midnight border-midnight shadow-2xl shadow-midnight/20" 
                        : "bg-white border-warm-gray hover:border-midnight/20"
                    )}
                  >
                    <div className="flex items-start gap-6">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
                        formData.industryTypes.includes(ind.id) ? "bg-white text-midnight" : "bg-warm-gray text-midnight/40 group-hover:bg-midnight/5"
                      )}>
                        <ind.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h3 className={cn("text-xl font-bold", formData.industryTypes.includes(ind.id) ? "text-white" : "text-midnight")}>
                            {ind.label}
                          </h3>
                          {formData.industryTypes.includes(ind.id) && (
                            <div className="w-5 h-5 bg-indigo-electric rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className={cn("text-xs font-medium italic", formData.industryTypes.includes(ind.id) ? "text-white/50" : "text-midnight/40")}>
                          {ind.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {formData.industryTypes.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center pt-8"
                >
                  <button 
                    onClick={handleNext}
                    className="px-12 py-5 bg-midnight text-white rounded-3xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/20 flex items-center gap-3"
                  >
                    Continue System Setup <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 'engagement' && (
            <motion.div
              key="engagement"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <button 
                onClick={() => setStep('industry')}
                className="flex items-center gap-2 text-midnight/40 hover:text-midnight transition-colors font-bold text-[10px] uppercase tracking-widest"
              >
                <ArrowLeft className="w-4 h-4" /> Change Industry
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-12">
                  <header className="space-y-4">
                    <h2 className="text-5xl font-serif font-bold text-midnight italic">Protocol Parameters</h2>
                    <p className="text-midnight/50 font-medium">Define your standard engagement and tax classification model.</p>
                  </header>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-midnight/40 uppercase tracking-[0.2em] px-4">Role Classification</label>
                      <div className="grid grid-cols-1 gap-3">
                        {engagements.map((eng) => (
                          <button
                            key={eng.id}
                            onClick={() => {
                              const current = formData.engagementTypes;
                              const next = current.includes(eng.id)
                                ? current.filter(id => id !== eng.id)
                                : [...current, eng.id];
                              setFormData({ ...formData, engagementTypes: next });
                            }}
                            className={cn(
                              "flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left group",
                              formData.engagementTypes.includes(eng.id) 
                                ? "bg-indigo-electric text-white border-indigo-electric shadow-lg shadow-indigo-500/20" 
                                : "bg-warm-gray/50 border-warm-gray hover:border-midnight/10"
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <eng.icon className="w-5 h-5" />
                              <span className="font-bold">{eng.label}</span>
                            </div>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                              formData.engagementTypes.includes(eng.id) ? "bg-white border-white" : "border-midnight/10"
                            )}>
                              {formData.engagementTypes.includes(eng.id) && <div className="w-2 h-2 bg-indigo-electric rounded-full" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-midnight/40 uppercase tracking-[0.2em] px-4">Tax Environment</label>
                      <div className="grid grid-cols-2 gap-3">
                        {taxes.map((tax) => (
                          <button
                            key={tax.id}
                            onClick={() => {
                              const current = formData.taxTypes;
                              const next = current.includes(tax.id)
                                ? current.filter(id => id !== tax.id)
                                : [...current, tax.id];
                              setFormData({ ...formData, taxTypes: next });
                            }}
                            className={cn(
                              "p-6 rounded-3xl border-2 transition-all text-left",
                              formData.taxTypes.includes(tax.id) 
                                ? "bg-midnight text-white border-midnight" 
                                : "bg-white border-warm-gray hover:border-midnight/10"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <span className="block font-bold mb-1">{tax.label}</span>
                              {formData.taxTypes.includes(tax.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={cn("text-[10px] font-medium italic opacity-50")}>{tax.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={formData.engagementTypes.length === 0 || formData.taxTypes.length === 0}
                    onClick={handleNext}
                    className="w-full py-6 bg-midnight text-white rounded-3xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-indigo-electric transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-midnight/10"
                  >
                    Lock Protocol <ArrowRight className="inline-ml-2 w-4 h-4 ml-2" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-xl shadow-midnight/5 space-y-6 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-indigo-electric mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">AI Market Pulse</span>
                    </div>
                    
                    <p className="text-xs font-medium text-midnight/60 leading-relaxed italic">
                      {formData.industryTypes.length > 0 && aiInsights[formData.industryTypes[formData.industryTypes.length - 1]]}
                    </p>
                    
                    <hr className="border-midnight/5" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold text-midnight uppercase tracking-widest">
                        <span>Industry Saturation</span>
                        <span className="text-indigo-electric">Optimal</span>
                      </div>
                      <div className="h-2 bg-warm-gray rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-electric w-3/4 rounded-full" />
                      </div>
                    </div>

                    {formData.taxTypes.length > 0 && aiInsights[formData.taxTypes[formData.taxTypes.length - 1]] && (
                      <div className="pt-4 p-4 bg-indigo-electric/5 rounded-2xl border border-indigo-electric/10">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 text-indigo-electric mt-0.5" />
                          <p className="text-[10px] font-medium text-indigo-electric leading-tight">
                            {aiInsights[formData.taxTypes[formData.taxTypes.length - 1]]}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Gradient Mesh */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-electric/5 rounded-full blur-3xl pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'identity' && (
            <motion.div
              key="identity"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-100 mb-4">
                  <Fingerprint className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                    Mission Vector Identified
                  </span>
                </div>
                <h1 className="text-6xl font-serif font-bold text-midnight italic">Select Interface Focus</h1>
                <p className="text-midnight/50 font-medium max-w-xl mx-auto">
                  Calibration sequence complete for <b>{formData.industryTypes.map(it => it.toUpperCase()).join(', ')}</b>. Select your operational lens.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <motion.div
                  whileHover={{ y: -8 }}
                  onClick={() => handleFinalize('recruiter')}
                  className="group relative cursor-pointer bg-midnight p-10 rounded-[3.5rem] shadow-2xl shadow-midnight/20 overflow-hidden border border-white/5"
                >
                  <div className="relative z-10 space-y-8">
                    <div className="w-16 h-16 bg-indigo-electric rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                      <Briefcase className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-serif font-bold text-white mb-4 italic">Recruit IQ</h2>
                      <p className="text-white/50 leading-relaxed font-medium">Source and manage top talent in {formData.industryTypes.join(' & ').toUpperCase()}.</p>
                    </div>
                    <div className="pt-6 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                        Enter Recruiting Portal <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-electric/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-electric/20 transition-all" />
                </motion.div>

                <motion.div
                  whileHover={{ y: -8 }}
                  onClick={() => handleFinalize('hunter')}
                  className="group relative cursor-pointer bg-white p-10 rounded-[3.5rem] shadow-2xl border border-midnight/5 overflow-hidden"
                >
                  <div className="relative z-10 space-y-8">
                    <div className="w-16 h-16 bg-coral rounded-2xl flex items-center justify-center shadow-xl shadow-coral/20 group-hover:scale-110 transition-transform">
                      <UserCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-serif font-bold text-midnight mb-4 italic">Career JQ</h2>
                      <p className="text-midnight/50 leading-relaxed font-medium">Find elite {formData.industryTypes.join(' & ').toUpperCase()} roles that fit your profile.</p>
                    </div>
                    <div className="pt-6 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-coral text-xs font-bold uppercase tracking-widest">
                        Enter Career Orbit <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-coral/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-coral/10 transition-all" />
                </motion.div>
              </div>
            </motion.div>
          )}

          {step === 'org-setup' && (
             <motion.div
             key="org-setup"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="max-w-xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-3xl shadow-midnight/10 border border-midnight/5"
           >
             <form onSubmit={handleOrgSubmit} className="space-y-8">
               <div className="text-center space-y-2">
                 <div className="w-16 h-16 bg-cream rounded-2xl flex items-center justify-center mx-auto mb-4 border border-midnight/5">
                   <Building2 className="w-8 h-8 text-midnight" />
                 </div>
                 <h3 className="text-3xl font-serif font-bold italic text-midnight">Establish HQ</h3>
                 <p className="text-sm text-midnight/40 font-medium italic">Finalizing infrastructure for your {formData.industryTypes.join(' & ').toUpperCase()} operation.</p>
               </div>

               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest px-4">Org Name</label>
                   <div className="relative">
                     <Rocket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/20" />
                     <input 
                       required
                       type="text"
                       value={orgForm.name}
                       onChange={e => setOrgForm({...orgForm, name: e.target.value})}
                       className="w-full pl-12 pr-6 py-4 bg-warm-gray rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-electric/5 transition-all text-midnight"
                       placeholder="Elite Systems Corp."
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest px-4">Corporate Domain</label>
                   <div className="relative">
                     <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/20" />
                     <input 
                       required
                       type="text"
                       value={orgForm.domain}
                       onChange={e => setOrgForm({...orgForm, domain: e.target.value})}
                       className="w-full pl-12 pr-6 py-4 bg-warm-gray rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-electric/5 transition-all text-midnight"
                       placeholder="elitesystems.ai"
                     />
                   </div>
                 </div>
               </div>

               <div className="flex gap-4">
                 <button 
                   type="button"
                   onClick={() => setStep('identity')}
                   className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-midnight/40 hover:text-midnight transition-colors"
                 >
                   Back
                 </button>
                 <button 
                   type="submit"
                   className="flex-[2] py-4 bg-midnight text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10 flex items-center justify-center gap-2"
                 >
                   Activate Command <ArrowRight className="w-4 h-4" />
                 </button>
               </div>
             </form>
           </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
