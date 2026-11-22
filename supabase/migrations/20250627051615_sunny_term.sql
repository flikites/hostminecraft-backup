/*
  # Add Trial Tracking to User Profiles

  1. Schema Changes
    - Add `trial_started_at` column to `user_profiles` table
    - This tracks when a user first started their free trial
    - NULL value means user hasn't used their trial yet

  2. Purpose
    - Prevent users from repeatedly creating/deleting trial subdomains
    - Enforce "one free trial per user" policy
    - Track trial usage at the user level, not subdomain level
*/

-- Add trial_started_at column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS trial_started_at timestamptz DEFAULT NULL;

-- Add comment to explain the column purpose
COMMENT ON COLUMN user_profiles.trial_started_at IS 'Timestamp when user first started their free trial. NULL means trial not yet used.';