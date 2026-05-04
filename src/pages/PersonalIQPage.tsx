import React, { useState, useEffect } from 'react';
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
  Upload,
  Linkedin,
  MessageSquare
} from 'lucide-react';
import { analyzePersonalProfile, PersonalProfileAnalysis } from '@/src/services/geminiService';
import { db, auth } from '@/src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { cn } from '@/src/lib/utils';

export default function PersonalIQPage() {
  const [profileText, setProfileText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<PersonalProfileAnalysis | null>(null);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const [linkedInProfile, setLinkedInProfile] = useState<any>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('linkedinProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setLinkedInProfile(parsed);
      setIsLinkedInConnected(true);
      // Auto-populate profile text if connected
      setProfileText(`LinkedIn Profile: ${parsed.name}\nBio: ${parsed.bio || 'Not provided'}\nSkills: ${parsed.skills?.join(', ') || 'Not provided'}`);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!profileText.trim() || !targetRole.trim()) return;
    setIsAnalyzing(true);
    try {
      const data = await analyzePersonalProfile(profileText, targetRole);
      setAnalysis(data);

      // Automatic Ingress to Internal Global Archive
      if (auth.currentUser) {
        const talent = {
          recruiterId: 'SYSTEM_AUTOGEN', // Mark as autogeneration from Career AI
          source: 'Career AI Ingress',
          name: auth.currentUser.displayName || 'Anonymous Candidate',
          title: data.humanReview.split('.')[0].slice(0, 50) || targetRole, // Dynamic title from analysis
          location: 'Remote (Self-Upload)',
          experience: 0, // Placeholder
          email: auth.currentUser.email,
          score: data.score,
          resumeSnippet: `Career AI Analysis for ${targetRole}. Match Coefficient: ${data.score}%. Assessment: ${data.humanReview}`,
          keywords: data.keywordOptimizations.map(k => k.toLowerCase()),
          createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'candidates'), talent);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes('permission')) {
        handleFirestoreError(error, OperationType.CREATE, 'candidates');
      }
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
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-coral/5 rounded-full border border-coral/10">
            <Sparkles className="w-3.5 h-3.5 text-coral" />
            <span className="text-[9px] font-bold text-coral uppercase tracking-[0.2em]">Presence Lab Intelligence</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Presence Lab</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Master your elite market presence and executive reach</p>
        </div>
        
        {isLinkedInConnected && (
          <div className="flex items-center gap-3 px-6 py-2.5 bg-indigo-600/5 border border-indigo-600/10 rounded-2xl">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Linkedin className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-indigo-600">LinkedIn Active</p>
              <p className="text-[10px] font-bold text-midnight">{linkedInProfile?.name}</p>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-electric/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
            
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-electric" /> Target Goal
              </h3>
            </div>
            <input 
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target Role (e.g. Principal Product Manager)"
              className="w-full px-6 py-4 bg-warm-gray/50 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-sm font-bold shadow-inner"
            />
            
            <div className="flex justify-between items-center pt-4">
               <h3 className="text-xl font-serif font-bold italic flex items-center gap-2">
                <FileText className="w-5 h-5 text-coral" /> Dossier Source
              </h3>
              <div className="flex gap-2">
                <label className="cursor-pointer px-4 py-1.5 bg-warm-gray text-midnight/40 rounded-full border border-midnight/5 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                  <Upload className="w-3 h-3" /> PDF
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
            <textarea 
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="Paste your resume content or LinkedIn profile summary..."
              className="w-full h-64 p-6 bg-warm-gray/50 rounded-[2rem] border border-transparent focus:bg-white focus:border-coral/20 outline-none transition-all text-sm font-medium leading-relaxed resize-none shadow-inner"
            />

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !profileText || !targetRole}
              className="w-full py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-midnight/20 hover:bg-coral transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isAnalyzing ? <Zap className="w-4 h-4 animate-spin text-coral" /> : <Rocket className="w-4 h-4 text-coral" />}
              {isAnalyzing ? 'Simulating Neural Reach...' : 'Run Presence IQ Audit'}
            </button>
          </section>

          {isLinkedInConnected && (
            <div className="p-8 bg-indigo-electric/5 rounded-[2.5rem] border border-indigo-electric/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <MessageSquare className="w-4 h-4 text-indigo-electric" />
                </div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">LinkedIn Direct Advice</h4>
              </div>
              <p className="text-[11px] font-medium italic text-midnight/60 leading-relaxed">
                App Detected LinkedIn Mode: We've automatically indexed your profile bio and {linkedInProfile?.skills?.length || 0} skills for analysis.
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
           <AnimatePresence mode="wait">
            {!analysis ? (
              <div className="h-full bg-warm-gray/10 rounded-[3.5rem] border-2 border-dashed border-midnight/5 flex flex-col items-center justify-center p-12 text-center group cursor-default">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl border border-midnight/5 mb-8 group-hover:scale-110 transition-transform">
                   <Eye className="w-10 h-10 text-midnight/10 mb-0 group-hover:text-indigo-electric transition-colors" />
                 </div>
                 <h4 className="text-3xl font-serif font-bold text-midnight/20 italic">Optimization Suite Idle</h4>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/10 max-w-xs mt-4">Provide target data to trigger Neural Market Reach analysis.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Visibility Score Card */}
                <div className="bg-white p-12 rounded-[4rem] border border-midnight/5 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-80 h-80 bg-coral/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                   
                   <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <h4 className="text-7xl font-serif font-bold italic text-midnight">{analysis.score}</h4>
                          <span className="text-2xl font-serif font-medium text-midnight/20 italic">/100</span>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-coral mt-2">Neural Reach Coefficient</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-emerald-500 font-bold mb-1">
                          <TrendingUp className="w-5 h-5" />
                          <span className="text-xl font-serif italic">{analysis.reachEstimate}</span>
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Estimated Reach Potential</p>
                      </div>
                   </div>

                   <div className="mt-12 p-8 bg-warm-gray/30 rounded-[2.5rem] border border-midnight/5 relative z-10 backdrop-blur-sm">
                      <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-electric mb-4 flex items-center gap-2">
                        <Brain className="w-4 h-4" /> Strategic Assessment
                      </h5>
                      <p className="text-lg text-midnight/70 font-medium italic leading-relaxed">"{analysis.humanReview}"</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tactical Advice */}
                  <div className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-6 flex flex-col">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-electric" /> Deployment Hotfixes
                    </h5>
                    <div className="space-y-3 flex-1">
                      {analysis.reachImprovementSuggestions.map((s, i) => (
                        <div key={i} className="p-4 bg-indigo-electric/5 rounded-2xl flex items-start gap-4 hover:bg-indigo-electric/10 transition-all cursor-default">
                          <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <span className="text-[10px] font-black text-indigo-electric">{i + 1}</span>
                          </div>
                          <p className="text-[11px] font-bold text-midnight/70 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                    {isLinkedInConnected && (
                      <div className="mt-4 pt-4 border-t border-midnight/5">
                        <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                           <Linkedin className="w-3 h-3" /> Syncing with LinkedIn Live Feed
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Keyword Optimization */}
                  <div className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-6">
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" /> Neural Keyword Sync
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordOptimizations.map((k, i) => (
                        <span key={i} className="px-4 py-2 bg-amber-50 text-amber-700/80 rounded-xl text-[10px] font-bold border border-amber-100/50 hover:bg-amber-100 transition-colors">
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="pt-6 border-t border-midnight/5 space-y-4">
                       <h6 className="text-[9px] font-bold uppercase tracking-widest text-coral/60 flex items-center gap-2">
                         <AlertCircle className="w-3.5 h-3.5" /> Presence Blind Spots
                       </h6>
                       <ul className="space-y-3">
                         {analysis.contentGaps.map((cg, i) => (
                           <li key={i} className="text-[11px] font-medium text-midnight/40 flex items-center gap-3">
                             <div className="w-1.5 h-1.5 bg-coral/20 rounded-full shrink-0" /> {cg}
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button className="flex-1 py-6 bg-midnight text-white rounded-[2.5rem] font-bold text-xs uppercase tracking-widest hover:bg-coral transition-all shadow-xl shadow-midnight/10 group">
                    Assemble Optimized Executive CV <Rocket className="w-4 h-4 inline ml-2 group-hover:translate-x-1 transition-transform" />
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
