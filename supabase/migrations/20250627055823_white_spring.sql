/*
  # Per-Domain Billing Migration

  1. Schema Changes
    - Remove UNIQUE constraint on customer_id in stripe_subscriptions
    - Add UNIQUE constraint on subscription_id in stripe_subscriptions
    - Add pending_payment status to subdomain_status enum
    - Add subdomain_id column to stripe_subscriptions

  2. Security
    - Update RLS policies to work with new schema
*/

-- Add pending_payment status to subdomain_status enum
ALTER TYPE subdomain_status ADD VALUE IF NOT EXISTS 'pending_payment';

-- Remove the unique constraint on customer_id in stripe_subscriptions
ALTER TABLE stripe_subscriptions DROP CONSTRAINT IF EXISTS stripe_subscriptions_customer_id_key;

-- Add unique constraint on subscription_id (allowing NULL values)
CREATE UNIQUE INDEX IF NOT EXISTS stripe_subscriptions_subscription_id_key 
ON stripe_subscriptions (subscription_id) 
WHERE subscription_id IS NOT NULL;

-- Add subdomain_id column to link subscriptions to specific subdomains
ALTER TABLE stripe_subscriptions 
ADD COLUMN IF NOT EXISTS subdomain_id uuid REFERENCES subdomains(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subdomain_id ON stripe_subscriptions(subdomain_id);

-- Update RLS policy for stripe_subscriptions to handle multiple subscriptions per customer
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        (customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        ) OR subdomain_id IN (
            SELECT id
            FROM subdomains
            WHERE user_id = auth.uid()
        ))
        AND deleted_at IS NULL
    );