/*
  # Remove Billing History

  1. Drop Table
    - Drop `billing_history` table and all related objects
    - Remove billing_status enum type
    - Clean up any references

  2. Purpose
    - Remove billing history functionality from the application
    - Clean up database schema
*/

-- Drop the billing_history table
DROP TABLE IF EXISTS billing_history CASCADE;

-- Drop the billing_status enum type
DROP TYPE IF EXISTS billing_status CASCADE;

-- Drop any indexes that might still exist
DROP INDEX IF EXISTS idx_billing_history_user_id;
DROP INDEX IF EXISTS idx_billing_history_subdomain_id;