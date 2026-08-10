import { create } from 'zustand';

export type Theme = 'dark' | 'dim';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'dark' ? 'dim' : 'dark',
    })),
}));
