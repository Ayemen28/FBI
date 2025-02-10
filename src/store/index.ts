
import { create } from 'zustand';
import { AppState, BotConfig } from '../types';
import { DatabaseManager } from '../db';
import { BotService } from '../services/bot';

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
      const bot = BotService.getInstance();
      await db.checkConnection();
      
      const config = await db.getBotConfig();
      if (config?.token) {
        await bot.initialize(config.token);
        if (config.sourceGroup) {
          await bot.fetchChannelMessages(config.sourceGroup);
        }
      }
      
      const stats = await db.getMessageStats();
      
      set({
        isInstalled: config !== null,
        botConfig: config,
        messages: stats?.total || 0,
        todayMessages: stats?.today || 0
      });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      throw new Error('فشل في الاتصال بقاعدة البيانات');
    }
  }
}));
