import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Copy, 
  LayoutTemplate, 
  Code2, 
  Palette, 
  BarChart, 
  Megaphone, 
  ShieldUser, 
  Search,
  X,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

type Category = 'All' | 'Engineering' | 'Design' | 'Data' | 'Marketing' | 'Leadership' | 'X-Ray';

interface Template {
  id: string;
  title: string;
  category: Category;
  description: string;
  query: string;
  icon: React.ElementType;
}

const templates: Template[] = [
  { 
    id: '1', title: 'Senior Backend (Golang)', category: 'Engineering', icon: Code2,
    description: 'Targeting high-performance system engineers with distributed systems experience.',
    query: '("Senior Software Engineer" OR "Backend Engineer" OR "Systems Engineer") AND (Golang OR Go OR Rust) AND (Kubernetes OR Docker OR Microservices) NOT (University OR Intern)'
  },
  { 
    id: '2', title: 'Product Designer (L5)', category: 'Design', icon: Palette,
    description: 'Finding mid-senior designers with Figma and Design Systems mastery.',
    query: '("Product Designer" OR "UX Designer" OR "UI/UX Designer") AND (Figma OR "Design Systems" OR Prototype) AND (Fintech OR SaaS) NOT (Junior OR Entry)'
  },
  { 
    id: '3', title: 'Data Scientist (NLP)', category: 'Data', icon: BarChart,
    description: 'Expert level focus on LLMs and Natural Language Processing.',
    query: '("Data Scientist" OR "ML Engineer" OR "AI Researcher") AND (NLP OR Transformers OR LLM OR PyTorch) AND (PhD OR Master) NOT (Analyst)'
  },
  { 
    id: '4', title: 'Growth Marketer', category: 'Marketing', icon: Megaphone,
    description: 'Performance-driven marketing leads for startup scaling.',
    query: '("Growth Lead" OR "Performance Marketer" OR "User Acquisition") AND (SQL OR "A/B Testing" OR Attribution) AND (Retention OR LTV) NOT (Agency)'
  },
  { 
    id: '5', title: 'VP of Engineering', category: 'Leadership', icon: ShieldUser,
    description: 'Strategic leadership roles for Series B+ companies.',
    query: '("VP of Engineering" OR "CTO" OR "Head of Engineering") AND (Scaling OR "Series B" OR Roadmap) AND (Hiring OR "Budget Management") NOT (Manager)'
  },
  { 
    id: '6', title: 'GitHub X-Ray (OS)', category: 'X-Ray', icon: Search,
    description: 'Finding open source contributors directly via GitHub profiles.',
    query: 'site:github.com "Joined on" "Public contributions" "Python" "California"'
  },
  { 
    id: '7', title: 'Staff Frontend (React)', category: 'Engineering', icon: Code2,
    description: 'Architecting high-scale frontend systems.',
    query: '("Staff Engineer" OR "Principal Engineer") AND (React OR Webpack OR Performance) AND (Architecture OR Mentorship)'
  },
  { 
    id: '8', title: 'Brand Identity Lead', category: 'Design', icon: Palette,
    description: 'Creative leads with strong brand storytelling portfolios.',
    query: '("Brand Designer" OR "Art Director") AND (Storytelling OR Branding OR Strategy) AND (Agency OR In-house)'
  },
  { 
    id: '9', title: 'Dribbble Pursuit', category: 'X-Ray', icon: Search,
    description: 'Finding designers based on portfolio views and location.',
    query: 'site:dribbble.com "Followers" "Software Designer" "Remote"'
  },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const categories: Category[] = ['All', 'Engineering', 'Design', 'Data', 'Marketing', 'Leadership', 'X-Ray'];

  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const copyQuery = (query: string) => {
    navigator.clipboard.writeText(query);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-[#0f172a] italic">Search Templates</h2>
          <p className="text-[#0f172a]/60 font-medium">Professional-grade search strings for every recruitment vertical.</p>
        </div>
        <div className="flex bg-white p-1 rounded-full border border-slate-300/5 shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-base font-bold uppercase tracking-widest transition-all",
                selectedCategory === cat ? "bg-[#1e293b] text-white" : "text-[#0f172a]/40 hover:text-[#0f172a]/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              key={template.id}
              className="group bg-white p-6 rounded-[2rem] border border-slate-300/5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden relative"
              onClick={() => setPreviewTemplate(template)}
            >
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-warm-gray group-hover:bg-indigo-electric group-hover:text-white transition-colors duration-300">
                    <template.icon className="w-6 h-6" />
                  </div>
                  <span className="text-base font-bold uppercase tracking-widest text-[#0f172a]/30 bg-warm-gray px-3 py-1 rounded-full group-hover:bg-[#1e293b]/5 transition-colors">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#0f172a] italic mb-2">{template.title}</h3>
                <p className="text-base text-[#0f172a]/50 leading-relaxed line-clamp-2 font-medium mb-6">{template.description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(j => (
                      <div key={j} className="w-6 h-6 rounded-full border-2 border-white bg-warm-gray flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${template.id}${j}`} 
                          alt="avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-electric flex items-center justify-center">
                      <span className="text-base font-bold text-white">+12</span>
                    </div>
                  </div>
                  <span className="text-base font-bold uppercase tracking-widest text-indigo-electric opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                    Preview Query <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-electric/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-indigo-electric/10 transition-all" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {previewTemplate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#1e293b]/40 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-cream w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-10 space-y-8">
                <header className="flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="p-4 rounded-2xl bg-indigo-electric text-white">
                      <previewTemplate.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-serif font-bold italic">{previewTemplate.title}</h3>
                      <p className="text-[#0f172a]/40 text-base font-bold uppercase tracking-widest mt-1">Core Recruitment Template</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewTemplate(null)}
                    className="p-3 rounded-full hover:bg-warm-gray transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </header>

                <div className="p-6 bg-white border border-slate-300/5 rounded-3xl space-y-4">
                  <div className="flex justify-between items-center text-base font-bold uppercase tracking-widest text-[#0f172a]/40">
                    <span>Generated Boolean Output</span>
                    <button 
                      onClick={() => copyQuery(previewTemplate.query)}
                      className="flex items-center gap-2 text-indigo-electric hover:text-indigo-700 transition-colors uppercase tracking-widest"
                    >
                      <Copy className="w-3 h-3" /> Copy String
                    </button>
                  </div>
                  <div className="font-mono text-base leading-relaxed text-[#0f172a]/80 break-words max-h-40 overflow-y-auto scrollbar-hide bg-warm-gray/50 p-4 rounded-xl">
                    {previewTemplate.query}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-bold uppercase tracking-widest text-[#0f172a]/40">Optimization Insights</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-slate-300/5 bg-emerald-50/50">
                      <p className="text-base font-bold text-emerald-600 mb-1">STRENGTH</p>
                      <p className="text-base font-medium text-[#0f172a]/70">High inclusivity for alternative job titles.</p>
                    </div>
                    <div className="p-4 rounded-2xl border border-slate-300/5 bg-indigo-50/50">
                      <p className="text-base font-bold text-indigo-600 mb-1">TARGET</p>
                      <p className="text-base font-medium text-[#0f172a]/70">Optimized for LinkedIn Recruiter & Sales Nav.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-300/5 flex gap-4">
                  <button 
                    className="flex-1 py-4 bg-[#1e293b] text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:bg-white hover:text-[#0f172a] border border-slate-300 transition-all shadow-xl shadow-midnight/10"
                    onClick={() => { copyQuery(previewTemplate.query); setPreviewTemplate(null); }}
                  >
                    Copy & Close
                  </button>
                  <button className="flex-1 py-4 bg-coral text-white rounded-2xl font-bold text-base uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-coral/20">
                    Use in Sourcing
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
