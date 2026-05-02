import { motion } from 'motion/react';
import { SearchMode, Page, AppMode } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  ArrowRight,
  Briefcase,
  Sparkles,
  Zap,
  Globe,
  Plus,
  FileText,
  ShieldCheck,
  Target
} from 'lucide-react';

interface DashboardPageProps {
  onSelectMode: (mode: SearchMode) => void;
  onNavigatePage: (page: Page) => void;
  appMode: AppMode;
}

export default function DashboardPage({ onSelectMode, onNavigatePage, appMode }: DashboardPageProps) {
  const isRecruiter = appMode === 'recruiter';

  if (!isRecruiter) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-100">
              <Sparkles className="w-4 h-4 text-emerald-600 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 tracking-[0.2em]">
                Career Intelligence active
              </span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-midnight italic">Your Market DNA</h2>
            <p className="text-midnight/50 font-medium max-w-xl italic">AI-optimized track for Senior Design & Engineering roles.</p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white rounded-[2rem] border border-midnight/5 shadow-sm flex items-center gap-4">
               <div>
                 <p className="text-[8px] font-bold uppercase tracking-widest text-midnight/20">Market Visibility</p>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-sm font-serif font-bold text-midnight italic uppercase">Top 2% Active</p>
                 </div>
               </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Profile Strength', value: '94%', color: 'text-emerald-600', icon: ShieldCheck },
            { label: 'Resume Readiness', value: 'High', color: 'text-amber-500', icon: FileText },
            { label: 'Saved Jobs', value: '12', color: 'text-midnight', icon: Globe },
            { label: 'App Progress', value: '4 Active', color: 'text-indigo-electric', icon: Target }
          ].map((stat, i) => (
            <div key={i} className="p-8 bg-white rounded-[2.5rem] border border-midnight/5 shadow-sm group hover:border-emerald-500/20 transition-all">
               <stat.icon className={cn("w-6 h-6 mb-4", stat.color)} />
               <h3 className="text-3xl font-serif font-bold text-midnight">{stat.value}</h3>
               <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/20 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => onNavigatePage('job-feed')}
            className="group cursor-pointer bg-white p-12 rounded-[4rem] border border-midnight/5 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-emerald-100 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-serif font-bold text-midnight mb-6 italic">Market Feed</h3>
              <p className="text-midnight/50 mb-10 leading-relaxed font-medium text-lg">Explore the live market feed synced with your unique skills and salary requirements.</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                  Explore Live Roles <ArrowRight className="w-4 h-4" />
                </span>
                <div className="w-24 h-12 bg-warm-gray/10 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-midnight/20" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all" />
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            onClick={() => onNavigatePage('resume-vault')}
            className="group cursor-pointer bg-midnight p-12 rounded-[4rem] shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full text-white">
              <div className="w-16 h-16 bg-amber-500 text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-serif font-bold mb-6 italic uppercase tracking-tight">DNA Optimizer</h3>
              <p className="text-white/40 mb-10 leading-relaxed font-medium text-lg italic">Calibrate your resume to bypass ATS filters and match top recruitment logic.</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  Optimize Resume <ArrowRight className="w-4 h-4" />
                </span>
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white/40" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/20 transition-all" />
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6 pt-10 border-t border-midnight/5">
          <h4 className="text-center text-[11px] font-bold uppercase tracking-[0.4em] text-midnight/20">Skill Calibration Center</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Interview IQ', icon: ShieldCheck, page: 'interview-prep' as Page, color: 'hover:bg-emerald-50' },
              { label: 'Market Study', icon: Globe, page: 'job-feed' as Page, color: 'hover:bg-amber-50' },
              { label: 'Resume Coach', icon: FileText, page: 'resume-vault' as Page, color: 'hover:bg-indigo-50' },
              { label: 'Global Search', icon: Target, page: 'job-feed' as Page, color: 'hover:bg-purple-50' }
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => onNavigatePage(action.page)}
                className={cn("p-8 bg-white rounded-[2.5rem] border border-midnight/5 text-center group transition-all", action.color)}
              >
                <action.icon className="w-10 h-10 mx-auto mb-4 text-midnight/20 group-hover:text-midnight transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 group-hover:text-midnight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-electric/5 border border-indigo-100">
          <Zap className="w-4 h-4 text-indigo-electric fill-current" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-electric tracking-[0.2em]">
            Enterprise Recruitment Intelligence Active
          </span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-midnight italic">How can we help you scout today?</h2>
        <p className="text-midnight/50 font-medium max-w-xl mx-auto italic">Select your primary objective to calibrate the AI intelligence and sourcing filters for maximum conversion.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <motion.div
          whileHover={{ y: -8 }}
          onClick={() => onSelectMode('candidate-for-job')}
          className="group cursor-pointer bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-16 h-16 bg-indigo-electric text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-midnight mb-4">I need to find candidates for a job</h3>
            <p className="text-midnight/60 mb-10 leading-relaxed font-medium">Build a high-quality pipeline using LinkedIn Boolean intelligence, X-Ray site queries, and AI-driven skill matching.</p>
            
            <div className="mt-auto flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2">
                Launch Candidate Sourcing <ArrowRight className="w-4 h-4" />
              </span>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-warm-gray overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=c${i}`} alt="avatar" />
                   </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-electric/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-electric/10 transition-all" />
        </motion.div>

        <motion.div
          whileHover={{ y: -8 }}
          onClick={() => onSelectMode('job-for-candidate')}
          className="group cursor-pointer bg-midnight p-10 rounded-[3rem] shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full text-white">
            <div className="w-16 h-16 bg-coral text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-coral/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-serif font-bold mb-4">I have a candidate and need to find a job</h3>
            <p className="text-white/50 mb-10 leading-relaxed font-medium">Reverse-match a talent profile against open VMS/MSP opportunities, industry needs, and relocation-friendly positions.</p>
            
            <div className="mt-auto flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-coral flex items-center gap-2">
                Launch Job Matching <ArrowRight className="w-4 h-4" />
              </span>
              <div className="w-20 h-10 bg-white/10 rounded-full border border-white/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white/40" />
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-coral/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-coral/20 transition-all" />
        </motion.div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 pt-10 border-t border-midnight/5">
        <h4 className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-midnight/20 tracking-[0.4em]">Recruiter Quick Launcher</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pipeline Tracker', icon: Users, page: 'candidates' as Page, color: 'hover:bg-indigo-50' },
            { label: 'Network Sourcing', icon: Sparkles, page: 'network' as Page, color: 'hover:bg-coral/5' },
            { label: 'Sourcing History', icon: Globe, page: 'history' as Page, color: 'hover:bg-emerald-50' },
            { label: 'Free Postings', icon: Plus, page: 'postings' as Page, color: 'hover:bg-purple-50' }
          ].map((action, i) => (
            <button 
              key={i} 
              onClick={() => onNavigatePage(action.page)}
              className={cn("p-6 bg-white rounded-[2rem] border border-midnight/5 text-center group transition-all", action.color)}
            >
              <action.icon className="w-8 h-8 mx-auto mb-3 text-midnight/20 group-hover:text-midnight transition-colors" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40 group-hover:text-midnight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
