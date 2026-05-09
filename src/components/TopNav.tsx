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
      "w-full text-slate-300 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-md",
      baseThemeClasses,
      "px-6 py-4 border-r-0 border-b"
    )}>
      <div className="flex items-center gap-8 flex-1 overflow-hidden">
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo className={cn(
            "w-9 h-9 transition-all shrink-0",
             isUniversal ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : appMode === 'recruiter' ? "text-indigo-400" : "text-coral"
          )} />
          <div className="hidden lg:flex flex-col">
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
        </div>

        <nav className="flex items-center space-x-2 overflow-x-auto scrollbar-hide flex-1">
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className={cn(
                "flex items-center px-4 py-2 rounded-xl transition-all duration-200 group text-sm font-semibold border-r border-dashed mr-2 shrink-0",
                isUniversal ? "text-amber-500/60 hover:text-amber-400 border-amber-500/20" : "text-slate-500 hover:text-slate-300 border-slate-700"
              )}
            >
              <History className="w-4 h-4 shrink-0 mr-2" />
              <span className="hidden md:inline">Return</span>
            </button>
          )}

          {finalMenuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                title={item.label}
                className={cn(
                  "flex items-center py-2 px-4 rounded-xl transition-all duration-200 group text-sm font-semibold whitespace-nowrap shrink-0",
                  isActive ? activeItemClasses : cn("text-slate-400", hoverItemClasses)
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors duration-200 mr-2",
                  isActive 
                    ? (isUniversal ? "text-amber-500" : appMode === 'recruiter' ? "text-indigo-400" : "text-coral") 
                    : "text-slate-500 group-hover:text-slate-300"
                )} />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4 shrink-0 ml-4">
        <button 
          onClick={() => setCurrentPage('linkedin-intelligence')}
          title="LinkedIn Integration"
          className={cn(
            "flex items-center justify-center p-2.5 rounded-xl border transition-all",
            isLinkedInConnected ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/5"
          )}
        >
          <Linkedin className={cn("w-4 h-4", isLinkedInConnected ? "text-emerald-400" : "text-white/40")} />
        </button>

        <button 
          onClick={onSwitchMode}
          title="Switch Mode"
          className={cn(
            "flex items-center p-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold border",
            isUniversal 
              ? "bg-amber-500/5 hover:bg-amber-500/10 text-amber-500/80 hover:text-amber-400 border-amber-500/20 shadow-sm shadow-amber-500/5" 
              : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-transparent"
          )}
        >
          <Link2 className="w-4 h-4 shrink-0" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
           <div className="hidden sm:flex flex-col items-end cursor-pointer" onClick={() => setCurrentPage('profile')}>
             <span className="text-sm font-bold text-white leading-none capitalize truncate max-w-[120px]">
               {userName || 'User'}
             </span>
             {funNameTag && (
               <span className="text-[10px] font-bold text-coral/80 bg-coral/10 px-1.5 py-0.5 rounded uppercase tracking-wider mt-1 truncate max-w-[120px]">{funNameTag}</span>
             )}
           </div>
           <button 
             onClick={() => setCurrentPage('profile')}
             className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white/80 overflow-hidden shrink-0"
           >
             {userLevel === 'superadmin' || isUniversal ? (
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${userName || 'admin'}&backgroundColor=transparent`} className="w-full h-full object-cover" alt="avatar" />
             ) : (
                <User className="w-5 h-5" />
             )}
           </button>
           <button 
             onClick={handleLogout}
             className="p-2 text-white/40 hover:text-rose-400 transition-colors shrink-0"
             title="Logout"
           >
             <LogOut className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
}
