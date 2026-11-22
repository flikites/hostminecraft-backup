import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { deleteDNSRecord } from '../_shared/cloudflare.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    console.log('🧹 Starting trial cleanup job...');
    console.log('📅 Current time:', new Date().toISOString());

    // Find all trial subdomains that have expired
    const now = new Date().toISOString();
    console.log('🔍 Searching for expired trials with trial_ends_at < ', now);
    
    const { data: expiredTrials, error: fetchError } = await supabase
      .from('subdomains')
      .select('id, subdomain, cloudflare_record_id, trial_ends_at, status, created_at')
      .eq('status', 'trial')
      .lt('trial_ends_at', now);

    if (fetchError) {
      console.error('❌ Error fetching expired trials:', fetchError);
      console.error('❌ Error details:', JSON.stringify(fetchError, null, 2));
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Failed to fetch expired trials',
          details: fetchError 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`📊 Query completed. Found ${expiredTrials?.length || 0} expired trial(s)`);

    if (!expiredTrials || expiredTrials.length === 0) {
      console.log('✅ No expired trials found - cleanup job completed successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired trials found',
          processed: 0,
          errors: 0,
          total: 0
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('🎯 Expired trials to process:');
    expiredTrials.forEach((trial, index) => {
      console.log(`  ${index + 1}. ${trial.subdomain} (ID: ${trial.id})`);
      console.log(`     - Trial ended: ${trial.trial_ends_at}`);
      console.log(`     - Created: ${trial.created_at}`);
      console.log(`     - DNS Record ID: ${trial.cloudflare_record_id || 'None'}`);
    });

    let processedCount = 0;
    let errorCount = 0;
    const processingResults: Array<{
      subdomain: string;
      id: string;
      dnsSuccess: boolean;
      dbSuccess: boolean;
      error?: string;
    }> = [];

    // Process each expired trial
    for (const trial of expiredTrials) {
      console.log(`\n🔄 Processing expired trial: ${trial.subdomain} (${trial.id})`);
      
      let dnsSuccess = true;
      let dbSuccess = false;
      let processingError: string | undefined;

      try {
        // Step 1: Delete DNS record if it exists
        if (trial.cloudflare_record_id) {
          console.log(`🌐 Attempting to delete DNS record: ${trial.cloudflare_record_id}`);
          
          const dnsResult = await deleteDNSRecord(trial.cloudflare_record_id);
          
          if (dnsResult.success) {
            console.log(`✅ Successfully deleted DNS record for ${trial.subdomain}`);
            dnsSuccess = true;
          } else {
            console.error(`❌ Failed to delete DNS record for ${trial.subdomain}:`, dnsResult.error);
            console.error(`❌ DNS deletion error details:`, JSON.stringify(dnsResult, null, 2));
            dnsSuccess = false;
            processingError = `DNS deletion failed: ${dnsResult.error}`;
            // Continue processing even if DNS deletion fails
          }
        } else {
          console.log(`ℹ️ No DNS record to delete for trial: ${trial.subdomain}`);
          dnsSuccess = true; // No DNS record to delete counts as success
        }

        // Step 2: Update subdomain status to expired and clear DNS record ID
        console.log(`💾 Updating database status for ${trial.subdomain} to 'expired'`);
        
        const { error: updateError } = await supabase
          .from('subdomains')
          .update({ 
            status: 'expired',
            cloudflare_record_id: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', trial.id);

        if (updateError) {
          console.error(`❌ Error updating trial status for ${trial.subdomain}:`, updateError);
          console.error(`❌ Database update error details:`, JSON.stringify(updateError, null, 2));
          dbSuccess = false;
          processingError = processingError 
            ? `${processingError}; Database update failed: ${updateError.message}`
            : `Database update failed: ${updateError.message}`;
          errorCount++;
        } else {
          console.log(`✅ Successfully updated database status for ${trial.subdomain}`);
          dbSuccess = true;
          
          // Only count as fully processed if database update succeeded
          if (dnsSuccess || !trial.cloudflare_record_id) {
            processedCount++;
            console.log(`🎉 Successfully processed trial ${trial.subdomain} (DNS: ${dnsSuccess ? 'Success' : 'Failed'}, DB: Success)`);
          } else {
            console.log(`⚠️ Partially processed trial ${trial.subdomain} (DNS: Failed, DB: Success)`);
          }
        }

      } catch (error) {
        console.error(`💥 Unexpected error processing trial ${trial.subdomain}:`, error);
        console.error(`💥 Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
        processingError = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;
        errorCount++;
        dnsSuccess = false;
        dbSuccess = false;
      }

      // Record processing result for summary
      processingResults.push({
        subdomain: trial.subdomain,
        id: trial.id,
        dnsSuccess,
        dbSuccess,
        error: processingError
      });
    }

    // Generate detailed summary
    console.log('\n📋 TRIAL CLEANUP SUMMARY:');
    console.log(`   Total expired trials found: ${expiredTrials.length}`);
    console.log(`   Successfully processed: ${processedCount}`);
    console.log(`   Errors encountered: ${errorCount}`);
    console.log(`   Success rate: ${((processedCount / expiredTrials.length) * 100).toFixed(1)}%`);

    if (processingResults.length > 0) {
      console.log('\n📊 DETAILED RESULTS:');
      processingResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.subdomain} (${result.id})`);
        console.log(`      DNS: ${result.dnsSuccess ? '✅ Success' : '❌ Failed'}`);
        console.log(`      Database: ${result.dbSuccess ? '✅ Success' : '❌ Failed'}`);
        if (result.error) {
          console.log(`      Error: ${result.error}`);
        }
      });
    }

    const summary = {
      success: true,
      message: `Processed ${processedCount} expired trials`,
      processed: processedCount,
      errors: errorCount,
      total: expiredTrials.length,
      details: processingResults.map(r => ({
        subdomain: r.subdomain,
        dnsSuccess: r.dnsSuccess,
        dbSuccess: r.dbSuccess,
        error: r.error
      }))
    };

    console.log(`🏁 Trial cleanup completed successfully`);
    console.log(`📤 Returning summary:`, JSON.stringify(summary, null, 2));

    return new Response(
      JSON.stringify(summary),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('💥 CRITICAL: Trial cleanup job failed with unexpected error:', error);
    console.error('💥 Error details:', JSON.stringify(error, null, 2));
    console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Trial cleanup job failed',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});