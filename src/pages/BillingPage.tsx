import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStripe } from '../hooks/useStripe';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PaymentMethodCard } from '../components/billing/PaymentMethodCard';
import { SubscriptionList } from '../components/billing/SubscriptionList';
import { AddSubdomainCard } from '../components/billing/AddSubdomainCard';
import { AddSubdomainModal } from '../components/dashboard/AddSubdomainModal';
import { useSubdomainManagement } from '../hooks/useSubdomainManagement';
import { Subdomain } from '../types';
import { getProductByPriceId } from '../stripe-config';

interface SubscriptionData {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  subdomain_id: string | null;
}

export function BillingPage() {
  const { user } = useAuth();
  const { loading: stripeLoading } = useStripe();
  const { addToast } = useToast();
  const {
    handleAddSubdomain,
    checkSubdomainAvailability,
    checkingAvailability,
    loading: managementLoading,
  } = useSubdomainManagement();
  const [subdomains, setSubdomains] = useState<Subdomain[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch subdomains
      const subdomainsResponse = await supabase
        .from('subdomains')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (subdomainsResponse.error) throw subdomainsResponse.error;

      setSubdomains(subdomainsResponse.data || []);

      // Fetch subscription data using the view
      const subscriptionsResponse = await supabase
        .from('stripe_user_subscriptions')
        .select('*');

      if (subscriptionsResponse.error) {
        console.error('Error fetching subscriptions:', subscriptionsResponse.error);
        // Don't throw here, just log the error and continue
        setSubscriptions([]);
      } else {
        setSubscriptions(subscriptionsResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      addToast({
        type: 'error',
        title: 'Loading Failed',
        message: 'Failed to load billing information',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      // Show loading toast
      addToast({
        type: 'info',
        title: 'Opening Payment Portal',
        message: 'Redirecting you to update your payment method...',
      });

      // Create Stripe customer portal session for payment method management
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addToast({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please sign in to update payment method',
        });
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain_id: activeSubdomains[0]?.id, // Use first active subdomain
          return_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      addToast({
        type: 'error',
        title: 'Portal Error',
        message: 'Failed to open payment portal',
      });
    }
  };

  const handleManageSubscription = async (subdomainId: string) => {
    try {
      // Show loading toast
      addToast({
        type: 'info',
        title: 'Opening Subscription Portal',
        message: 'Redirecting you to manage your subscription...',
      });

      // Create Stripe customer portal session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        addToast({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please sign in to manage your subscription',
        });
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-portal`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subdomain_id: subdomainId,
          return_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      addToast({
        type: 'error',
        title: 'Portal Error',
        message: 'Failed to open subscription management portal',
      });
    }
  };

  const onAddSubdomainSuccess = (newSubdomain: Subdomain) => {
    setSubdomains([newSubdomain, ...subdomains]);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const activeSubdomains = subdomains.filter(s => s.status === 'active');

  // Get subscription for a specific subdomain
  const getSubdomainSubscription = (subdomain: Subdomain) => {
    // Find subscription by matching subdomain_id or fallback to stripe_subscription_id
    return subscriptions.find(sub => 
      sub.subdomain_id === subdomain.id || 
      sub.subscription_id === subdomain.stripe_subscription_id
    );
  };

  const getPlanName = (priceId: string | null) => {
    if (!priceId) return 'Unknown Plan';
    const product = getProductByPriceId(priceId);
    if (!product) {
      // Fallback: try to determine from price_id pattern
      if (priceId === 'price_1RdZqbLYEn3C5bpj2aRnz8sl') return 'Annual Plan';
      if (priceId === 'price_1RdZodLYEn3C5bpjklC3RIsX') return 'Monthly Plan';
      return 'Unknown Plan';
    }
    
    return product.interval === 'year' ? 'Annual Plan' : 'Monthly Plan';
  };

  const getPlanPrice = (priceId: string | null) => {
    if (!priceId) return 'N/A';
    const product = getProductByPriceId(priceId);
    if (!product) {
      // Fallback: try to determine from price_id pattern
      if (priceId === 'price_1RdZqbLYEn3C5bpj2aRnz8sl') return '$30/year';
      if (priceId === 'price_1RdZodLYEn3C5bpjklC3RIsX') return '$5/month';
      return 'N/A';
    }
    
    return product.interval === 'year' ? '$30/year' : '$5/month';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-2">
            Billing & Subscriptions
          </h1>
          <p className="text-stone-600 font-minecraft">
            Manage your subdomain subscriptions and billing information
          </p>
        </div>

        {loading && (
          <div className="py-12">
            <LoadingSpinner message="Loading billing information..." />
          </div>
        )}

        {!loading && (
          <>
            {/* Payment Method Card - only show if user has active subdomains */}
            {activeSubdomains.length > 0 && (
              <PaymentMethodCard
                stripeLoading={stripeLoading}
                onUpdatePaymentMethod={handleUpdatePaymentMethod}
              />
            )}

            {/* Subscription List */}
            <SubscriptionList
              activeSubdomains={activeSubdomains}
              getSubdomainSubscription={getSubdomainSubscription}
              getPlanName={getPlanName}
              getPlanPrice={getPlanPrice}
              onManageSubscription={handleManageSubscription}
              stripeLoading={stripeLoading}
            />

            {/* Add Subdomain Card */}
            <AddSubdomainCard onShowModal={() => setShowAddModal(true)} />

            {/* Add Subdomain Modal */}
            <AddSubdomainModal
              isOpen={showAddModal}
              onClose={handleCloseModal}
              onSubmit={(formData, selectedPriceId) => 
                handleAddSubdomain(formData, selectedPriceId, subdomains, onAddSubdomainSuccess)
              }
              hasActiveSubscription={activeSubdomains.length > 0}
              hasActiveTrial={subdomains.some(s => s.status === 'trial')}
              hasUsedTrial={user?.trial_started_at !== null}
              subdomains={subdomains}
              checkSubdomainAvailability={checkSubdomainAvailability}
              checkingAvailability={checkingAvailability}
            />
          </>
        )}
      </div>
    </div>
  );
}