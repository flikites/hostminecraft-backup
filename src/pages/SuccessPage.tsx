import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useStripe } from '../hooks/useStripe';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { getProductByPriceId } from '../stripe-config';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getSubscription } = useStripe();
  const { hasProcessedSuccess } = usePaymentSuccess();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const subdomainName = searchParams.get('subdomain');
  const target = searchParams.get('target');
  const port = searchParams.get('port');

  useEffect(() => {
    if (user) {
      fetchSubscription();
      
      // Auto-redirect to dashboard after 5 seconds to allow webhook processing
      const timer = setTimeout(() => {
        navigate('/dashboard?payment_success=true');
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const fetchSubscription = async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubscriptionDetails = () => {
    if (!subscription?.price_id) return null;
    
    const product = getProductByPriceId(subscription.price_id);
    return product;
  };

  const subscriptionDetails = getSubscriptionDetails();

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {loading && (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        )}
        
        {!loading && (
        <Card variant="minecraft" className="text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-grass-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
              Payment Successful!
            </h1>
            {subdomainName ? (
              <div>
                <p className="text-stone-600 font-minecraft mb-2">
                  Thank you for your purchase! Your subdomain is being set up.
                </p>
                <p className="text-lg font-minecraft font-bold text-grass-700">
                  {subdomainName}.hostminecraft.com
                </p>
                <p className="text-xs text-stone-500 font-minecraft mt-2">
                  <strong>Note:</strong> Your subdomain will be activated within a few minutes.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-stone-600 font-minecraft">
                  Thank you for your purchase. Your subscription is now active.
                </p>
                <p className="text-xs text-stone-500 font-minecraft mt-2">
                  <strong>Note:</strong> Your subdomain may take a few moments to activate while we process your payment.
                </p>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {subscriptionDetails && (
              <div className="bg-grass-50 rounded-lg p-4 border-2 border-grass-200">
                <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                  {subscriptionDetails.name}
                </h3>
                <div className="text-sm font-minecraft text-stone-600 space-y-1">
                  <p>
                    <span className="font-bold">Price:</span> ${subscriptionDetails.price.toFixed(2)}
                    {subscriptionDetails.interval && ` per ${subscriptionDetails.interval}`}
                  </p>
                  {subscriptionDetails.description && (
                    <p>
                      <span className="font-bold">Benefit:</span> {subscriptionDetails.description}
                    </p>
                  )}
                  {sessionId && (
                    <p className="text-xs text-stone-500 mt-2">
                      Session ID: {sessionId}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link to="/dashboard" className="block">
                <Button variant="primary" className="w-full" icon={ArrowRight}>
                  Go to Dashboard
                </Button>
              </Link>
              <Link to="/" className="block">
                <Button variant="ghost" className="w-full" icon={Home}>
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-xs text-stone-500 font-minecraft">
              <p>
                You will receive a confirmation email shortly. If you have any questions, 
                please contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
}