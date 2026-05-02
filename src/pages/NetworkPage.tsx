import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Linkedin, 
  Sparkles, 
  Search, 
  MessageSquare, 
  UserPlus,
  Zap,
  Briefcase,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<'connections' | 'suggestions'>('connections');

  const connections = [
    { id: '1', name: 'James Wilson', title: 'VP Engineering @ Scalar', industry: 'Cloud Infrastructure', match: 'High', skills: ['Scale', 'Go', 'Strategy'] },
    { id: '2', name: 'Elena Rodriguez', title: 'Senior Recruiter @ TechStack', industry: 'Professional Services', match: 'Medium', skills: ['Hiring', 'Growth'] },
    { id: '3', name: 'David Kim', title: 'Product Manager @ Orbit', industry: 'SaaS', match: 'High', skills: ['Product', 'UX', 'SQL'] },
  ];

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Network Intelligence</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest mt-2">Leverage your 1st-degree connections for active roles</p>
        </div>
        <div className="bg-[#0077B5] text-white px-6 py-2.5 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20">
          <Linkedin className="w-4 h-4" /> Connected as Alex
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-midnight/5 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="flex border-b border-midnight/5 p-2 bg-warm-gray/30">
          <button 
            onClick={() => setActiveTab('connections')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all",
              activeTab === 'connections' ? "bg-white text-midnight shadow-sm" : "text-midnight/40 hover:text-midnight"
            )}
          >
            My Connections (1,248)
          </button>
          <button 
            onClick={() => setActiveTab('suggestions')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2",
              activeTab === 'suggestions' ? "bg-white text-indigo-electric shadow-sm" : "text-midnight/40 hover:text-midnight"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Suggestion Engine
          </button>
        </div>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'connections' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {connections.map(c => (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   key={c.id} 
                   className="p-6 bg-warm-gray/30 rounded-3xl border border-transparent hover:border-indigo-electric/20 hover:bg-white transition-all group"
                 >
                   <div className="flex justify-between mb-4">
                     <div className="w-12 h-12 bg-midnight/5 rounded-2xl flex items-center justify-center text-midnight font-serif font-bold italic">
                       {c.name[0]}
                     </div>
                     <button className="p-2 text-midnight/20 hover:text-indigo-electric transition-colors">
                       <MessageSquare className="w-5 h-5" />
                     </button>
                   </div>
                   <h4 className="text-lg font-serif font-bold text-midnight italic">{c.name}</h4>
                   <p className="text-[10px] font-bold text-midnight/40 uppercase tracking-wider mb-4 leading-tight">{c.title}</p>
                   
                   <div className="flex flex-wrap gap-1.5 mb-6">
                     {c.skills.map(s => (
                       <span key={s} className="px-2 py-0.5 bg-white border border-midnight/5 rounded text-[8px] font-bold text-midnight/40">{s}</span>
                     ))}
                   </div>

                   <button className="w-full py-2.5 bg-midnight text-white rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-electric transition-colors flex items-center justify-center gap-2">
                     Analyze Potential Match <Zap className="w-3.5 h-3.5" />
                   </button>
                 </motion.div>
               ))}
             </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 py-10">
              <div className="text-center space-y-4 mb-12">
                <div className="w-20 h-20 bg-indigo-electric/10 text-indigo-electric rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-serif font-bold italic">Smart Match Suggestions</h3>
                <p className="text-sm text-midnight/40 font-medium italic">Our AI analyzed your 1st-degree network against your current open positions.</p>
              </div>

              <div className="space-y-4">
                 {[
                   { name: 'Sarah Chen', role: 'Staff Architect', match: 'Backend Staff (L6)', why: 'Worked together at Scalar; strong K8s background matches job requirements by 92%.' },
                   { name: 'Marcus Bell', role: 'DevOps Lead', match: 'Infrastructure Lead', why: 'Recent LinkedIn update shows "Open to Work"; matches tech stack exactly.' }
                 ].map((s, i) => (
                   <div key={i} className="p-8 bg-indigo-electric/5 rounded-[2.5rem] border border-indigo-100 flex flex-col md:flex-row gap-6 items-center">
                     <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm relative shrink-0">
                       <UserPlus className="w-10 h-10 text-indigo-electric/20" />
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                          <h4 className="text-xl font-serif font-bold italic">{s.name}</h4>
                          <span className="text-[8px] font-bold px-2 py-0.5 bg-indigo-electric text-white rounded-full uppercase tracking-widest">92% Match</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 mb-3 underline decoration-indigo-electric/20 decoration-2 underline-offset-4">Match for: {s.match}</p>
                        <p className="text-xs text-midnight/60 font-medium leading-relaxed italic">"{s.why}"</p>
                     </div>
                     <button className="px-8 py-4 bg-midnight text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-coral transition-all grow-0 shrink-0">
                       Reach Out on LinkedIn
                     </button>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
