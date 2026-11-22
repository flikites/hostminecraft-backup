/*
  # Support Tickets Schema

  1. New Tables
    - `support_tickets`: Store support ticket submissions
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for authenticated users)
      - `email` (text, required)
      - `name` (text, required)
      - `subject` (text, required)
      - `message` (text, required)
      - `status` (enum: open, in_progress, resolved, closed)
      - `priority` (enum: low, medium, high, urgent)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on support_tickets table
    - Add policies for users to view their own tickets
    - Add policy for anonymous users to create tickets
*/

-- Create support ticket status enum
CREATE TYPE support_ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Create support ticket priority enum
CREATE TYPE support_ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  email text NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status support_ticket_status DEFAULT 'open',
  priority support_ticket_priority DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to view their own tickets
CREATE POLICY "Users can view own support tickets"
  ON support_tickets
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR email = auth.email());

-- Policy for authenticated users to create tickets
CREATE POLICY "Authenticated users can create support tickets"
  ON support_tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy for anonymous users to create tickets
CREATE POLICY "Anonymous users can create support tickets"
  ON support_tickets
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_email ON support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);