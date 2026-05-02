import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Sparkles, ShieldCheck, Mail, Lock } from 'lucide-react';

interface AuthPageProps {
  onLogin: (email: string) => void;
}

export default function AuthPage({ onLogin }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/20" />
              <input
                type="email"
                placeholder="Work Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-warm-gray border border-transparent rounded-2xl focus:border-indigo-electric focus:bg-white outline-none transition-all text-sm font-bold placeholder:text-midnight/20"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/20" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-warm-gray border border-transparent rounded-2xl focus:border-indigo-electric focus:bg-white outline-none transition-all text-sm font-bold placeholder:text-midnight/20"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-midnight text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-xl shadow-midnight/10 flex items-center justify-center gap-2"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isLogin ? 'Sign In Intelligence' : 'Join the Network'}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 py-2 opacity-50 justify-center">
          <div className="h-px flex-1 bg-midnight/10" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40">Or connect with</span>
          <div className="h-px flex-1 bg-midnight/10" />
        </div>

        <button className="mt-4 w-full py-3 bg-[#0077B5] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2">
          LinkedIn Fast Connect
        </button>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="mt-8 text-[11px] font-bold text-midnight/40 hover:text-midnight transition-colors uppercase tracking-widest text-center"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
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
