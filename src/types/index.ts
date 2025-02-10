
export interface InstallationState {
  step: number;
  isComplete: boolean;
  token?: string;
  channels?: Channel[];
}

export interface Channel {
  id: string;
  username: string;
  title: string;
  autoResponses: AutoResponse[];
  rules: string[];
  filters: ContentFilter[];
  scheduledPosts: ScheduledPost[];
  stats: ChannelStats;
}

export interface ContentFilter {
  type: 'keyword' | 'regex' | 'ai';
  pattern: string;
  action: 'delete' | 'warn' | 'ban';
}

export interface AutoResponse {
  trigger: string;
  response: string;
  isActive: boolean;
}

export interface ScheduledPost {
  id: string;
  content: string;
  scheduledFor: string;
  mediaUrl?: string;
  status: 'pending' | 'posted' | 'failed';
}

export interface ChannelStats {
  memberCount: number;
  messageCount: number;
  activeUsers: number;
  topPosts: any[];
}

export interface BotConfig {
  token: string;
  channels: Channel[];
  isActive: boolean;
  welcomeMessage?: string;
  rulesMessage?: string;
  autoDeleteJoinMessages?: boolean;
  antiSpam?: boolean;
  antiFlood?: boolean;
  maxWarnings?: number;
  mediaScanEnabled?: boolean;
  linkPreviewEnabled?: boolean;
  userJoinRestriction?: 'none' | 'approval' | 'verification';
  languageFilter?: boolean;
  maxMessagesPerMinute?: number;
  autoArchiveInactive?: boolean;
}

export interface RealtimeAlert {
  id: string;
  type: 'warning' | 'info' | 'error';
  message: string;
  timestamp: string;
  userId?: number;
  channelId?: string;
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
