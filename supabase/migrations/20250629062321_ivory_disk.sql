/*
  # Fix Stripe Subscriptions Constraint Issues

  1. Database Fixes
    - Ensure proper unique constraint on subscription_id exists
    - Add proper indexes for performance
    - Fix any constraint naming issues

  2. Purpose
    - Resolve "no unique or exclusion constraint matching the ON CONFLICT specification" error
    - Ensure webhook can properly upsert subscription data
*/

-- Drop existing constraint if it exists with wrong name
DROP INDEX IF EXISTS stripe_subscriptions_subscription_id_key;

-- Create proper unique constraint on subscription_id (allowing NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS stripe_subscriptions_subscription_id_key 
ON stripe_subscriptions (subscription_id) 
WHERE subscription_id IS NOT NULL;

-- Ensure we have proper indexes
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subdomain_id ON stripe_subscriptions(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_status ON stripe_subscriptions(status);

-- Add a composite index for better query performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_status 
ON stripe_subscriptions(customer_id, status) 
WHERE deleted_at IS NULL;