/*
  # Fix Stripe User Subscriptions View

  1. Database Changes
    - Drop existing stripe_user_subscriptions view
    - Recreate view with subdomain_id field included
    - This enables proper linking between subscriptions and subdomains

  2. Purpose
    - Allow billing page to correctly match subscriptions to specific subdomains
    - Include subdomain_id in the view for accurate subscription data display
*/

-- Drop the existing view
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Recreate the view with subdomain_id included
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4,
    s.subdomain_id
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

-- Grant access to authenticated users
GRANT SELECT ON stripe_user_subscriptions TO authenticated;

-- Add comment explaining the view
COMMENT ON VIEW stripe_user_subscriptions IS 'User subscription data with subdomain linking for billing page';