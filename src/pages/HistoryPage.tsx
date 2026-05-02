import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSearch, 
  UserPlus, 
  HardDrive, 
  Star, 
  Trash2, 
  ChevronRight, 
  Download,
  Filter,
  Search,
  MoreVertical,
  Briefcase,
  FileText
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

type FilterType = 'all' | 'saved' | 'analyses' | 'searches';

interface HistoryItem {
  id: string;
  type: 'analysis' | 'search';
  title: string;
  date: string;
  detail: string;
  isSaved: boolean;
  score?: number;
}

const mockHistory: HistoryItem[] = [
  { id: '1', type: 'analysis', title: 'Resume Analysis: David Chen', date: '2 hours ago', detail: 'Principal Engineer (Cloud)', isSaved: true, score: 88 },
  { id: '2', type: 'search', title: 'Staff Designer SF/Remote', date: '5 hours ago', detail: 'Boolean String Generation', isSaved: false },
  { id: '3', type: 'analysis', title: 'Resume Analysis: Sarah Miller', date: 'Yesterday', detail: 'Snr Product Manager', isSaved: true, score: 72 },
  { id: '4', type: 'search', title: 'Rust Blockchain Specialist', date: 'May 1', detail: 'X-Ray Search (GitHub)', isSaved: false },
  { id: '5', type: 'search', title: 'Growth Marketer EMEA', date: 'April 30', detail: 'Boolean String Generation', isSaved: true },
  { id: '6', type: 'analysis', title: 'Resume Analysis: Michael Wu', date: 'April 29', detail: 'Data Scientist (NLP)', isSaved: false, score: 94 },
];

export default function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [items, setItems] = useState<HistoryItem[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item => {
    const matchesFilter = 
      activeFilter === 'all' || 
      (activeFilter === 'saved' && item.isSaved) ||
      (activeFilter === 'analyses' && item.type === 'analysis') ||
      (activeFilter === 'searches' && item.type === 'search');
    
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.detail.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const toggleSave = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isSaved: !item.isSaved } : item));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-midnight italic">Archive & Intelligence</h2>
          <p className="text-midnight/60 font-medium">Review your historical analyses and generated search strings.</p>
        </div>
        <div className="flex bg-midnight text-white px-6 py-3 rounded-2xl gap-8 shadow-xl shadow-midnight/10 border border-white/5">
          <div className="text-center">
            <span className="block text-xl font-serif font-bold">1.2k</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Total</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-xl font-serif font-bold">245</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Saved</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <span className="block text-xl font-serif font-bold">82%</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">Avg IQ</span>
          </div>
        </div>
      </header>

      <div className="bg-white p-6 rounded-[2.5rem] border border-midnight/5 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between border-b border-midnight/5 pb-6">
          <div className="flex bg-warm-gray p-1 rounded-full border border-midnight/5">
            {(['all', 'saved', 'analyses', 'searches'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={cn(
                  "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeFilter === f ? "bg-midnight text-white shadow-lg" : "text-midnight/40 hover:text-midnight/60"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-warm-gray px-4 py-2.5 rounded-full border border-midnight/5 w-full md:w-80">
            <Search className="w-4 h-4 text-midnight/30" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archive..."
              className="bg-transparent border-none outline-none text-xs font-bold w-full"
            />
          </div>
        </div>

        <div className="space-y-2 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                key={item.id}
                className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-warm-gray transition-all cursor-pointer border border-transparent hover:border-midnight/5"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                  item.type === 'analysis' ? "bg-indigo-electric/10 text-indigo-electric group-hover:bg-indigo-electric group-hover:text-white" : "bg-coral/10 text-coral group-hover:bg-coral group-hover:text-white"
                )}>
                  {item.type === 'analysis' ? <FileText className="w-6 h-6" /> : <Briefcase className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <h4 className="text-sm font-bold text-midnight truncate">{item.title}</h4>
                    {item.score && (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-electric/10 text-indigo-electric text-[9px] font-bold">
                        {item.score}% Match
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-midnight/40 font-bold uppercase tracking-widest">{item.detail} • {item.date}</p>
                </div>

                <div className="flex items-center gap-2 pr-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleSave(item.id); }}
                    className={cn(
                      "p-2.5 rounded-xl transition-all",
                      item.isSaved ? "bg-amber-50 text-amber-500" : "text-midnight/10 hover:bg-midnight/5 hover:text-midnight/30"
                    )}
                  >
                    <Star className={cn("w-5 h-5", item.isSaved && "fill-amber-500")} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    className="p-2.5 rounded-xl text-midnight/10 hover:bg-red-50 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="w-px h-6 bg-midnight/5 mx-2" />
                  <button className="p-2.5 rounded-xl text-midnight/10 hover:bg-white hover:text-midnight transition-all">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-warm-gray flex items-center justify-center mx-auto mb-4">
                <HardDrive className="w-8 h-8 text-midnight/20" />
              </div>
              <p className="text-sm font-serif font-bold text-midnight/40 italic">No historical data found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
