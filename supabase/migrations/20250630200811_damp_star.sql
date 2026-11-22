/*
  # Trial Cleanup Cron Job

  1. New Extension
    - Enable pg_cron extension for scheduled jobs

  2. Scheduled Job
    - Create a cron job that runs every hour to clean up expired trials
    - Calls the trial-cleanup edge function
    - Runs at minute 0 of every hour

  3. Purpose
    - Automatically expire trial subdomains when their trial period ends
    - Remove DNS records for expired trials
    - Keep the database clean and accurate
*/

-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a cron job to run trial cleanup every hour
-- This will call our trial-cleanup edge function
SELECT cron.schedule(
  'trial-cleanup',
  '0 * * * *', -- Run at minute 0 of every hour
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/trial-cleanup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Add comment explaining the cron job
COMMENT ON EXTENSION pg_cron IS 'Enables scheduled jobs for trial cleanup and other maintenance tasks';