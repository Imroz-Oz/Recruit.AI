import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Rocket, Target, TrendingUp, Zap, ShieldCheck, BarChart3, ChevronRight, Activity, Users, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db } from '../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';

interface ScaleUpPlanPageProps {
  userLevel: string;
}

export default function ScaleUpPlanPage({ userLevel }: ScaleUpPlanPageProps) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    users: 0,
    paidUsers: 0,
    agencies: 0,
    jobs: 0
  });
  const [aiInsight, setAiInsight] = useState<string>('');

  const isGod = userLevel === 'universal';

  useEffect(() => {
    async function fetchPlatformData() {
      if (!isGod) {
        setLoading(false);
        return;
      }
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const activeUsersCount = usersSnap.size;
        
        let paid = 0;
        let agency = 0;
        usersSnap.forEach(d => {
            const data = d.data();
            if (data.userPlan === 'pro' || data.userPlan === 'enterprise') paid++;
            if (data.isCompanyUser) agency++;
        });

        const jobsSnap = await getDocs(collection(db, 'jobs'));
        const jobsCount = jobsSnap.size;

        setMetrics({ users: activeUsersCount, paidUsers: paid, agencies: agency, jobs: jobsCount });

        // Generate AI Insight
        try {
           const { getAI } = await import('@/src/services/aiService');
           const ai = getAI();
           if (ai) {
             const prompt = `You are Recruit IQ's Chief Intelligence Officer. Given the metrics: Users=${activeUsersCount}, Paid=${paid}, Agencies=${agency}, Jobs=${jobsCount}. Generate a highly strategic, visionary 2-sentence scale-up strategy for the God Admin.`;
             const res = await ai.models.generateContent({ model: "gemini-3.1-pro-preview", contents: prompt });
             if (res.text) setAiInsight(res.text);
           }
        } catch (e) {
           console.error("AI Insight error", e);
        }

      } catch (err) {
        console.error("Scale Up Hub Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlatformData();
  }, [isGod]);

  if (!isGod) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-700">
        <ShieldCheck className="w-16 h-16 text-amber-500 mb-6" />
        <h2 className="text-3xl font-bold text-[#0f172a]">Access Denied</h2>
        <p className="text-[#0f172a]/50 mt-2">Only Supreme Creators can view the Scale-Up Hub.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-amber-500/20 pb-8 rounded-t-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
            <Rocket className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold uppercase tracking-widest text-amber-700">Classified Intelligence</span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">Scale-Up Model</h2>
          <p className="text-[#0f172a]/70 font-medium max-w-xl italic mt-2">Real-time platform roadmap, AI expansion strategy & business scaling metrics.</p>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-amber-500/20 shadow-xl shadow-amber-500/5">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#0f172a]">{metrics.users}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mt-1">Total Users</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#0f172a]">{metrics.paidUsers}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mt-1">Premium Users & Cashflow</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#0f172a]">{metrics.jobs}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mt-1">Job Engine Nodes</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-coral/20 shadow-xl shadow-coral/5">
            <div className="w-12 h-12 bg-coral/10 text-coral rounded-2xl flex items-center justify-center mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <p className="text-3xl font-serif font-bold text-[#0f172a]">{metrics.agencies}</p>
            <p className="text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mt-1">Enterprise Orgs</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 text-xs font-bold uppercase tracking-widest mb-6">
                 <Zap className="w-3 h-3" /> Phase 1 AI Strategy
               </div>
               <h3 className="text-3xl font-serif font-bold text-white mb-4">Autonomous Intelligence</h3>
               <p className="text-slate-400 leading-relaxed mb-6">
                 The Recruit IQ AI system analyzes new features and improves model context dynamically. 
                 By observing user success rates (Matches & Screenings), it restructures candidate ranking equations automatically.
               </p>
               
               {aiInsight && (
                 <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-100/90 italic font-medium leading-relaxed">
                   <div className="flex items-center gap-2 mb-2 text-amber-500 not-italic text-sm font-bold uppercase tracking-widest">
                     <Sparkles className="w-4 h-4" /> Real-time System Analysis
                   </div>
                   {aiInsight}
                 </div>
               )}
               
               <div className="space-y-4">
                 <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                   <p className="text-sm font-medium text-slate-200 uppercase tracking-widest">Model Self-Healing: Active</p>
                 </div>
                 <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                   <div className="w-3 h-3 bg-amber-500 rounded-full" />
                   <p className="text-sm font-medium text-slate-200 uppercase tracking-widest">Multi-Agent Swarm: Next Cycle</p>
                 </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all duration-700" />
         </div>
         
         <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl shadow-indigo-900/5 relative overflow-hidden group">
            <div className="relative z-10">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-200 text-xs font-bold uppercase tracking-widest mb-6">
                 <Target className="w-3 h-3" /> Expansion Roadmap
               </div>
               <h3 className="text-3xl font-serif font-bold text-[#0f172a] mb-8">Global Adoption Target</h3>
               
               <div className="space-y-6">
                  <div className="relative">
                     <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">
                       <span>Market Penetration</span>
                       <span className="text-indigo-600">Q3 2026 Target: 10k Orgs</span>
                     </div>
                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-600 rounded-full w-[15%]" />
                     </div>
                  </div>
                  <div className="relative">
                     <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-[#0f172a]/40 mb-2">
                       <span>Feature Parity (Enterprise)</span>
                       <span className="text-coral">85% Complete</span>
                     </div>
                     <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-coral rounded-full w-[85%]" />
                     </div>
                  </div>
                  
                  <div className="pt-6 mt-6 border-t border-slate-100">
                     <p className="text-[#0f172a]/60 italic font-medium">As God Admin, your roadmap sets the AI learning boundaries. The system detects privacy and edge-case issues automatically and highlights them for your review.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
