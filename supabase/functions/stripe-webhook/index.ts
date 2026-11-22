import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { createDNSRecord, deleteDNSRecord, isValidIP, isValidDomain } from '../_shared/cloudflare.ts';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No signature found in headers');
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body as text (this is what Stripe expects)
    const body = await req.text();

    if (!body || body.length === 0) {
      console.error('❌ No body received');
      return new Response('No body received', { status: 400 });
    }

    console.log(`📦 Body length: ${body.length}`);
    console.log(`🔑 Signature: ${signature}`);

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      // Use the async version with the raw text body
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
      console.log(`✅ Webhook signature verified for event: ${event.type} (${event.id})`);
    } catch (error: any) {
      console.error(`❌ Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    // Check for duplicate events using Stripe's idempotency
    const { data: existingEvent, error: eventCheckError } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (eventCheckError && eventCheckError.code !== 'PGRST116') {
      console.error('❌ Error checking for duplicate events:', eventCheckError);
    }

    if (existingEvent) {
      console.log(`⏭️ Skipping duplicate event: ${event.id}`);
      return Response.json({ received: true, duplicate: true });
    }

    // Record this event to prevent duplicates
    const { error: recordError } = await supabase
      .from('webhook_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString()
      });

    if (recordError) {
      console.error('❌ Error recording webhook event:', recordError);
      // Continue processing even if we can't record the event
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  console.log(`🔄 Processing webhook event: ${event.type} (${event.id})`);
  
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    console.log('❌ No stripe data found in event');
    return;
  }

  if (!('customer' in stripeData)) {
    console.log('❌ No customer found in stripe data');
    return;
  }

  // for one time payments, we only listen for the checkout.session.completed event
  if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
    console.log('⏭️ Skipping payment_intent.succeeded for one-time payment');
    return;
  }

  const { customer: customerId } = stripeData;
  
  if (!customerId || typeof customerId !== 'string') {
    console.error(`❌ No customer received on event: ${JSON.stringify(event)}`);
    return;
  }

  let isSubscription = true;
  let subdomainName: string | null = null;
  let subdomainId: string | null = null;

  if (event.type === 'checkout.session.completed') {
    const session = stripeData as Stripe.Checkout.Session;
    const { mode } = session;

    isSubscription = mode === 'subscription';
    
    // Get subdomain name from session metadata
    subdomainName = session.metadata?.subdomain_name || null;
    subdomainId = session.metadata?.subdomain_id || null;
    
    console.info(`📋 Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
    console.info(`🏷️ Subdomain name from metadata: ${subdomainName}`);
    console.info(`🆔 Subdomain ID from metadata: ${subdomainId}`);

    if (isSubscription) {
      console.info(`🔄 Starting subscription sync for customer: ${customerId}`);
      await syncCustomerFromStripe(customerId, { ...session.metadata, subdomain_id: subdomainId });
    } else if (mode === 'payment' && session.payment_status === 'paid') {
      try {
        // Extract the necessary information from the session
        const {
          id: checkout_session_id,
          payment_intent,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
        } = session;

        // Insert the order into the stripe_orders table
        const { error: orderError } = await supabase.from('stripe_orders').insert({
          checkout_session_id,
          payment_intent_id: payment_intent,
          customer_id: customerId,
          amount_subtotal,
          amount_total,
          currency,
          payment_status,
          status: 'completed', // assuming we want to mark it as completed since payment is successful
        });

        if (orderError) {
          console.error('❌ Error inserting order:', orderError);
          return;
        }
        console.info(`✅ Successfully processed one-time payment for session: ${checkout_session_id}`);
      } catch (error) {
        console.error('❌ Error processing one-time payment:', error);
      }
    }
  } else if (event.type === 'payment_intent.succeeded') {
    // Payment intent succeeded - no additional processing needed
    console.log(`💰 Payment intent succeeded: ${stripeData.id}`);
  } else if (event.type === 'invoice.payment_succeeded') {
    // Handle successful subscription payments
    const invoice = stripeData as Stripe.Invoice;
    
    if (invoice.subscription) {
      console.info(`💰 Processing successful payment for subscription: ${invoice.subscription}`);
      await syncCustomerFromStripe(customerId);
    }
  } else if (event.type === 'customer.subscription.deleted' || 
             (event.type === 'customer.subscription.updated' && 
              (stripeData as Stripe.Subscription).status === 'canceled')) {
    // Handle subscription cancellation/deletion
    const subscription = stripeData as Stripe.Subscription;
    console.info(`🗑️ Processing subscription cancellation: ${subscription.id}`);
    await handleSubscriptionCancellation(subscription.id, customerId);
  } else {
    // For other subscription events, we still need to sync
    console.info(`🔄 Processing subscription event: ${event.type} for customer: ${customerId}`);
    await syncCustomerFromStripe(customerId, { subdomain_id: subdomainId });
  }
}

async function handleSubscriptionCancellation(subscriptionId: string, customerId: string) {
  try {
    console.log(`🔄 Handling cancellation for subscription: ${subscriptionId}`);
    
    // Find the subdomain associated with this subscription
    const { data: subdomain, error: subdomainError } = await supabase
      .from('subdomains')
      .select('id, subdomain, cloudflare_record_id, status')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle();

    if (subdomainError && subdomainError.code !== 'PGRST116') {
      console.error('❌ Error finding subdomain for cancelled subscription:', subdomainError);
      return;
    }

    if (!subdomain) {
      console.log(`⚠️ No subdomain found for cancelled subscription: ${subscriptionId}`);
      return;
    }

    console.log(`🎯 Found subdomain for cancellation: ${subdomain.subdomain} (${subdomain.id})`);

    // Delete DNS record if it exists
    if (subdomain.cloudflare_record_id) {
      console.log(`🌐 Deleting DNS record: ${subdomain.cloudflare_record_id}`);
      
      const dnsResult = await deleteDNSRecord(subdomain.cloudflare_record_id);
      
      if (dnsResult.success) {
        console.log(`✅ Successfully deleted DNS record for ${subdomain.subdomain}`);
      } else {
        console.error(`❌ Failed to delete DNS record for ${subdomain.subdomain}:`, dnsResult.error);
      }
    } else {
      console.log(`ℹ️ No DNS record to delete for subdomain: ${subdomain.subdomain}`);
    }

    // Update subdomain status to cancelled and clear DNS record ID
    const { error: updateError } = await supabase
      .from('subdomains')
      .update({ 
        status: 'cancelled',
        cloudflare_record_id: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subdomain.id);

    if (updateError) {
      console.error('❌ Error updating subdomain status to cancelled:', updateError);
    } else {
      console.info(`✅ Successfully cancelled subdomain ${subdomain.subdomain} and removed DNS record`);
    }

    // Update subscription status in our database
    const { error: subscriptionError } = await supabase
      .from('stripe_subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscriptionId);

    if (subscriptionError) {
      console.error('❌ Error updating subscription status:', subscriptionError);
    }

  } catch (error) {
    console.error(`❌ Error handling subscription cancellation for ${subscriptionId}:`, error);
  }
}

async function syncCustomerFromStripe(customerId: string, metadata?: any) {
  try {
    console.log(`🔄 Starting sync for customer: ${customerId}`);
    console.log(`📋 Metadata received:`, metadata);
    
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10, // Handle multiple subscriptions
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.info(`❌ No subscriptions found for customer: ${customerId}`);
      return;
    }

    console.log(`📊 Found ${subscriptions.data.length} subscription(s) for customer: ${customerId}`);

    // Extract subdomain name from metadata and resolve to actual subdomain ID
    const subdomainName = metadata?.subdomain_name;
    const metadataSubdomainId = metadata?.subdomain_id;
    const target = metadata?.target;
    const port = metadata?.port;
    console.log(`🏷️ Subdomain name from metadata: ${subdomainName}`);
    console.log(`🆔 Subdomain ID from metadata: ${metadataSubdomainId}`);
    console.log(`🎯 Target from metadata: ${target}`);
    console.log(`🔌 Port from metadata: ${port}`);
    
    let actualSubdomainId = null;
    let subdomainData = null;
    
    // Prioritize subdomain_id from metadata if available
    if (metadataSubdomainId) {
      console.log(`🔍 Looking up subdomain with ID: ${metadataSubdomainId}`);
      
      const { data: existingSubdomain, error: existingError } = await supabase
        .from('subdomains')
        .select('id, status, user_id, subdomain, pending_price_id')
        .eq('id', metadataSubdomainId)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('❌ Error fetching subdomain by ID:', existingError);
      } else if (existingSubdomain) {
        actualSubdomainId = existingSubdomain.id;
        subdomainData = existingSubdomain;
        console.log(`✅ Found subdomain by ID: ${actualSubdomainId} (${existingSubdomain.subdomain})`);
      }
    } else if (subdomainName) {
      console.log(`🔍 Looking up subdomain with name: ${subdomainName}`);
      
      // Get user_id from customer first
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single();

      if (customerError || !customerData) {
        console.error('❌ Customer not found:', customerError);
        return;
      }

      // Check if subdomain already exists
      const { data: existingSubdomain, error: existingError } = await supabase
        .from('subdomains')
        .select('id, status, user_id, subdomain, pending_price_id')
        .eq('subdomain', subdomainName)
        .eq('user_id', customerData.user_id)
        .maybeSingle();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('❌ Error checking existing subdomain:', existingError);
        return;
      }

      if (existingSubdomain) {
        actualSubdomainId = existingSubdomain.id;
        subdomainData = existingSubdomain;
        console.log(`✅ Found existing subdomain: ${actualSubdomainId} (${existingSubdomain.subdomain})`);
      } else {
        console.log(`🆕 Creating new subdomain: ${subdomainName}`);
        
        // Create the subdomain from the successful payment
        const { data: newSubdomain, error: createError } = await supabase
          .from('subdomains')
          .insert({
            user_id: customerData.user_id,
            subdomain: subdomainName,
            minecraft_server_ip: target || '0.0.0.0', // Use target from metadata or placeholder
            minecraft_server_port: port ? parseInt(port) : 25565, // Use port from metadata or default
            status: 'pending_payment',
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating subdomain:', createError);
          return;
        }

        actualSubdomainId = newSubdomain.id;
        subdomainData = newSubdomain;
        console.log(`✅ Created new subdomain: ${actualSubdomainId} (${newSubdomain.subdomain})`);
      }
    } else {
      // If no metadata, try to find the most recent subdomain for this customer
      console.log('🔍 No subdomain name in metadata, looking for recent subdomains');
      
      // Get user_id from customer
      const { data: customerData, error: customerError } = await supabase
        .from('stripe_customers')
        .select('user_id')
        .eq('customer_id', customerId)
        .single();

      if (!customerError && customerData) {
        const { data: recentSubdomains, error: recentError } = await supabase
          .from('subdomains')
          .select('id, status, user_id, subdomain, unique_id, pending_price_id')
          .eq('user_id', customerData.user_id)
          .in('status', ['pending_payment', 'trial'])
          .order('created_at', { ascending: false })
          .limit(1);

        if (!recentError && recentSubdomains && recentSubdomains.length > 0) {
          actualSubdomainId = recentSubdomains[0].id;
          subdomainData = recentSubdomains[0];
          console.log(`✅ Found recent subdomain: ${actualSubdomainId} (${recentSubdomains[0].subdomain})`);
        }
      }
    }

    // Process each subscription
    for (const subscription of subscriptions.data) {
      console.log(`🔄 Processing subscription: ${subscription.id} with status: ${subscription.status}`);

      // Check if subscription already exists in our database
      const { data: existingSub, error: fetchError } = await supabase
        .from('stripe_subscriptions')
        .select('id, subdomain_id')
        .eq('subscription_id', subscription.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error checking existing subscription:', fetchError);
        continue; // Skip this subscription and continue with others
      }

      // Use existing subdomain_id if we don't have one from metadata
      let finalSubdomainId = actualSubdomainId;
      if (!finalSubdomainId && existingSub?.subdomain_id) {
        finalSubdomainId = existingSub.subdomain_id;
        console.log(`🔗 Using existing subdomain_id: ${finalSubdomainId}`);
      }

      // Prepare subscription data
      const subscriptionData = {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
        ...(finalSubdomainId ? { subdomain_id: finalSubdomainId } : {}),
      };

      console.log(`💾 Syncing subscription data for ${subscription.id}:`, subscriptionData);

      let subError;
      if (existingSub) {
        // Update existing subscription
        console.log(`🔄 Updating existing subscription: ${subscription.id}`);
        const { error: updateError } = await supabase
          .from('stripe_subscriptions')
          .update(subscriptionData)
          .eq('subscription_id', subscription.id);
        subError = updateError;
      } else {
        // Insert new subscription
        console.log(`➕ Inserting new subscription: ${subscription.id}`);
        const { error: insertError } = await supabase
          .from('stripe_subscriptions')
          .insert(subscriptionData);
        subError = insertError;
      }

      if (subError) {
        console.error('❌ Error syncing subscription:', subError);
        continue; // Continue with other subscriptions
      }

      console.log(`✅ Successfully synced subscription: ${subscription.id}`);

      // CRITICAL: Activate subdomain if subscription is active
      if (finalSubdomainId && subscription.status === 'active') {
        console.log(`🚀 Activating subdomain ${finalSubdomainId} for active subscription ${subscription.id}`);
        
        // Get the subdomain details for DNS creation
        const { data: subdomainDetails, error: subdomainDetailsError } = await supabase
          .from('subdomains')
          .select('subdomain, minecraft_server_ip, cloudflare_record_id, pending_price_id')
          .eq('id', finalSubdomainId)
          .single();

        if (subdomainDetailsError || !subdomainDetails) {
          console.error('❌ Error fetching subdomain details for DNS creation:', subdomainDetailsError);
        } else {
          // Create DNS record if it doesn't exist
          if (!subdomainDetails.cloudflare_record_id) {
            console.log(`🌐 Creating DNS record for subdomain: ${subdomainDetails.subdomain}`);
            
            const dnsResult = await createDNSRecord(
              subdomainDetails.subdomain, 
              subdomainDetails.minecraft_server_ip
            );

            if (dnsResult.success) {
              console.log(`✅ DNS record created successfully: ${dnsResult.record_id}`);
              
              // Update subdomain with DNS record ID and activate it
              const { error: subdomainError } = await supabase
                .from('subdomains')
                .update({ 
                  status: 'active',
                  stripe_subscription_id: subscription.id,
                  cloudflare_record_id: dnsResult.record_id,
                  pending_price_id: null, // Clear pending price after successful activation
                  updated_at: new Date().toISOString()
                })
                .eq('id', finalSubdomainId);

              if (subdomainError) {
                console.error('❌ Error activating subdomain with DNS record:', subdomainError);
              } else {
                console.info(`✅ Successfully activated subdomain ${finalSubdomainId} (${subdomainDetails.subdomain}) with DNS record ${dnsResult.record_id}`);
              }
            } else {
              console.error(`❌ Failed to create DNS record for ${subdomainDetails.subdomain}:`, dnsResult.error);
              
              // Still activate the subdomain even if DNS creation fails
              const { error: subdomainError } = await supabase
                .from('subdomains')
                .update({ 
                  status: 'active',
                  stripe_subscription_id: subscription.id,
                  pending_price_id: null, // Clear pending price after successful activation
                  updated_at: new Date().toISOString()
                })
                .eq('id', finalSubdomainId);

              if (subdomainError) {
                console.error('❌ Error activating subdomain without DNS record:', subdomainError);
              } else {
                console.info(`⚠️ Activated subdomain ${finalSubdomainId} (${subdomainDetails.subdomain}) but DNS creation failed`);
              }
            }
          } else {
            console.log(`🔗 DNS record already exists for subdomain: ${subdomainDetails.subdomain}`);
            
            // Just activate the subdomain
            const { error: subdomainError } = await supabase
              .from('subdomains')
              .update({ 
                status: 'active',
                stripe_subscription_id: subscription.id,
                pending_price_id: null, // Clear pending price after successful activation
                updated_at: new Date().toISOString()
              })
              .eq('id', finalSubdomainId);

            if (subdomainError) {
              console.error('❌ Error activating subdomain:', subdomainError);
            } else {
              console.info(`✅ Successfully activated subdomain ${finalSubdomainId} (${subdomainDetails.subdomain}) for subscription ${subscription.id}`);
            }
          }
        }
      } else if (finalSubdomainId && subscription.status !== 'active') {
        console.log(`⚠️ Subdomain ${finalSubdomainId} found but subscription status is ${subscription.status}, not activating`);
        
        // Update subdomain status based on subscription status
        let newStatus = 'pending_payment';
        if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          newStatus = 'cancelled';
        } else if (subscription.status === 'past_due') {
          newStatus = 'expired';
        }
        
        // If subscription is being cancelled or expired, handle DNS cleanup
        if ((subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'past_due') && finalSubdomainId) {
          console.log(`🗑️ Subscription ${subscription.id} is ${subscription.status}, cleaning up DNS for subdomain ${finalSubdomainId}`);
          
          // Get subdomain details for DNS cleanup
          const { data: subdomainDetails, error: subdomainDetailsError } = await supabase
            .from('subdomains')
            .select('subdomain, cloudflare_record_id')
            .eq('id', finalSubdomainId)
            .single();

          if (!subdomainDetailsError && subdomainDetails?.cloudflare_record_id) {
            console.log(`🌐 Deleting DNS record for expired/cancelled subdomain: ${subdomainDetails.subdomain}`);
            
            const dnsResult = await deleteDNSRecord(subdomainDetails.cloudflare_record_id);
            
            if (dnsResult.success) {
              console.log(`✅ Successfully deleted DNS record for ${subdomainDetails.subdomain}`);
              
              // Clear the DNS record ID from the subdomain
              await supabase
                .from('subdomains')
                .update({ cloudflare_record_id: null })
                .eq('id', finalSubdomainId);
            } else {
              console.error(`❌ Failed to delete DNS record for ${subdomainDetails.subdomain}:`, dnsResult.error);
            }
          }
        }
        
        const { error: statusError } = await supabase
          .from('subdomains')
          .update({ 
            status: newStatus,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', finalSubdomainId);

        if (statusError) {
          console.error('❌ Error updating subdomain status:', statusError);
        } else {
          console.info(`🔄 Updated subdomain ${finalSubdomainId} status to ${newStatus} for subscription ${subscription.id}`);
        }
      } else if (subdomainName && !finalSubdomainId) {
        console.log(`⚠️ Subdomain with name ${subdomainName} could not be created or found`);
      } else {
        console.log('ℹ️ No subdomain to activate - this may be a subscription without a linked subdomain');
      }
    }

    console.info(`✅ Successfully synced all subscriptions for customer: ${customerId}`);
  } catch (error) {
    console.error(`❌ Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}