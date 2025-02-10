import type TelegramBot from 'node-telegram-bot-api';
import { DatabaseManager } from '../db';

export class BotService {
  private static instance: BotService;
  private token: string | null = null;

  private constructor() {}

  public static getInstance(): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  public async initialize(token: string): Promise<boolean> {
    try {
      this.token = token;
      return true;
    } catch (error) {
      console.error('Failed to initialize bot:', error);
      return false;
    }
  }

  public async getChatMembersCount(chatId: string): Promise<number> {
    try {
      if (!this.token) return 0;
      const response = await fetch(`https://api.telegram.org/bot${this.token}/getChatMembersCount?chat_id=${chatId}`);
      const data = await response.json();
      return data.ok ? data.result : 0;
    } catch (error) {
      console.error('Failed to get members count:', error);
      return 0;
    }
  }

  public async getAdministrators(chatId: string): Promise<any[]> {
    try {
      if (!this.token) return [];
      const response = await fetch(`https://api.telegram.org/bot${this.token}/getChatAdministrators?chat_id=${chatId}`);
      const data = await response.json();
      return data.ok ? data.result : [];
    } catch (error) {
      console.error('Failed to get administrators:', error);
      return [];
    }
  }
}