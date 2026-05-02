import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user?.email) {
        onLogin(result.user.email);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-midnight/5 flex flex-col"
      >
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-12 h-12 bg-indigo-electric rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-white font-serif font-bold text-2xl italic">IQ</span>
          </div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-midnight">Recruit IQ</h1>
        </div>

        <div className="space-y-2 text-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-midnight italic">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-midnight/40 text-sm font-medium">
            Professional AI Intelligence for Modern Staffing
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 bg-midnight text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-xl shadow-midnight/10 flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 bg-white rounded-full p-0.5" alt="Google" />
            Continue with Google
          </button>

          <p className="text-[10px] text-midnight/30 text-center font-medium leading-relaxed">
            By connecting, you agree to our Enterprise Data Agreement and AI Ethics Protocol.
          </p>
        </div>
      </motion.div>

      <div className="mt-10 flex gap-8 items-center text-midnight/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Matching Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">GDPR Compliance</span>
        </div>
      </div>
    </div>
  );
}
