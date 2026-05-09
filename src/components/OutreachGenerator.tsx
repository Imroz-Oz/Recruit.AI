import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Send, Link as LinkIcon, Sparkles, Loader2, Copy, CheckCircle2, Target, Smartphone } from 'lucide-react';
import { generatePersonalizedOutreach } from '../services/aiService';

export default function OutreachGenerator({ myProfile, initialName = '', initialTitle = '', initialContext = '' }: { myProfile: any, initialName?: string, initialTitle?: string, initialContext?: string }) {
  const [targetName, setTargetName] = useState(initialName);
  const [targetTitle, setTargetTitle] = useState(initialTitle);
  const [targetUrl, setTargetUrl] = useState(initialContext);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{subject?: string, body?: string, linkedInMessage?: string, textMessage?: string, strategy?: string} | null>(null);
  const [copied, setCopied] = useState<'body' | 'linkedin' | 'text' | null>(null);

  const handleGenerate = async () => {
    if (!targetUrl || !targetName) return;
    setIsGenerating(true);
    setResult(null);
    try {
      const generated = await generatePersonalizedOutreach(
        { name: targetName, title: targetTitle },
        myProfile || {},
        targetUrl
      );
      setResult(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'body' | 'linkedin' | 'text') => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-300/5 shadow-2xl shadow-midnight/5 w-full">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center">
          <Send className="w-6 h-6 text-coral" />
        </div>
        <div>
          <h2 className="text-2xl font-serif font-bold italic text-[#0f172a]">Smart Outreach Engine</h2>
          <p className="text-sm font-medium text-[#0f172a]/40">AI analyzes their context online and drafts the perfect note.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#0f172a]/40 uppercase tracking-widest ml-1 mb-2 block">Target Name</label>
            <div className="relative">
              <input 
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. Sarah Connor" 
                className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-coral/5 focus:border-coral/30 font-bold text-[#0f172a]"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#0f172a]/40 uppercase tracking-widest ml-1 mb-2 block">Target Title</label>
            <div className="relative">
              <input 
                value={targetTitle}
                onChange={(e) => setTargetTitle(e.target.value)}
                placeholder="e.g. VP of Product" 
                className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-coral/5 focus:border-coral/30 font-bold text-[#0f172a]"
              />
            </div>
          </div>
        </div>
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-[#0f172a]/40 uppercase tracking-widest ml-1 mb-2 block">Context URL (Crucial)</label>
            <div className="relative">
              <input 
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://linkedin.com/in/... or company.com" 
                className="w-full bg-[#1e293b]/2 border border-slate-300/5 pl-12 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-coral/5 focus:border-coral/30 font-bold text-[#0f172a]"
              />
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0f172a]/20" />
            </div>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={!targetUrl || !targetName || isGenerating}
            className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-coral text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-orange-600 transition-all disabled:opacity-50 mt-auto shadow-lg shadow-coral/30"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Studying URL Context...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate Deep-Context Note
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-slate-100 overflow-hidden"
          >
            {result.strategy && (
               <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                 <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                   <Target className="w-4 h-4" />
                 </div>
                 <div>
                   <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">AI Strategy</h4>
                   <p className="text-sm font-medium text-emerald-900/80 leading-relaxed">{result.strategy}</p>
                 </div>
               </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1e293b]/2 rounded-3xl p-6 border border-slate-300/5 relative group h-full">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200">
                  <Mail className="w-5 h-5 text-[#0f172a]/40" />
                  <h4 className="text-lg font-bold text-[#0f172a]">Email Draft</h4>
                </div>
                {result.subject && <p className="text-base font-bold text-[#0f172a] mb-2">Subj: {result.subject}</p>}
                <p className="text-sm text-[#0f172a]/80 leading-relaxed font-medium whitespace-pre-wrap">{result.body}</p>
                
                <button 
                  onClick={() => copyToClipboard(result.body || '', 'body')}
                  className="absolute top-6 right-6 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[#0f172a]/40 hover:text-indigo-electric transition-colors"
                >
                  {copied === 'body' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              {result.linkedInMessage && (
                <div className="bg-[#1e293b]/2 rounded-3xl p-6 border border-slate-300/5 relative group h-full">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200">
                    <MessageSquare className="w-5 h-5 text-[#0f172a]/40" />
                    <h4 className="text-lg font-bold text-[#0f172a]">LinkedIn Note</h4>
                  </div>
                  <p className="text-sm text-[#0f172a]/80 leading-relaxed font-medium whitespace-pre-wrap">{result.linkedInMessage}</p>
                  
                  <button 
                    onClick={() => copyToClipboard(result.linkedInMessage || '', 'linkedin')}
                    className="absolute top-6 right-6 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[#0f172a]/40 hover:text-indigo-electric transition-colors"
                  >
                    {copied === 'linkedin' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {result.textMessage && (
                <div className="bg-[#1e293b]/2 rounded-3xl p-6 border border-slate-300/5 relative group h-full">
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-200">
                    <Smartphone className="w-5 h-5 text-[#0f172a]/40" />
                    <h4 className="text-lg font-bold text-[#0f172a]">SMS / Text</h4>
                  </div>
                  <p className="text-sm text-[#0f172a]/80 leading-relaxed font-medium whitespace-pre-wrap">{result.textMessage}</p>
                  
                  <button 
                    onClick={() => copyToClipboard(result.textMessage || '', 'text')}
                    className="absolute top-6 right-6 p-3 bg-white border border-slate-200 shadow-sm rounded-xl text-[#0f172a]/40 hover:text-indigo-electric transition-colors"
                  >
                    {copied === 'text' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
