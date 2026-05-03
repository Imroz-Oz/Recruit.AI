import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Search,
  Eye,
  FileText,
  Brain,
  Rocket,
  Upload
} from 'lucide-react';
import { analyzePersonalProfile, PersonalProfileAnalysis } from '@/src/services/geminiService';
import { cn } from '@/src/lib/utils';

export default function PersonalIQPage() {
  const [profileText, setProfileText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PersonalProfileAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!profileText.trim() || !targetRole.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzePersonalProfile(profileText, targetRole);
      setAnalysis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setProfileText(`Extracted from ${file.name}: ${text.slice(0, 1000)}...`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/5 rounded-full border border-coral/10">
            <Sparkles className="w-3.5 h-3.5 text-coral" />
            <span className="text-[9px] font-bold text-coral uppercase tracking-[0.2em]">Presence Lab Intelligence</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Presence Lab</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Master your elite market presence and executive reach</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-electric" /> Target Goal
              </h3>
            </div>
            <input 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Principal Product Manager)"
              className="w-full px-6 py-4 bg-warm-gray/50 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-sm font-bold"
            />
            
            <div className="flex justify-between items-center pt-4">
               <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
                <FileText className="w-5 h-5 text-coral" /> Current Profile
              </h3>
              <label className="cursor-pointer px-4 py-1.5 bg-warm-gray text-midnight/40 rounded-full border border-midnight/5 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                <Upload className="w-3 h-3" /> Upload PDF
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
              </label>
            </div>
            <textarea 
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Paste your resume content or LinkedIn profile summary..."
              className="w-full h-64 p-6 bg-warm-gray/50 rounded-[2rem] border border-transparent focus:bg-white focus:border-coral/20 outline-none transition-all text-sm font-medium leading-relaxed"
            />

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !profileText || !targetRole}
              className="w-full py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-midnight/20 hover:bg-coral transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isAnalyzing ? <Zap className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
              {isAnalyzing ? 'Running Reach Simulation...' : 'Generate Visibility Audit'}
            </button>
          </section>
        </div>

        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
            {!analysis ? (
              <div className="h-full bg-warm-gray/10 rounded-[3.5rem] border-2 border-dashed border-midnight/5 flex flex-col items-center justify-center p-12 text-center">
                 <Eye className="w-16 h-16 text-midnight/5 mb-6" />
                 <h4 className="text-2xl font-serif font-bold text-midnight/20 italic">Optimization Engine Ready</h4>
                 <p className="text-xs font-medium text-midnight/20 max-w-xs mt-2">Analyze your data to see how recruiters view your profile and get strategic improvements.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Visibility Score Card */}
                <div className="bg-white p-12 rounded-[4rem] border border-midnight/5 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-coral/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                   
                   <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <h4 className="text-6xl font-serif font-bold italic text-midnight">{analysis.score}<span className="text-2xl text-midnight/20">/100</span></h4>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-coral">Market Readiness IQ</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-emerald-500 font-bold mb-1">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-xl font-serif italic">{analysis.reachEstimate}</span>
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Estimated Visibility Pool</p>
                      </div>
                   </div>

                   <div className="mt-12 p-8 bg-warm-gray/30 rounded-[2.5rem] border border-midnight/5 relative z-10">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-electric mb-4 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Professional Verdict
                      </h5>
                      <p className="text-base text-midnight/70 font-medium italic leading-relaxed">"{analysis.humanReview}"</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tactical Advice */}
                  <div className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-6">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-electric" /> Reach Improvements
                    </h5>
                    <div className="space-y-3">
                      {analysis.reachImprovementSuggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-indigo-electric/5 rounded-2xl flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-indigo-electric shrink-0 mt-0.5" />
                          <p className="text-xs font-bold text-midnight/60">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Keyword Optimization */}
                  <div className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-6">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Key-Word Alchemy
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordOptimizations.map((k, i) => (
                        <span key={i} className="px-4 py-2 bg-amber-50 text-amber-700/80 rounded-full text-[10px] font-bold border border-amber-100/50">
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-midnight/5">
                       <h6 className="text-[9px] font-bold uppercase tracking-widest text-coral/60 mb-3 flex items-center gap-2">
                         <AlertCircle className="w-3.5 h-3.5" /> Content Gaps to Fill
                       </h6>
                       <ul className="space-y-2">
                         {analysis.contentGaps.map((cg, i) => (
                           <li key={i} className="text-xs font-medium text-midnight/40 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-coral/20 rounded-full" /> {cg}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-coral transition-all">
                    Download Optimized CV Structure
                  </button>
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
