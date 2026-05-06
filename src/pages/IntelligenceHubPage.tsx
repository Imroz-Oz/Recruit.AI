import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Globe, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  MessageSquare,
  FileSearch,
  ExternalLink,
  Users,
  Briefcase,
  FileText,
  Upload,
  ArrowRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { analyzeMatch, analyzeMultipleResumes, AnalysisResponse, MultiResumeAnalysis } from '@/src/services/geminiService';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { cn } from '@/src/lib/utils';

type Tab = 'single' | 'multi' | 'market';

export default function IntelligenceHubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('single');
  
  // Single Analyze State
  const [resume, setResume] = useState('');
  const [jd, setJd] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [singleAnalysis, setSingleAnalysis] = useState<AnalysisResponse | null>(null);

  // Multi Analyze State
  const [multiResumes, setMultiResumes] = useState<string[]>([]);
  const [isMultiAnalyzing, setIsMultiAnalyzing] = useState(false);
  const [multiResults, setMultiResults] = useState<MultiResumeAnalysis | null>(null);

  // Market Match State
  const [jobUrl, setJobUrl] = useState('');

  const handleSingleAnalyze = async () => {
    if (!resume.trim() || !jd.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzeMatch(resume, jd);
      setSingleAnalysis(data);

      // Automatic Ingress 1:1
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const orgId = userDoc.data()?.organizationId || 'global';

        const talent = {
          recruiterId: auth.currentUser.uid,
          organizationId: orgId,
          source: 'Intelligence Hub (1:1)',
          name: 'Target Candidate',
          title: jd.split('.')[0].slice(0, 50) || 'Analyzed Profile',
          location: 'Global Hub',
          score: data.score,
          resumeSnippet: resume.slice(0, 500),
          keywords: data.strengths.map(s => s.toLowerCase()),
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'candidates'), talent);
        
        // Silent Internal Notification
        console.log('Intelligence Hub: Bio-Asset Synchronized to Archive');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleMultiAnalyze = async () => {
    if (multiResumes.length === 0 || !jd.trim()) return;
    setIsMultiAnalyzing(true);
    try {
      const data = await analyzeMultipleResumes(multiResumes, jd);
      setMultiResults(data);

      // Automatic Ingress Multi
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const orgId = userDoc.data()?.organizationId || 'global';

        await Promise.all(multiResumes.map(async (r, i) => {
          const pick = data.topPicks.find(p => p.candidateName.includes(`Resume_${i+1}`));
          const talent = {
            recruiterId: auth.currentUser?.uid,
            organizationId: orgId,
            source: 'Intelligence Hub (Multi)',
            name: pick?.candidateName || `Batch Candidate ${i+1}`,
            title: jd.split('.')[0].slice(0, 50) || 'Analyzed Profile',
            location: 'Global Hub Batch',
            score: pick?.score || 85,
            resumeSnippet: r.slice(0, 500),
            keywords: pick?.recommendations.map(re => re.toLowerCase()) || [],
            createdAt: serverTimestamp()
          };
          await addDoc(collection(db, 'candidates'), talent);
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsMultiAnalyzing(false);
    }
  };

  const handlePortalMatch = async () => {
    if (!resume.trim() || !jobUrl.trim()) return;
    setIsAnalyzing(true);
    try {
      // Mocking a crawler response that leads to a match analysis
      const mockJD = `Simulated extraction from ${jobUrl}: Senior Role requiring core competencies in ${resume.slice(0, 50)}...`;
      const data = await analyzeMatch(resume, mockJD);
      setSingleAnalysis(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'single' | 'multi' | 'jd') => {
    const files = e.target.files;
    if (!files) return;
    
    // In a real app, I'd use a PDF parser here. For this demo, I'll simulate extraction.
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const mockExtracted = `Extracted from ${file.name}: ${text.slice(0, 500)}... [Full content simulated]`;
        
        if (type === 'single') setResume(mockExtracted);
        if (type === 'jd') setJd(mockExtracted);
        if (type === 'multi') {
          setMultiResumes(prev => [...prev, mockExtracted].slice(0, 5));
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <div className="space-y-10">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
            <Brain className="w-3.5 h-3.5 text-indigo-electric" />
            <span className="text-[9px] font-bold text-indigo-electric uppercase tracking-[0.2em]">Recruiter Intelligence Hub</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Talent Intelligence</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Connect resumes to opportunities with deep semantic analysis</p>
        </div>
      </header>

      <div className="bg-white rounded-[3rem] border border-midnight/5 shadow-sm overflow-hidden min-h-[700px] flex flex-col">
        {/* Hub Tabs */}
        <div className="flex border-b border-midnight/5 p-2 bg-warm-gray/30">
          <button 
            onClick={() => setActiveTab('single')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2",
              activeTab === 'single' ? "bg-white text-midnight shadow-sm" : "text-midnight/40 hover:text-midnight"
            )}
          >
            <User className="w-3.5 h-3.5" /> 1:1 Match
          </button>
          <button 
            onClick={() => setActiveTab('multi')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2",
              activeTab === 'multi' ? "bg-white text-indigo-electric shadow-sm" : "text-midnight/40 hover:text-midnight"
            )}
          >
            <Users className="w-3.5 h-3.5" /> Multi-Resume Rank
          </button>
          <button 
            onClick={() => setActiveTab('market')}
            className={cn(
              "flex-1 py-4 text-[10px] font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2",
              activeTab === 'market' ? "bg-white text-emerald-600 shadow-sm" : "text-midnight/40 hover:text-midnight"
            )}
          >
            <Globe className="w-3.5 h-3.5" /> Reverse Market IQ
          </button>
        </div>

        <div className="p-10 flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'single' && (
              <motion.div 
                key="single"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-electric" /> Resume Input
                      </h3>
                      <label className="cursor-pointer px-4 py-1.5 bg-warm-gray text-midnight/60 rounded-full border border-midnight/5 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                        <Upload className="w-3 h-3" /> Upload PDF/Word
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileUpload(e, 'single')} />
                      </label>
                    </div>
                    <textarea 
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="Paste resume content here..."
                      className="w-full h-48 p-6 bg-warm-gray/50 rounded-[2rem] border border-transparent focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-sm font-medium leading-relaxed"
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-emerald-600" /> Job Description
                      </h3>
                      <label className="cursor-pointer px-4 py-1.5 bg-warm-gray text-midnight/60 rounded-full border border-midnight/5 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                        <Upload className="w-3 h-3" /> Upload JD
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileUpload(e, 'jd')} />
                      </label>
                    </div>
                    <textarea 
                      value={jd}
                      onChange={(e) => setJd(e.target.value)}
                      placeholder="Paste job description here..."
                      className="w-full h-48 p-6 bg-warm-gray/50 rounded-[2rem] border border-transparent focus:bg-white focus:border-emerald-600/20 outline-none transition-all text-sm font-medium leading-relaxed"
                    />
                  </div>

                  <button 
                    onClick={handleSingleAnalyze}
                    disabled={isAnalyzing || !resume || !jd}
                    className="w-full py-5 bg-midnight text-white rounded-3xl font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-midnight/20 hover:bg-indigo-electric transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isAnalyzing ? <Zap className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isAnalyzing ? 'Analyzing Semantic Match...' : 'Generate 1:1 Intelligence Analysis'}
                  </button>
                </div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    {!singleAnalysis ? (
                      <div className="h-full bg-warm-gray/20 rounded-[3rem] border-2 border-dashed border-midnight/5 flex flex-col items-center justify-center p-12 text-center">
                         <FileSearch className="w-12 h-12 text-midnight/10 mb-4" />
                         <p className="text-xs font-bold text-midnight/20 uppercase tracking-widest">Awaiting Inputs</p>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-midnight text-white p-10 rounded-[3rem] shadow-2xl space-y-8 overflow-hidden relative"
                      >
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-electric/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                         
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                            <div className="md:col-span-1 flex flex-col items-center justify-center text-center space-y-4">
                              <div className="relative w-40 h-40">
                                <svg className="w-full h-full" viewBox="0 0 100 100">
                                  <circle 
                                    cx="50" cy="50" r="45" 
                                    fill="none" stroke="currentColor" 
                                    strokeWidth="8" className="text-white/10"
                                  />
                                  <motion.circle 
                                    cx="50" cy="50" r="45" 
                                    fill="none" stroke="currentColor" 
                                    strokeWidth="8" 
                                    strokeDasharray="282.7"
                                    initial={{ strokeDashoffset: 282.7 }}
                                    animate={{ strokeDashoffset: 282.7 - (282.7 * singleAnalysis.score) / 100 }}
                                    strokeLinecap="round"
                                    className={cn(
                                      "transition-colors duration-1000",
                                      singleAnalysis.score >= 85 ? "text-emerald-400" : 
                                      singleAnalysis.score >= 70 ? "text-indigo-400" : "text-coral"
                                    )}
                                  />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <span className="text-4xl font-serif font-bold italic">{singleAnalysis.score}%</span>
                                  <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Match IQ</span>
                                </div>
                              </div>
                              <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                                  {singleAnalysis.score >= 85 ? 'Elite Potential' : 
                                   singleAnalysis.score >= 70 ? 'Strategic Fit' : 'Developmental'}
                                </p>
                              </div>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                              <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                                <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
                                  <Sparkles className="w-3 h-3 text-indigo-400" /> Executive Intelligence
                                </h5>
                                <p className="text-sm font-medium leading-relaxed italic text-white/80">"{singleAnalysis.humanSummary}"</p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Key Strengths</h5>
                                  <ul className="space-y-2">
                                    {singleAnalysis.strengths.slice(0, 3).map((s, i) => (
                                      <li key={i} className="text-[11px] font-medium text-white/60 flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" /> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="space-y-3">
                                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-coral">Core Gaps</h5>
                                  <ul className="space-y-2">
                                    {singleAnalysis.gaps.slice(0, 3).map((g, i) => (
                                      <li key={i} className="text-[11px] font-medium text-white/60 flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 text-coral shrink-0 mt-0.5" /> {g}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                         </div>

                         {singleAnalysis.bridgeExperience && singleAnalysis.bridgeExperience.length > 0 && (
                            <div className="p-8 bg-indigo-electric/10 rounded-[2.5rem] border border-indigo-400/20 relative z-10">
                              <h5 className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center gap-2">
                                <Brain className="w-4 h-4" /> Bridge Logic: Mitigating Gaps
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {singleAnalysis.bridgeExperience.map((be, i) => (
                                  <div key={i} className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <AlertCircle className="w-3 h-3 text-coral" />
                                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 line-through decoration-coral">{be.gap}</span>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                      <p className="text-[11px] text-white/70 leading-relaxed font-medium">
                                        <span className="text-indigo-300 font-bold">Solution:</span> {be.mitigation}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                         )}

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Optimization Roadmap
                              </h5>
                              <div className="space-y-3">
                                {singleAnalysis.optimizationRoadmap?.map((step, i) => (
                                  <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                                    <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                                      {i + 1}
                                    </div>
                                    <p className="text-[11px] font-medium text-white/70">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Strategic Suggestions
                              </h5>
                              <div className="space-y-3">
                                {singleAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                                  <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                                    <p className="text-[11px] font-medium text-white/60">{rec}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                         </div>

                         <div className="pt-6 border-t border-white/10 flex gap-4 relative z-10">
                           <button className="flex-1 py-4 bg-white text-midnight rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric hover:text-white transition-all">
                             Export to PDF
                           </button>
                           <button className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                             Save to Pipeline
                           </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'multi' && (
              <motion.div 
                key="multi"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="bg-warm-gray/30 p-8 rounded-[3rem] border border-midnight/5 space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-serif font-bold italic">Resumes ({multiResumes.length}/5)</h3>
                          <label className="cursor-pointer px-4 py-1.5 bg-midnight text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-indigo-electric transition-all disabled:opacity-50">
                            Add Files
                            <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt" onChange={(e) => handleFileUpload(e, 'multi')} disabled={multiResumes.length >= 5} />
                          </label>
                        </div>
                        <div className="space-y-3">
                          {multiResumes.map((r, i) => (
                            <div key={i} className="p-4 bg-white rounded-xl border border-midnight/5 flex justify-between items-center group">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-electric/10 text-indigo-electric rounded-lg flex items-center justify-center font-bold text-xs">
                                  {i + 1}
                                </div>
                                <span className="text-xs font-bold text-midnight/40 truncate max-w-[120px]">Resume_{i+1}.pdf</span>
                              </div>
                              <button onClick={() => setMultiResumes(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-midnight/10 hover:text-coral transition-colors opacity-0 group-hover:opacity-100">
                                <AlertCircle className="w-4 h-4 rotate-45" />
                              </button>
                            </div>
                          ))}
                          {multiResumes.length === 0 && (
                            <div className="py-12 text-center border-2 border-dashed border-midnight/5 rounded-2xl">
                               <Upload className="w-10 h-10 text-midnight/10 mx-auto mb-2" />
                               <p className="text-[10px] font-bold text-midnight/20 uppercase tracking-widest">Drag & Drop Resumes</p>
                            </div>
                          )}
                        </div>
                     </div>

                     <div className="bg-warm-gray/30 p-8 rounded-[3rem] border border-midnight/5 space-y-6">
                        <h3 className="text-xl font-serif font-bold italic">Role Definition</h3>
                        <textarea 
                          value={jd}
                          onChange={(e) => setJd(e.target.value)}
                          placeholder="Paste JD for ranking..."
                          className="w-full h-40 p-5 bg-white rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none transition-all text-xs font-medium leading-relaxed"
                        />
                         <button 
                          onClick={handleMultiAnalyze}
                          disabled={isMultiAnalyzing || multiResumes.length === 0 || !jd}
                          className="w-full py-5 bg-indigo-electric text-white rounded-3xl font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 hover:bg-midnight transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {isMultiAnalyzing ? <Zap className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                          {isMultiAnalyzing ? 'Calculating Hierarchy...' : 'Rank Talent Pool'}
                        </button>
                     </div>
                  </div>

                  <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                      {!multiResults ? (
                        <div className="h-full bg-warm-gray/20 rounded-[3rem] border-2 border-dashed border-midnight/5 flex flex-col items-center justify-center p-12 text-center">
                          <Users className="w-16 h-16 text-midnight/10 mb-4" />
                          <h4 className="text-xl font-serif font-bold text-midnight/20 italic">Select up to 5 resumes for analysis</h4>
                        </div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-8"
                        >
                          <div className="bg-indigo-electric text-white p-8 rounded-[3rem] shadow-xl">
                            <h5 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Market Perspective</h5>
                            <p className="text-sm font-medium italic">"{multiResults.generalObservations}"</p>
                          </div>

                          <div className="space-y-4">
                            {multiResults.topPicks.map((pick, i) => (
                              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-sm space-y-6 group">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-indigo-electric text-white rounded-2xl flex items-center justify-center font-serif font-bold text-xl italic">
                                       {pick.candidateName[0]}
                                     </div>
                                     <div>
                                        <h4 className="text-lg font-serif font-bold text-midnight italic">{pick.candidateName}</h4>
                                        <div className="flex gap-2 mt-1">
                                           <span className="text-[10px] font-bold text-indigo-electric px-2 py-0.5 bg-indigo-50 rounded-full uppercase tracking-widest">{pick.score}% Semantic Match</span>
                                        </div>
                                     </div>
                                  </div>
                                  <button className="p-3 bg-warm-gray rounded-xl group-hover:bg-midnight group-hover:text-white transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                  </button>
                                </div>
                                
                                <div className="p-5 bg-warm-gray/50 rounded-2xl">
                                  <p className="text-xs text-midnight/60 font-medium leading-relaxed italic">"{pick.reasoning}"</p>
                                </div>

                                <div className="space-y-3">
                                  <h6 className="text-[9px] font-bold uppercase tracking-widest text-midnight/30">Strategic Recommendations</h6>
                                  <div className="flex flex-wrap gap-2">
                                     {pick.recommendations.map((rec, idx) => (
                                       <span key={idx} className="px-3 py-1 bg-white border border-midnight/5 rounded-full text-[9px] font-bold text-midnight/40">{rec}</span>
                                     ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'market' && (
               <motion.div 
                key="market"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto py-12 space-y-12"
              >
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                    <Globe className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-serif font-bold italic text-midnight">Reverse Market Match</h3>
                  <p className="text-sm text-midnight/40 font-medium italic max-w-lg mx-auto">Input a candidate and a specific job portal URL (LinkedIn, Indeed, Carrier Page) to analyze their potential for that specific role.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 ml-4">Candidate Profile</label>
                    <textarea 
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      placeholder="Paste candidate resume/profile..."
                      className="w-full h-40 p-6 bg-warm-gray rounded-[2.5rem] border border-transparent focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-xs font-medium"
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 ml-4">Job Portal URL</label>
                      <div className="relative">
                        <input 
                          value={jobUrl}
                          onChange={(e) => setJobUrl(e.target.value)}
                          placeholder="https://linkedin.com/jobs/view/..."
                          className="w-full pl-12 pr-6 py-4 bg-warm-gray rounded-2xl border border-transparent focus:bg-white focus:border-emerald-500/20 outline-none transition-all text-xs font-bold"
                        />
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/20" />
                      </div>
                    </div>
                    <button 
                      onClick={handlePortalMatch}
                      disabled={isAnalyzing || !resume || !jobUrl}
                      className="w-full py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-midnight/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isAnalyzing ? <Zap className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                      Run Portal MatchIQ
                    </button>
                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
                      <p className="text-[10px] text-emerald-700/60 font-medium leading-relaxed italic">"Our crawler will extract the Job Description, requirements, and culture markers from the URL to map your candidate's specific DNA."</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
