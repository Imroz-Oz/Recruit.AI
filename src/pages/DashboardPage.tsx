import { motion } from 'motion/react';
import { SearchMode, Page, AppMode, User } from '@/src/types';
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
  Target,
  BarChart3
} from 'lucide-react';
import { useAppStore } from '../store';

interface DashboardPageProps {
  onSelectMode: (mode: SearchMode) => void;
  onNavigatePage: (page: Page) => void;
  appMode: AppMode;
  user?: User | null;
}

export default function DashboardPage({ onSelectMode, onNavigatePage, appMode, user }: DashboardPageProps) {
  const { showProfilePicture } = useAppStore();
  const isRecruiter = appMode === 'recruiter';
  const isPaid = user?.userPlan === 'pro' || user?.userPlan === 'enterprise';
  const userLevel = user?.userLevel || 'member';

  if (!isRecruiter) {
    // HUNTER DASHBOARD
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral/5 border border-coral/10">
              <Sparkles className="w-4 h-4 text-coral fill-current" />
              <span className="text-base font-bold uppercase tracking-widest text-coral tracking-[0.2em]">
                {isPaid ? 'Premium Career Intelligence' : 'Basic Career Intelligence'}
              </span>
            </div>
            <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">Your Market DNA</h2>
            <p className="text-[#0f172a]/50 font-medium max-w-xl italic">
              AI-optimized track for {user?.title || 'Professional'} roles.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-4 bg-white rounded-[2rem] border border-slate-300/5 shadow-sm flex items-center gap-4">
               <div>
                 <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/20">Market Visibility</p>
                 <div className="flex items-center gap-2">
                   <div className={cn("w-2 h-2 rounded-full animate-pulse", isPaid ? "bg-emerald-500" : "bg-orange-400")} />
                   <p className="text-base font-serif font-bold text-[#0f172a] italic uppercase">
                     {isPaid ? 'Top 2% Active' : 'Standard Tier'}
                   </p>
                 </div>
               </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Market DNA', value: isPaid ? '94%' : '71%', color: 'text-indigo-electric', icon: ShieldCheck },
            { label: 'Portfolio Health', value: isPaid ? 'High' : 'Needs Work', color: 'text-coral', icon: FileText },
            { label: 'Network Pulse', value: isPaid ? '12' : '2', color: 'text-[#0f172a]', icon: Globe },
            { label: 'Active Missions', value: '4 Active', color: 'text-indigo-electric', icon: Target }
          ].map((stat, i) => (
            <div key={i} className={cn("p-8 rounded-3xl border shadow-sm group transition-all font-sans", isPaid ? "bg-white border-slate-300/5 hover:border-indigo-electric/20" : "bg-slate-50 border-slate-200")}>
               <stat.icon className={cn("w-6 h-6 mb-4", stat.color)} />
               <h3 className="text-3xl font-serif font-bold text-[#0f172a]">{stat.value}</h3>
               <p className="text-base font-bold uppercase tracking-widest text-[#0f172a]/20 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            onClick={() => onNavigatePage('job-feed')}
            className="group cursor-pointer bg-white p-12 rounded-[4rem] border border-slate-300/5 shadow-sm hover:shadow-2xl hover:shadow-indigo-electric/10 transition-all relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-16 h-16 bg-indigo-electric text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-indigo-100 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-serif font-bold text-[#0f172a] mb-6 italic">Opportunity Orbit</h3>
              <p className="text-[#0f172a]/50 mb-10 leading-relaxed font-medium text-lg">Explore the live selection orbit synced with your unique market DNA and executive requirements.</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-base font-bold uppercase tracking-widest text-indigo-electric flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                   Launch Market Discovery <ArrowRight className="w-4 h-4" />
                </span>
                <div className="w-24 h-12 bg-warm-gray/10 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#0f172a]/20" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-56 h-64 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all" />
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            onClick={() => onNavigatePage('resume-vault')}
            className={cn("group cursor-pointer p-12 rounded-[4rem] shadow-sm hover:shadow-2xl transition-all relative overflow-hidden", isPaid ? "bg-[#1e293b]" : "bg-slate-800 opacity-95")}
          >
            <div className="relative z-10 flex flex-col h-full text-white">
              <div className="w-16 h-16 bg-coral text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-coral/20 group-hover:scale-110 transition-transform relative z-10">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-serif font-bold mb-6 italic uppercase tracking-tight text-white">Portfolio Engine</h3>
              <p className="text-white/40 mb-10 leading-relaxed font-medium text-lg italic">Calibrate your professional assets to bypass enterprise filters and match elite recruitment logic.</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-base font-bold uppercase tracking-widest text-coral flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Engineer Assets <ArrowRight className="w-4 h-4" />
                </span>
                <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white/40" />
                </div>
              </div>
              {!isPaid && (
                  <div className="mt-6 inline-flex self-start items-center gap-2 px-3 py-1 bg-coral/20 text-coral rounded-lg text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                      <Zap className="w-3 h-3" /> Upgrade to unlock full engine
                  </div>
              )}
            </div>
            <div className="absolute top-0 right-0 w-56 h-64 bg-indigo-electric/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-electric/30 transition-all opacity-30" />
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6 pt-10 border-t border-slate-300/5">
          <h4 className="text-center text-sm font-bold uppercase tracking-[0.4em] text-[#0f172a]/20">Executive Readiness Center</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Readiness Engine', icon: ShieldCheck, page: 'interview-prep' as Page, color: 'hover:bg-violet/5' },
              { label: 'Community Hub', icon: Users, page: 'message-buddy' as Page, color: 'hover:bg-amber-500/5' },
              { label: 'Performance Analytics', icon: BarChart3, page: 'history' as Page, color: 'hover:bg-purple-50' }
            ].map((action, i) => (
              <button 
                key={i} 
                onClick={() => onNavigatePage(action.page)}
                className={cn("p-8 bg-white rounded-3xl border border-slate-300/5 text-center group transition-all", action.color)}
              >
                <action.icon className="w-10 h-10 mx-auto mb-4 text-[#0f172a]/20 group-hover:text-[#0f172a] transition-colors" />
                <span className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40 group-hover:text-[#0f172a]">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RECRUITER DASHBOARD
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-4">
        <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border", 
          userLevel === 'universal' ? "bg-amber-500/10 border-amber-500/20" : "bg-indigo-electric/5 border-indigo-100"
        )}>
          <Zap className={cn("w-4 h-4 fill-current", userLevel === 'universal' ? "text-amber-500" : "text-indigo-electric")} />
          <span className={cn("text-base font-bold uppercase tracking-widest tracking-[0.2em]", 
            userLevel === 'universal' ? "text-amber-500" : "text-indigo-electric"
          )}>
            {userLevel === 'universal' ? 'GOD MODE ACTIVE' : 'Enterprise Recruitment Intelligence Active'}
          </span>
        </div>
        <h2 className="text-5xl font-serif font-bold text-[#0f172a] italic">How can we help you scout today?</h2>
        <p className="text-[#0f172a]/50 font-medium max-w-xl mx-auto italic">
          {userLevel === 'universal' 
             ? "You have absolute control over the platform infrastructure and recruitment intelligence."
             : "Select your primary objective to calibrate the AI intelligence and sourcing filters for maximum conversion."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <motion.div
          whileHover={{ y: -8 }}
          onClick={() => onSelectMode('candidate-for-job')}
          className="group cursor-pointer bg-white p-10 rounded-3xl border border-slate-300/5 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className={cn("w-16 h-16 text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform",
              userLevel === 'universal' ? "bg-amber-500 shadow-amber-500/20" : "bg-indigo-electric shadow-indigo-100"
            )}>
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-[#0f172a] mb-4">I need to find candidates for a job</h3>
            <p className="text-[#0f172a]/60 mb-10 leading-relaxed font-medium">Build a high-quality pipeline using LinkedIn Boolean intelligence, X-Ray site queries, and AI-driven skill matching.</p>
            
            <div className="mt-auto flex items-center justify-between">
              <span className={cn("text-base font-bold uppercase tracking-widest flex items-center gap-2",
                userLevel === 'universal' ? "text-amber-600" : "text-indigo-electric"
              )}>
                Launch Candidate Sourcing <ArrowRight className="w-4 h-4" />
              </span>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-warm-gray overflow-hidden flex items-center justify-center">
                    {showProfilePicture ? (
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=c${i}`} alt="avatar" />
                    ) : (
                      <Users className="w-4 h-4 text-slate-400" />
                    )}
                   </div>
                ))}
              </div>
            </div>
          </div>
          <div className={cn("absolute top-0 right-0 w-48 h-48 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-all",
             userLevel === 'universal' ? "bg-amber-500/5 group-hover:bg-amber-500/10" : "bg-indigo-electric/5 group-hover:bg-indigo-electric/10"
          )} />
        </motion.div>

        <motion.div
          whileHover={{ y: -8 }}
          onClick={() => onSelectMode('job-for-candidate')}
          className="group cursor-pointer bg-[#1e293b] p-10 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full text-white">
            <div className="w-16 h-16 bg-coral text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-coral/20 group-hover:scale-110 transition-transform">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-3xl font-serif font-bold mb-4">I have a candidate and need to find a job</h3>
            <p className="text-white/50 mb-10 leading-relaxed font-medium">Reverse-match a talent profile against open VMS/MSP opportunities, industry needs, and relocation-friendly positions.</p>
            
            <div className="mt-auto flex items-center justify-between">
              <span className="text-base font-bold uppercase tracking-widest text-coral flex items-center gap-2">
                Launch Job Matching <ArrowRight className="w-4 h-4" />
              </span>
              <div className="flex -space-x-3 opacity-50">
                {[5, 6, 7].map(i => (
                   <div key={i} className="w-10 h-10 rounded-full border-4 border-[#1e293b] bg-slate-800 overflow-hidden">
                    <Briefcase className="w-5 h-5 m-2.5 text-white/50" />
                   </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-coral/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-coral/10 transition-all" />
        </motion.div>
      </div>
      
      {/* Universal / Admin Quick Actions */}
      {(userLevel === 'universal' || userLevel === 'admin_head' || userLevel === 'superadmin') && (
         <div className="max-w-5xl mx-auto pt-10 border-t border-slate-300/5">
           <h4 className="text-center text-sm font-bold uppercase tracking-[0.4em] text-[#0f172a]/20 mb-6">Administrative Control</h4>
           <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => onNavigatePage(userLevel === 'universal' || userLevel === 'superadmin' ? 'superadmin' : 'admin')}
                className="p-6 bg-white rounded-3xl border border-slate-300/5 shadow-sm text-center group hover:bg-slate-50 transition-all"
              >
                  <ShieldCheck className="w-6 h-6 mx-auto mb-3 text-[#0f172a]/40 group-hover:text-amber-500" />
                  <p className="font-bold uppercase tracking-widest text-sm text-[#0f172a]/60 group-hover:text-[#0f172a]">Access Control Panel</p>
              </button>
              <button 
                onClick={() => onNavigatePage('history')}
                className="p-6 bg-white rounded-3xl border border-slate-300/5 shadow-sm text-center group hover:bg-slate-50 transition-all"
              >
                  <Target className="w-6 h-6 mx-auto mb-3 text-[#0f172a]/40 group-hover:text-indigo-electric" />
                  <p className="font-bold uppercase tracking-widest text-sm text-[#0f172a]/60 group-hover:text-[#0f172a]">Global Analytics</p>
              </button>
           </div>
         </div>
      )}
      
      {userLevel === 'member' && (
         <div className="max-w-5xl mx-auto space-y-6 pt-10 border-t border-slate-300/5">
         <h4 className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[#0f172a]/20 tracking-[0.4em]">Executive Toolkit</h4>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {[
             { label: 'Engagement Flow', icon: Users, page: 'candidates' as Page, color: 'hover:bg-indigo-50' },
             { label: 'Orbit Selection', icon: Sparkles, page: 'network' as Page, color: 'hover:bg-coral/5' },
             { label: 'Performance Analytics', icon: Globe, page: 'history' as Page, color: 'hover:bg-violet/5' },
             { label: 'Mission Briefs', icon: Plus, page: 'postings' as Page, color: 'hover:bg-purple-50' }
           ].map((action, i) => (
             <button 
               key={i} 
               onClick={() => onNavigatePage(action.page)}
               className={cn("p-6 bg-white rounded-[2rem] border border-slate-300/5 text-center group transition-all", action.color)}
             >
               <action.icon className="w-8 h-8 mx-auto mb-3 text-[#0f172a]/20 group-hover:text-[#0f172a] transition-colors" />
               <span className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40 group-hover:text-[#0f172a]">{action.label}</span>
             </button>
           ))}
         </div>
       </div>
      )}
    </div>
  );
}
