/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';

export interface CasReflection {
  id: string;
  date: string;
  moodBefore: string;
  moodAfter: string;
  notes: string;
}

export type TabType = 'home' | 'slime' | 'sand' | 'bubble' | 'fluid' | 'pebble';

interface MindSpaceState {
  // Navigation / Tabs
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Session stats (synchronized to localStorage)
  minutesSpent: number;
  favoriteWidget: string;
  visitsCount: number;
  completedBreaks: number;
  bubblePops: number;
  highPebbleStack: number;
  unlockedFivePop: boolean; // 50 pops
  unlockedHundredPop: boolean; // 100 pops
  unlockedFiveHundredPop: boolean; // 500 pops
  reflections: CasReflection[];
  soundEnabled: boolean;
  ambientEnabled: boolean;
  theme: 'light' | 'dark';

  // State actions
  incrementMinSpent: (qty: number) => void;
  incrementVisits: () => void;
  incrementCompletedBreaks: () => void;
  addBubblePops: (qty: number) => void;
  updateHighPebbleStack: (height: number) => void;
  setFavoriteWidget: (name: string) => void;
  addReflection: (notes: string, moodBefore: string, moodAfter: string) => void;
  deleteReflection: (id: string) => void;
  toggleSound: () => void;
  toggleAmbient: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetAllStats: () => void;
}

// Load initial values from localStorage helper
const getStored = (key: string, fallback: any) => {
  try {
    const val = localStorage.getItem(`mindspace_${key}`);
    if (val !== null) return JSON.parse(val);
  } catch (e) {
    console.error("Failed to load local storage:", e);
  }
  return fallback;
};

// Save helper
const saveStored = (key: string, value: any) => {
  try {
    localStorage.setItem(`mindspace_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to write local storage:", e);
  }
};

export const useStore = create<MindSpaceState>((set) => ({
  activeTab: 'home',
  setActiveTab: (tab) => {
    set({ activeTab: tab });
    if (tab !== 'home') {
      // Dynamic increment of favorite widget score or updates
      set((state) => {
        const counts = { ...getStored('widget_views', { slime: 0, sand: 0, bubble: 0, fluid: 0, pebble: 0 }) };
        counts[tab as keyof typeof counts] = (counts[tab as keyof typeof counts] || 0) + 1;
        saveStored('widget_views', counts);

        // Calculate favorite
        let maxView = 0;
        let favName = 'NoneYet';
        const labels: Record<string, string> = {
          slime: 'Slime Simulator',
          sand: 'Zen Sand Garden',
          bubble: 'Bubble Wrap Popper',
          fluid: 'Fluid Color Playground',
          pebble: 'Pebble Stacker'
        };
        for (const [k, v] of Object.entries(counts)) {
          if ((v as number) > maxView) {
            maxView = v as number;
            favName = labels[k] || k;
          }
        }
        saveStored('favoriteWidget', favName);
        return { favoriteWidget: favName };
      });
    }
  },

  // State values initialized from store
  minutesSpent: getStored('minutesSpent', 0),
  favoriteWidget: getStored('favoriteWidget', 'None Yet'),
  visitsCount: getStored('visitsCount', 0),
  completedBreaks: getStored('completedBreaks', 0),
  bubblePops: getStored('bubblePops', 0),
  highPebbleStack: getStored('highPebbleStack', 0),
  unlockedFivePop: getStored('unlockedFivePop', false),
  unlockedHundredPop: getStored('unlockedHundredPop', false),
  unlockedFiveHundredPop: getStored('unlockedFiveHundredPop', false),
  reflections: getStored('reflections', []),
  soundEnabled: getStored('soundEnabled', true),
  ambientEnabled: getStored('ambientEnabled', false),
  theme: getStored('theme', 'dark'),

  // Actions
  incrementMinSpent: (qty) => set((state) => {
    const nextVal = Math.round((state.minutesSpent + qty) * 100) / 100;
    saveStored('minutesSpent', nextVal);
    return { minutesSpent: nextVal };
  }),

  incrementVisits: () => set((state) => {
    const nextVal = state.visitsCount + 1;
    saveStored('visitsCount', nextVal);
    return { visitsCount: nextVal };
  }),

  incrementCompletedBreaks: () => set((state) => {
    const nextVal = state.completedBreaks + 1;
    saveStored('completedBreaks', nextVal);
    // Give 2 min relaxation credit as well
    const extraMinutes = 1.5; // average break length
    const mSpent = Math.round((state.minutesSpent + extraMinutes) * 100) / 100;
    saveStored('minutesSpent', mSpent);
    return { completedBreaks: nextVal, minutesSpent: mSpent };
  }),

  addBubblePops: (qty) => set((state) => {
    const pops = state.bubblePops + qty;
    saveStored('bubblePops', pops);

    const fFive = pops >= 50 ? true : state.unlockedFivePop;
    const fHun = pops >= 100 ? true : state.unlockedHundredPop;
    const fFiveH = pops >= 500 ? true : state.unlockedFiveHundredPop;

    if (fFive !== state.unlockedFivePop) saveStored('unlockedFivePop', fFive);
    if (fHun !== state.unlockedHundredPop) saveStored('unlockedHundredPop', fHun);
    if (fFiveH !== state.unlockedFiveHundredPop) saveStored('unlockedFiveHundredPop', fFiveH);

    return {
      bubblePops: pops,
      unlockedFivePop: fFive,
      unlockedHundredPop: fHun,
      unlockedFiveHundredPop: fFiveH
    };
  }),

  updateHighPebbleStack: (height) => set((state) => {
    if (height > state.highPebbleStack) {
      saveStored('highPebbleStack', height);
      return { highPebbleStack: height };
    }
    return {};
  }),

  setFavoriteWidget: (name) => set(() => {
    saveStored('favoriteWidget', name);
    return { favoriteWidget: name };
  }),

  addReflection: (notes, moodBefore, moodAfter) => set((state) => {
    const newRef: CasReflection = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      moodBefore,
      moodAfter,
      notes
    };
    const nextList = [newRef, ...state.reflections];
    saveStored('reflections', nextList);
    return { reflections: nextList };
  }),

  deleteReflection: (id) => set((state) => {
    const nextList = state.reflections.filter((r) => r.id !== id);
    saveStored('reflections', nextList);
    return { reflections: nextList };
  }),

  toggleSound: () => set((state) => {
    const nextVal = !state.soundEnabled;
    saveStored('soundEnabled', nextVal);
    return { soundEnabled: nextVal };
  }),

  toggleAmbient: () => set((state) => {
    const nextVal = !state.ambientEnabled;
    saveStored('ambientEnabled', nextVal);
    return { ambientEnabled: nextVal };
  }),

  setTheme: (theme) => set(() => {
    saveStored('theme', theme);
    return { theme };
  }),

  resetAllStats: () => set(() => {
    localStorage.clear();
    return {
      minutesSpent: 0,
      favoriteWidget: 'None Yet',
      visitsCount: 1,
      completedBreaks: 0,
      bubblePops: 0,
      highPebbleStack: 0,
      unlockedFivePop: false,
      unlockedHundredPop: false,
      unlockedFiveHundredPop: false,
      reflections: [],
      soundEnabled: true,
      ambientEnabled: false,
      theme: 'dark'
    };
  })
}));
