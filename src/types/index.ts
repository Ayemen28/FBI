export interface InstallationState {
  step: number;
  isComplete: boolean;
  token?: string;
  sourceGroup?: string;
  targetGroup?: string;
}

export interface BotConfig {
  token: string;
  sourceGroup: string;
  targetGroup: string;
  isActive: boolean;
  welcomeMessage?: string;
  rulesMessage?: string;
  autoDeleteJoinMessages?: boolean;
  antiSpam?: boolean;
  antiFlood?: boolean;
  maxWarnings?: number;
}

export interface UserActivity {
  userId: number;
  username: string;
  messageCount: number;
  lastActive: string;
  warnings: number;
  status: 'active' | 'restricted' | 'banned';
  joinDate: string;
}

export interface MessageStats {
  total: number;
  today: number;
  media: number;
  text: number;
  deleted: number;
}

export interface GroupMember {
  userId: number;
  username: string;
  firstName: string;
  lastName?: string;
  isAdmin: boolean;
  joinDate: string;
  permissions: string[];
}

export interface AppState {
  isInstalled: boolean;
  botConfig: BotConfig | null;
  messages: number;
  todayMessages: number;
  activeUsers: number;
  bannedUsers: number;
}