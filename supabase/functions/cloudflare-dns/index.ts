import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { createDNSRecord, updateDNSRecord, deleteDNSRecord } from '../_shared/cloudflare.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);

    if (getUserError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, subdomain_id, target } = await req.json();

    if (!action || !subdomain_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify subdomain ownership
    const { data: subdomain, error: subdomainError } = await supabase
      .from('subdomains')
      .select('*')
      .eq('id', subdomain_id)
      .eq('user_id', user.id)
      .single();

    if (subdomainError || !subdomain) {
      return new Response(
        JSON.stringify({ error: 'Subdomain not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let result;

    switch (action) {
      case 'create':
        if (!target) {
          return new Response(
            JSON.stringify({ error: 'Target is required for create action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        result = await createDNSRecord(subdomain.subdomain, target);
        if (result.success) {
          // Update subdomain with Cloudflare record ID
          await supabase
            .from('subdomains')
            .update({ cloudflare_record_id: result.record_id })
            .eq('id', subdomain_id);
        }
        break;

      case 'update':
        if (!target || !subdomain.cloudflare_record_id) {
          return new Response(
            JSON.stringify({ error: 'Target and existing record ID required for update' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        result = await updateDNSRecord(subdomain.cloudflare_record_id, subdomain.subdomain, target);
        break;

      case 'delete':
        if (!subdomain.cloudflare_record_id) {
          return new Response(
            JSON.stringify({ error: 'No DNS record found to delete' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
        result = await deleteDNSRecord(subdomain.cloudflare_record_id);
        if (result.success) {
          // Clear Cloudflare record ID from subdomain
          await supabase
            .from('subdomains')
            .update({ cloudflare_record_id: null })
            .eq('id', subdomain_id);
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Cloudflare DNS error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
