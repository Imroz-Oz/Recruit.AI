import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  TrendingUp, 
  Globe, 
  Lock,
  Plus,
  Search,
  ArrowUpRight,
  MoreVertical,
  Activity,
  CheckCircle2,
  XCircle,
  Trash2
} from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { User } from '@/src/types';
import { maskEmail } from '@/src/lib/utils';

interface Organization {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial' | 'pending';
  plan?: 'free' | 'pro' | 'enterprise';
  resumeCount: number;
  userCount: number;
  employeeCount: number;
  adminManagerCount: number;
  adminHeadEmail: string;
  country: string;
  createdAt: string;
}

const AdminPage = () => {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDomain, setNewOrgDomain] = useState('');
  
  const [showEditOrgModal, setShowEditOrgModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  const [activeTab, setActiveTab] = useState<'organizations' | 'users' | 'candidates' | 'integrations' | 'ai_learning'>('organizations');
  const [users, setUsers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  useEffect(() => {
    fetchOrgs();
    fetchUsers();
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const q = query(collection(db, 'candidates'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCandidates(data);
    } catch (error) {
      console.error('Fetch Candidates Error:', error);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteDoc(doc(db, 'candidates', candidateId));
      fetchCandidates();
    } catch (error) {
      console.error('Delete Candidate Error:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (error) {
      console.error('Fetch Users Error:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    } catch (error) {
      console.error('Delete User Error:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.id), {
        role: editingUser.role,
        userLevel: editingUser.userLevel,
        funNameTag: editingUser.funNameTag || null
      });
      setShowEditUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Update User Error:', error);
    }
  };

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'organizations'));
      const snapshot = await getDocs(q);
      const orgList: Organization[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        orgList.push({
          id: docSnapshot.id,
          name: data.name,
          domain: data.domain,
          status: data.status || 'active',
          plan: data.plan || 'free',
          resumeCount: data.resumeCount || 0,
          userCount: data.userCount || 0,
          employeeCount: data.employeeCount || 0,
          adminManagerCount: data.adminManagerCount || 0,
          adminHeadEmail: data.adminHeadEmail || '',
          country: data.country || 'USA',
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || new Date().toISOString()
        });
      }
      setOrgs(orgList);
    } catch (error) {
      console.error('Fetch Orgs Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!newOrgName || !newOrgDomain) return;
    const orgId = newOrgDomain.split('.')[0].toLowerCase();
    
    try {
      await setDoc(doc(db, 'organizations', orgId), {
        name: newOrgName,
        domain: newOrgDomain,
        status: 'active',
        plan: 'free',
        createdAt: new Date(),
        ownerId: auth.currentUser?.uid
      });
      setShowNewOrgModal(false);
      setNewOrgName('');
      setNewOrgDomain('');
      fetchOrgs();
    } catch (error) {
      console.error('Create Org Error:', error);
    }
  };

  const handleUpdateOrg = async () => {
    if (!editingOrg) return;
    try {
      await updateDoc(doc(db, 'organizations', editingOrg.id), {
        status: editingOrg.status,
        plan: editingOrg.plan,
      });
      setShowEditOrgModal(false);
      fetchOrgs();
    } catch (error) {
      console.error('Update Org Error:', error);
    }
  };

  const handleApproveOrg = async (orgId: string) => {
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        status: 'active'
      });
      fetchOrgs();
    } catch (error) {
      console.error('Approve Org Error:', error);
    }
  };

  const handleRejectOrg = async (orgId: string) => {
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        status: 'rejected'
      });
      fetchOrgs();
    } catch (error) {
      console.error('Reject Org Error:', error);
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    try {
      await deleteDoc(doc(db, 'organizations', orgId));
      fetchOrgs();
    } catch (error) {
      console.error('Delete Org Error:', error);
    }
  };

  const stats = [
    { id: 'organizations' as const, label: 'Total Organizations', value: orgs.length, icon: Building2, color: 'text-blue-500' },
    { id: 'candidates' as const, label: 'Global Talent Pool', value: candidates.length, icon: FileText, color: 'text-purple-500' },
    { id: 'users' as const, label: 'Active Users', value: users.length, icon: Users, color: 'text-green-500' },
    { id: 'uptime' as const, label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-orange-500' },
  ];

  return (
    <div className="flex flex-col gap-10 p-10 max-w-7xl mx-auto w-full">
      {/* Universal Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-serif font-bold italic text-[#0f172a]">Global Control Center</h1>
            <div className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-base font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Root Access
            </div>
          </div>
          <p className="text-[#0f172a]/60 font-medium mt-2">Managing the infrastructure for all Recruit IQ deployments.</p>
        </div>
        
        <button 
          onClick={() => setShowNewOrgModal(true)}
          className="flex items-center gap-3 px-6 py-3 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
        >
          <Plus className="w-4 h-4" /> Provision Organization
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => {
              if (stat.id !== 'uptime') {
                setActiveTab(stat.id);
              }
            }}
            className={`bg-white p-6 rounded-[2rem] border border-slate-300/5 shadow-xl shadow-midnight/5 transition-all ${stat.id !== 'uptime' ? 'cursor-pointer hover:border-indigo-electric/30 hover:shadow-indigo-electric/10' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-[#1e293b]/2 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>
            <p className="text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-[#0f172a] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-300/5 pb-4 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('organizations')}
          className={`px-6 py-2 text-base font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'organizations' ? 'bg-[#1e293b] text-white' : 'bg-transparent text-[#0f172a]/40 hover:bg-[#1e293b]/5'
          }`}
        >
          Organizations
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 text-base font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'users' ? 'bg-[#1e293b] text-white' : 'bg-transparent text-[#0f172a]/40 hover:bg-[#1e293b]/5'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={`px-6 py-2 text-base font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'candidates' ? 'bg-[#1e293b] text-white' : 'bg-transparent text-[#0f172a]/40 hover:bg-[#1e293b]/5'
          }`}
        >
          Talent Pool
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-6 py-2 text-base font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'integrations' ? 'bg-[#1e293b] text-white' : 'bg-transparent text-[#0f172a]/40 hover:bg-[#1e293b]/5'
          }`}
        >
          Integrations Hub
        </button>
        <button
          onClick={() => setActiveTab('ai_learning')}
          className={`px-6 py-2 text-base font-bold uppercase tracking-wider rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'ai_learning' ? 'bg-[#1e293b] text-white' : 'bg-transparent text-[#0f172a]/40 hover:bg-[#1e293b]/5'
          }`}
        >
          <Activity className="w-4 h-4" /> AI Self-Learning
        </button>
      </div>

      {activeTab === 'ai_learning' && (
        <div className="space-y-6">
          <div className="bg-indigo-electric p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] pointer-events-none" />
             <div className="space-y-2 relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  <span className="text-base font-bold uppercase tracking-widest">Autonomous Learning Subsystem</span>
                </div>
                <h4 className="text-2xl font-serif font-bold italic mt-2">Continuous Model Improvement</h4>
                <p className="text-white/70 text-base font-medium leading-relaxed">The AI models actively fine-tune themselves based on user input, acceptance rates of personalized outreach, and system telemetry. No manual intervention required.</p>
             </div>
             <div className="mt-8 md:mt-0 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 relative z-10 text-center">
               <p className="text-sm font-bold uppercase tracking-widest text-white/50 mb-1">Vector Updates</p>
               <div className="text-4xl font-black italic text-emerald-400">Live</div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-300/5 shadow-xl shadow-midnight/5">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" /> Outreach Model Drift (Real-time)
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-[#0f172a]/70">Context Resolution Accuracy</span>
                    <span className="text-indigo-600">96.4%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '96.4%' }} className="h-full bg-indigo-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-[#0f172a]/70">Tone Alignment (Self-Corrected)</span>
                    <span className="text-emerald-500">91.2%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '91.2%' }} className="h-full bg-emerald-500" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-[#0f172a]/70">User Edit Rate (Lower is Better)</span>
                    <span className="text-amber-500">12.5%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '12.5%' }} className="h-full bg-amber-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-300/5 shadow-xl shadow-midnight/5">
              <h3 className="text-xl font-bold text-[#0f172a] mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" /> Adaptation Events
              </h3>
              <div className="space-y-4">
                {[
                  { time: '2 mins ago', event: 'Fine-tuned parsing weights for Indeed formatting.' },
                  { time: '14 mins ago', event: 'Reduced formal tone in SWE outreach based on rejection telemetry.' },
                  { time: '1 hour ago', event: 'Ingested new domain taxonomy for Healthcare sector.' },
                  { time: '3 hours ago', event: 'Self-corrected search grounding hallucination via Cross-Validation.' }
                ].map((log, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                     <span className="text-xs font-bold text-slate-400 uppercase w-24 shrink-0">{log.time}</span>
                     <p className="text-sm font-medium text-[#0f172a]/70">{log.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'organizations' && (
      <div className="bg-white rounded-3xl border border-slate-300/5 shadow-2xl shadow-midnight/5 overflow-hidden">
        <div className="p-8 border-b border-slate-300/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-bold text-[#0f172a]">Active Organizations</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/20" />
            <input 
              placeholder="Search by name, domain, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/2 border border-slate-300/5 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1e293b]/2">
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Organization</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Resumes</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Users</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Provisioned</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-[#0f172a]/20">
                      <Settings className="w-10 h-10 animate-spin" />
                      <p className="text-base font-bold uppercase tracking-widest">Synching Global Data...</p>
                    </div>
                  </td>
                </tr>
              ) : orgs.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map((org) => (
                <tr key={org.id} className="hover:bg-[#1e293b]/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-electric/10 rounded-2xl flex items-center justify-center font-bold text-indigo-electric">
                        {org.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-[#0f172a]">{org.name}</p>
                        <p className="text-base text-[#0f172a]/40">{org.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-base font-bold uppercase tracking-tighter ${
                      org.status === 'active' ? 'bg-green-50 text-green-600 border border-green-200' :
                      org.status === 'suspended' ? 'bg-red-50 text-red-600 border border-red-200' :
                      org.status === 'pending' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-base font-bold uppercase tracking-tighter ${
                      org.plan === 'enterprise' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      org.plan === 'pro' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-base text-[#0f172a]/60">{org.resumeCount}</td>
                  <td className="px-8 py-6 font-mono text-base text-[#0f172a]/60">{org.userCount}</td>
                  <td className="px-8 py-6 text-base font-medium text-[#0f172a]/40">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {org.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveOrg(org.id)}
                            className="p-2 hover:bg-green-50 rounded-xl text-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRejectOrg(org.id)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => {
                          setEditingOrg(org);
                          setShowEditOrgModal(true);
                        }}
                        className="p-2 hover:bg-[#1e293b]/5 rounded-xl text-[#0f172a]/40 transition-colors"
                        title="Edit Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrg(org.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                        title="Delete Organization"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'users' && (
      <div className="bg-white rounded-3xl border border-slate-300/5 shadow-2xl shadow-midnight/5 overflow-hidden">
        <div className="p-8 border-b border-slate-300/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-bold text-[#0f172a]">Global Users</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/20" />
            <input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/2 border border-slate-300/5 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1e293b]/2">
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">User ID & Info</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Email</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Role</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {users.filter(u => `${u.name||''} ${u.email||''} ${u.id||''}`.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                <tr key={u.id} className="hover:bg-[#1e293b]/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-gray-500">
                        {(u.name || u.displayName || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#0f172a]">{u.name || u.displayName || 'No Name'}</p>
                        <p className="text-base text-[#0f172a]/40 font-mono">{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-base font-medium text-[#0f172a]/60">{maskEmail(u.email)}</td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full text-base font-bold uppercase tracking-tighter bg-indigo-50 text-indigo-600 border border-indigo-200">
                      {u.role || u.userLevel || 'candidate'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingUser(u);
                          setShowEditUserModal(true);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                        title="Edit User"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'candidates' && (
      <div className="bg-white rounded-3xl border border-slate-300/5 shadow-2xl shadow-midnight/5 overflow-hidden">
        <div className="p-8 border-b border-slate-300/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-bold text-[#0f172a]">Global Talent Pool</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0f172a]/20" />
            <input 
              placeholder="Search talent..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1e293b]/2 border border-slate-300/5 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium text-base"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#1e293b]/2">
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Candidate</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Experience / Skills</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest">Added By (Org ID)</th>
                <th className="px-8 py-5 text-base font-bold text-[#0f172a]/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {candidates.filter(c => `${c.name||''} ${c.title||''} ${c.skills||''}`.toLowerCase().includes(searchQuery.toLowerCase())).map((candidate) => (
                <tr key={candidate.id} className="hover:bg-[#1e293b]/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-bold text-indigo-600">
                        {candidate.name ? candidate.name[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-[#0f172a]">{candidate.name || 'Unnamed Candidate'}</p>
                        <p className="text-base text-[#0f172a]/40">{candidate.title}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-base font-medium text-[#0f172a]">{candidate.skills}</p>
                    <p className="text-sm text-[#0f172a]/40 uppercase tracking-widest mt-1">{candidate.experience || 0} Yrs • {candidate.location}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 rounded-full text-base font-bold uppercase tracking-tighter bg-[#1e293b] text-white">
                      {candidate.orgId || candidate.organizationId || 'GLOBAL'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleDeleteCandidate(candidate.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Candidate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-300/5 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-[#0f172a]">Active API Integrations</h3>
              <p className="text-sm font-medium text-[#0f172a]/50">Manage connections to external ATS, Job Boards, and sourcing platforms.</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors">
              <Plus className="w-4 h-4" /> Connect New System
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Workday', type: 'Enterprise ATS', status: 'connected', sync: 'Live', requests: '1.2M/mo' },
              { name: 'Greenhouse', type: 'ATS', status: 'connected', sync: '15m sync', requests: '450K/mo' },
              { name: 'LinkedIn Recruiter', type: 'Sourcing Source', status: 'syncing', sync: 'Live', requests: '2.1M/mo' },
              { name: 'Indeed Apply', type: 'Job Board', status: 'error', sync: 'Error', requests: '0/mo' },
              { name: 'Lever', type: 'ATS', status: 'disconnected', sync: 'N/A', requests: '0/mo' }
            ].map((integration, idx) => (
               <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-300/5 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-xl text-slate-400">
                     {integration.name.charAt(0)}
                   </div>
                   <div className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                     integration.status === 'connected' ? 'bg-emerald-50 text-emerald-600' :
                     integration.status === 'syncing' ? 'bg-amber-50 text-amber-600' :
                     integration.status === 'error' ? 'bg-red-50 text-red-600' :
                     'bg-slate-50 text-slate-500'
                   }`}>
                     {integration.status}
                   </div>
                 </div>
                 <h4 className="font-bold text-lg text-[#0f172a]">{integration.name}</h4>
                 <p className="text-xs font-medium text-[#0f172a]/40 uppercase tracking-widest mb-4">{integration.type}</p>
                 
                 <div className="flex justify-between items-center text-sm font-medium border-t border-slate-50 pt-4">
                   <span className="text-[#0f172a]/40">Sync: <span className="text-[#0f172a]">{integration.sync}</span></span>
                   <span className="text-[#0f172a]/40">Loads: <span className="text-[#0f172a]">{integration.requests}</span></span>
                 </div>
                 
                 <div className="mt-4 flex gap-2">
                   <button className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-[#0f172a] rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Configure</button>
                   <button className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-[#0f172a] rounded-lg transition-colors">
                     <Settings className="w-4 h-4" />
                   </button>
                 </div>
               </div>
            ))}
          </div>
        </div>
      )}

      {/* Provisioning Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1e293b]/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-3xl shadow-midnight/20 relative"
          >
            <h3 className="text-2xl font-serif font-bold italic text-[#0f172a] mb-2">New Organization Protocol</h3>
            <p className="text-base text-[#0f172a]/40 mb-8">Provision a dedicated environment for a new corporate partner.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Organization Name</label>
                <input 
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Acme Corporation" 
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Primary Domain</label>
                <input 
                  value={newOrgDomain}
                  onChange={(e) => setNewOrgDomain(e.target.value)}
                  placeholder="e.g. acme.com" 
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => {
                  setShowNewOrgModal(false);
                  setNewOrgName('');
                  setNewOrgDomain('');
                }}
                className="flex-1 py-4 bg-[#1e293b]/5 text-[#0f172a] rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-[#1e293b]/10 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleCreateOrg}
                className="flex-[2] py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
              >
                Provision Instance
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditOrgModal && editingOrg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1e293b]/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-3xl shadow-midnight/20 relative"
          >
            <h3 className="text-2xl font-serif font-bold italic text-[#0f172a] mb-2">Manage Organization</h3>
            <p className="text-base text-[#0f172a]/40 mb-8">Update settings for {editingOrg.name}.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={editingOrg.status}
                  onChange={(e) => setEditingOrg({...editingOrg, status: e.target.value as any})}
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Plan Configuration</label>
                <select 
                  value={editingOrg.plan || 'free'}
                  onChange={(e) => setEditingOrg({...editingOrg, plan: e.target.value as any})}
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                >
                  <option value="free">Free Tier</option>
                  <option value="pro">Pro Tier</option>
                  <option value="enterprise">Enterprise Tier</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setShowEditOrgModal(false)}
                className="flex-1 py-4 bg-[#1e293b]/5 text-[#0f172a] rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-[#1e293b]/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateOrg}
                className="flex-[2] py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1e293b]/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-3xl shadow-midnight/20 relative"
          >
            <h3 className="text-2xl font-serif font-bold italic text-[#0f172a] mb-2">Manage User Access</h3>
            <p className="text-base text-[#0f172a]/40 mb-8">Update god mode and access level for {editingUser.email}.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Role Configuration</label>
                <select 
                  value={editingUser.role || 'candidate'}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                >
                  <option value="candidate">Candidate</option>
                  <option value="corp">Corporate / Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">System Access Level</label>
                <select 
                  value={editingUser.userLevel || 'member'}
                  onChange={(e) => setEditingUser({...editingUser, userLevel: e.target.value})}
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                >
                  <option value="member">Standard Member</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="admin_head">Admin Head</option>
                  <option value="universal">Universal (God Mode)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-base font-bold text-[#0f172a] uppercase tracking-widest ml-1">Fun Name Tag</label>
                <input 
                  type="text"
                  value={editingUser.funNameTag || ''}
                  onChange={(e) => setEditingUser({...editingUser, funNameTag: e.target.value})}
                  placeholder="e.g. React Final Boss"
                  className="w-full bg-[#1e293b]/2 border border-slate-300/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button 
                onClick={() => setShowEditUserModal(false)}
                className="flex-1 py-4 bg-[#1e293b]/5 text-[#0f172a] rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-[#1e293b]/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateUser}
                className="flex-[2] py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-midnight/10"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
