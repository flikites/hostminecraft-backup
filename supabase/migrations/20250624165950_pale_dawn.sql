/*
  # User Profiles and Subdomains Schema

  1. New Tables
    - `user_profiles`: User profile information
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, not null)
      - `full_name` (text, nullable)
      - `avatar_url` (text, nullable)
      - Timestamps for created_at and updated_at

    - `subdomains`: Subdomain management
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `subdomain` (text, unique)
      - `minecraft_server_ip` (text)
      - `minecraft_server_port` (integer, default 25565)
      - `status` (enum: active, trial, cancelled, expired)
      - `trial_ends_at` (timestamp, nullable)
      - `stripe_subscription_id` (text, nullable)
      - `cloudflare_record_id` (text, nullable)
      - Timestamps for created_at and updated_at

    - `billing_history`: Payment history
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `subdomain_id` (uuid, references subdomains)
      - `amount` (integer, in cents)
      - `currency` (text, default 'usd')
      - `stripe_payment_intent_id` (text)
      - `status` (enum: pending, completed, failed, refunded)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create subdomain status enum
CREATE TYPE subdomain_status AS ENUM ('active', 'trial', 'cancelled', 'expired');

-- Create subdomains table
CREATE TABLE IF NOT EXISTS subdomains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  subdomain text UNIQUE NOT NULL,
  minecraft_server_ip text NOT NULL,
  minecraft_server_port integer DEFAULT 25565,
  status subdomain_status DEFAULT 'trial',
  trial_ends_at timestamptz,
  stripe_subscription_id text,
  cloudflare_record_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subdomains"
  ON subdomains
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subdomains"
  ON subdomains
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subdomains"
  ON subdomains
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own subdomains"
  ON subdomains
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create billing status enum
CREATE TYPE billing_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Create billing history table
CREATE TABLE IF NOT EXISTS billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  subdomain_id uuid REFERENCES subdomains(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  currency text DEFAULT 'usd',
  stripe_payment_intent_id text NOT NULL,
  status billing_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own billing history"
  ON billing_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subdomains_user_id ON subdomains(user_id);
CREATE INDEX IF NOT EXISTS idx_subdomains_status ON subdomains(status);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subdomain_id ON billing_history(subdomain_id);