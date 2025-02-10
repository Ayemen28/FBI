
import type TelegramBot from 'node-telegram-bot-api';
import { DatabaseManager } from '../db';

export class BotService {
  private static instance: BotService;
  private token: string | null = null;
  private channelMessages: any[] = [];

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

  public async fetchChannelMessages(chatId: string): Promise<any[]> {
    try {
      if (!this.token) return [];
      const response = await fetch(`https://api.telegram.org/bot${this.token}/getUpdates?chat_id=${chatId}&limit=100`);
      const data = await response.json();
      
      if (data.ok) {
        const messages = data.result.filter((update: any) => update.message && update.message.chat.id.toString() === chatId);
        this.channelMessages = messages.map((update: any) => ({
          message_id: update.message.message_id,
          text: update.message.text || '',
          date: new Date(update.message.date * 1000).toISOString(),
          from: update.message.from.username || update.message.from.first_name,
          type: update.message.photo ? 'photo' : update.message.video ? 'video' : 'text'
        }));
        
        // Store messages in database
        const db = DatabaseManager.getInstance();
        for (const message of this.channelMessages) {
          await db.saveMessage({
            source_message_id: message.message_id,
            source_chat_id: chatId,
            target_chat_id: chatId,
            content: message.text,
            status: 'active'
          });
        }
        
        return this.channelMessages;
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }
}
