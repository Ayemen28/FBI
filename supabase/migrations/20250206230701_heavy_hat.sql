/*
  # Initial Schema Setup for Telegram Bot Manager

  1. New Tables
    - `bot_configs`
      - Stores bot configuration including tokens and group IDs
    - `messages`
      - Stores message history and processing status
    - `users`
      - Stores admin users who can access the dashboard
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Bot Configurations Table
CREATE TABLE IF NOT EXISTS bot_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL,
  source_group text NOT NULL,
  target_group text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Messages History Table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_message_id bigint NOT NULL,
  target_message_id bigint,
  source_chat_id text NOT NULL,
  target_chat_id text NOT NULL,
  content text NOT NULL,
  processed_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  error_message text
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Enable Row Level Security
ALTER TABLE bot_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Allow authenticated read access to bot_configs"
  ON bot_configs FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to bot_configs"
  ON bot_configs FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to messages"
  ON messages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_processed_at ON messages(processed_at);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_bot_configs_is_active ON bot_configs(is_active);