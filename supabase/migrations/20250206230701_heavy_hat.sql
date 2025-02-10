
/*
  # Enhanced Schema Setup for Multi-Channel Telegram Bot Manager
*/

-- Channels Table
CREATE TABLE IF NOT EXISTS channels (
  channel_id BIGINT PRIMARY KEY,
  channel_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disabled'))
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  user_id BIGINT PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  join_date TIMESTAMPTZ DEFAULT NOW()
);

-- Admins Table
CREATE TABLE IF NOT EXISTS admins (
  admin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(user_id),
  channel_id BIGINT REFERENCES channels(channel_id),
  role TEXT CHECK (role IN ('owner', 'admin', 'moderator')),
  UNIQUE(user_id, channel_id)
);

-- Scheduled Posts Table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id BIGINT REFERENCES channels(channel_id),
  message TEXT NOT NULL,
  media_url TEXT,
  schedule_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel Settings Table
CREATE TABLE IF NOT EXISTS channel_settings (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id BIGINT REFERENCES channels(channel_id),
  setting_key TEXT NOT NULL,
  setting_value JSONB,
  UNIQUE(channel_id, setting_key)
);

-- User Interactions Table
CREATE TABLE IF NOT EXISTS user_interactions (
  interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(user_id),
  channel_id BIGINT REFERENCES channels(channel_id),
  interaction_type TEXT CHECK (interaction_type IN ('message', 'reply', 'like', 'share')),
  content TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Logs Table
CREATE TABLE IF NOT EXISTS logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(user_id),
  channel_id BIGINT REFERENCES channels(channel_id),
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Auto Responses Table
CREATE TABLE IF NOT EXISTS auto_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id BIGINT REFERENCES channels(channel_id),
  trigger_word TEXT NOT NULL,
  response_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sponsored Posts Table
CREATE TABLE IF NOT EXISTS sponsored_posts (
  ad_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id BIGINT REFERENCES channels(channel_id),
  advertiser_name TEXT NOT NULL,
  ad_text TEXT NOT NULL,
  media_url TEXT,
  schedule_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'posted', 'cancelled')),
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_channel_status ON channels(status);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time ON scheduled_posts(schedule_time);
CREATE INDEX IF NOT EXISTS idx_auto_responses_trigger ON auto_responses(trigger_word);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsored_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow admin access to channels" ON channels FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND channel_id = channels.channel_id));

CREATE POLICY "Allow admin access to channel settings" ON channel_settings FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND channel_id = channel_settings.channel_id));

CREATE POLICY "Allow admin access to scheduled posts" ON scheduled_posts FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid() AND channel_id = scheduled_posts.channel_id));
