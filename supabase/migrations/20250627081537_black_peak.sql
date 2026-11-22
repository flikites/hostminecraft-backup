/*
  # Add unique identifier for subdomain payment tracking

  1. Schema Changes
    - Add `unique_id` column to `subdomains` table
    - This will be used to track subdomains through the payment process
    - Generate unique IDs for existing subdomains

  2. Purpose
    - Ensure proper linking between pending subdomains and Stripe payments
    - Provide a stable identifier that persists through the payment flow
*/

-- Add unique_id column to subdomains table
ALTER TABLE subdomains 
ADD COLUMN IF NOT EXISTS unique_id text UNIQUE DEFAULT gen_random_uuid()::text;

-- Update existing subdomains to have unique IDs if they don't already
UPDATE subdomains 
SET unique_id = gen_random_uuid()::text 
WHERE unique_id IS NULL;

-- Make unique_id NOT NULL after populating existing records
ALTER TABLE subdomains 
ALTER COLUMN unique_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subdomains_unique_id ON subdomains(unique_id);

-- Add comment to explain the column purpose
COMMENT ON COLUMN subdomains.unique_id IS 'Unique identifier for tracking subdomains through payment process';