/*
  # Add Pending Price ID to Subdomains

  1. Schema Changes
    - Add `pending_price_id` column to `subdomains` table
    - This will store the price_id that user selected before payment
    - Allows tracking of payment intent (monthly vs annual)

  2. Purpose
    - Track which plan user intended to purchase
    - Enable proper plan display in billing after payment
    - Link payment intent to actual Stripe subscription
*/

-- Add pending_price_id column to subdomains table
ALTER TABLE subdomains 
ADD COLUMN IF NOT EXISTS pending_price_id text DEFAULT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subdomains_pending_price_id ON subdomains(pending_price_id);

-- Add comment to explain the column purpose
COMMENT ON COLUMN subdomains.pending_price_id IS 'Stores the price_id selected by user before payment, cleared after successful payment';