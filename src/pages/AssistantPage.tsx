import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { AppMode } from '@/src/types';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  FileText, 
  Search, 
  Zap,
  MoreHorizontal,
  Plus,
  Briefcase,
  Building,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Linkedin,
  Network
} from 'lucide-react';
import { generateLinkedInOptimizations } from '@/src/services/aiService';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export default function AssistantPage({ appMode }: { appMode: AppMode }) {
  const isRecruiter = appMode === 'recruiter';
  
  if (!isRecruiter) {
    return <HunterCareerAIPage />;
  }

  // RECRUITER CURRENT CHAT UI
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: "Hello! I'm your Recruit IQ Copilot. I can help you generate outreach messages, screen candidates, or optimize your boolean strings. What are we working on today?",
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: 'Just now'
    };

    setMessages([...messages, newUserMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: "I've analyzed that request. For a Senior Backend role with Go experience, I recommend adding 'Distributed Systems' and 'Kubernetes' to your boolean string to filter for true high-scale expertise. Should I regenerate the query for you?",
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const recruiterSuggestions = [
    { label: 'Outreach Note', icon: Send },
    { label: 'Screening Qs', icon: Zap },
    { label: 'Boolean Polish', icon: Search },
    { label: 'JD Summary', icon: FileText },
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-midnight/5">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg bg-indigo-electric shadow-indigo-100">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold italic">Strategic Advisor</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 text-indigo-500">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-indigo-500" /> Advisor Neural Active
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="p-3 rounded-full hover:bg-neutral-100 transition-colors">
            <MoreHorizontal className="w-5 h-5 text-midnight/40" />
          </button>
        </div>
      </header>

      <div className="flex-1 bg-white rounded-3xl border border-midnight/5 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto space-y-8 scrollbar-hide">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl shrink-0 flex items-center justify-center",
                msg.role === 'user' ? "bg-coral text-white" : "bg-indigo-electric/10 text-indigo-electric"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-5 rounded-3xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-midnight text-white rounded-tr-none" 
                  : "bg-warm-gray text-midnight rounded-tl-none border border-midnight/5 italic"
              )}>
                {msg.text}
                <span className={cn(
                  "block text-[9px] mt-2 font-bold uppercase tracking-widest opacity-40",
                  msg.role === 'user' ? "text-white" : "text-midnight"
                )}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-electric/10 text-indigo-electric">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-warm-gray px-6 py-4 rounded-3xl rounded-tl-none border border-midnight/5 flex gap-1">
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-midnight/20 rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-midnight/20 rounded-full" />
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-midnight/20 rounded-full" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-midnight/5 bg-warm-gray/30 space-y-4">
           <div className="flex flex-wrap gap-2">
            {recruiterSuggestions.map((s) => (
              <button 
                key={s.label}
                onClick={() => setInput(`Generate a ${s.label.toLowerCase()} for...`)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-midnight/5 rounded-full text-xs font-bold transition-all text-midnight/60 hover:border-indigo-electric hover:text-indigo-electric"
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
            <button className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold bg-indigo-electric/10 text-indigo-electric">
              <Plus className="w-3.5 h-3.5" /> Custom
            </button>
          </div>

          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask the AI Assistant to generate outreach, improve search, or summarize..."
              className="w-full pl-6 pr-16 py-4 bg-white border border-midnight/10 rounded-2xl outline-none transition-all text-sm font-medium focus:border-indigo-electric/40 focus:ring-4 focus:ring-indigo-electric/5"
            />
            <button 
              onClick={handleSend}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white rounded-xl flex items-center justify-center transition-colors bg-midnight hover:bg-indigo-electric"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// NEW HUNTER UI
function HunterCareerAIPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleGenerate = async () => {
    if (!role || !company) return;
    setIsGenerating(true);
    const optimization = await generateLinkedInOptimizations(role, company);
    setResults(optimization);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] relative flex flex-col rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 md:p-10">
      {/* Decorative animated blobs */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} 
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-r from-pink-300/30 to-purple-400/30 rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }} 
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] bg-gradient-to-r from-blue-300/30 to-indigo-400/30 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="relative z-10 flex flex-col lg:flex-row gap-10 h-full">
        {/* Left Column: Input Panel */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6 shrink-0">
          <header className="space-y-4 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-700">
                Career AI Copilot
              </span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-midnight leading-tight tracking-tight">
              Target &<br/><span className="text-purple-600 italic">Conquer.</span>
            </h2>
            <p className="text-midnight/60 font-medium text-sm leading-relaxed">
              Tell me your dream role and company. I'll dynamically reverse-engineer 
              their culture and generate a custom LinkedIn optimization strategy.
            </p>
          </header>

          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 pl-2">Target Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600/50" />
                <input 
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-purple-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 pl-2">Target Company</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-600/50" />
                <input 
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI, Vercel"
                  className="w-full pl-12 pr-4 py-4 bg-white/50 border border-purple-100 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 transition-all font-medium"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !role || !company}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-600/20 group mt-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Targets...
                </>
              ) : (
                <>
                  Generate Strategy
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Results Display */}
        <div className="flex-1 w-full bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white shadow-xl p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {!results && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold italic text-midnight">Awaiting Mission Parameters</h3>
                  <p className="text-midnight/40 font-medium max-w-sm mx-auto">
                    Provide your target role and company on the left, and I will generate a tactical blueprint for your LinkedIn profile.
                  </p>
                </div>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
                  <div className="absolute inset-0 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-midnight">Synthesizing Culture & Requirements...</h3>
                  <p className="text-sm font-medium text-purple-600 animate-pulse">Running semantic analysis on {company}'s DNA...</p>
                </div>
              </motion.div>
            )}

            {results && !isGenerating && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-serif font-bold italic text-midnight mb-2">Your Optimization Blueprint</h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-purple-600">Targeting {role} at {company}</p>
                </div>

                <motion.div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                      <Linkedin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight">Headline Upgrades</h4>
                      <p className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">First Impression Logic</p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {results.headlineSuggestions?.map((headline: string, i: number) => (
                      <div key={i} className="flex gap-3 items-start p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                         <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                         <p className="text-sm font-medium text-midnight/80">{headline}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight">About Section Override</h4>
                      <p className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">The Narrative Shift</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed font-medium text-midnight/70 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 italic">
                    {results.summaryTwist}
                  </p>
                </motion.div>

                <motion.div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                      <Network className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight">Social Engineering Strategy</h4>
                      <p className="text-[10px] uppercase tracking-widest text-midnight/40 font-bold">Connection Targeting</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed font-medium text-midnight/70 p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                    {results.connectionStrategy}
                  </p>
                </motion.div>
                
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

