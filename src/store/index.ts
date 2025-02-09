import { create } from 'zustand';
import { AppState, BotConfig } from '../types';
import { DatabaseManager } from '../db';

interface AppStore extends AppState {
  setInstalled: (value: boolean) => void;
  setBotConfig: (config: BotConfig) => void;
  updateMessageStats: (total: number, today: number) => void;
  initializeStore: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set) => ({
  isInstalled: false,
  botConfig: null,
  messages: 0,
  todayMessages: 0,
  setInstalled: (value) => set({ isInstalled: value }),
  setBotConfig: (config) => set({ botConfig: config }),
  updateMessageStats: (total, today) => set({ messages: total, todayMessages: today }),
  initializeStore: async () => {
    try {
      const db = DatabaseManager.getInstance();
      const config = await db.getBotConfig();
      const stats = await db.getMessageStats();
      
      set({
        isInstalled: config !== null,
        botConfig: config,
        messages: stats.total,
        todayMessages: stats.today
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
    }
  }
}));