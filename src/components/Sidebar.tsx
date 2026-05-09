import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Linkedin,
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
  BarChart3,
  Rocket,
  CheckSquare,
  Building
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
  onLogout: () => void;
  appMode: AppMode;
  userLevel?: 'member' | 'admin' | 'admin_head' | 'superadmin' | 'universal' | 'page_admin';
  userPlan?: 'free' | 'pro' | 'enterprise';
  userName?: string;
  funNameTag?: string;
  onSwitchMode: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  isLinkedInConnected, 
  onConnectLinkedIn, 
  onLogout,
  appMode, 
  userLevel,
  userPlan,
  userName,
  funNameTag,
  onSwitchMode,
  isCollapsed,
  onToggleCollapse,
  onBack,
  canGoBack
}: SidebarProps) {
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isUniversal = userLevel === 'universal';
  const isPaid = userPlan === 'pro' || userPlan === 'enterprise';
  const isPageAdmin = userLevel === 'page_admin';

  // Base Recruiter Items
  const recruiterItems = [
    { id: 'dashboard' as Page, label: 'Dash', icon: LayoutDashboard },
    { id: 'intelligence' as Page, label: 'AI Intel', icon: Zap },
    { id: 'assistant' as Page, label: 'Assistant', icon: Bot },
  ];

  // Enterprise / Admin Manager Items
  const staffingItems = [
    { id: 'tasks' as Page, label: 'Tasks', icon: CheckSquare },
    { id: 'sourcing' as Page, label: 'Find Talent', icon: Search },
    { id: 'postings' as Page, label: 'Jobs', icon: Briefcase },
    { id: 'candidates' as Page, label: 'Talent Pool', icon: Users },
  ];

  const vaultItem = { id: 'resume-vault' as Page, label: 'Vault', icon: ShieldCheck };

  // Admin Head Items
  const analyticsItems = [
    { id: 'history' as Page, label: 'Stats', icon: BarChart3 },
    { id: 'admin' as Page, label: 'Team', icon: ShieldCheck },
  ];

  const hunterItems = [
    { id: 'dashboard' as Page, label: 'Hub', icon: LayoutDashboard },
    { id: 'job-feed' as Page, label: 'Job Board', icon: Globe },
    { id: 'personal-iq' as Page, label: 'My Brand', icon: Sparkles },
    { id: 'linkedin-intelligence' as Page, label: 'LinkedIn IQ', icon: Linkedin },
    { id: 'resume-vault' as Page, label: 'My Docs', icon: FileText },
    { id: 'interview-prep' as Page, label: 'Mock Int.', icon: ShieldCheck },
    { id: 'assistant' as Page, label: 'Career AI', icon: Bot },
    { id: 'history' as Page, label: 'Stats', icon: BarChart3 },
    { id: 'message-buddy' as Page, label: 'Community', icon: Users },
  ];

  const pageAdminItems = [
    { id: 'company-page-builder' as Page, label: 'Portal', icon: Building },
    { id: 'postings' as Page, label: 'Jobs', icon: Briefcase },
    { id: 'history' as Page, label: 'Stats', icon: BarChart3 },
  ];

  const superAdminItem = { id: 'superadmin' as Page, label: 'God Mode', icon: ShieldCheck };
  const scaleUpItem = { id: 'scale-up' as Page, label: 'Scale Up', icon: Rocket };

  let menuItems: any[] = [];
  
  if (appMode === 'hunter') {
    menuItems = hunterItems;
  } else if (isPageAdmin) {
    menuItems = pageAdminItems;
  } else {
    menuItems = [...recruiterItems];
    
    // Vault access for admins OR paid users
    if (userLevel === 'admin' || userLevel === 'admin_head' || userLevel === 'superadmin' || userLevel === 'universal' || isPaid) {
      menuItems.push(vaultItem);
    }
    
    if (userLevel === 'admin' || userLevel === 'admin_head' || userLevel === 'superadmin' || userLevel === 'universal') {
      menuItems.push(...staffingItems);
    }
    
    if (userLevel === 'admin_head' || userLevel === 'superadmin' || userLevel === 'universal') {
      menuItems.push(...analyticsItems);
    }
  }

  if (isUniversal || userLevel === 'superadmin') {
    menuItems.push(superAdminItem);
    if (isUniversal) {
      menuItems.push(scaleUpItem);
    }
  }

  const finalMenuItems = menuItems;

  const baseThemeClasses = isUniversal 
    ? "bg-gradient-to-b from-amber-950 via-[#1e1005] to-[#0a0502] border-r border-amber-500/20 shadow-[4px_0_24px_rgba(245,158,11,0.05)]" 
    : appMode === 'recruiter' 
      ? "bg-gradient-to-b from-indigo-950 via-slate-900 to-[#0f172a] border-r border-indigo-900/50" 
      : "bg-gradient-to-b from-rose-950 via-slate-950 to-black border-r border-rose-900/50";

  const activeItemClasses = isUniversal
    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_4px_12px_rgba(245,158,11,0.1)]"
    : appMode === 'recruiter'
      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
      : "bg-coral/10 text-coral border border-coral/20";
      
  const hoverItemClasses = isUniversal
    ? "hover:bg-amber-500/5 hover:text-amber-400 border border-transparent"
    : "hover:bg-white/5 hover:text-white border border-transparent";

  return (
    <div className={cn(
      "h-screen text-slate-300 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-y-auto scrollbar-hide",
      isCollapsed ? "w-20" : "w-64",
      baseThemeClasses
    )}>
      <div className={cn("p-6 flex flex-col h-full", isCollapsed && "px-4 items-center")}>
        <div className={cn("flex flex-col gap-6 mb-8", !isCollapsed && "px-2")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
            <div className="flex items-center gap-3">
              <BrandLogo className={cn(
                "w-9 h-9 transition-all shrink-0",
                isUniversal ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : appMode === 'recruiter' ? "text-indigo-400" : "text-coral"
              )} />
              {!isCollapsed && (
                <div className="flex flex-col">
                  <h1 className={cn("text-xl font-bold tracking-tight leading-none whitespace-nowrap", isUniversal ? "text-amber-50" : "text-white")}>
                    {isUniversal ? 'God Mode' : appMode === 'recruiter' ? 'Recruit IQ' : 'Career IQ'}
                  </h1>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em] mt-1.5",
                    isUniversal ? "text-amber-500/80" : appMode === 'recruiter' ? "text-indigo-400/80" : "text-coral/80"
                  )}>
                    {isUniversal ? 'Supreme Override' : appMode === 'recruiter' ? 'Intelligence Hub' : 'Market Mastery'}
                  </span>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button 
                onClick={onToggleCollapse}
                className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
          {isCollapsed && (
            <button 
              onClick={onToggleCollapse}
              className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors mx-auto mt-4"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto scrollbar-hide py-2">
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className={cn(
                "w-full flex items-center py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold border-b border-dashed mb-4",
                isUniversal ? "text-amber-500/60 hover:text-amber-400 border-amber-500/20" : "text-slate-500 hover:text-slate-300 border-slate-700",
                isCollapsed ? "justify-center px-0" : "px-3 gap-3"
              )}
            >
              <History className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Return</span>}
            </button>
          )}

          {finalMenuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold",
                  isActive ? activeItemClasses : cn("text-slate-400", hoverItemClasses),
                  isCollapsed ? "justify-center px-0" : "px-3 gap-3"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors duration-200",
                  isActive 
                    ? (isUniversal ? "text-amber-500" : appMode === 'recruiter' ? "text-indigo-400" : "text-coral") 
                    : "text-slate-500 group-hover:text-slate-300"
                )} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={cn("mt-auto pt-6 space-y-3 border-t", isUniversal ? "border-amber-500/10" : "border-white/5", isCollapsed && "items-center flex flex-col")}>
          
          <button 
            onClick={onSwitchMode}
            title={isCollapsed ? "Switch Mode" : undefined}
            className={cn(
              "w-full flex items-center py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold border",
              isUniversal 
                ? "bg-amber-500/5 hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/5" 
                : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-transparent",
              isCollapsed ? "justify-center px-0" : "px-3 gap-3"
            )}
          >
            <Link2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Switch Mode</span>}
          </button>
          
          {!isCollapsed ? (
            <div className={cn(
              "p-3 rounded-xl border transition-all duration-300 mt-2",
              isLinkedInConnected 
                ? "border-emerald-500/30 bg-emerald-500/5" 
                : "border-white/10 bg-white/5"
            )}>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">LinkedIn Sync</span>
                 <div className={cn(
                   "w-1.5 h-1.5 rounded-full",
                   isLinkedInConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-white/20"
                 )} />
               </div>
               <button 
                 onClick={() => setCurrentPage('linkedin-intelligence')}
                 className={cn(
                   "w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors",
                   isLinkedInConnected 
                     ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                     : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                 )}
               >
                 {isLinkedInConnected ? 'Manage' : 'Connect'}
               </button>
            </div>
          ) : (
            <button 
               onClick={() => setCurrentPage('linkedin-intelligence')}
               title="LinkedIn Integration"
               className={cn(
                 "w-full flex items-center justify-center p-3 rounded-xl border transition-all",
                 isLinkedInConnected ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
               )}
             >
               <Linkedin className={cn("w-4 h-4", isLinkedInConnected ? "text-emerald-400" : "text-white/40")} />
             </button>
          )}

          <div 
             onClick={() => setCurrentPage('profile')}
             title={isCollapsed ? "Profile" : undefined}
             className={cn(
               "w-full flex items-center py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold hover:bg-white/5 border border-transparent cursor-pointer",
               currentPage === 'profile' ? "text-white bg-white/5" : "text-slate-400 hover:text-slate-200",
               isCollapsed ? "justify-center px-0 mt-2" : "px-3 gap-3"
             )}
           >
             <User className={cn(
               "w-4 h-4 shrink-0 transition-colors duration-200",
               currentPage === 'profile' ? "text-white" : "text-slate-500 group-hover:text-slate-300"
             )} />
             {!isCollapsed && (
               <div className="flex flex-col items-start overflow-hidden w-full">
                 <span className="text-sm truncate max-w-[150px]">{userName || 'Profile'}</span>
                 {funNameTag && (
                   <span className="text-[10px] font-bold text-coral/80 bg-coral/10 px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5 truncate max-w-[150px]">
                     {funNameTag}
                   </span>
                 )}
               </div>
             )}
           </div>

          <button 
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : undefined}
            className={cn(
              "w-full flex items-center py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 border border-transparent mt-1",
              isCollapsed ? "justify-center px-0 text-slate-500" : "px-3 gap-3 text-slate-500"
            )}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
