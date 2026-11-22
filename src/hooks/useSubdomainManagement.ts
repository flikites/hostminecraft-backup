import { useState } from 'react';
import { useAuth } from './useAuth';
import { useStripe } from './useStripe';
import { useCloudflareDNS } from './useCloudflareDNS';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { Subdomain } from '../types';
import { stripeProducts } from '../stripe-config';
import toast from 'react-hot-toast';

export function useSubdomainManagement() {
  const { user } = useAuth();
  const { createCheckoutSession } = useStripe();
  const { createDNSRecord, updateDNSRecord, deleteDNSRecord, loading: dnsLoading } = useCloudflareDNS();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const checkSubdomainAvailability = async (subdomain: string): Promise<boolean> => {
    if (!subdomain || subdomain.trim() === '') {
      return false;
    }

    setCheckingAvailability(true);
    try {
      const { data: existingSubdomain, error } = await supabase
        .from('subdomains')
        .select('id')
        .eq('subdomain', subdomain.toLowerCase().trim())
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking subdomain availability:', error);
        return false;
      }

      // Return true if no existing subdomain found (available)
      return !existingSubdomain;
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      return false;
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleAddSubdomain = async (
    formData: { subdomain: string; target: string; minecraft_server_port: string },
    selectedPriceId?: string,
    subdomains: Subdomain[] = [],
    onSuccess?: (newSubdomain: Subdomain) => void,
    upgradeSubdomainId?: string
  ) => {
    if (!user) return;

    // Check if user is eligible for a new trial
    const trialSubdomains = subdomains.filter(s => s.status === 'trial');
    const hasUsedTrial = user.trial_started_at !== null;
    const isEligibleForNewTrial = !hasUsedTrial && trialSubdomains.length === 0;
    
    try {
      setLoading(true);

      // Only check subdomain availability if NOT upgrading an existing subdomain
      if (!upgradeSubdomainId) {
        const { data: existingSubdomain, error: checkError } = await supabase
          .from('subdomains')
          .select('id')
          .eq('subdomain', formData.subdomain.toLowerCase())
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingSubdomain) {
          addToast({
            type: 'error',
            title: 'Subdomain Taken',
            message: 'This subdomain is already taken. Please choose another.',
          });
          return;
        }
      }

      // Determine if this should be a trial or requires payment
      const shouldCreateTrial = !upgradeSubdomainId && isEligibleForNewTrial;
      const needsPayment = upgradeSubdomainId || !isEligibleForNewTrial;
      
      if (needsPayment) {
        // Use selectedPriceId if provided, otherwise default to monthly plan
        const priceId = selectedPriceId || stripeProducts[1].priceId;
        let subdomainId = upgradeSubdomainId;

        // If not upgrading, create a new subdomain record with pending status
        if (!upgradeSubdomainId) {
          console.log('🆕 Creating pending subdomain record for payment tracking');
          
          const { data: pendingSubdomain, error: createError } = await supabase
            .from('subdomains')
            .insert({
              user_id: user.id,
              subdomain: formData.subdomain.toLowerCase(),
              minecraft_server_ip: formData.target,
              minecraft_server_port: parseInt(formData.minecraft_server_port),
              status: 'pending_payment',
              pending_price_id: priceId,
            })
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating pending subdomain:', createError);
            addToast({
              type: 'error',
              title: 'Setup Failed',
              message: 'Failed to prepare subdomain for payment. Please try again.',
            });
            return;
          }

          subdomainId = pendingSubdomain.id;
          console.log(`✅ Created pending subdomain: ${subdomainId}`);
        } else {
          // For upgrades, update the existing subdomain with the pending price
          console.log('🔄 Updating existing subdomain with pending price');
          
          const { error: updateError } = await supabase
            .from('subdomains')
            .update({
              pending_price_id: priceId,
              minecraft_server_ip: formData.target,
              minecraft_server_port: parseInt(formData.minecraft_server_port),
              updated_at: new Date().toISOString()
            })
            .eq('id', upgradeSubdomainId);

          if (updateError) {
            console.error('❌ Error updating subdomain with pending price:', updateError);
            addToast({
              type: 'error',
              title: 'Update Failed',
              message: 'Failed to prepare subdomain for upgrade. Please try again.',
            });
            return;
          }
        }

        // Create checkout session with subdomain info in metadata
        try {
          const result = await createCheckoutSession({
            priceId,
            mode: 'subscription',
            subdomainId,
            subdomainName: formData.subdomain,
            target: formData.target,
            port: formData.minecraft_server_port,
            successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}&subdomain=${encodeURIComponent(formData.subdomain)}&target=${encodeURIComponent(formData.target)}&port=${formData.minecraft_server_port}`,
            cancelUrl: `${window.location.origin}/dashboard`,
          });
          
          if (!result) {
            // If checkout session creation failed, clean up the pending subdomain
            if (!upgradeSubdomainId && subdomainId) {
              console.log('🧹 Cleaning up pending subdomain due to checkout failure');
              await supabase.from('subdomains').delete().eq('id', subdomainId);
            }
            
            addToast({
              type: 'error',
              title: 'Payment Setup Failed',
              message: 'Failed to set up payment. Please try again.',
            });
          }
        } catch (error) {
          // If checkout session creation failed, clean up the pending subdomain
          if (!upgradeSubdomainId && subdomainId) {
            console.log('🧹 Cleaning up pending subdomain due to checkout error');
            await supabase.from('subdomains').delete().eq('id', subdomainId);
          }
          throw error;
        }
        
        return;
      }

      // Show loading toast for trial creation
      addToast({
        type: 'info',
        title: 'Creating subdomain...',
        message: 'Setting up DNS records',
      });

      const { data, error } = await supabase
        .from('subdomains')
        .insert({
          user_id: user.id,
          subdomain: formData.subdomain.toLowerCase(),
          minecraft_server_ip: formData.target,
          minecraft_server_port: parseInt(formData.minecraft_server_port),
          status: shouldCreateTrial ? 'trial' : 'active',
          trial_ends_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        })
        .select()
        .single();

      if (error) throw error;

      // Create DNS record in Cloudflare
      const dnsResult = await createDNSRecord(data.id, formData.target);
      if (!dnsResult?.success) {
        // If DNS creation fails, delete the subdomain record
        await supabase.from('subdomains').delete().eq('id', data.id);
        addToast({
          type: 'error',
          title: 'DNS Setup Failed',
          message: 'Failed to create DNS record. Please try again.',
        });
        return;
      }

      // If this is a trial subdomain and user hasn't used trial before, mark trial as started
      if (shouldCreateTrial) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ trial_started_at: new Date().toISOString() })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating trial_started_at:', updateError);
          // Don't fail the subdomain creation for this error
        }
      }

      onSuccess?.(data);
      addToast({
        type: 'success',
        title: 'Subdomain Created!',
        message: `${data.subdomain}.hostminecraft.com is now active`,
      });

      // Auto-copy subdomain to clipboard
      const fullDomain = `${data.subdomain}.hostminecraft.com`;
      const domainWithPort = data.minecraft_server_port !== 25565 
        ? `${fullDomain}:${data.minecraft_server_port}`
        : fullDomain;
      
      try {
        await navigator.clipboard.writeText(domainWithPort);
        // Small delay to ensure the first toast is visible before showing the second
        setTimeout(() => {
          addToast({
            type: 'success',
            title: 'Copied to Clipboard!',
            message: `${domainWithPort} is ready to share with your players!`,
            sticky: true
          });
        }, 1500);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Show fallback toast if clipboard fails
        setTimeout(() => {
          addToast({
            type: 'info',
            title: 'Subdomain Ready!',
            message: `Your domain: ${domainWithPort}`,
            sticky: true
          });
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error creating subdomain:', error);
      if (error.code === '23505') {
        addToast({
          type: 'error',
          title: 'Subdomain Taken',
          message: 'This subdomain is already taken. Please choose another.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Creation Failed',
          message: 'Failed to create subdomain. Please try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubdomain = async (
    subdomainId: string,
    onSuccess?: (deletedId: string) => void
  ) => {
    if (!confirm('Are you sure you want to delete this subdomain? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);

      // Delete DNS record first
      await deleteDNSRecord(subdomainId);

      // Delete subdomain from database
      const { error } = await supabase
        .from('subdomains')
        .delete()
        .eq('id', subdomainId);

      if (error) throw error;

      onSuccess?.(subdomainId);
      addToast({
        type: 'success',
        title: 'Subdomain Deleted',
        message: 'Subdomain and DNS records have been removed',
      });
    } catch (error) {
      console.error('Error deleting subdomain:', error);
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete subdomain',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubdomain = async (
    subdomainId: string,
    updatedData: { target: string; minecraft_server_port: string },
    onSuccess?: () => void
  ) => {
    try {
      setLoading(true);

      // Update subdomain in database
      const { error } = await supabase
        .from('subdomains')
        .update({
          minecraft_server_ip: updatedData.target,
          minecraft_server_port: parseInt(updatedData.minecraft_server_port),
          updated_at: new Date().toISOString()
        })
        .eq('id', subdomainId);

      if (error) throw error;

      // Update DNS record
      const dnsResult = await updateDNSRecord(subdomainId, updatedData.target);
      if (!dnsResult?.success) {
        addToast({
          type: 'error',
          title: 'DNS Update Failed',
          message: 'Failed to update DNS record. Please try again.',
        });
        return;
      }

      onSuccess?.();
      addToast({
        type: 'success',
        title: 'Subdomain Updated',
        message: 'Your subdomain has been successfully updated.',
      });

      // Auto-copy updated subdomain to clipboard
      try {
        // Get the subdomain details to construct the full domain
        const { data: subdomainDetails, error: fetchError } = await supabase
          .from('subdomains')
          .select('subdomain, minecraft_server_port')
          .eq('id', subdomainId)
          .single();

        if (!fetchError && subdomainDetails) {
          const fullDomain = `${subdomainDetails.subdomain}.hostminecraft.com`;
          const domainWithPort = subdomainDetails.minecraft_server_port !== 25565 
            ? `${fullDomain}:${subdomainDetails.minecraft_server_port}`
            : fullDomain;
          
          await navigator.clipboard.writeText(domainWithPort);
          // Small delay to ensure the first toast is visible before showing the second
          setTimeout(() => {
            addToast({
              type: 'success',
              title: 'Copied to Clipboard!',
              message: `Updated domain: ${domainWithPort}`,
              sticky: true
            });
          }, 1500);
        }
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        // Don't show error toast for clipboard failures on updates
      }
    } catch (error) {
      console.error('Error updating subdomain:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update subdomain. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    handleAddSubdomain,
    handleDeleteSubdomain,
    handleEditSubdomain,
    checkSubdomainAvailability,
    checkingAvailability,
    loading: loading || dnsLoading,
  };
}