export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: IDBDatabase | null = null;
  private dbName = 'botDashboard';
  private dbVersion = 3;
  private dbReady: Promise<void>;

  private constructor() {
    this.dbReady = this.initializeDatabase();
  }

  public async checkConnection(): Promise<boolean> {
    try {
      await this.ensureDbReady();
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }

  public async fetchChannelData(channelId: string) {
    try {
      const store = await this.getStore('messages', 'readwrite');
      return new Promise((resolve, reject) => {
        const request = store.index('source_chat_id').getAll(channelId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error fetching channel data:', error);
      return [];
    }
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create bot_configs store
        if (!db.objectStoreNames.contains('bot_configs')) {
          const botConfigsStore = db.createObjectStore('bot_configs', { keyPath: 'id' });
          botConfigsStore.createIndex('created_at', 'created_at');
          botConfigsStore.createIndex('is_active', 'is_active');
        }

        // Create messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
          messagesStore.createIndex('processed_at', 'processed_at');
          messagesStore.createIndex('status', 'status');
          messagesStore.createIndex('source_chat_id', 'source_chat_id');
          messagesStore.createIndex('target_chat_id', 'target_chat_id');
        }

        // Create users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('username', 'username');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
    });
  }

  private async ensureDbReady() {
    try {
      await this.dbReady;
      if (!this.db) {
        throw new Error('Database not initialized');
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      throw new Error('فشل في تهيئة قاعدة البيانات');
    }
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly') {
    await this.ensureDbReady();
    const transaction = this.db!.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  public async addChannel(channel: Channel) {
    const store = await this.getStore('channels', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(channel);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getChannel(channelId: string) {
    const store = await this.getStore('channels');
    return new Promise((resolve, reject) => {
      const request = store.get(channelId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getAllChannels() {
    const store = await this.getStore('channels');
    return new Promise<Channel[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async updateChannelSettings(channelId: string, settings: Partial<Channel>) {
    const store = await this.getStore('channels', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.get(channelId);
      request.onsuccess = () => {
        const channel = request.result;
        if (channel) {
          const updatedChannel = { ...channel, ...settings };
          store.put(updatedChannel).onsuccess = () => resolve(true);
        } else {
          reject(new Error('Channel not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async addAutoResponse(channelId: string, response: AutoResponse) {
    const store = await this.getStore('channels', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.get(channelId);
      request.onsuccess = () => {
        const channel = request.result;
        if (channel) {
          channel.autoResponses = [...(channel.autoResponses || []), response];
          store.put(channel).onsuccess = () => resolve(true);
        } else {
          reject(new Error('Channel not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async schedulePost(channelId: string, post: ScheduledPost) {
    const store = await this.getStore('channels', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.get(channelId);
      request.onsuccess = () => {
        const channel = request.result;
        if (channel) {
          channel.scheduledPosts = [...(channel.scheduledPosts || []), post];
          store.put(channel).onsuccess = () => resolve(true);
        } else {
          reject(new Error('Channel not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async getBotConfig() {
    try {
      const store = await this.getStore('bot_configs');
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const configs = request.result;
          resolve(configs[configs.length - 1] || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting bot config:', error);
      return null;
    }
  }

  public async saveBotConfig(config: { token: string; sourceGroup: string; targetGroup: string }) {
    try {
      const store = await this.getStore('bot_configs', 'readwrite');
      const id = crypto.randomUUID();
      const newConfig = {
        id,
        ...config,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return new Promise((resolve, reject) => {
        const request = store.add(newConfig);
        request.onsuccess = () => resolve(newConfig);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error saving bot config:', error);
      throw error;
    }
  }

  public async saveMessage(message: {
    source_message_id: number;
    source_chat_id: string;
    target_chat_id: string;
    content: string;
    status: string;
  }) {
    const store = await this.getStore('messages', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.add({
        ...message,
        processed_at: new Date().toISOString()
      });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getMessageStats() {
    try {
      const store = await this.getStore('messages');
      const total = await this.countMessages();
      const today = await this.countTodayMessages();
      const messageTypes = await this.getMessageTypeStats();
      
      return {
        total,
        today,
        ...messageTypes
      };
    } catch (error) {
      console.error('Error getting message stats:', error);
      return {
        total: 0,
        today: 0,
        media: 0,
        text: 0,
        deleted: 0
      };
    }
  }

  private async countMessages(): Promise<number> {
    const store = await this.getStore('messages');
    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async countTodayMessages(): Promise<number> {
    const store = await this.getStore('messages');
    const today = new Date().toISOString().split('T')[0];
    const index = store.index('processed_at');
    const range = IDBKeyRange.bound(
      today + 'T00:00:00.000Z',
      today + 'T23:59:59.999Z'
    );
    
    return new Promise((resolve, reject) => {
      const request = index.count(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getMessageTypeStats() {
    const store = await this.getStore('messages');
    const messages = await new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return {
      media: messages.filter(m => m.content.includes('media')).length,
      text: messages.filter(m => !m.content.includes('media')).length,
      deleted: messages.filter(m => m.status === 'deleted').length
    };
  }

  public async saveUser(user: {
    userId: number;
    username: string;
    firstName: string;
    lastName: string;
    isAdmin: boolean;
    permissions: string[];
    joinDate: string;
  }) {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(user);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async getUsers() {
    const store = await this.getStore('users');
    return new Promise<any[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  public async updateUserStatus(userId: number, status: string) {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => {
        const user = request.result;
        if (user) {
          user.status = status;
          store.put(user).onsuccess = () => resolve(true);
        } else {
          reject(new Error('User not found'));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  public async deleteUser(userId: number) {
    const store = await this.getStore('users', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(userId);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }
}