import React, { useState } from 'react';
import { 
  Zap,
  Copy
} from 'lucide-react';
import CandidateSearch from '@/src/components/CandidateSearch';

export default function SourcingPage({ isLinkedInConnected, onConnectLinkedIn }: { isLinkedInConnected: boolean, onConnectLinkedIn: () => void }) {
  const [matches, setMatches] = useState<any[]>([]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
            <Zap className="w-3.5 h-3.5 text-indigo-electric fill-indigo-electric" />
            <span className="text-[9px] font-bold text-indigo-electric uppercase tracking-[0.2em]">Selection Orbit Protocol</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Selection Orbit</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Connect elite JD intent with Boolean logic & executive talent archives</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 rounded-full border-2 border-midnight font-bold text-xs hover:bg-midnight hover:text-white transition-all uppercase tracking-widest">
            Saved Searches
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12">
        <CandidateSearch 
          onMatchesFound={setMatches} 
          isLinkedInConnected={isLinkedInConnected} 
          onConnectLinkedIn={onConnectLinkedIn}
        />
      </div>
      
      {/* Search Templates provided by User Experience */}
      <section className="space-y-6 pt-10 border-t border-midnight/5">
        <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-midnight/20 text-center">Niche Pro-Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: 'Cloud Infrastructure / SRE', query: '("Go" OR "Kubernetes" OR "Terraform") AND ("SRE" OR "Systems")' },
            { label: 'FinTech / Backend Eng', query: '("Java" OR "Spring") AND ("Payment" OR "Ledger" OR "Banking")' },
            { label: 'Data Science / GenAI', query: '("PyTorch" OR "LLM" OR "LangChain") AND ("Transformer" OR "Attention")' }
          ].map((template, i) => (
             <div key={i} className="p-6 bg-white rounded-[2rem] border border-midnight/5 hover:border-indigo-electric/20 transition-all group cursor-pointer">
               <div className="flex justify-between items-start mb-4">
                 <h5 className="text-xs font-bold text-midnight group-hover:text-indigo-electric transition-colors">{template.label}</h5>
                 <button className="p-2 bg-warm-gray rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                    <Copy className="w-3 h-3 text-midnight/40" />
                 </button>
               </div>
               <div className="bg-warm-gray/50 p-4 rounded-xl font-mono text-[9px] text-midnight/40 line-clamp-2">
                 {template.query}
               </div>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
}
