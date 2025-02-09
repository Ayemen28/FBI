export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: IDBDatabase | null = null;
  private dbName = 'botDashboard';
  private dbVersion = 1;
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
        const request = store.index('channel_id').getAll(channelId);
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
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('processed_at', 'processed_at', { unique: false });
          messagesStore.createIndex('status', 'status', { unique: false });
          messagesStore.createIndex('channel_id', 'channel_id', { unique: false });
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

  public async getMessageStats() {
    try {
      const store = await this.getStore('messages');
      return new Promise<{ total: number; today: number }>((resolve, reject) => {
        const request = store.count();
        request.onsuccess = () => {
          const total = request.result;
          const today = new Date().toISOString().split('T')[0];
          
          // Count today's messages
          const index = store.index('processed_at');
          const range = IDBKeyRange.bound(
            today + 'T00:00:00.000Z',
            today + 'T23:59:59.999Z'
          );
          
          const todayRequest = index.count(range);
          todayRequest.onsuccess = () => {
            resolve({
              total,
              today: todayRequest.result
            });
          };
          todayRequest.onerror = () => reject(todayRequest.error);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting message stats:', error);
      return { total: 0, today: 0 };
    }
  }
}