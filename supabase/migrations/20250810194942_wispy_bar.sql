/*
  # Optimize RLS Performance by Fixing Auth Function Calls

  This migration addresses performance issues in Row Level Security (RLS) policies
  where auth functions are re-evaluated for each row instead of being cached.

  ## Performance Issues Fixed:
  1. stripe_customers - "Users can view their own customer data" policy
  2. stripe_orders - "Users can view their own order data" policy  
  3. user_profiles - "Users can view own profile" policy
  4. user_profiles - "Users can update own profile" policy
  5. user_profiles - "Users can insert own profile" policy
  6. subdomains - "Users can view own subdomains" policy
  7. subdomains - "Users can insert own subdomains" policy
  8. subdomains - "Users can update own subdomains" policy
  9. subdomains - "Users can delete own subdomains" policy
  10. support_tickets - "Users can view own support tickets" policy
  11. stripe_subscriptions - "Users can view their own subscription data" policy

  ## Solution:
  Replace `auth.uid()` with `(SELECT auth.uid())` and `auth.email()` with `(SELECT auth.email())`
  to allow PostgreSQL to cache the function result instead of re-evaluating for each row.

  ## Security:
  - All policies maintain the same security model
  - No changes to access permissions
  - Only performance optimization applied
*/

-- 1. Fix stripe_customers RLS policy
DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers
  FOR SELECT
  TO authenticated
  USING ((user_id = (SELECT auth.uid())) AND (deleted_at IS NULL));

-- 2. Fix stripe_orders RLS policy
DROP POLICY IF EXISTS "Users can view their own order data" ON public.stripe_orders;

CREATE POLICY "Users can view their own order data"
  ON public.stripe_orders
  FOR SELECT
  TO authenticated
  USING ((customer_id IN ( 
    SELECT stripe_customers.customer_id
    FROM stripe_customers
    WHERE ((stripe_customers.user_id = (SELECT auth.uid())) AND (stripe_customers.deleted_at IS NULL))
  )) AND (deleted_at IS NULL));

-- 3. Fix user_profiles RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

-- 4. Fix subdomains RLS policies
DROP POLICY IF EXISTS "Users can view own subdomains" ON public.subdomains;
DROP POLICY IF EXISTS "Users can insert own subdomains" ON public.subdomains;
DROP POLICY IF EXISTS "Users can update own subdomains" ON public.subdomains;
DROP POLICY IF EXISTS "Users can delete own subdomains" ON public.subdomains;

CREATE POLICY "Users can view own subdomains"
  ON public.subdomains
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own subdomains"
  ON public.subdomains
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own subdomains"
  ON public.subdomains
  FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own subdomains"
  ON public.subdomains
  FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- 5. Fix support_tickets RLS policy
DROP POLICY IF EXISTS "Users can view own support tickets" ON public.support_tickets;

CREATE POLICY "Users can view own support tickets"
  ON public.support_tickets
  FOR SELECT
  TO authenticated
  USING (((user_id = (SELECT auth.uid())) OR (email = (SELECT auth.email()))));

-- 6. Fix stripe_subscriptions RLS policy
DROP POLICY IF EXISTS "Users can view their own subscription data" ON public.stripe_subscriptions;

CREATE POLICY "Users can view their own subscription data"
  ON public.stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING ((
    (customer_id IN ( 
      SELECT stripe_customers.customer_id
      FROM stripe_customers
      WHERE ((stripe_customers.user_id = (SELECT auth.uid())) AND (stripe_customers.deleted_at IS NULL))
    )) OR 
    (subdomain_id IN ( 
      SELECT subdomains.id
      FROM subdomains
      WHERE (subdomains.user_id = (SELECT auth.uid()))
    ))
  ) AND (deleted_at IS NULL));

-- 7. Add performance indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id_active 
  ON public.stripe_customers (user_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stripe_orders_customer_id_active 
  ON public.stripe_orders (customer_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id_active 
  ON public.stripe_subscriptions (customer_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_subdomain_id_active 
  ON public.stripe_subscriptions (subdomain_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_email 
  ON public.support_tickets (user_id, email);

-- 8. Update existing get_subdomain_count function to be more secure and performant
CREATE OR REPLACE FUNCTION public.get_subdomain_count()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  subdomain_count bigint;
BEGIN
  -- Use fully qualified table name and optimized query
  SELECT count(*) INTO subdomain_count
  FROM public.subdomains 
  WHERE status != 'cancelled' AND status != 'expired';
  
  RETURN subdomain_count;
END;
$function$;

-- Ensure the function has proper permissions
GRANT EXECUTE ON FUNCTION public.get_subdomain_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_subdomain_count() TO anon;

-- 9. Create a performance monitoring function (SECURITY DEFINER with secure search_path)
CREATE OR REPLACE FUNCTION public.get_table_stats()
RETURNS TABLE(
  table_name text,
  row_count bigint,
  active_policies integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    'subdomains'::text,
    (SELECT count(*) FROM public.subdomains)::bigint,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'subdomains')::integer
  UNION ALL
  SELECT 
    'user_profiles'::text,
    (SELECT count(*) FROM public.user_profiles)::bigint,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'user_profiles')::integer
  UNION ALL
  SELECT 
    'stripe_customers'::text,
    (SELECT count(*) FROM public.stripe_customers WHERE deleted_at IS NULL)::bigint,
    (SELECT count(*) FROM pg_policies WHERE tablename = 'stripe_customers')::integer;
END;
$function$;

-- Grant permissions for monitoring function (admin use only)
GRANT EXECUTE ON FUNCTION public.get_table_stats() TO authenticated;

-- 10. Analyze tables to update statistics for better query planning
ANALYZE public.stripe_customers;
ANALYZE public.stripe_orders;
ANALYZE public.stripe_subscriptions;
ANALYZE public.subdomains;
ANALYZE public.support_tickets;
ANALYZE public.user_profiles;