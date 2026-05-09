import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, User, CheckCircle2, ShieldOff, ShieldCheck, X } from 'lucide-react';
import { useAppStore } from '../store';
import { GlassCard } from './ui/GlassCard';

export function ThemeSettings({ onClose }: { onClose: () => void }) {
  const { backgroundImage, showProfilePicture, setBackgroundImage, setShowProfilePicture } = useAppStore();
  
  const presets = [
    { id: 'default', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', label: 'Royal Abstract' },
    { id: 'superhero', url: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?q=80&w=2564&auto=format&fit=crop', label: 'Dark Knight' },
    { id: 'fluid', url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=2564&auto=format&fit=crop', label: 'Liquid Gold' },
    { id: 'neon', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2564&auto=format&fit=crop', label: 'Cyber Pulse' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-midnight/40 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg"
      >
        <GlassCard intensity="heavy" className="p-8 relative border-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-400 hover:text-midnight transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-3xl font-serif font-bold text-midnight italic mb-8">Theme Settings</h2>
          
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-electric" />
                <h3 className="font-bold text-lg text-midnight tracking-tight">Background Aura</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setBackgroundImage(preset.url)}
                    className={`relative h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                      backgroundImage === preset.url ? 'border-indigo-electric shadow-lg' : 'border-transparent hover:border-white/50'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 to-transparent flex items-end p-3">
                      <span className="text-white text-xs font-bold uppercase tracking-wider">{preset.label}</span>
                    </div>
                    {backgroundImage === preset.url && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-electric rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-coral" />
                <h3 className="font-bold text-lg text-midnight tracking-tight">Profile Privacy</h3>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60">
                <div className="flex items-start gap-3">
                  {showProfilePicture ? <ShieldOff className="w-5 h-5 text-slate-500 mt-0.5" /> : <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />}
                  <div>
                    <span className="block font-bold text-midnight">Reduce Visual Bias</span>
                    <span className="text-sm text-slate-500">Hide LinkedIn profile pictures globally</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={!showProfilePicture}
                    onChange={(e) => setShowProfilePicture(!e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
            
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
