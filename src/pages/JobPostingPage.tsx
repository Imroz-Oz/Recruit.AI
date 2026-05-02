import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Send, 
  Trash2, 
  Users, 
  Briefcase, 
  ExternalLink,
  Mail,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutTemplate,
  Globe,
  Settings,
  Zap,
  Lock,
  Upload
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function JobPostingPage() {
  const [isPosting, setIsPosting] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [jdText, setJdText] = useState('');
  const [postings, setPostings] = useState([
    { id: '1', title: 'Senior Backend Engineer', company: 'Self (Agency)', applicants: 14, status: 'Active', posted: '2 days ago' },
    { id: '2', title: 'Product UI/UX Designer', company: 'Global Vision', applicants: 8, status: 'Active', posted: '5 days ago' },
  ]);

  const [connectedBoards, setConnectedBoards] = useState([
    { name: 'Indeed (Free)', status: 'Connected', icon: 'I' },
    { name: 'ZipRecruiter (Free)', status: 'Connected', icon: 'Z' },
    { name: 'LinkedIn (Aggregated)', status: 'Connected', icon: 'L' },
    { name: 'Monster', status: 'Pending', icon: 'M' },
    { name: 'Glassdoor', status: 'In Future', icon: 'G' },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJdText(`Extracted JD: ${event.target?.result as string}`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Talent Magnet</h2>
          <p className="text-midnight/40 text-[10px] font-bold uppercase tracking-widest mt-2">Publish jobs to global free networks and manage visibility</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowConnections(true)}
            className="px-6 py-3 bg-white border border-midnight/5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-warm-gray transition-all flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-emerald-500" /> Board Connections
          </button>
          <button 
            onClick={() => setIsPosting(true)}
            className="px-8 py-3 bg-midnight text-white rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-xl shadow-midnight/10 flex items-center gap-2 hover:bg-coral transition-all"
          >
            <Plus className="w-4 h-4" /> New Free Posting
          </button>
        </div>
      </header>

      {/* Connection Drawer/Modal */}
      <AnimatePresence>
        {showConnections && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/60 backdrop-blur-md z-[100] flex items-center justify-end"
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full p-10 shadow-2xl space-y-10 flex flex-col"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-serif font-bold italic">Board Connect IQ</h3>
                <button onClick={() => setShowConnections(false)} className="p-3 bg-warm-gray rounded-full hover:bg-neutral-200">
                  <XCircle className="w-6 h-6 text-midnight/20" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto">
                 <p className="text-sm font-medium text-midnight/40 italic leading-relaxed">Assign where your free postings are distributed. Premium boards require API keys in future enterprise tiers.</p>
                 
                 <div className="space-y-3">
                    {connectedBoards.map((board, i) => (
                      <div key={i} className="p-4 bg-warm-gray/30 rounded-2xl border border-midnight/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white",
                            board.status === 'Connected' ? "bg-indigo-electric" : "bg-midnight/10"
                          )}>
                            {board.icon}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-midnight">{board.name}</h4>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-midnight/20">{board.status}</p>
                          </div>
                        </div>
                        {board.status === 'Connected' ? (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-xl shadow-emerald-500/50" />
                        ) : (
                          <Lock className="w-4 h-4 text-midnight/10" />
                        )}
                      </div>
                    ))}
                 </div>

                 <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-indigo-electric shrink-0" />
                    <p className="text-[10px] text-indigo-700/60 font-bold leading-relaxed italic uppercase tracking-wider">Future boards (Monster, CareerBuilder, Dice) can be connected by pasting your API keys in the settings hub.</p>
                 </div>
              </div>

              <button 
                onClick={() => setShowConnections(false)}
                className="w-full py-5 bg-midnight text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-electric transition-all"
              >
                 Calibrate Global Distribution
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Postings', value: '4', icon: Briefcase, color: 'text-indigo-600' },
          { label: 'Total Applicants', value: '38', icon: Users, color: 'text-emerald-500' },
          { label: 'Views today', value: '242', icon: Clock, color: 'text-amber-500' },
          { label: 'Avg Match', value: '72%', icon: Users, color: 'text-coral' },
        ].map(stat => (
          <div key={stat.label} className="p-6 bg-white rounded-[2.5rem] border border-midnight/5 shadow-sm">
             <stat.icon className={cn("w-6 h-6 mb-4", stat.color)} />
             <h3 className="text-3xl font-serif font-bold text-midnight">{stat.value}</h3>
             <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/20 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] border border-midnight/5 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-midnight/5 flex justify-between items-center bg-warm-gray/10">
          <h3 className="text-xl font-serif font-bold italic">Managed Postings</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white rounded-xl text-[10px] font-bold uppercase text-midnight border border-midnight/5">Filter Status</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-midnight/5 text-[9px] font-bold uppercase tracking-[0.2em] text-midnight/30">
                <th className="px-8 py-6">Role Tile</th>
                <th className="px-8 py-6">Applicants</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Posted</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-midnight/5">
              {postings.map(post => (
                <tr key={post.id} className="group hover:bg-warm-gray/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-midnight/5 rounded-xl flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-midnight/20" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-midnight">{post.title}</h4>
                        <p className="text-[9px] font-bold text-midnight/20 uppercase tracking-widest">{post.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-midnight">{post.applicants}</span>
                      <Users className="w-3.5 h-3.5 text-midnight/10" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                      {post.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs text-midnight/40 font-medium">{post.posted}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 rounded-xl hover:bg-midnight hover:text-white transition-all text-midnight/20">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl hover:bg-neutral-200 transition-all text-midnight/20">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Post Modal Overlay */}
      <AnimatePresence>
        {isPosting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-midnight/60 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-start">
                <div>
                   <h3 className="text-3xl font-serif font-bold italic">Create Intelligence-Driven Posting</h3>
                   <p className="text-xs text-midnight/40 font-medium">Automatic distribution to free boards in US & Canada</p>
                </div>
                <button 
                  onClick={() => setIsPosting(false)}
                  className="w-10 h-10 bg-warm-gray rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 ml-4">Job Title</label>
                    <input className="w-full px-6 py-4 bg-warm-gray rounded-2xl outline-none border border-transparent focus:bg-white focus:border-indigo-electric/20 text-sm font-bold" placeholder="Senior DevOps Engineer..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 ml-4">Location / Remote</label>
                    <input className="w-full px-6 py-4 bg-warm-gray rounded-2xl outline-none border border-transparent focus:bg-white focus:border-indigo-electric/20 text-sm font-bold" placeholder="Austin, TX / Remote" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 ml-4">Job Description</label>
                    <label className="cursor-pointer px-3 py-1 bg-warm-gray text-midnight/40 rounded-full text-[8px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-2">
                      <Upload className="w-2.5 h-2.5" /> Upload JD
                      <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <textarea 
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    className="w-full px-6 py-4 bg-warm-gray rounded-[2rem] outline-none border border-transparent focus:bg-white focus:border-indigo-electric/20 text-sm font-medium h-4 relative z-0 min-h-[160px]" 
                    placeholder="Describe the role responsibilities and required stack..." 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button 
                  onClick={() => setIsPosting(false)}
                  className="flex-1 py-4 bg-warm-gray text-midnight rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all"
                 >
                   Save Prototype
                 </button>
                 <button 
                  onClick={() => setIsPosting(false)}
                  className="flex-1 py-4 bg-midnight text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-2"
                 >
                   Publish Intelligence Posting <Send className="w-4 h-4" />
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
