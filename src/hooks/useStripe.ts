import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'payment' | 'subscription';
  subdomainId?: string;
  subdomainName?: string;
  target?: string;
  port?: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface StripeSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const { supabaseUser } = useAuth();

  const createCheckoutSession = async ({
    priceId,
    mode,
    subdomainId,
    subdomainName,
    target,
    port,
    successUrl = `${window.location.origin}/success`,
    cancelUrl = `${window.location.origin}/billing`,
  }: CreateCheckoutSessionParams) => {
    if (!supabaseUser) {
      toast.error('Please sign in to continue');
      return null;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return null;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          mode,
          subdomain_id: subdomainId,
          subdomain_name: subdomainName,
          target,
          port,
          success_url: successUrl,
          cancel_url: cancelUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect immediately to Stripe checkout
        window.location.href = data.url;
      }

      return data;
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getSubscription = async (): Promise<StripeSubscription | null> => {
    if (!supabaseUser) return null;

    try {
      // Get the most recent active subscription for this user
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .eq('subscription_status', 'active')
        .order('current_period_start', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  };

  const cancelSubscription = async (): Promise<boolean> => {
    if (!supabaseUser) return false;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return false;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel-subscription`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      return true;
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      toast.error(error.message || 'Failed to cancel subscription');
      return false;
    }
  };
  return {
    createCheckoutSession,
    getSubscription,
    cancelSubscription,
    loading,
  };
}