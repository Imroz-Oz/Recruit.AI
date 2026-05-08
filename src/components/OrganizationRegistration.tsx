import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  X,
  ArrowRight,
  Info,
  DollarSign,
  Zap,
  Briefcase
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/src/lib/utils';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  color: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'freelance',
    name: 'Freelance / Career AI',
    price: '$29/mo',
    description: 'Perfect for single recruiters or career seekers.',
    color: 'border-blue-200 bg-blue-50/30',
    features: ['Recruit IQ Sourcing', 'AI Boolean Generation', 'Personal Talent Pool', 'Basic Analytics']
  },
  {
    id: 'hunter',
    name: 'Job Hunter Pro',
    price: '$49/mo',
    description: 'Advanced features for dedicated job hunters.',
    color: 'border-emerald-200 bg-emerald-50/30',
    features: ['LinkedIn Intelligence', 'AI Outreach Generator', 'Interview Evaluations', 'Infinite Network Insights']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Sync',
    price: 'Custom',
    description: 'Scalable solution for large organizations.',
    color: 'border-slate-300 bg-[#1e293b] text-white',
    features: ['10-20 Admin Heads', '100-300 Admin/Managers', 'Up to 20K Member Accounts', 'Privileged Universal Support']
  }
];

export default function OrganizationRegistration({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'pricing' | 'form' | 'success'>('pricing');
  const [formData, setFormData] = useState({
    companyName: '',
    employeeCount: '',
    adminManagerCount: '',
    adminHeadEmail: '',
    companyEmail: '',
    country: 'USA',
    domain: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'organizations'), {
        ...formData,
        status: 'pending',
        type: 'enterprise',
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid || 'anonymous',
        systemEmail: `${formData.companyName.replace(/\s+/g, '')}@Recruit.AI`.toLowerCase()
      });
      setStep('success');
    } catch (error) {
      console.error('Org Registration Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream p-10 flex items-center justify-center font-sans">
      <div className="max-w-5xl w-full">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-[#0f172a]/40 hover:text-[#0f172a] transition-colors group"
        >
          <X className="w-5 h-5" />
          <span className="text-base font-bold uppercase tracking-widest">Back to Dashboard</span>
        </button>

        <AnimatePresence mode="wait">
          {step === 'pricing' && (
            <motion.div 
              key="pricing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-serif font-bold italic text-[#0f172a]">Select Your Ecosystem</h2>
                <p className="text-[#0f172a]/40 font-bold uppercase tracking-widest">Pricing architecture for global recruitment intelligence</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PRICING_TIERS.map((tier) => (
                  <div 
                    key={tier.id}
                    className={cn(
                      "p-8 rounded-3xl border-2 flex flex-col h-full hover:scale-[1.02] transition-all",
                      tier.color
                    )}
                  >
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-1">{tier.name}</h4>
                      <div className="text-3xl font-serif font-bold italic">{tier.price}</div>
                    </div>
                    <p className={cn("text-base mb-8", tier.id === 'enterprise' ? 'text-white/60' : 'text-[#0f172a]/60')}>
                      {tier.description}
                    </p>
                    <ul className="space-y-4 mb-10 flex-1">
                      {tier.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-base font-bold uppercase tracking-wide">
                          <CheckCircle2 className={cn("w-4 h-4", tier.id === 'enterprise' ? 'text-coral' : 'text-indigo-electric')} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => setStep('form')}
                      className={cn(
                        "w-full py-4 rounded-2xl font-black text-base uppercase tracking-widest transition-all",
                        tier.id === 'enterprise' ? 'bg-white text-[#0f172a] hover:bg-coral hover:text-white' : 'bg-[#1e293b] text-white hover:bg-indigo-electric'
                      )}
                    >
                      {tier.id === 'enterprise' ? 'Provision Enterprise' : 'Initiate Tier'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[4rem] p-16 shadow-2xl flex flex-col md:flex-row gap-16"
            >
              <div className="flex-1 space-y-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[#1e293b] text-white rounded-[1.5rem] flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-serif font-bold italic text-[#0f172a] leading-tight">Enterprise Infrastructure Setup</h3>
                  <p className="text-[#0f172a]/40 font-bold uppercase tracking-[0.2em] text-base leading-relaxed">
                    Once submitted, a Universal Admin will review your application for enterprise verification.
                  </p>
                </div>

                <div className="p-8 bg-neutral-50 rounded-3xl space-y-4">
                   <div className="flex items-center gap-4">
                     <Info className="w-5 h-5 text-indigo-electric" />
                     <h5 className="text-base font-black uppercase tracking-widest">Protocol Rules</h5>
                   </div>
                   <p className="text-base font-bold text-[#0f172a]/40 uppercase tracking-widest leading-loose">
                     System Emails will be generated as: <br />
                     <span className="text-indigo-electric">OrganizationName@Recruit.AI</span><br />
                     Individual users: <br/>
                     <span className="text-indigo-electric">EmployeeName.OrganizationName@Recruit.AI</span>
                   </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-[1.5] grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-base font-black uppercase text-[#0f172a]/40 tracking-widest ml-2">Company Name</label>
                  <input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. United Software Technologies" className="w-full p-5 bg-warm-gray rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-midnight/5 font-bold text-base" />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-black uppercase text-[#0f172a]/40 tracking-widest ml-2">Employees</label>
                  <select value={formData.employeeCount} onChange={e => setFormData({...formData, employeeCount: e.target.value})} className="w-full p-5 bg-warm-gray rounded-2xl outline-none font-bold text-base appearance-none">
                    <option value="">Select Range</option>
                    <option value="1-50">1-50 Professionals</option>
                    <option value="51-200">51-200 Professionals</option>
                    <option value="200+">200+ Professionals</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-base font-black uppercase text-[#0f172a]/40 tracking-widest ml-2">Admin/Managers Needed</label>
                  <input required type="number" value={formData.adminManagerCount} onChange={e => setFormData({...formData, adminManagerCount: e.target.value})} placeholder="10" className="w-full p-5 bg-warm-gray rounded-2xl outline-none font-bold text-base" />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-black uppercase text-[#0f172a]/40 tracking-widest ml-2">Admin Head Email</label>
                  <input required type="email" value={formData.adminHeadEmail} onChange={e => setFormData({...formData, adminHeadEmail: e.target.value})} placeholder="boss@company.com" className="w-full p-5 bg-warm-gray rounded-2xl outline-none font-bold text-base" />
                </div>
                <div className="space-y-2">
                  <label className="text-base font-black uppercase text-[#0f172a]/40 tracking-widest ml-2">Country of Hiring</label>
                  <select value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full p-5 bg-warm-gray rounded-2xl outline-none font-bold text-base appearance-none">
                    <option value="USA">United States of America</option>
                    <option value="Canada">Canada</option>
                    <option value="Mexico">Mexico</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Other">Other Global Location</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="col-span-2 mt-4 py-6 bg-[#1e293b] text-white rounded-[2rem] font-black text-base uppercase tracking-[0.3em] hover:bg-coral hover:shadow-2xl hover:shadow-coral/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Transmitting protocol...' : 'Request Deployment Authorization'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div 
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1e293b] text-white rounded-[4rem] p-20 text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-coral/5 pointer-events-none" />
              <div className="w-24 h-24 bg-coral text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-coral/40">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="text-5xl font-serif font-bold italic">Application Transmitted</h3>
              <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-base max-w-sm mx-auto leading-relaxed">
                Your enterprise credentials have been queued for Universal Admin authorization. You will receive notification at {formData.adminHeadEmail} upon approval.
              </p>
              <button 
                onClick={onBack}
                className="px-12 py-5 bg-white text-[#0f172a] rounded-3xl font-black text-base uppercase tracking-widest hover:bg-coral hover:text-white transition-all"
              >
                Return to Matrix
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
