import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/src/lib/utils';

const performanceData = [
  { month: 'Jan', placements: 4, interviews: 12, outreach: 120 },
  { month: 'Feb', placements: 6, interviews: 18, outreach: 150 },
  { month: 'Mar', placements: 3, interviews: 15, outreach: 110 },
  { month: 'Apr', placements: 8, interviews: 24, outreach: 200 },
  { month: 'May', placements: 12, interviews: 32, outreach: 250 },
  { month: 'Jun', placements: 10, interviews: 28, outreach: 220 },
];

const sourceData = [
  { name: 'LinkedIn', value: 45, color: '#2D44FF' },
  { name: 'GitHub', value: 25, color: '#121212' },
  { name: 'Referrals', value: 20, color: '#F43F5E' },
  { name: 'Direct', value: 10, color: '#10B981' },
];

const conversionData = [
  { stage: 'Sourced', count: 1000 },
  { stage: 'Screened', count: 400 },
  { stage: 'Interview', count: 120 },
  { stage: 'Offer', count: 45 },
  { stage: 'Hired', count: 32 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-midnight/5 pb-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-electric/5 border border-indigo-electric/10 rounded-full">
            <TrendingUp className="w-4 h-4 text-indigo-electric" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-electric">
              Performance Intelligence
            </span>
          </div>
          <h2 className="text-5xl font-serif font-bold text-midnight leading-tight tracking-tight">
            Force <span className="text-indigo-electric italic">Multipliers.</span>
          </h2>
          <p className="text-midnight/60 font-medium text-sm max-w-lg leading-relaxed">
            Real-time decryption of your recruitment velocity. Analyze funnel health, 
            sourcing ROI, and mission-critical performance benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-5 py-3 bg-white border border-midnight/5 rounded-2xl flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-midnight/60 hover:border-indigo-electric/20 transition-all">
            <Calendar className="w-4 h-4" /> Last 30 Days
          </button>
          <button className="px-5 py-3 bg-midnight text-white rounded-2xl flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-electric transition-all shadow-xl shadow-midnight/10">
            <Download className="w-4 h-4" /> Export Data
          </button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Placement Velocity', val: '12.4d', delta: '+15%', trend: 'up', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Conversion Rate', val: '8.2%', delta: '+2.4%', trend: 'up', icon: Target, color: 'text-indigo-electric', bg: 'bg-indigo-electric/10' },
          { label: 'Network Reach', val: '4.2k', delta: '-5%', trend: 'down', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
          { label: 'Interviews/Offer', val: '3.8', delta: 'Valid', trend: 'neutral', icon: Clock, color: 'text-coral', bg: 'bg-coral/10' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-sm hover:shadow-xl hover:shadow-midnight/5 transition-all group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "px-2 py-1 rounded-full text-[9px] font-bold flex items-center gap-1",
                stat.trend === 'up' ? "bg-emerald-50 text-emerald-600" : stat.trend === 'down' ? "bg-red-50 text-red-600" : "bg-warm-gray text-midnight/40"
              )}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                {stat.delta}
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-midnight/30 mb-1">{stat.label}</p>
            <h4 className="text-3xl font-serif font-bold text-midnight italic">{stat.val}</h4>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Growth Area */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-serif font-bold italic text-midnight">Mission Trajectory</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight/30">Placements vs Outreach Intensity</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-electric" />
                <span className="text-[10px] font-bold text-midnight/40 uppercase">Placements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-electric/30" />
                <span className="text-[10px] font-bold text-midnight/40 uppercase">Interviews</span>
              </div>
            </div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D44FF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2D44FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#121212', opacity: 0.4 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#121212', opacity: 0.4 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                    fontWeight: 700,
                    fontFamily: 'Fraunces'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="placements" 
                  stroke="#2D44FF" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorPlacements)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="interviews" 
                  stroke="#2D44FF" 
                  strokeDasharray="8 8"
                  strokeOpacity={0.3}
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source ROI */}
        <div className="bg-midnight p-10 rounded-[3rem] shadow-2xl space-y-8 flex flex-col">
          <div>
            <h3 className="text-2xl font-serif font-bold italic text-white">Sourcing DNA</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Channel Yield ROI</p>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-10">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {sourceData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                     <span className="text-[11px] font-bold text-white/60 uppercase tracking-widest">{s.name}</span>
                   </div>
                   <span className="text-lg font-serif font-bold text-white italic">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Section */}
      <div className="bg-white/40 backdrop-blur-sm p-10 md:p-16 rounded-[4rem] border border-white shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-electric/5 blur-[120px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-4xl font-serif font-bold italic text-midnight italic">Conversion Dynamics</h3>
            <p className="text-sm font-medium text-midnight/40 leading-relaxed">
              Tracking the entropy of your recruitment funnel. From raw market signals 
              to secured executive placement.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-end justify-between gap-4 h-[300px]">
             {conversionData.map((stage, i) => (
               <div key={stage.stage} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group">
                 <div className="text-xs font-bold text-midnight/30 mb-2 uppercase tracking-widest">{stage.count}</div>
                 <motion.div 
                   initial={{ height: 0 }}
                   whileInView={{ height: `${(stage.count / 1000) * 100}%` }}
                   viewport={{ once: true }}
                   className={cn(
                    "w-full rounded-t-3xl transition-all group-hover:opacity-80 relative",
                    i === 0 ? "bg-midnight/5" : 
                    i === 1 ? "bg-indigo-electric/20" :
                    i === 2 ? "bg-indigo-electric/40" :
                    i === 3 ? "bg-indigo-electric/70" : "bg-indigo-electric"
                   )}
                 >
                   {i === 4 && (
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                       <Zap className="w-8 h-8 text-indigo-electric fill-indigo-electric animate-pulse" />
                     </div>
                   )}
                 </motion.div>
                 <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-midnight pt-4 mt-auto">{stage.stage}</div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
