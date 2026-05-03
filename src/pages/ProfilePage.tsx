import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Settings, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Building2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { User as UserType } from '@/src/types';

interface ProfilePageProps {
  user: UserType;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const accountSince = new Date(auth.currentUser?.metadata.creationTime || Date.now()).toLocaleDateString();
  const lastLogin = new Date(auth.currentUser?.metadata.lastSignInTime || Date.now()).toLocaleDateString();

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
            <User className="w-3.5 h-3.5 text-indigo-electric" />
            <span className="text-[9px] font-bold text-indigo-electric uppercase tracking-[0.2em]">Secure Profile</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Professional Identity</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Manage your global intelligence credentials</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm text-center space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-electric" />
            <div className="w-24 h-24 bg-midnight text-white rounded-3xl flex items-center justify-center font-serif font-bold text-4xl italic shadow-2xl shadow-midnight/30 mx-auto transition-transform group-hover:scale-105">
              {user.name[0]}
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold italic text-midnight">{user.name}</h3>
              <p className="text-xs font-bold text-midnight/30 uppercase tracking-[0.2em]">{user.role === 'corp' ? 'Corporate Recruiter' : 'Intelligence Candidate'}</p>
            </div>
            <div className="flex justify-center gap-4 pt-4">
              <span className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
          </div>

          <div className="bg-midnight p-10 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-midnight/30">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" /> Security Status
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Encryption</span>
                <span className="font-bold text-emerald-400">AES-256 Active</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Database Link</span>
                <span className="font-bold text-indigo-400">Encrypted Cloud</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">IP Masking</span>
                <span className="font-bold text-amber-400">Node Cluster</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-12 rounded-[4rem] border border-midnight/5 shadow-sm space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-midnight/20">Credentials</h5>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Mail className="w-5 h-5 text-midnight/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-midnight/20 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-midnight italic">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Clock className="w-5 h-5 text-midnight/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-midnight/20 uppercase tracking-widest">Active Since</p>
                      <p className="text-sm font-bold text-midnight italic">{accountSince}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-[10px] font-bold uppercase tracking-widest text-midnight/20">System Metadata</h5>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Shield className="w-5 h-5 text-midnight/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-midnight/20 uppercase tracking-widest">Access Level</p>
                      <p className="text-sm font-bold text-emerald-600 italic">Global Admin</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-gray flex items-center justify-center">
                      <Clock className="w-5 h-5 text-midnight/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-midnight/20 uppercase tracking-widest">Last Secure Sync</p>
                      <p className="text-sm font-bold text-midnight italic">{lastLogin}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-midnight/5 flex gap-4">
              <button className="flex-1 py-4 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3">
                <Settings className="w-4 h-4" /> Edit Account Parameters
              </button>
              <button className="flex-1 py-4 bg-warm-gray text-midnight/60 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center justify-center gap-3">
                <ExternalLink className="w-4 h-4" /> Export Intelligence Data
              </button>
            </div>
          </div>

          <div className="bg-indigo-electric p-12 rounded-[4rem] text-white flex items-center justify-between shadow-2xl shadow-indigo-500/20">
             <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Pro Insight</span>
                </div>
                <h4 className="text-2xl font-serif font-bold italic">Upgrade to Elite Intelligence</h4>
                <p className="text-white/60 text-xs font-medium">Unlock hyper-targeted resume reverse marketing and advanced AI screening.</p>
             </div>
             <button className="px-10 py-4 bg-white text-indigo-electric rounded-full font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">Go Elite</button>
          </div>
        </div>
      </div>
    </div>
  );
}
