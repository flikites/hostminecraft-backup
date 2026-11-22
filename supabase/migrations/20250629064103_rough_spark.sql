/*
  # Webhook Events Tracking

  1. New Table
    - `webhook_events`: Track processed webhook events to prevent duplicates
      - `id` (uuid, primary key)
      - `stripe_event_id` (text, unique) - Stripe's event ID
      - `event_type` (text) - Type of webhook event
      - `processed_at` (timestamp) - When we processed it
      - `created_at` (timestamp) - When record was created

  2. Purpose
    - Prevent duplicate webhook processing
    - Use Stripe's event ID for idempotency
    - Track webhook processing history
*/

-- Create webhook events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- Add comment explaining the table
COMMENT ON TABLE webhook_events IS 'Tracks processed Stripe webhook events to prevent duplicate processing';