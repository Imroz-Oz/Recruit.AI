import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Mic, 
  Video, 
  MessageSquare, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  RotateCcw,
  Target,
  BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function InterviewPrepPage() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    "Tell me about a time you had to lead a cross-functional team through a technical disagreement.",
    "How do you approach scaling a React application for hundreds of thousands of concurrent users?",
    "Describe your most complex architectural decision and its long-term impact on the product.",
    "What's your strategy for maintaining high-quality code standards while meeting aggressive deadlines?"
  ];

  const toggleSession = () => setSessionStarted(!sessionStarted);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-100">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500">
              High-Fidelity Prep Protocol Active
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-midnight italic">AI Interview IQ Coach</h2>
          <p className="text-midnight/50 font-medium max-w-xl italic">
            Simulate high-pressure technical interviews with an AI agent trained on FAANG and top-tier startup screening logic.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white rounded-2xl border border-midnight/5 shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-electric/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-electric" />
            </div>
            <div className="text-left">
              <p className="text-[8px] font-bold uppercase tracking-widest text-midnight/30">Prep Level</p>
              <p className="text-sm font-serif font-bold text-midnight italic">Advanced Elite</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Stage */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video bg-midnight rounded-[3rem] overflow-hidden shadow-2xl shadow-midnight/40 group">
            <AnimatePresence mode="wait">
              {!sessionStarted ? (
                <motion.div 
                  key="intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-8"
                >
                  <div className="w-24 h-24 bg-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-amber-500/40 relative">
                    <Bot className="w-12 h-12 text-white" />
                    <div className="absolute -inset-4 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-serif font-bold text-white italic">Ready to simulate?</h3>
                    <p className="text-white/40 text-sm max-w-sm mx-auto font-medium">Session will focus on "Senior Technical Leadership" and "Full-Stack System Design".</p>
                  </div>
                  <button 
                    onClick={toggleSession}
                    className="flex items-center gap-4 px-10 py-5 bg-white text-midnight rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-500 hover:text-white transition-all group/btn"
                  >
                    Initialize Session <Play className="w-4 h-4 fill-current group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="session"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col p-12"
                >
                  <div className="flex justify-between items-start mb-auto">
                    <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Live Analysis Tracking</span>
                    </div>
                    <button 
                      onClick={toggleSession}
                      className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="max-w-2xl mx-auto text-center space-y-8">
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-full">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Question {currentQuestion + 1} of 10</span>
                     </div>
                     <h4 className="text-3xl font-serif font-bold text-white italic leading-relaxed">
                        "{questions[currentQuestion % questions.length]}"
                     </h4>
                  </div>

                  <div className="mt-auto flex items-center justify-center gap-8">
                     <button className="w-20 h-20 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center text-white/40 hover:text-red-500 transition-all border border-white/10">
                        <Video className="w-8 h-8" />
                     </button>
                     <button className="w-28 h-28 bg-white text-midnight rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/20 hover:scale-110 active:scale-95 transition-all group/mic ring-8 ring-white/10">
                        <Mic className="w-10 h-10 transition-colors" />
                     </button>
                     <button className="w-20 h-20 bg-white/5 hover:bg-white/10 text-white rounded-full flex items-center justify-center text-white/40 hover:text-amber-500 transition-all border border-white/10">
                        <MessageSquare className="w-8 h-8" />
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 space-y-6">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-midnight/20">Confidence Meter</h5>
                <div className="h-4 w-full bg-warm-gray/10 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: sessionStarted ? '78%' : '0%' }}
                    className="h-full bg-emerald-500 shadow-xl shadow-emerald-500/20" 
                   />
                </div>
                <p className="text-xs font-medium text-midnight/40 leading-relaxed italic">
                   "Your speech cadence is optimal. Watch for filler words like 'basically' during technical explanations."
                </p>
             </div>
             <div className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 space-y-6">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-midnight/20">Key Competency focus</h5>
                <div className="flex flex-wrap gap-2">
                   {['Scalability', 'Reliability', 'Strategic Influence', 'Conflict Resolution'].map(tag => (
                      <span key={tag} className="px-3 py-1 bg-indigo-electric/5 text-indigo-electric rounded-lg text-[10px] font-bold uppercase tracking-widest">
                        {tag}
                      </span>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <aside className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-midnight/5 shadow-sm space-y-8">
             <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/20">Active Scenario</p>
                <h4 className="text-2xl font-serif font-bold text-midnight italic">Senior Backend Lead</h4>
             </div>
             
             <div className="space-y-4">
                <h5 className="text-[10px] font-bold uppercase tracking-[0.3em] text-midnight/20">Evaluation Matrix</h5>
                <div className="space-y-6">
                   {[
                     { label: 'Technical Accuracy', score: 85, color: 'bg-emerald-500' },
                     { label: 'Communication IQ', score: 92, color: 'bg-indigo-electric' },
                     { label: 'Leadership Signal', score: 78, color: 'bg-amber-500' }
                   ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-midnight/60">{item.label}</span>
                           <span className="text-midnight">{item.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-warm-gray/10 rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: `${item.score}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <button className="w-full py-5 bg-midnight text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-midnight/10 flex items-center justify-center gap-3">
                Download Analysis Report <Zap className="w-4 h-4 fill-current text-white/50" />
             </button>
          </div>

          <div className="bg-emerald-900 p-8 rounded-[3rem] text-white relative overflow-hidden group cursor-pointer">
             <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white/60" />
                </div>
                <h4 className="text-xl font-serif font-bold italic">Optimize Your Answers</h4>
                <p className="text-white/40 text-xs leading-relaxed font-medium">Use the "STAR+" framework to boost your leadership indicators by 25%.</p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 group-hover:translate-x-1 transition-transform">
                  Read Full Tutorial <ArrowRight className="w-3.5 h-3.5" />
                </div>
             </div>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
        </aside>
      </div>
    </div>
  );
}
