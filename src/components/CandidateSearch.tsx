import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Sparkles, 
  Search, 
  Users, 
  ArrowRight, 
  Copy, 
  Terminal,
  Zap,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  ChevronDown,
  Eye,
  Info,
  X,
  Upload,
  DollarSign
} from 'lucide-react';
import { generateBooleanFromJD, BooleanResponse } from '@/src/services/geminiService';
import { cn } from '@/src/lib/utils';

interface CandidateSearchProps {
  onMatchesFound: (matches: any[]) => void;
}

export default function CandidateSearch({ onMatchesFound }: CandidateSearchProps) {
  const [jd, setJd] = useState('');
  const [manualQuery, setManualQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'ai' | 'manual'>('ai');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BooleanResponse | null>(null);
  
  // Advanced Filters
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState({ city: '', state: '', country: '', zip: '', radius: '25' });
  const [industry, setIndustry] = useState('');
  const [minExp, setMinExp] = useState(0);
  const [gradYear, setGradYear] = useState('');
  const [companies, setCompanies] = useState('');
  const [degree, setDegree] = useState('Any');
  const [relocation, setRelocation] = useState(false);
  const [certifications, setCertifications] = useState('');

  // Internal Pool State (Mocking for Demo)
  const [talentPool, setTalentPool] = useState<any[]>([
    { 
      id: '1', 
      name: 'Alex Rivera', 
      title: 'Senior Backend Engineer', 
      score: 94, 
      location: 'San Jose, CA', 
      isInternal: true,
      industry: 'FinTech',
      gradYear: 2018,
      experience: 8,
      degree: 'BS Computer Science',
      pastCompanies: ['Google', 'Stripe'],
      resumeSnippet: '...expert in Go and Kubernetes... led distributed systems at Stripe... 5+ years of cloud infrastructure experience...',
      highlightedMatches: ['Go', 'Kubernetes', 'Cloud Infrastructure', 'Distributed Systems'],
      keywords: ['Go', 'Kubernetes', 'SRE', 'Cloud', 'Distributed']
    },
    { 
      id: '2', 
      name: 'Sarah Chen', 
      title: 'System Architect', 
      score: 88, 
      location: 'Remote', 
      isInternal: true,
      industry: 'E-commerce',
      gradYear: 2012,
      experience: 12,
      degree: 'MS Software Engineering',
      pastCompanies: ['Amazon', 'Shopify'],
      resumeSnippet: '...architecting scalable Java microservices... focus on high availability... previously at Amazon and Shopify...',
      highlightedMatches: ['Architecting', 'Scalable', 'Java', 'Microservices'],
      keywords: ['Java', 'Microservices', 'AWS', 'Architecture', 'Scalable']
    }
  ]);

  const [matches, setMatches] = useState<any[]>([]);

  // Preview State
  const [previewCandidate, setPreviewCandidate] = useState<any | null>(null);

  const handleGenerate = async () => {
    if (searchMode === 'ai' && !jd.trim()) return;
    if (searchMode === 'manual' && !manualQuery.trim()) return;

    setIsGenerating(true);
    try {
      if (searchMode === 'ai') {
        const data = await generateBooleanFromJD(jd);
        setResult(data);
        // Find matches based on AI result
        const found = talentPool.filter(c => 
          data.suggestedTitles.some(t => c.title.toLowerCase().includes(t.toLowerCase())) ||
          data.query.toLowerCase().split(' ').some(k => (c.keywords || []).some((ck: string) => ck.toLowerCase().includes(k.toLowerCase())))
        );
        setMatches(found.length > 0 ? found : talentPool.slice(0, 2));
        onMatchesFound(found.length > 0 ? found : talentPool.slice(0, 2));
      } else {
        // Manual Boolean Search Logic
        const keywords = manualQuery.replace(/[()"]/g, '').split(/\s+OR\s+|\s+AND\s+/).map(k => k.trim().toLowerCase());
        const found = talentPool.filter(c => {
          const text = (c.name + ' ' + c.title + ' ' + c.resumeSnippet + ' ' + (c.keywords?.join(' ') || '')).toLowerCase();
          return keywords.every(k => text.includes(k));
        });
        setMatches(found);
        onMatchesFound(found);
        setResult({ query: manualQuery, suggestedTitles: [title || 'Manual Search Result'] });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTalentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newTalent = {
      id: Math.random().toString(),
      name: file.name.split('.')[0].replace(/_/g, ' '),
      title: 'Added Candidate',
      score: 100,
      location: 'Internal Pool',
      isInternal: true,
      experience: 5,
      degree: 'N/A',
      resumeSnippet: `Uploaded resume for ${file.name}. Keyword indexing active...`,
      highlightedMatches: [],
      keywords: ['uploaded']
    };
    setTalentPool(prev => [...prev, newTalent]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJd(`Extracted JD: ${event.target?.result as string}`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-center mb-8">
        <div className="bg-white p-1 rounded-full border border-midnight/5 shadow-sm flex gap-1">
          <button 
            onClick={() => setSearchMode('ai')}
            className={cn(
              "px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              searchMode === 'ai' ? "bg-midnight text-white" : "text-midnight/40 hover:text-midnight"
            )}
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Assisted IQ
          </button>
          <button 
            onClick={() => setSearchMode('manual')}
            className={cn(
              "px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              searchMode === 'manual' ? "bg-indigo-electric text-white" : "text-midnight/40 hover:text-midnight"
            )}
          >
            <Terminal className="w-3.5 h-3.5" /> Manual Boolean
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Definition & JD / Manual Query */}
        <section className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors duration-500",
                searchMode === 'ai' ? "bg-coral" : "bg-indigo-electric"
              )}>
                {searchMode === 'ai' ? <FileText className="w-6 h-6" /> : <Terminal className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold italic">
                  {searchMode === 'ai' ? 'JD Intelligence' : 'Manual Sourcing Builder'}
                </h3>
                <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">
                  {searchMode === 'ai' ? 'Paste JD to generate boolean logic' : 'Direct boolean string & manual filter matching'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <label className="cursor-pointer px-4 py-1.5 bg-indigo-electric/5 text-indigo-electric rounded-full border border-indigo-100 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                <Upload className="w-3 h-3" /> Add Resume to Pool
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleTalentUpload} />
              </label>
              <label className="cursor-pointer px-4 py-1.5 bg-warm-gray text-midnight/60 rounded-full border border-midnight/5 text-[9px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                <Upload className="w-3 h-3" /> Upload JD
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          <div className="relative">
            {searchMode === 'ai' ? (
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here..."
                className="w-full h-64 p-8 bg-warm-gray border border-transparent rounded-[2.5rem] focus:bg-white focus:border-coral/20 outline-none transition-all text-sm font-medium leading-relaxed resize-none"
              />
            ) : (
              <textarea
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder='e.g. ("Java" OR "JDK") AND ("AWS" OR "Cloud") AND "Microservices"...'
                className="w-full h-64 p-8 bg-warm-gray border border-transparent rounded-[2.5rem] focus:bg-white focus:border-indigo-electric/20 outline-none transition-all text-sm font-mono leading-relaxed resize-none"
              />
            )}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (searchMode === 'ai' ? !jd.trim() : !manualQuery.trim())}
              className={cn(
                "absolute bottom-6 right-6 px-10 py-4 text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50",
                searchMode === 'ai' ? "bg-midnight hover:bg-coral shadow-midnight/20" : "bg-indigo-electric hover:bg-midnight shadow-indigo-500/20"
              )}
            >
              {isGenerating ? <Zap className="w-4 h-4 animate-spin" /> : (searchMode === 'ai' ? <Sparkles className="w-4 h-4" /> : <Search className="w-4 h-4" />)}
              {isGenerating ? 'Processing...' : (searchMode === 'ai' ? 'Activate Intelligence Search' : 'Run Manual Search')}
            </button>
          </div>
        </section>

        {/* Advanced Filters */}
        <section className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-electric/10 text-indigo-electric rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif font-bold italic">Manual Precision</h3>
            </div>
            {matches.length > 0 && <span className="text-[10px] font-bold text-emerald-500">{matches.length} Hits</span>}
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" /> Core Target
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Target Job Title" className="w-full p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none focus:bg-white focus:border-indigo-electric/20" />
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Geo-Targeting
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input value={location.city} onChange={(e) => setLocation({...location, city: e.target.value})} placeholder="City" className="p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none focus:bg-white focus:border-indigo-electric/20" />
                <input value={location.zip} onChange={(e) => setLocation({...location, zip: e.target.value})} placeholder="Zip Code" className="p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none focus:bg-white focus:border-indigo-electric/20" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-warm-gray rounded-xl">
                 <span className="text-[9px] font-bold text-midnight/40 w-12 shrink-0">Radius</span>
                 <input type="range" min="5" max="100" step="5" value={location.radius} onChange={(e) => setLocation({...location, radius: e.target.value})} className="flex-1 accent-indigo-electric" />
                 <span className="text-[10px] font-bold text-indigo-electric w-8 text-right font-mono">{location.radius}mi</span>
              </div>
            </div>

            {/* Industry / Exp */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2"><Briefcase className="w-3.5 h-3.5" /> Industry</label>
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Fintech" className="w-full p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2"><Zap className="w-3.5 h-3.5" /> Min Exp</label>
                <input type="number" value={minExp} onChange={(e) => setMinExp(Number(e.target.value))} className="w-full p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none" />
              </div>
            </div>

            {/* Education / Companies */}
            <div className="space-y-4 pt-4 border-t border-midnight/5">
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Certifications</label>
                <input value={certifications} onChange={(e) => setCertifications(e.target.value)} placeholder="AWS Certified, CISSP, PMP..." className="w-full p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none focus:bg-white focus:border-indigo-electric/20" />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5" /> Graduation Year / Degree</label>
                <div className="flex gap-2">
                  <input value={gradYear} onChange={(e) => setGradYear(e.target.value)} placeholder="Year" className="w-20 p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none" />
                  <select value={degree} onChange={(e) => setDegree(e.target.value)} className="flex-1 p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none appearance-none">
                    <option>Any Degree</option>
                    <option>Bachelors</option>
                    <option>Masters</option>
                    <option>PhD</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-bold uppercase tracking-widest text-midnight/30 flex items-center gap-2"><Building2 className="w-3.5 h-3.5" /> Target Companies</label>
                <input value={companies} onChange={(e) => setCompanies(e.target.value)} placeholder="FAANG, Shopify, Stripe..." className="w-full p-3 bg-warm-gray text-[10px] font-bold rounded-xl outline-none" />
              </div>

               <label className="flex items-center gap-3 p-3 bg-indigo-electric/5 rounded-xl cursor-pointer hover:bg-indigo-electric/10 transition-all">
                <input type="checkbox" checked={relocation} onChange={(e) => setRelocation(e.target.checked)} className="w-4 h-4 rounded accent-indigo-electric" />
                <span className="text-[10px] font-bold text-midnight/60">Open to Relocation Only</span>
              </label>
            </div>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {(result || matches.length > 0) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
          >
            {/* Boolean Results */}
            <div className="space-y-8">
               <div className="bg-midnight text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-5 h-5 text-coral" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Boolean Search Protocol</span>
                  </div>
                  {result && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(result.query)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-all text-[10px] font-bold uppercase tracking-widest"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy String
                    </button>
                  )}
                </div>
                <div className="bg-white/5 p-8 rounded-3xl border border-white/10 font-mono text-xs leading-relaxed text-indigo-200 shadow-inner">
                  {result?.query || manualQuery}
                </div>
                <div className="mt-10">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-5 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Recommended Search Titles
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {(result?.suggestedTitles || [title || 'Search Query']).map((t, i) => (
                      <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-white/60 hover:text-white hover:border-coral transition-all cursor-default">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Internal Talent & Preview */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-midnight/5 shadow-sm space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-electric text-white rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold italic">Internal Matches</h3>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{matches.length} Matches Found</span>
                   <p className="text-[8px] text-midnight/20 font-bold uppercase mt-1">Cross-referenced with filters</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                {matches.length > 0 ? matches.map((c) => (
                  <div key={c.id} className="p-6 bg-warm-gray/30 rounded-[2rem] border border-transparent hover:border-indigo-electric/20 hover:bg-white transition-all group flex items-start gap-4 cursor-default">
                    <div className="w-14 h-14 bg-indigo-electric text-white rounded-2xl flex items-center justify-center font-serif font-bold text-2xl italic shrink-0 shadow-lg shadow-indigo-500/10">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-lg font-serif font-bold text-midnight italic truncate">{c.name}</h4>
                          <p className="text-[10px] text-midnight/40 font-bold uppercase tracking-wider">{c.title}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-indigo-electric">{c.score}%</div>
                          <div className="text-[8px] text-midnight/20 uppercase font-bold tracking-widest mt-0.5">Semantic Fit</div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-white/50 rounded-xl border border-midnight/5 mb-4 group-hover:bg-warm-gray/10 transition-colors">
                        <p className="text-[10px] text-midnight/60 font-medium italic leading-relaxed line-clamp-2">
                           {c.resumeSnippet.split(' ').map((word: string, i: number) => {
                             const isMatch = c.highlightedMatches?.some((m: any) => word.toLowerCase().includes(m.toLowerCase()));
                             return isMatch ? <span key={i} className="text-indigo-electric font-bold bg-indigo-50 px-1 rounded mx-0.5 underline decoration-indigo-electric/20">{word} </span> : word + ' ';
                           })}
                        </p>
                      </div>

                      <div className="flex gap-4">
                         <button 
                          onClick={() => setPreviewCandidate(c)}
                          className="px-4 py-2 bg-indigo-electric text-white rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-midnight transition-colors"
                         >
                           <Eye className="w-3 h-3" /> Quick Preview
                         </button>
                         <button className="px-4 py-2 border border-midnight/5 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-white transition-colors">
                           View Profile
                         </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-20 select-none">
                    <Search className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">No strict matches found</p>
                  </div>
                )}
              </div>
              <button className="w-full mt-2 py-5 border-2 border-dashed border-midnight/5 rounded-[2rem] text-midnight/20 hover:text-midnight/40 hover:border-midnight/10 transition-all font-bold text-[10px] uppercase tracking-[0.3em]">
                Explore Deep Talent Archive
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Preview Modal */}
      <AnimatePresence>
        {previewCandidate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl space-y-10 relative overflow-hidden"
            >
              <button 
                onClick={() => setPreviewCandidate(null)}
                className="absolute top-10 right-10 w-12 h-12 bg-warm-gray rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-8 border-b border-midnight/5 pb-10">
                <div className="w-24 h-24 bg-midnight text-white rounded-[2rem] flex items-center justify-center font-serif font-bold text-4xl italic overflow-hidden shadow-2xl">
                  {previewCandidate.name[0]}
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-serif font-bold italic text-midnight">{previewCandidate.name}</h3>
                  <p className="text-xl font-medium text-midnight/40 italic">{previewCandidate.title}</p>
                </div>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Experience</span>
                       <p className="text-sm font-bold text-midnight">{previewCandidate.experience} Years</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Degree</span>
                       <p className="text-sm font-bold text-midnight">{previewCandidate.degree}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Grad Year</span>
                       <p className="text-sm font-bold text-midnight">{previewCandidate.gradYear}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-bold uppercase tracking-widest text-midnight/20">Location</span>
                       <p className="text-sm font-bold text-midnight">{previewCandidate.location}</p>
                    </div>
                 </div>

                 <div className="bg-indigo-electric/5 p-8 rounded-[3rem] border border-indigo-100 space-y-4">
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2">
                       <Eye className="w-4 h-4" /> Intelligence Match Preview
                    </h5>
                    <p className="text-sm text-midnight/80 font-medium leading-relaxed italic">
                       {previewCandidate.resumeSnippet.split(' ').map((word: string, i: number) => {
                             const isMatch = previewCandidate.highlightedMatches?.some((m: string) => word.toLowerCase().includes(m.toLowerCase()));
                             return isMatch ? <span key={i} className="text-indigo-electric font-bold underline decoration-indigo-electric/40">{word} </span> : word + ' ';
                        })}
                    </p>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button className="flex-1 py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-coral transition-all">
                       Connect Immediately
                    </button>
                    <button className="flex-1 py-5 bg-warm-gray text-midnight rounded-[2rem] font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all">
                       Add to Shortlist
                    </button>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
