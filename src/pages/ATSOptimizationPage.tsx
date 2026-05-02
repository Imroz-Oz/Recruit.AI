import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  Layers, 
  CheckCircle2, 
  XCircle,
  Layout,
  Type,
  Maximize,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const principles = [
  { 
    title: 'Hierarchical Clarity', 
    desc: 'Use standard H1-H3 tagging for sections. Parsing algorithms prioritize top-down structure.', 
    icon: Layout,
    color: 'text-indigo-electric'
  },
  { 
    title: 'Text-Only Encoding', 
    desc: 'Avoid graphical elements or tables. Multi-column layouts often confuse older scanners.', 
    icon: FileCheck,
    color: 'text-emerald-500'
  },
  { 
    title: 'Contextual Keywords', 
    desc: 'Don’t just list skills; weave them into bullet points with measurable outcome data.', 
    icon: Type,
    color: 'text-coral'
  },
  { 
    title: 'Clean Metadata', 
    desc: 'Ensure your filename and file properties don’t contain dates from 5 years ago.', 
    icon: Maximize,
    color: 'text-amber-500'
  },
];

const rejectionTriggers = [
  { trigger: 'Unconventional Section Titles', fix: 'Use "Work Experience" instead of "Professional Journey".' },
  { trigger: 'Image-Based Text', fix: 'If you can’t highlight it, symbols or text inside SVGs won’t be read.' },
  { trigger: 'Header/Footer Overlap', fix: 'Don’t put contact info in the literal Page Header margin.' },
  { trigger: 'Complex Bullet Symbols', fix: 'Stick to standard round or square bullets. No custom icons.' },
];

export default function ATSOptimizationPage() {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="text-center space-y-6 max-w-3xl mx-auto">
        <h2 className="text-5xl font-serif font-bold text-midnight italic">ATS Fortress</h2>
        <div className="flex justify-center">
          <div className="flex items-center gap-8 bg-white px-10 py-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 border border-midnight/5">
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold text-indigo-electric">98%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40">Readability</span>
            </div>
            <div className="w-px h-10 bg-midnight/5" />
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold text-coral">0</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40">Shadow Blocks</span>
            </div>
            <div className="w-px h-10 bg-midnight/5" />
            <div className="text-center">
              <span className="block text-4xl font-serif font-bold text-emerald-500">Opt+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-midnight/40">Tier Status</span>
            </div>
          </div>
        </div>
        <p className="text-midnight/60 font-medium">Ensure your candidate’s profile never hits the automated rejection bin by following these battle-tested formatting rules.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-10 rounded-[3rem] border border-midnight/5 shadow-sm space-y-10">
          <h3 className="text-2xl font-serif font-bold italic border-b border-midnight/5 pb-6">Phase 1: Core Principles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {principles.map((p) => (
              <div key={p.title} className="space-y-3">
                <div className={cn("inline-flex p-3 rounded-2xl bg-warm-gray", p.color)}>
                  <p.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-midnight">{p.title}</h4>
                <p className="text-xs text-midnight/60 leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-midnight text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="w-6 h-6 text-coral" />
              <h3 className="text-2xl font-serif font-bold italic">Rejection Triggers</h3>
            </div>
            <div className="space-y-6">
              {rejectionTriggers.map((item, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                  <XCircle className="w-5 h-5 text-red-400 mt-1 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-red-300/60">Trigger</p>
                    <p className="text-sm font-bold">{item.trigger}</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <p className="text-xs text-white/50">{item.fix}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-coral/10 rounded-full blur-[100px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-midnight/5 shadow-sm">
          <h3 className="text-xl font-serif font-bold italic mb-8">Section Hierarchy</h3>
          <div className="space-y-3">
            {[
              'Personal Contact Info',
              'Professional Summary',
              'Core Skills Matrix',
              'Work Experience (Reverse-Chrono)',
              'Education & Certifications',
              'Projects / Volunteerism'
            ].map((section, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-warm-gray rounded-2xl group hover:bg-indigo-electric hover:text-white transition-all cursor-default">
                <span className="text-sm font-bold flex items-center gap-3">
                  <span className="text-[10px] opacity-40 font-mono">0{i+1}</span>
                  {section}
                </span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 p-1 relative group h-full">
          {/* Glowing Effect Background */}
          <div className="absolute inset-0 bg-indigo-electric rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
          
          <div className="relative h-full bg-white rounded-[2.2rem] p-10 flex flex-col justify-center border border-indigo-100">
            <h3 className="text-3xl font-serif font-bold italic mb-6">The "Invisible" Keyword Strategy</h3>
            <p className="text-midnight/60 leading-relaxed mb-8 max-w-xl font-medium">
              Top recruiters leverage <span className="text-indigo-electric font-bold">Semantic Grouping</span>. Instead of just "React", use "Frontend Architecture with React & Next.js". 
              Scanners today don't just look for matches; they look for <span className="italic">proximity context</span>.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs font-bold text-emerald-800 leading-relaxed italic">"Spearheaded cloud migration using AWS (EC2/S3) reducing latency by 40%."</p>
              </div>
              <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex gap-4 opacity-60">
                <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-xs font-bold text-red-800 leading-relaxed">"Knowledge of AWS, EC2, S3, Cloud Computing."</p>
              </div>
            </div>
            
            <button className="mt-10 self-start px-8 py-3 rounded-full bg-indigo-electric text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-indigo-200">
              Generate Optimized Bullet Points
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
