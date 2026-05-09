import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Zap, 
  ArrowRight,
  Upload,
  CheckCircle2,
  RefreshCw,
  Eye,
  Download,
  Terminal,
  FileCheck,
  Copy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { adaptResumeToJD } from '@/src/services/geminiService';

export default function ResumeVaultPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedResume, setAdaptedResume] = useState('');
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setResumeText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleATSScan = () => {
    if (!resumeText) return;
    
    setIsAnalyzing(true);
    // Simulate ATS Parser rules
    setTimeout(() => {
      const mockResult = {
        score: 68,
        issues: [
          {
            type: 'critical',
            title: 'Two-Column Layout Detected',
            description: 'Workday and Taleo typically fail to read the right column accurately. Data serialization is broken.',
            recommendation: 'Refactor into a single-column block layout. Remove all tables and CSS grid equivalents.',
          },
          {
            type: 'warning',
            title: 'Header Standardization',
            description: "Section detected as 'What I've Done'. Generic parsers require standard taxonomy.",
            recommendation: "Change to 'Work Experience' or 'Professional Experience' for 100% parser compatibility.",
          },
          {
            type: 'warning',
            title: 'Date Format Regex Failure',
            description: 'Found unstructured dates (e.g., "Fall 2021").',
            recommendation: 'Format all dates as MM/YYYY (e.g., 09/2021) to match enterprise ATS chron-regex.',
          }
        ],
        passed: [
          'Contact Information Parsed',
          'Standard Font Detected',
          'File Size Optimal'
        ]
      };
      
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleAdaptResume = async () => {
    setIsAdapting(true);
    try {
      const generated = await adaptResumeToJD(resumeText, jobDescription);
      setAdaptedResume(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdapting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/5 border border-coral/10">
          <Sparkles className="w-4 h-4 text-coral fill-current" />
          <span className="text-base font-bold uppercase tracking-widest text-coral tracking-[0.2em]">
            Chameleon Engine Active
          </span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">Portfolio <span className="text-coral">Engine</span></h2>
        <p className="text-[#0f172a]/50 font-medium max-w-xl mx-auto italic text-lg mt-2">
          Calibrate your professional assets to bypass enterprise filters and match elite recruitment logic.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-[3rem] border border-slate-300/5 shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-2xl font-serif font-bold italic text-[#0f172a]">1. Base Asset</h3>
               <label className="cursor-pointer">
                 <div className="px-5 py-2.5 bg-coral/10 text-coral rounded-full text-sm font-bold uppercase tracking-widest hover:bg-coral hover:text-white transition-all flex items-center gap-2">
                   <Upload className="w-4 h-4" /> Upload .txt
                 </div>
                 <input type="file" className="hidden" accept=".txt,.md" onChange={handleFileUpload} />
               </label>
             </div>
             <textarea 
               value={resumeText}
               onChange={(e) => setResumeText(e.target.value)}
               placeholder="Paste your current resume content here..."
               className="w-full h-96 p-6 bg-warm-gray/10 rounded-3xl outline-none focus:border-coral/20 border-2 border-transparent transition-all font-mono text-sm leading-relaxed"
             />
           </div>

           <div className="bg-white p-8 rounded-[3rem] border border-slate-300/5 shadow-sm">
             <h3 className="text-2xl font-serif font-bold italic text-[#0f172a] mb-6">2. Target Architecture (JD)</h3>
             <textarea 
               value={jobDescription}
               onChange={(e) => setJobDescription(e.target.value)}
               placeholder="Paste the target Job Description to activate the Chameleon adaptation module..."
               className="w-full h-48 p-6 bg-[#1e293b]/5 rounded-3xl outline-none focus:border-indigo-electric/30 border-2 border-transparent transition-all text-sm font-medium italic"
             />
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1e293b] p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-coral/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 space-y-8">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-coral/20 rounded-2xl flex items-center justify-center">
                     <Terminal className="w-6 h-6 text-coral" />
                   </div>
                   <h3 className="text-2xl font-serif font-bold italic">ATS Parser Simulator</h3>
                 </div>
                 {analysisResult && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#0f172a]/40 text-white/40">Readability</p>
                      <p className={cn("text-3xl font-serif font-bold italic", analysisResult.score > 80 ? "text-emerald-400" : "text-amber-400")}>{analysisResult.score}%</p>
                    </div>
                 )}
               </div>

               <p className="text-white/50 text-sm font-medium leading-relaxed italic">
                 Enterprise Applicant Tracking Systems (Workday, Taleo, Greenhouse) use brutal data serialization. Run a pre-flight check to see what the machine sees.
               </p>

               {!analysisResult && (
                 <button 
                   onClick={handleATSScan}
                   disabled={!resumeText || isAnalyzing}
                   className="w-full py-5 bg-white text-[#1e293b] rounded-2xl font-black text-base uppercase tracking-[0.2em] hover:bg-coral hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {isAnalyzing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                   {isAnalyzing ? 'Simulating Extractor...' : 'Run ATS Pre-Flight Check'}
                 </button>
               )}

               <AnimatePresence>
                 {analysisResult && (
                   <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6 pt-4 border-t border-white/10"
                   >
                      <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-coral">Parser Extraction Errors</h4>
                        {analysisResult.issues.map((issue: any, i: number) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3">
                             <div className="flex items-center gap-2">
                               <AlertCircle className={cn("w-4 h-4", issue.type === 'critical' ? 'text-coral' : 'text-amber-400')} />
                               <h5 className="font-bold text-white text-base">{issue.title}</h5>
                             </div>
                             <p className="text-white/60 text-sm italic">{issue.description}</p>
                             <div className="p-3 bg-indigo-electric/20 rounded-xl text-indigo-200 text-sm font-medium mt-2">
                               <span className="font-bold uppercase tracking-widest text-[10px] block mb-1 text-indigo-300">Solution</span>
                               {issue.recommendation}
                             </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                         <h4 className="text-xs font-black uppercase tracking-widest text-emerald-400">Successfully Serialized</h4>
                         <ul className="space-y-2">
                           {analysisResult.passed.map((pass: string, i: number) => (
                             <li key={i} className="flex items-center gap-2 text-sm text-emerald-100/60 font-medium bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                               <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {pass}
                             </li>
                           ))}
                         </ul>
                      </div>
                      
                      {jobDescription && (
                         <div className="pt-6">
                            <button 
                              onClick={handleAdaptResume}
                              disabled={isAdapting}
                              className="w-full py-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl font-black text-white text-base uppercase tracking-[0.2em] hover:from-indigo-600 hover:to-purple-700 transition-all flex justify-center items-center gap-3 disabled:opacity-50"
                            >
                              {isAdapting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                              Adapt Resume For Role (Chameleon)
                            </button>
                            <p className="text-center text-white/30 text-xs font-bold uppercase tracking-widest mt-3">Synthesizes JD and outputs optimized copy</p>
                         </div>
                      )}
                      
                      {adaptedResume && (
                        <div className="pt-8 animate-in fade-in slide-in-from-top-4">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-[#0f172a]/30 text-white/40">Adapted Output</h4>
                            <button onClick={() => navigator.clipboard.writeText(adaptedResume)} className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
                              <Copy className="w-3 h-3" /> Copy Output
                            </button>
                          </div>
                          <textarea 
                            readOnly
                            value={adaptedResume}
                            className="w-full h-96 p-6 bg-white/5 border border-white/10 rounded-[2rem] outline-none text-white font-mono text-xs leading-relaxed"
                          />
                        </div>
                      )}
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
