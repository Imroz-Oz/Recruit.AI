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
  Activity
} from 'lucide-react';
import { collection, query, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/src/lib/firebase';
import { User } from '@/src/types';

interface Organization {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'trial';
  plan?: 'free' | 'pro' | 'enterprise';
  resumeCount: number;
  userCount: number;
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


  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'organizations'));
      const snapshot = await getDocs(q);
      const orgList: Organization[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        // In a real app, we'd use aggregations or separate count fields
        // For this demo, we'll simulate these numbers
          orgList.push({
            id: docSnapshot.id,
            name: data.name,
            domain: data.domain,
            status: data.status || 'active',
            plan: data.plan || 'free',
            resumeCount: Math.floor(Math.random() * 500), // Simulated
            userCount: Math.floor(Math.random() * 20),   // Simulated
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
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

  const stats = [
    { label: 'Total Organizations', value: orgs.length, icon: Building2, color: 'text-blue-500' },
    { label: 'Global Talent Pool', value: '42,903', icon: FileText, color: 'text-purple-500' },
    { label: 'Active Users', value: orgs.reduce((acc, curr) => acc + curr.userCount, 0), icon: Users, color: 'text-green-500' },
    { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-orange-500' },
  ];

  return (
    <div className="flex flex-col gap-10 p-10 max-w-7xl mx-auto w-full">
      {/* Universal Admin Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-serif font-bold italic text-midnight">Global Control Center</h1>
            <div className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Root Access
            </div>
          </div>
          <p className="text-midnight/60 font-medium mt-2">Managing the infrastructure for all Recruit IQ deployments.</p>
        </div>
        
        <button 
          onClick={() => setShowNewOrgModal(true)}
          className="flex items-center gap-3 px-6 py-3 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
        >
          <Plus className="w-4 h-4" /> Provision Organization
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-midnight/5 shadow-xl shadow-midnight/5">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-midnight/2 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                <TrendingUp className="w-3 h-3" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-midnight/40 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-midnight mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-[2.5rem] border border-midnight/5 shadow-2xl shadow-midnight/5 overflow-hidden">
        <div className="p-8 border-b border-midnight/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <h2 className="text-xl font-bold text-midnight">Active Organizations</h2>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-midnight/20" />
            <input 
              placeholder="Search by name, domain, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-midnight/2 border border-midnight/5 pl-14 pr-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5 focus:border-indigo-electric/30 font-medium text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-midnight/2">
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Organization</th>
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Plan</th>
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Resumes</th>
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Users</th>
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest">Provisioned</th>
                <th className="px-8 py-5 text-[10px] font-bold text-midnight/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-midnight/20">
                      <Settings className="w-10 h-10 animate-spin" />
                      <p className="text-sm font-bold uppercase tracking-widest">Synching Global Data...</p>
                    </div>
                  </td>
                </tr>
              ) : orgs.filter(o => o.name.toLowerCase().includes(searchQuery.toLowerCase())).map((org) => (
                <tr key={org.id} className="hover:bg-midnight/[0.01] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-electric/10 rounded-2xl flex items-center justify-center font-bold text-indigo-electric">
                        {org.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-midnight">{org.name}</p>
                        <p className="text-xs text-midnight/40">{org.domain}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                      org.status === 'active' ? 'bg-green-50 text-green-600 border border-green-200' :
                      org.status === 'suspended' ? 'bg-red-50 text-red-600 border border-red-200' :
                      'bg-orange-50 text-orange-600 border border-orange-200'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tighter ${
                      org.plan === 'enterprise' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                      org.plan === 'pro' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {org.plan}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-mono text-sm text-midnight/60">{org.resumeCount}</td>
                  <td className="px-8 py-6 font-mono text-sm text-midnight/60">{org.userCount}</td>
                  <td className="px-8 py-6 text-xs font-medium text-midnight/40">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingOrg(org);
                          setShowEditOrgModal(true);
                        }}
                        className="p-2 hover:bg-midnight/5 rounded-xl text-midnight/40 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-midnight/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl shadow-midnight/20 relative"
          >
            <h3 className="text-2xl font-serif font-bold italic text-midnight mb-2">New Organization Protocol</h3>
            <p className="text-sm text-midnight/40 mb-8">Provision a dedicated environment for a new corporate partner.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-midnight uppercase tracking-widest ml-1">Organization Name</label>
                <input 
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="e.g. Acme Corporation" 
                  className="w-full bg-midnight/2 border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-midnight uppercase tracking-widest ml-1">Primary Domain</label>
                <input 
                  value={newOrgDomain}
                  onChange={(e) => setNewOrgDomain(e.target.value)}
                  placeholder="e.g. acme.com" 
                  className="w-full bg-midnight/2 border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
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
                className="flex-1 py-4 bg-midnight/5 text-midnight rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-midnight/10 transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleCreateOrg}
                className="flex-[2] py-4 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
              >
                Provision Instance
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditOrgModal && editingOrg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-midnight/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-3xl shadow-midnight/20 relative"
          >
            <h3 className="text-2xl font-serif font-bold italic text-midnight mb-2">Manage Organization</h3>
            <p className="text-sm text-midnight/40 mb-8">Update settings for {editingOrg.name}.</p>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-midnight uppercase tracking-widest ml-1">Status</label>
                <select 
                  value={editingOrg.status}
                  onChange={(e) => setEditingOrg({...editingOrg, status: e.target.value as any})}
                  className="w-full bg-midnight/2 border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-midnight uppercase tracking-widest ml-1">Plan Configuration</label>
                <select 
                  value={editingOrg.plan || 'free'}
                  onChange={(e) => setEditingOrg({...editingOrg, plan: e.target.value as any})}
                  className="w-full bg-midnight/2 border border-midnight/5 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-electric/5"
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
                className="flex-1 py-4 bg-midnight/5 text-midnight rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-midnight/10 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateOrg}
                className="flex-[2] py-4 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10"
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
