import { create } from 'zustand';

interface AppState {
  themeMode: 'recruiter' | 'hunter' | 'universal' | null;
  backgroundImage: string | null;
  showProfilePicture: boolean;
  setBackgroundImage: (url: string) => void;
  setShowProfilePicture: (show: boolean) => void;
  setThemeMode: (mode: 'recruiter' | 'hunter' | 'universal' | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  themeMode: null, // null means they are at the Nexus Gate
  backgroundImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  showProfilePicture: true,
  setBackgroundImage: (url) => set({ backgroundImage: url }),
  setShowProfilePicture: (show) => set({ showProfilePicture: show }),
  setThemeMode: (mode) => set({ themeMode: mode }),
}));
