import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, Sparkles, ShieldCheck, Loader2, ArrowRight, Brain, Globe, Target, Zap, User, Rocket } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import BrandLogo from '@/src/components/BrandLogo';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [intendedRole, setIntendedRole] = useState<'recruiter' | 'hunter' | null>(null);

  useEffect(() => {
    // Clear any stale intended role on mount
    localStorage.removeItem('intendedRole');
  }, []);

  const handleRoleSelect = (role: 'recruiter' | 'hunter') => {
    localStorage.setItem('intendedRole', role);
    setIntendedRole(role);
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user?.email) {
        onLogin(result.user.email);
      }
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        console.log('Login attempt cancelled by user or environment.');
      } else {
        console.error(err);
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkedInLogin = async () => {
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/linkedin/url');
      if (!response.ok) throw new Error('Failed to get LinkedIn Auth URL');
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        'LinkedIn Auth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        setIsLoading(false);
        setError('Popup blocked. Please enable popups to connect LinkedIn.');
        return;
      }

      // Listen for the success message from the popup
      const handleMessage = (event: MessageEvent) => {
        // Log all messages in dev for diagnostic purposes
        if (process.env.NODE_ENV === 'development') {
          console.log('[LinkedIn Auth] Received Message:', event.data);
        }

        if (event.data?.type === 'LINKEDIN_AUTH_SUCCESS' && event.data.profile) {
          const profile = event.data.profile;
          window.removeEventListener('message', handleMessage);
          
          if (profile.email) {
            onLogin(profile.email, profile);
          } else {
            setError('LinkedIn login successful, but no email was returned.');
            setIsLoading(false);
          }
        } else if (event.data?.type === 'LINKEDIN_AUTH_ERROR') {
          window.removeEventListener('message', handleMessage);
          setError(`LinkedIn Error: ${event.data.error || 'Authentication failed'}`);
          setIsLoading(false);
        }
      };

      window.addEventListener('message', handleMessage);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initiate LinkedIn connection');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream font-sans text-midnight overflow-x-hidden selection:bg-indigo-electric/20">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-7xl mx-auto z-10 w-full">
        <div className="flex items-center gap-3">
          <BrandLogo className="w-10 h-10 text-midnight" />
          <span className="text-xl font-serif font-bold tracking-tight italic">Recruit AI</span>
        </div>
        <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-midnight/60">
          <a href="#about" className="hover:text-midnight transition-colors">About Us</a>
          <a href="#features" className="hover:text-midnight transition-colors">Capabilities</a>
          <a href="#security" className="hover:text-midnight transition-colors">Security</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
              <Sparkles className="w-4 h-4 text-indigo-electric" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">
                The Blueprint for High-End Staffing
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] tracking-tight">
              Elite Intelligence for the <br /><span className="italic text-violet">Modern Workforce</span>
            </h1>
            
            <p className="text-lg md:text-xl text-midnight/60 leading-relaxed max-w-lg mb-8">
              Empower your recruitment strategy with AI-driven matching, predictive candidate insights, and seamless engagement flows. Connecting top-tier talent with world-class opportunities.
            </p>

            <div className="flex gap-4 items-center">
               <div className="flex -space-x-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={`w-10 h-10 rounded-full border-2 border-cream bg-midnight/10 flex items-center justify-center z-[${4-i}]`}>
                     <User className="w-4 h-4 text-midnight/50" />
                   </div>
                 ))}
               </div>
               <p className="text-xs font-medium text-midnight/50">
                 Trusted by <span className="font-bold text-midnight">500+</span> elite staffing teams globally
               </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-violet/10 blur-3xl rounded-full transform -rotate-12 translate-x-10 scale-110" />
            
            {/* Auth Card */}
             <div className="w-full max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-2xl shadow-violet/5 flex flex-col relative z-10 border border-midnight/5 min-h-[440px]">
              
              <AnimatePresence mode="wait">
                {!intendedRole ? (
                  <motion.div 
                    key="role-select"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col justify-center"
                  >
                    <div className="space-y-2 text-center mb-10">
                      <h2 className="text-3xl font-serif font-bold text-midnight italic">
                        Identify Mission
                      </h2>
                      <p className="text-midnight/40 text-[11px] font-bold uppercase tracking-widest">
                        Select your operational state
                      </p>
                    </div>
                    <div className="space-y-4">
                      <button 
                        onClick={() => handleRoleSelect('recruiter')}
                        className="w-full p-6 text-left border-2 border-warm-gray rounded-3xl hover:border-violet/30 hover:bg-violet/5 transition-all group flex items-center justify-between"
                      >
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Target className="w-5 h-5 text-violet group-hover:scale-110 transition-transform" />
                             <span className="font-bold text-sm text-midnight uppercase tracking-widest">Building a Team</span>
                           </div>
                           <p className="text-xs font-medium text-midnight/50 italic">Scout and secure elite talent</p>
                         </div>
                         <ArrowRight className="w-5 h-5 text-midnight/20 group-hover:text-violet group-hover:translate-x-1 transition-all" />
                      </button>

                      <button 
                        onClick={() => handleRoleSelect('hunter')}
                        className="w-full p-6 text-left border-2 border-warm-gray rounded-3xl hover:border-emerald-600/30 hover:bg-emerald-600/5 transition-all group flex items-center justify-between"
                      >
                         <div>
                           <div className="flex items-center gap-2 mb-1">
                             <Rocket className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                             <span className="font-bold text-sm text-midnight uppercase tracking-widest">Advancing Career</span>
                           </div>
                           <p className="text-xs font-medium text-midnight/50 italic">Access your intelligence orbit</p>
                         </div>
                         <ArrowRight className="w-5 h-5 text-midnight/20 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex-1 flex flex-col justify-center relative pt-4"
                  >
                    <button 
                      onClick={() => setIntendedRole(null)} 
                      className="absolute -top-4 -left-4 p-2 text-midnight/30 hover:text-midnight hover:bg-neutral-100 rounded-full transition-all"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180" />
                    </button>

                    <div className="space-y-2 text-center mb-10">
                      <h2 className="text-3xl font-serif font-bold text-midnight italic">
                        {intendedRole === 'recruiter' ? 'Launch Portal' : 'Access Orbit'}
                      </h2>
                      <p className="text-midnight/40 text-[11px] font-bold uppercase tracking-widest">
                        Authenticate to access intelligence
                      </p>
                    </div>

                    <div className="space-y-6">
                      {error && (
                        <div className="p-4 bg-coral/10 border border-coral/20 rounded-2xl text-coral text-xs font-bold text-center">
                          {error}
                        </div>
                      )}

                      <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-4 bg-white border-2 border-warm-gray text-midnight rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:border-midnight/20 hover:bg-neutral-50 transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-midnight" />
                        ) : (
                          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                        )}
                        {isLoading ? 'Authenticating...' : 'Continue with Google'}
                      </button>

                      <button
                        onClick={handleLinkedInLogin}
                        disabled={isLoading}
                        className="w-full py-4 bg-[#0A66C2] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-[#004182] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <div className="w-4 h-4 bg-white text-[#0A66C2] rounded-sm flex items-center justify-center text-[10px] font-bold">in</div>
                        )}
                        {isLoading ? 'Authenticating...' : 'Continue with LinkedIn'}
                      </button>

                      <div className="pt-6 border-t border-midnight/5">
                        <p className="text-[10px] text-midnight/30 text-center font-medium leading-relaxed">
                          By connecting, you agree to our <span className="underline cursor-pointer hover:text-midnight/50">Enterprise Data Agreement</span> and <a href="#/privacy" className="underline hover:text-midnight/50">Privacy Protocol</a>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white border-t border-midnight/5 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-violet">About Recruit AI</h2>
            <h3 className="text-4xl md:text-5xl font-serif font-bold italic leading-tight">Elevating Human Potential through Machine Precision</h3>
            <p className="text-xl text-midnight/60 leading-relaxed font-medium">
              We built Recruit AI to bridge the gap between extraordinary talent and visionary enterprises. 
              Our platform doesn't just parse resumes; it understands professional DNA, creating matches 
              that traditional algorithms miss. Whether you are a strategic headhunter or an elite candidate, 
              Recruit AI equips you with the intelligence needed to operate at the peak of the market.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="text-center mb-16 space-y-4">
             <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-coral">Core Capabilities</h2>
             <h3 className="text-4xl font-serif font-bold italic">The Intelligence Arsenal</h3>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
             {[
               { icon: Brain, title: 'Advisor Deep-Dive', desc: 'Autonomous intelligence agent that analyzes resumes contextually, extracting true skill trajectories and leadership potential.', color: 'text-indigo-electric', bg: 'bg-indigo-electric/10' },
               { icon: Target, title: 'Selection Orbit', desc: 'Enterprise-grade sourcing logic allowing you to build highly targeted talent pools and monitor market movements.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
               { icon: Globe, title: 'Opportunity Matrix', desc: 'Candidates receive AI-curated role recommendations that align not just with skills, but with career trajectory and culture.', color: 'text-amber-500', bg: 'bg-amber-500/10' }
             ].map((feature, i) => (
               <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-midnight/5 hover:border-midnight/10 transition-colors shadow-sm">
                 <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-8`}>
                   <feature.icon className={`w-7 h-7 ${feature.color}`} />
                 </div>
                 <h4 className="text-xl font-serif font-bold mb-4">{feature.title}</h4>
                 <p className="text-midnight/60 font-medium leading-relaxed">{feature.desc}</p>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* Security / Footer CTA */}
      <section id="security" className="py-24 bg-midnight text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10 space-y-8">
           <ShieldCheck className="w-16 h-16 text-violet mx-auto" />
           <h3 className="text-4xl font-serif font-bold italic">Enterprise Grade Security</h3>
           <p className="text-xl text-white/50 leading-relaxed">
             Your data infrastructure is fortified. We utilize state-of-the-art encryption, zero-retention AI protocols, and strict RBAC controls to ensure your talent repository remains absolutely secure.
           </p>
           <div className="pt-8">
             <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-4 bg-white text-midnight rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-all">
               Access Portal Now
             </button>
           </div>
        </div>
      </section>

      <footer className="bg-midnight border-t border-white/10 text-white/30 py-12 text-center text-xs font-medium">
        <div className="flex flex-col items-center gap-6">
          <p>&copy; {new Date().getFullYear()} Recruit AI | Intelligence Systems. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#/privacy" className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4">Privacy Protocol</a>
            <span className="cursor-pointer hover:text-white transition-colors">Data Agreement</span>
            <span className="cursor-pointer hover:text-white transition-colors">Ethics Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
