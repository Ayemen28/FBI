
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

  public async addChannel(username: string): Promise<Channel | null> {
    try {
      if (!this.token) return null;
      const response = await fetch(`https://api.telegram.org/bot${this.token}/getChat?chat_id=@${username}`);
      const data = await response.json();
      
      if (data.ok) {
        const channel: Channel = {
          id: data.result.id.toString(),
          username: username,
          title: data.result.title,
          autoResponses: [],
          rules: [],
          filters: [],
          scheduledPosts: [],
          stats: {
            memberCount: 0,
            messageCount: 0,
            activeUsers: 0,
            topPosts: []
          }
        };
        
        const db = DatabaseManager.getInstance();
        await db.addChannel(channel);
        return channel;
      }
      return null;
    } catch (error) {
      console.error('Failed to add channel:', error);
      return null;
    }
  }

  public async sendMessage(channelId: string, text: string): Promise<boolean> {
    try {
      if (!this.token) return false;
      const response = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: channelId,
          text: text,
          parse_mode: 'HTML'
        })
      });
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  public async scheduleMessage(channelId: string, text: string, date: Date): Promise<boolean> {
    try {
      const db = DatabaseManager.getInstance();
      const post: ScheduledPost = {
        id: Date.now().toString(),
        content: text,
        scheduledFor: date.toISOString(),
        status: 'pending'
      };
      await db.schedulePost(channelId, post);
      return true;
    } catch (error) {
      console.error('Failed to schedule message:', error);
      return false;
    }
  }

  public async getChatMembersCount(chatId: string): Promise<number> {
    try {
      if (!this.token) return 0;
      // Ensure chatId is properly formatted
      const formattedChatId = chatId.startsWith('-100') ? chatId : `-100${chatId.replace(/[^0-9]/g, '')}`;
      const response = await fetch(`https://api.telegram.org/bot${this.token}/getChatMembersCount?chat_id=${formattedChatId}`);
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
      // Ensure chatId is properly formatted
      const formattedChatId = chatId.startsWith('-100') ? chatId : `-100${chatId.replace(/[^0-9]/g, '')}`;
      const response = await fetch(`https://api.telegram.org/bot${this.token}/getChatAdministrators?chat_id=${formattedChatId}`);
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
