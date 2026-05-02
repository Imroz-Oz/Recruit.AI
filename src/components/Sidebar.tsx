import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  History, 
  ShieldCheck, 
  Bot,
  Users,
  Globe,
  Zap,
  Sparkles,
  Link2,
  User,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Page, AppMode } from '@/src/types';

import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isLinkedInConnected: boolean;
  onConnectLinkedIn: () => void;
  appMode: AppMode;
  onSwitchMode: () => void;
}

export default function Sidebar({ currentPage, setCurrentPage, isLinkedInConnected, onConnectLinkedIn, appMode, onSwitchMode }: SidebarProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const recruiterItems = [
    { id: 'dashboard' as Page, label: 'Launcher', icon: LayoutDashboard },
    { id: 'sourcing' as Page, label: 'Search Builder', icon: Search },
    { id: 'intelligence' as Page, label: 'Intelligence Hub', icon: Zap },
    { id: 'candidates' as Page, label: 'Pipeline / Submits', icon: Users },
    { id: 'assistant' as Page, label: 'AI Recruiter', icon: Bot },
    { id: 'history' as Page, label: 'Archive', icon: History },
  ];

  const hunterItems = [
    { id: 'dashboard' as Page, label: 'Career Hub', icon: LayoutDashboard },
    { id: 'job-feed' as Page, label: 'Market Explorer', icon: Globe },
    { id: 'personal-iq' as Page, label: 'DNA Optimizer', icon: Sparkles },
    { id: 'resume-vault' as Page, label: 'Resume Coach', icon: FileText },
    { id: 'interview-prep' as Page, label: 'AI Interview IQ', icon: ShieldCheck },
    { id: 'assistant' as Page, label: 'Career Assistant', icon: Bot },
    { id: 'history' as Page, label: 'Saved Jobs', icon: History },
  ];

  const menuItems = appMode === 'recruiter' ? recruiterItems : hunterItems;

  return (
    <div className={cn(
      "w-64 h-screen text-white flex flex-col fixed left-0 top-0 z-50 transition-all duration-500",
      appMode === 'recruiter' ? "bg-midnight" : "bg-emerald-950 shadow-2xl shadow-emerald-950/40"
    )}>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-10">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all",
            appMode === 'recruiter' ? "bg-indigo-electric shadow-indigo-500/20" : "bg-amber-500 shadow-amber-500/20"
          )}>
            <span className="text-white font-serif font-bold text-xl italic">{appMode === 'recruiter' ? 'IQ' : 'JQ'}</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-bold tracking-tight leading-none text-white">
              {appMode === 'recruiter' ? 'Recruit IQ' : 'Career JQ'}
            </h1>
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-[0.3em] mt-1",
              appMode === 'recruiter' ? "text-indigo-400" : "text-amber-400"
            )}>
              {appMode === 'recruiter' ? 'Intelligence Hub' : 'Market Mastery'}
            </span>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                currentPage === item.id 
                  ? (appMode === 'recruiter' ? "bg-indigo-electric text-white" : "bg-amber-500 text-white") 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                currentPage === item.id ? "text-white" : "text-white/40 group-hover:text-white/80"
              )} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <button 
          onClick={onSwitchMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white group"
        >
          <Zap className="w-4 h-4 text-amber-400 group-hover:animate-pulse" />
          Switch Mode
        </button>

        <div className={cn(
          "p-4 rounded-xl border transition-all duration-300",
          isLinkedInConnected 
            ? "border-emerald-500/30 bg-emerald-500/5" 
            : "border-white/10 bg-white/5"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Integration</span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isLinkedInConnected ? "bg-emerald-500 animate-pulse" : "bg-white/20"
            )} />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#0077B5] flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-none">LinkedIn</span>
              <span className="text-[10px] text-white/40">{isLinkedInConnected ? 'Connected' : 'Not Connected'}</span>
            </div>
          </div>
          <button 
            onClick={onConnectLinkedIn}
            className={cn(
              "w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shadow-lg",
              isLinkedInConnected 
                ? "bg-white/10 text-white hover:bg-white/20" 
                : (appMode === 'recruiter' ? "bg-coral text-white hover:opacity-90 shadow-coral/20" : "bg-amber-600 text-white hover:opacity-90 shadow-amber-600/20")
            )}
          >
            {isLinkedInConnected ? 'Manage Account' : 'Connect Account'}
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors cursor-pointer group border-t border-white/5 pt-6">
          <User className="w-5 h-5 text-white/40 group-hover:text-white/80" />
          <span className="text-xs font-medium">Professional Profile</span>
        </div>
        
        <div 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-coral transition-colors cursor-pointer group"
        >
          <LogOut className="w-5 h-5 text-white/40 group-hover:text-coral/80" />
          <span className="text-xs font-medium">Finish Session</span>
        </div>
      </div>
    </div>
  );
}
