import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage({ onBack }: { onBack?: () => void }) {
  return (
    <div className="min-h-screen bg-cream p-8 md:p-20 font-sans selection:bg-indigo-electric/10">
      <div className="max-w-3xl mx-auto space-y-12">
        {onBack && (
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-[#0f172a]/40 hover:text-[#0f172a] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-base font-bold uppercase tracking-widest">Back to App</span>
          </button>
        )}

        <header className="space-y-6">
          <div className="w-16 h-16 bg-indigo-electric rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-5xl font-serif font-bold text-[#0f172a] italic italic">Privacy <span className="text-indigo-electric">Protocol.</span></h1>
          <p className="text-[#0f172a]/40 font-bold uppercase tracking-[0.2em] text-base">Last Updated: May 3, 2026</p>
        </header>

        <div className="prose prose-midnight max-w-none space-y-8 text-[#0f172a]/70 leading-relaxed font-medium">
          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#0f172a] italic">1. Intelligence & Data Collection</h2>
            <p>
              When you authenticate via LinkedIn or Google, our system retrieves your professional identification (Name, Email, Profile Picture) to calibrate your mission profile. We do not store your credentials; authentication is handled directly by the identity providers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#0f172a] italic">2. Resume DNA Analysis</h2>
            <p>
              Any resume uploaded to our "Secure Portfolio" or "Onboarding Wizard" is processed by our AI to extract professional skill signatures. This data is used solely to match you with relevant vacancies and is encrypted at rest.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#0f172a] italic">3. Cookies & Tracking</h2>
            <p>
              We use operational cookies to maintain your authentication state and local storage to save your progress during missions. We do not use third-party advertising trackers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-[#0f172a] italic">4. Your Rights</h2>
            <p>
              You may request a total erasure of your professional DNA from our servers at any time via the "Settings" portal.
            </p>
          </section>
        </div>

        <footer className="pt-20 border-t border-slate-300/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e293b] flex items-center justify-center text-white">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-base font-bold text-[#0f172a]/40 uppercase tracking-widest leading-tight">
                Enterprise Grade Security<br/>AES-256 Encrypted
              </p>
            </div>
            <p className="text-base font-medium text-[#0f172a]/30 italic">
              Designed for transparency. Built for security.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
