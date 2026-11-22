/*
  # Public Subdomain Count Access

  1. New Function
    - `get_subdomain_count()`: Returns total count of subdomains
    - Accessible to both authenticated and anonymous users
    - Uses SECURITY DEFINER to bypass RLS for counting only
    - Does not expose any sensitive subdomain data

  2. Security
    - Function only returns a count, no actual subdomain data
    - Uses SECURITY DEFINER with owner privileges to count records
    - No user data is exposed to anonymous users
*/

-- Create a secure function to get subdomain count that bypasses RLS
CREATE OR REPLACE FUNCTION get_subdomain_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM subdomains;
$$;

-- Grant execute permission to both authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_subdomain_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_subdomain_count() TO anon;

-- Add comment explaining the function
COMMENT ON FUNCTION get_subdomain_count() IS 'Returns total count of subdomains. Accessible to all users for displaying availability counter.';