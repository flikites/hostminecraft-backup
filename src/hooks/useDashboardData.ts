import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useStripe } from './useStripe';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { Subdomain } from '../types';

export function useDashboardData() {
  const { user } = useAuth();
  const { getSubscription } = useStripe();
  const { addToast } = useToast();
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubdomains();
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const fetchSubdomains = async () => {
    try {
      const { data, error } = await supabase
        .from('subdomains')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubdomains(data || []);
    } catch (error) {
      console.error('Error fetching subdomains:', error);
      addToast({
        type: 'error',
        title: 'Failed to load subdomains',
        sticky: true
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchSubdomains(), fetchSubscription()]);
  };

  const hasActiveSubscription = subscription?.subscription_status === 'active';
  const trialSubdomains = subdomains.filter(s => s.status === 'trial');
  const hasActiveTrial = trialSubdomains.length > 0;
  const hasUsedTrial = user?.trial_started_at !== null;

  return {
    subdomains,
    setSubdomains,
    subscription,
    loading,
    hasActiveSubscription,
    hasActiveTrial,
    hasUsedTrial,
    trialSubdomains,
    refreshData,
    fetchSubdomains,
    fetchSubscription,
  };
}