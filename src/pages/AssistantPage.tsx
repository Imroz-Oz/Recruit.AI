import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { AppMode } from '@/src/types';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  FileText, 
  Search, 
  Zap,
  MoreHorizontal,
  Plus,
  Rocket,
  GraduationCap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export default function AssistantPage({ appMode }: { appMode: AppMode }) {
  const isRecruiter = appMode === 'recruiter';
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      text: isRecruiter 
        ? "Hello! I'm your Recruit IQ Copilot. I can help you generate outreach messages, screen candidates, or optimize your boolean strings. What are we working on today?"
        : "Welcome to your Career Command Center. I'm your AI Coach. I can help you tailor your resume, prep for interviews, or suggest keywords to boost your profile visibility. How can I help you land that role?",
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

    // Simulate AI response
    setTimeout(() => {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: isRecruiter 
          ? "I've analyzed that request. For a Senior Backend role with Go experience, I recommend adding 'Distributed Systems' and 'Kubernetes' to your boolean string to filter for true high-scale expertise. Should I regenerate the query for you?"
          : "That's a great target. Based on the Senior Frontend role at Innovate AI, I've updated your 'Key Projects' section to emphasize Framer Motion and WebGL performance which highlights your high-signal technical depth. Want to preview the change?",
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

  const hunterSuggestions = [
    { label: 'Tailor Resume', icon: Sparkles },
    { label: 'Interview Prep', icon: Bot },
    { label: 'Keyword Opt', icon: Zap },
    { label: 'JD Explained', icon: GraduationCap },
  ];

  const suggestions = isRecruiter ? recruiterSuggestions : hunterSuggestions;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col max-w-4xl mx-auto space-y-6">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-midnight/5">
        <div className="flex gap-4 items-center">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
            isRecruiter ? "bg-indigo-electric shadow-indigo-100" : "bg-emerald-600 shadow-emerald-100"
          )}>
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold italic">{isRecruiter ? 'Recruit IQ Assistant' : 'Career JQ Coach'}</h2>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
              isRecruiter ? "text-indigo-500" : "text-emerald-500"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isRecruiter ? "bg-indigo-500" : "bg-emerald-500"
              )} /> AI Neural Active
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
                msg.role === 'user' ? (isRecruiter ? "bg-coral text-white" : "bg-amber-500 text-white") : (isRecruiter ? "bg-indigo-electric/10 text-indigo-electric" : "bg-emerald-500/10 text-emerald-600")
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
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                isRecruiter ? "bg-indigo-electric/10 text-indigo-electric" : "bg-emerald-500/10 text-emerald-600"
              )}>
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
            {suggestions.map((s) => (
              <button 
                key={s.label}
                onClick={() => setInput(`Generate a ${s.label.toLowerCase()} for...`)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-white border border-midnight/5 rounded-full text-xs font-bold transition-all text-midnight/60 hover:border-indigo-electric hover:text-indigo-electric",
                  !isRecruiter && "hover:border-emerald-600 hover:text-emerald-600"
                )}
              >
                <s.icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            ))}
            <button className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold",
              isRecruiter ? "bg-indigo-electric/10 text-indigo-electric" : "bg-emerald-500/10 text-emerald-600"
            )}>
              <Plus className="w-3.5 h-3.5" /> Custom
            </button>
          </div>

          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecruiter ? "Ask the AI Assistant to generate outreach, improve search, or summarize..." : "Ask your AI Coach to optimize resume, prep interviews, or find keywords..."}
              className={cn(
                "w-full pl-6 pr-16 py-4 bg-white border border-midnight/10 rounded-2xl outline-none transition-all text-sm font-medium focus:border-indigo-electric/40 focus:ring-4 focus:ring-indigo-electric/5",
                !isRecruiter && "focus:border-emerald-600/40 focus:ring-4 focus:ring-emerald-600/5"
              )}
            />
            <button 
              onClick={handleSend}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 text-white rounded-xl flex items-center justify-center transition-colors bg-midnight",
                isRecruiter ? "hover:bg-indigo-electric" : "hover:bg-emerald-600"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
