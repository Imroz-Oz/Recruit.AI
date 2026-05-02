import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  Upload,
  Cpu,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function ResumeVaultPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setScore(0);
    setShowResults(false);
    
    // Simulated analysis steps
    setTimeout(() => {
      let currentScore = 0;
      const interval = setInterval(() => {
        currentScore += 2;
        setScore(currentScore);
        if (currentScore >= 92) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setShowResults(true);
        }
      }, 30);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-100">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
            Profile DNA Optimizer v2.4
          </span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-midnight italic">Quantify Your Market Value</h2>
        <p className="text-midnight/50 font-medium max-w-xl mx-auto italic">
          Upload your resume to calibrate your semantic fingerprint against current recruitment algorithms.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Upload & Actions */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-midnight/5 shadow-sm space-y-8">
            <div className="aspect-[3/4] bg-warm-gray/5 border-2 border-dashed border-midnight/5 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center group hover:border-emerald-500/20 transition-all cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-midnight/20 group-hover:text-emerald-600" />
              </div>
              <p className="text-sm font-serif font-bold text-midnight italic mb-2">Drop Latest Resume</p>
              <p className="text-[10px] font-bold text-midnight/20 uppercase tracking-widest">PDF, DOCX (Max 5MB)</p>
              <input type="file" className="hidden" />
            </div>

            <button 
              onClick={startAnalysis}
              disabled={isAnalyzing}
              className="w-full py-5 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-midnight/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calibrating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Semantic DNA
                </>
              )}
            </button>

            <div className="pt-6 border-t border-midnight/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-midnight/20 mb-4">Past Versions</h4>
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-warm-gray/5 rounded-xl text-xs font-bold text-midnight/40 group cursor-pointer hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                    <div className="flex items-center gap-3">
                      <Download className="w-3 h-3 translate-y-[-1px]" />
                      v{3-i}.0_Final.pdf
                    </div>
                    <span>{i}d ago</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results / Empty State */}
        <div className="md:col-span-2">
          <AnimatePresence mode="wait">
            {!showResults && !isAnalyzing ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full bg-white/50 border-2 border-dashed border-midnight/5 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center italic text-midnight/20"
              >
                <div className="w-20 h-20 bg-midnight/5 rounded-full flex items-center justify-center mb-8">
                  <Eye className="w-10 h-10 opacity-20" />
                </div>
                <p className="text-xl font-serif font-bold">Awaiting Calibration Input</p>
                <p className="text-sm font-medium mt-2">Upload your resume to see your market alignment score.</p>
              </motion.div>
            ) : showResults ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                {/* Score Hero */}
                <div className="bg-midnight p-10 rounded-[3.5rem] text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
                  <div className="relative z-10 space-y-4 text-center md:text-left flex-1">
                    <h3 className="text-4xl font-serif font-bold italic underline decoration-emerald-500 underline-offset-8">Excellent Alignment</h3>
                    <p className="text-white/50 text-sm leading-relaxed font-bold uppercase tracking-widest leading-loose">
                      Your profile matches 92% of the semantic requirements for "Senior Design Systems" roles in North America.
                    </p>
                  </div>
                  <div className="relative z-10 w-40 h-40 rounded-full border-8 border-white/5 flex flex-col items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin duration-[2s]" />
                    <span className="text-6xl font-serif font-bold italic">{score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Market Score</span>
                  </div>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-midnight/20">Critical Insights</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Keyword Optimization', status: 'high', text: 'You are missing "Distributed Systems" and "GRPC" which are trending in your target roles.' },
                        { label: 'Impact Quantification', status: 'med', text: 'Great use of metrics in Project X, but Project Y lacks data-driven results.' }
                      ].map((insight, i) => (
                        <div key={i} className="p-4 bg-warm-gray/5 rounded-2xl space-y-2 border-l-4 border-amber-500/20">
                          <p className="text-[10px] font-bold text-midnight uppercase tracking-widest flex items-center gap-2">
                             <AlertCircle className="w-3 h-3 text-amber-500" />
                             {insight.label}
                          </p>
                          <p className="text-xs font-medium text-midnight/60 italic leading-relaxed">{insight.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 space-y-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-midnight/20">Top Recommendations</h4>
                    <div className="space-y-4">
                      {[
                        'Add "Performance Optimization" to your skills section.',
                        'Highlight your experience with "Cypress" or "Playwright".',
                        'Refine your summary to be more tech-forward.'
                      ].map((rec, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5" />
                          <p className="text-xs font-medium text-midnight/60">{rec}</p>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-4 bg-emerald-600/5 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all">
                      Apply All Fixes via AI
                    </button>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center justify-between p-8 bg-indigo-electric/5 border border-indigo-100 rounded-[2.5rem]">
                   <div className="flex items-center gap-6">
                     <div className="w-12 h-12 rounded-xl bg-indigo-electric text-white flex items-center justify-center">
                       <Zap className="w-6 h-6" />
                     </div>
                     <div>
                       <h5 className="font-serif font-bold text-midnight italic">Unlock Premium visibility</h5>
                       <p className="text-xs font-medium text-midnight/50">Boost your profile ranking to the top 1% of recruiters.</p>
                     </div>
                   </div>
                   <button className="px-8 py-3 bg-midnight text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-electric transition-all flex items-center gap-2">
                     Upgrade IQ <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              </motion.div>
            ) : isAnalyzing && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center space-y-8"
              >
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-midnight/5" />
                  <div className="absolute inset-0 rounded-full border-8 border-emerald-500 border-t-transparent animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-emerald-600 animate-pulse" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-serif font-bold text-midnight italic">AI Neural Analysis in Progress</p>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3].map(i => (
                       <div key={i} className={cn("w-2 h-2 rounded-full bg-emerald-500 animate-bounce", i===2 && "delay-100", i===3 && "delay-200")} />
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-midnight/30 uppercase tracking-[0.4em] pt-4">Processing Semantic Tokens...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
