import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  Mail, 
  Trash2, 
  UserCog,
  Search,
  CheckCircle2,
  X,
  Building2,
  FileText
} from 'lucide-react';
import { db, auth } from '@/src/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/src/lib/firestoreErrorHandler';
import { User } from '@/src/types';

export default function AdminPage() {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orgData, setOrgData] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'member' as const });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    const fetchOrgAndMembers = async () => {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (!isMounted) return;
      const orgId = userSnap.data()?.organizationId;
      
      if (!orgId) {
        setIsLoading(false);
        return;
      }

      // Fetch org details
      const orgSnap = await getDoc(doc(db, 'organizations', orgId));
      if (!isMounted) return;
      setOrgData({ id: orgSnap.id, ...orgSnap.data() });

      // Live member stream
      const q = query(
        collection(db, 'users'),
        where('organizationId', '==', orgId)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: doc.id,
            isLoggedIn: false, // fallback
            role: data.role || 'candidate',
            ...data
          } as unknown as User;
        });
        setTeamMembers(fetched);
        setIsLoading(false);
      });
    };

    fetchOrgAndMembers();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [auth.currentUser]);

  const handleUpdateRole = async (userId: string, newLevel: 'member' | 'admin' | 'admin_head') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        userLevel: newLevel
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (userId === auth.currentUser?.uid) return;
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        organizationId: null,
        userLevel: 'member'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvite.email || !orgData) return;

    // Check Plan Limits
    const limit = orgData.plan === 'enterprise' ? Infinity : orgData.plan === 'pro' ? 5 : 2;
    if (teamMembers.length >= limit) {
      // Limit Reached
      return;
    }

    try {
      // In a real app, this would trigger an email or cloud function
      // For now, we'll simulate account provisioning if the user exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newInvite.email));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        await updateDoc(userDoc.ref, {
          organizationId: orgData.id,
          userLevel: newInvite.role
        });
      } else {
        // For @recruit.ai emails, we simulate auto-creation
        if (newInvite.email.endsWith('@recruit.ai')) {
          const simulatedId = `rec-${Math.random().toString(36).substring(7)}`;
          await setDoc(doc(db, 'users', simulatedId), {
            email: newInvite.email,
            organizationId: orgData.id,
            userLevel: newInvite.role,
            displayName: newInvite.email.split('@')[0],
            createdAt: serverTimestamp()
          });
        } else {
          // Could not find user
        }
      }

      setIsInviteModalOpen(false);
      setNewInvite({ email: '', role: 'member' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'invites');
    }
  };

  const filteredMembers = teamMembers.filter(m => 
    m.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-electric/5 rounded-full border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-electric" />
            <span className="text-[9px] font-bold text-indigo-electric uppercase tracking-[0.2em]">Administrative Interface</span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Team Management</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest">Control access and roles for {orgData?.name || 'Organization'}</p>
        </div>
        <div className="flex gap-4 items-center">
           {orgData?.plan === 'free' && (
             <div className="px-4 py-2 bg-indigo-electric/10 text-indigo-electric rounded-2xl text-[9px] font-bold uppercase tracking-widest hidden md:block">
               Free Tier Active — Limited Seats
             </div>
           )}
           <button 
             onClick={() => setIsInviteModalOpen(true)}
             className="px-8 py-3.5 bg-midnight text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10 flex items-center gap-2"
           >
             <UserPlus className="w-4 h-4" /> Provision Team Member
           </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            label: 'Active Seats / Limit', 
            value: `${teamMembers.length} / ${orgData?.plan === 'enterprise' ? 'Unlimited' : orgData?.plan === 'pro' ? 5 : 2}`, 
            icon: Users, color: 'text-indigo-600' 
          },
          { label: 'Cloud Database', value: orgData?.name || '---', icon: Building2, color: 'text-emerald-600' },
          { label: 'Current Plan', value: orgData?.plan ? orgData.plan.toUpperCase() : 'FREE', icon: Shield, color: 'text-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 rounded-2xl bg-warm-gray/30 flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/30">{stat.label}</p>
              <h4 className="text-2xl font-serif font-bold italic text-midnight truncate max-w-[200px]">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Team Member Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-midnight">Global Productivity Matrix</h3>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-white rounded-xl border border-midnight/5 text-[10px] font-bold uppercase tracking-widest text-midnight/40">Efficiency: 94%</div>
            <div className="px-4 py-2 bg-white rounded-xl border border-midnight/5 text-[10px] font-bold uppercase tracking-widest text-midnight/40">Uptime: 99.9%</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Avg Time to Hire', value: '18 Days', trend: '-2d', color: 'text-indigo-600' },
            { label: 'Offer Acceptance', value: '82%', trend: '+4%', color: 'text-emerald-600' },
            { label: 'Sourcing Velocity', value: '42/wk', trend: '+12%', color: 'text-violet' },
            { label: 'Candidate IQ', value: '94.2', trend: '+1.2', color: 'text-coral' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-midnight/5 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-widest text-midnight/20 mb-2">{stat.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-serif font-bold italic">{stat.value}</span>
                <span className="text-[10px] font-bold text-emerald-500">{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-midnight/5 shadow-sm overflow-hidden flex flex-col">
        <div className="p-8 border-b border-midnight/5 bg-warm-gray/10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="relative flex-1 max-w-xl">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/20" />
             <input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Filter team by name or email..."
               className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl border border-midnight/5 outline-none focus:border-indigo-electric/40 text-sm font-medium"
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-midnight/5 bg-warm-gray/5">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">User Identity</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">Authority Level</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30">Organization</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-midnight/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <ShieldCheck className="w-10 h-10 animate-spin text-indigo-electric mx-auto opacity-20" />
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.uid} className="group hover:bg-warm-gray/10 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        member.userPlan === 'enterprise' ? 'bg-purple-50 text-purple-600' :
                        member.userPlan === 'pro' ? 'bg-indigo-electric/10 text-indigo-electric' :
                        'bg-warm-gray text-midnight/40'
                      }`}>
                        {member.displayName?.[0] || member.email[0].toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-bold text-midnight">{member.displayName || 'Unnamed Partner'}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-midnight/40">{member.email}</p>
                          {member.userPlan && (
                            <span className="px-1.5 py-0.5 bg-midnight/5 rounded text-[8px] font-bold uppercase text-midnight/30">
                              {member.userPlan}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      member.userLevel === 'superadmin' ? 'bg-red-50 text-red-600 border-red-200' :
                      member.userLevel === 'admin' ? 'bg-amber-50 text-amber-6d00 border-amber-200' :
                      'bg-indigo-50 text-indigo-600 border-indigo-200'
                    }`}>
                      {member.userLevel || 'member'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-bold text-midnight uppercase">{orgData?.name || '---'}</div>
                    <div className="text-[9px] text-midnight/30 font-bold uppercase tracking-widest">Verified Domain</div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                       {member.userLevel !== 'superadmin' && (
                         <>
                           <button 
                            onClick={() => handleUpdateRole(member.uid, member.userLevel === 'admin' ? 'member' : 'admin')}
                            title="Toggle Admin Authority"
                            className="p-2 bg-warm-gray rounded-xl hover:bg-neutral-200 transition-all"
                           >
                             <UserCog className="w-5 h-5 text-midnight/40" />
                           </button>
                           {member.uid !== auth.currentUser?.uid && (
                             <button 
                              onClick={() => handleRemoveMember(member.uid)}
                              title="Remove from Team"
                              className="p-2 bg-warm-gray rounded-xl hover:bg-red-50 text-red-400 transition-all"
                             >
                               <Trash2 className="w-5 h-5" />
                             </button>
                           )}
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/80 backdrop-blur-md z-[110] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-xl rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="absolute top-8 right-8 w-10 h-10 bg-warm-gray rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-8">
                <h3 className="text-3xl font-serif font-bold italic text-midnight">Provision Partner</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30 mt-2">Grant access to your organization's talent cloud</p>
              </div>

              <form onSubmit={handleInvite} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-midnight/40 ml-1">Work Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-midnight/20" />
                    <input 
                      required
                      type="email"
                      value={newInvite.email}
                      onChange={e => setNewInvite({...newInvite, email: e.target.value})}
                      className="w-full pl-16 pr-6 py-4 bg-warm-gray/50 rounded-2xl border border-transparent focus:border-indigo-electric/20 outline-none text-sm font-bold transition-all"
                      placeholder="partner@recruit.ai"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-midnight/40 ml-1">Authority Level</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewInvite({...newInvite, role: 'member'})}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left ${
                        newInvite.role === 'member' ? 'border-indigo-electric bg-indigo-electric/5' : 'border-midnight/5 hover:border-midnight/10'
                      }`}
                    >
                      <Users className="w-6 h-6 text-indigo-electric mb-3" />
                      <p className="text-sm font-bold text-midnight">Team Member</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewInvite({...newInvite, role: 'admin'})}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left ${
                        newInvite.role === 'admin' ? 'border-amber-500 bg-amber-500/5' : 'border-midnight/5 hover:border-midnight/10'
                      }`}
                    >
                      <Shield className="w-6 h-6 text-amber-500 mb-3" />
                      <p className="text-sm font-bold text-midnight">Manager</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewInvite({...newInvite, role: 'admin_head'})}
                      className={`p-6 rounded-[2rem] border-2 transition-all text-left col-span-2 ${
                        newInvite.role === 'admin_head' ? 'border-coral bg-coral/5' : 'border-midnight/5 hover:border-midnight/10'
                      }`}
                    >
                      <ShieldCheck className="w-6 h-6 text-coral mb-3" />
                      <p className="text-sm font-bold text-midnight">Admin Head</p>
                      <p className="text-[8px] font-bold text-midnight/30 uppercase mt-1">Full access + productivity analytics</p>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-midnight text-white rounded-[2rem] font-bold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-midnight/20 hover:bg-indigo-electric transition-all"
                >
                  Confirm Provisioning
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
