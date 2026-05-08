import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Sparkles, MessageCircle, Search, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { db } from '../lib/firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';

import { generateBuddyIcebreaker } from '@/src/services/aiService';

interface MessageBuddyPageProps {
  userLevel: string;
  userPlan: string;
  myProfile: any;
}

export default function MessageBuddyPage({ userLevel, userPlan, myProfile }: MessageBuddyPageProps) {
  const [buddies, setBuddies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, { icebreaker: string, synergy: string }>>({});
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  const isPaid = userPlan === 'pro' || userPlan === 'enterprise' || userLevel === 'universal' || userLevel === 'superadmin';

  const handleGenerateIcebreaker = async (buddy: any) => {
    setGeneratingFor(buddy.id);
    const result = await generateBuddyIcebreaker(myProfile, buddy);
    if (result && result.icebreaker) {
      setAiSuggestions(prev => ({ ...prev, [buddy.id]: result }));
    }
    setGeneratingFor(null);
  };

  useEffect(() => {
    async function fetchBuddies() {
      if (!isPaid) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'users'), where('selectedMode', '==', 'hunter'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)).filter(u => u.name);
        setBuddies(fetched);
      } catch (err) {
        console.error("Failed to fetch buddies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBuddies();
  }, [isPaid]);

  if (!isPaid) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-coral/10 rounded-full flex items-center justify-center mb-8">
          <MessageCircle className="w-12 h-12 text-coral" />
        </div>
        <h2 className="text-4xl font-serif font-bold text-[#0f172a] mb-4">Message Buddy is a Premium Feature</h2>
        <p className="text-[#0f172a]/50 max-w-lg mb-8 italic">
          Upgrade to Premium to find and collaborate with other professionals in our community. Build your network and find your next career ally.
        </p>
        <button className="px-8 py-4 bg-[#1e293b] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-xl shadow-slate-900/10">
          <Zap className="w-4 h-4 inline-block mr-2" />
          Upgrade Now
        </button>
      </div>
    );
  }

  const filteredBuddies = buddies.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-300/10 pb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-electric/5 border border-indigo-100 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-electric" />
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-electric">Community Hub</span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">Message Buddy</h2>
          <p className="text-[#0f172a]/50 font-medium max-w-xl italic mt-2">Connect, collaborate and grow with other driven professionals.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0f172a]/30" />
          <input 
            type="text" 
            placeholder="Search by name or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300/10 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 shadow-sm"
          />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="w-8 h-8 border-4 border-indigo-electric/30 border-t-indigo-electric rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuddies.map(buddy => (
            <motion.div 
              key={buddy.id}
              whileHover={{ y: -4 }}
              className="p-6 bg-white rounded-3xl border border-slate-300/10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="flex items-start gap-4 z-10 relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                  <span className="text-xl font-bold text-indigo-electric">{buddy.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0f172a] group-hover:text-indigo-electric transition-colors">{buddy.name}</h3>
                  <p className="text-sm text-[#0f172a]/50 italic mb-2 line-clamp-1">{buddy.title || 'Professional'}</p>
                  
                  {buddy.funNameTag && (
                    <span className="inline-block px-2 py-0.5 bg-coral/10 text-coral text-xs font-bold uppercase tracking-wider rounded">
                      {buddy.funNameTag}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-8 relative z-10 space-y-3">
                {aiSuggestions[buddy.id] ? (
                   <div className="p-4 bg-indigo-50/50 rounded-xl text-sm text-[#0f172a]/70 italic border border-indigo-100">
                     <p className="font-bold text-indigo-electric mb-1 not-italic text-xs uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Setup Icebreaker</p>
                     "{aiSuggestions[buddy.id].icebreaker}"
                   </div>
                ) : (
                   <button 
                     onClick={() => handleGenerateIcebreaker(buddy)}
                     disabled={generatingFor === buddy.id}
                     className="w-full py-2 bg-indigo-50 text-indigo-electric font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                   >
                     {generatingFor === buddy.id ? <div className="w-4 h-4 border-2 border-indigo-electric/30 border-t-indigo-electric rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                     {generatingFor === buddy.id ? 'Analyzing Synergy...' : 'Generate Icebreaker'}
                   </button>
                )}
                
                <button 
                  onClick={() => alert(`Messaging feature for ${buddy.name} is coming soon in the Chat Update!`)}
                  className="w-full py-3 bg-[#1e293b] text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </button>
              </div>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-electric/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-electric/10 transition-all" />
            </motion.div>
          ))}
          {filteredBuddies.length === 0 && (
            <div className="col-span-full py-20 text-center text-[#0f172a]/30 italic font-medium">
              No buddies found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
