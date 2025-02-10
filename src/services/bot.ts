
import TelegramBot from 'node-telegram-bot-api';
import { DatabaseManager } from '../db';

export class BotService {
  private static instance: BotService;
  private bot: TelegramBot | null = null;

  private constructor() {}

  public static getInstance(): BotService {
    if (!BotService.instance) {
      BotService.instance = new BotService();
    }
    return BotService.instance;
  }

  public async initialize(token: string): Promise<boolean> {
    try {
      this.bot = new TelegramBot(token, { polling: true });
      this.setupEventListeners();
      return true;
    } catch (error) {
      console.error('Failed to initialize bot:', error);
      return false;
    }
  }

  private setupEventListeners() {
    if (!this.bot) return;

    this.bot.on('message', async (msg) => {
      const db = DatabaseManager.getInstance();
      await db.saveMessage({
        source_message_id: msg.message_id,
        source_chat_id: String(msg.chat.id),
        target_chat_id: '',
        content: msg.text || '',
        status: 'received'
      });
    });

    this.bot.on('edited_message', async (msg) => {
      // Handle edited messages
    });

    this.bot.on('delete_message', async (msg) => {
      // Handle deleted messages
    });
  }

  public async getChatMembersCount(chatId: string): Promise<number> {
    try {
      if (!this.bot) return 0;
      const count = await this.bot.getChatMembersCount(chatId);
      return count;
    } catch (error) {
      console.error('Failed to get members count:', error);
      return 0;
    }
  }

  public async getAdministrators(chatId: string): Promise<TelegramBot.ChatMember[]> {
    try {
      if (!this.bot) return [];
      return await this.bot.getChatAdministrators(chatId);
    } catch (error) {
      console.error('Failed to get administrators:', error);
      return [];
    }
  }
}
