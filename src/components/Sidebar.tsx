import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  History, 
  ShieldCheck, 
  Briefcase,
  Bot,
  Users,
  Globe,
  Zap,
  Sparkles,
  Link2,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Page, AppMode } from '@/src/types';

import { auth } from '@/src/lib/firebase';
import { signOut } from 'firebase/auth';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  isLinkedInConnected: boolean;
  onConnectLinkedIn: () => void;
  appMode: AppMode;
  onSwitchMode: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  isLinkedInConnected, 
  onConnectLinkedIn, 
  appMode, 
  onSwitchMode,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const recruiterItems = [
    { id: 'dashboard' as Page, label: 'Executive Nexus', icon: LayoutDashboard },
    { id: 'sourcing' as Page, label: 'Selection Orbit', icon: Search },
    { id: 'resume-vault' as Page, label: 'Library', icon: ShieldCheck },
    { id: 'postings' as Page, label: 'Mission Briefs', icon: Briefcase },
    { id: 'candidates' as Page, label: 'Engagement Flow', icon: Users },
    { id: 'intelligence' as Page, label: 'Insight Engine', icon: Zap },
    { id: 'assistant' as Page, label: 'Advisor', icon: Bot },
    { id: 'history' as Page, label: 'Performance Analytics', icon: BarChart3 },
  ];

  const hunterItems = [
    { id: 'dashboard' as Page, label: 'Success Nexus', icon: LayoutDashboard },
    { id: 'job-feed' as Page, label: 'Opportunity Orbit', icon: Globe },
    { id: 'personal-iq' as Page, label: 'Presence Lab', icon: Sparkles },
    { id: 'resume-vault' as Page, label: 'Secure Portfolio', icon: FileText },
    { id: 'interview-prep' as Page, label: 'Readiness Engine', icon: ShieldCheck },
    { id: 'assistant' as Page, label: 'Career AI', icon: Bot },
    { id: 'history' as Page, label: 'Performance Analytics', icon: BarChart3 },
  ];

  const menuItems = appMode === 'recruiter' ? recruiterItems : hunterItems;

  return (
    <div className={cn(
      "h-screen text-white flex flex-col fixed left-0 top-0 z-50 transition-all duration-500 overflow-y-auto scrollbar-hide",
      isCollapsed ? "w-20" : "w-64",
      appMode === 'recruiter' ? "bg-midnight shadow-2xl shadow-black/40" : "bg-midnight/95 backdrop-blur-xl border-r border-white/5"
    )}>
      <div className={cn("p-8", isCollapsed && "px-4")}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <BrandLogo className={cn(
              "w-10 h-10 transition-all shrink-0",
              appMode === 'recruiter' ? "text-indigo-electric" : "text-coral"
            )} />
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                <h1 className="text-xl font-serif font-bold tracking-tight leading-none text-white whitespace-nowrap">
                  {appMode === 'recruiter' ? 'Recruit AI' : 'Career AI'}
                </h1>
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-[0.3em] mt-1",
                  appMode === 'recruiter' ? "text-indigo-electric" : "text-coral"
                )}>
                  {appMode === 'recruiter' ? 'Intelligence Hub' : 'Market Mastery'}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={onToggleCollapse}
            className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 group text-sm font-medium",
                currentPage === item.id 
                  ? (appMode === 'recruiter' ? "bg-indigo-electric text-white shadow-xl shadow-indigo-600/20" : "bg-coral text-white shadow-xl shadow-coral/20") 
                  : "text-white/60 hover:text-white hover:bg-white/5",
                isCollapsed ? "justify-center px-0" : "gap-3"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                currentPage === item.id ? "text-white" : "text-white/40 group-hover:text-white/80"
              )} />
              {!isCollapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className={cn("mt-auto p-6 space-y-4", isCollapsed && "p-4")}>
        <button 
          onClick={onSwitchMode}
          title={isCollapsed ? "Switch Mode" : undefined}
          className={cn(
            "w-full flex items-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white group",
            isCollapsed ? "p-3 justify-center" : "px-4 py-3 gap-3"
          )}
        >
          <Zap className="w-4 h-4 text-violet group-hover:animate-pulse shrink-0" />
          {!isCollapsed && <span className="animate-in fade-in duration-300">Switch Mode</span>}
        </button>

        {!isCollapsed ? (
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
                  : (appMode === 'recruiter' ? "bg-indigo-electric text-white hover:opacity-90 shadow-indigo-electric/20" : "bg-coral text-white hover:opacity-90 shadow-coral/20")
              )}
            >
              {isLinkedInConnected ? 'Manage Account' : 'Connect Account'}
            </button>
          </div>
        ) : (
          <button 
            onClick={onConnectLinkedIn}
            title="LinkedIn Integration"
            className={cn(
              "w-full flex items-center justify-center p-3 rounded-xl border transition-all",
              isLinkedInConnected ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
            )}
          >
            <Link2 className={cn("w-4 h-4", isLinkedInConnected ? "text-emerald-400" : "text-white/40")} />
          </button>
        )}

        <div 
          onClick={() => setCurrentPage('profile')}
          title={isCollapsed ? "Profile" : undefined}
          className={cn(
            "flex items-center transition-colors cursor-pointer group border-t border-white/5",
            currentPage === 'profile' ? "text-white" : "text-white/60 hover:text-white",
            isCollapsed ? "justify-center py-4" : "gap-3 px-4 py-3 pt-6"
          )}
        >
          <User className={cn(
            "w-5 h-5 transition-colors shrink-0",
            currentPage === 'profile' ? "text-white" : "text-white/40 group-hover:text-white/80"
          )} />
          {!isCollapsed && <span className="text-xs font-medium animate-in fade-in duration-300">Profile</span>}
        </div>
        
        <div 
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={cn(
            "flex items-center transition-colors cursor-pointer group",
            isCollapsed ? "justify-center py-4" : "gap-3 px-4 py-3 text-white/60 hover:text-red-400"
          )}
        >
          <LogOut className={cn(
            "w-5 h-5 shrink-0 transition-opacity",
            isCollapsed ? "text-white/40 group-hover:text-red-400" : "text-white/40 group-hover:text-red-400 opacity-70 group-hover:opacity-100"
          )} />
          {!isCollapsed && <span className="text-xs font-bold uppercase tracking-widest animate-in fade-in duration-300">Logout</span>}
        </div>
      </div>
    </div>
  );
}
