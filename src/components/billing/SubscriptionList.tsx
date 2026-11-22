import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Settings } from 'lucide-react';
import { Subdomain } from '../../types';

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
}

interface SubscriptionListProps {
  activeSubdomains: Subdomain[];
  getSubdomainSubscription: (subdomain: Subdomain) => SubscriptionData | undefined;
  getPlanName: (priceId: string | null) => string;
  getPlanPrice: (priceId: string | null) => string;
  onManageSubscription: (subdomainId: string) => void;
  stripeLoading: boolean;
}

export function SubscriptionList({
  activeSubdomains,
  getSubdomainSubscription,
  getPlanName,
  getPlanPrice,
  onManageSubscription,
  stripeLoading
}: SubscriptionListProps) {
  return (
    <Card variant="minecraft" className="mb-8">
      <CardHeader>
        <h2 className="text-xl font-minecraft font-bold text-minecraft-800">
          Subscriptions
        </h2>
      </CardHeader>
      <CardContent>
        {activeSubdomains.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-minecraft text-stone-600 mb-4">
              No active subscriptions found.
            </p>
            <p className="font-minecraft text-stone-500 text-sm">
              <Link to="/dashboard" className="text-grass-600 hover:text-grass-700 font-bold">
                Go to your dashboard
              </Link> to create subdomains.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600">
                    Subdomain
                  </th>
                  {/* <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Plan
                  </th> */}
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Renews
                  </th>
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {activeSubdomains.map((subdomain) => {
                  const subscription = getSubdomainSubscription(subdomain);
                  
                  return (
                    <tr key={subdomain.id} className="border-b border-stone-100">
                      <td className="py-3 px-4 font-minecraft text-sm text-stone-800 align-top">
                        <div className="mb-2">
                          <span className="px-2 py-1 bg-grass-100 text-grass-800 rounded text-xs font-minecraft">
                            Active
                          </span>
                        </div>
                        <div className="font-bold mb-1">
                          {subdomain.subdomain.length > 21 
                            ? `${subdomain.subdomain.substring(0, 21)}...` 
                            : subdomain.subdomain
                          }.hostminecraft.com
                        </div>
                        <div className="text-xs text-stone-500">
                          Created {new Date(subdomain.created_at).toLocaleDateString()}
                        </div>
                        
                        {/* Mobile-only content */}
                        <div className="md:hidden mt-3 space-y-2">
                          {/* <div className="text-sm">
                            <span className="font-bold text-grass-700">
                              {getPlanName(subscription?.price_id || null)}
                            </span>
                            <div className="text-xs text-stone-600">
                              {getPlanPrice(subscription?.price_id || null)}
                            </div>
                          </div> */}
                          
                          <div className="text-sm">
                            <span className="font-bold text-stone-700">Renews:</span>
                            <div className="text-xs text-stone-600">
                              {subscription?.current_period_end 
                                ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                                : 'N/A'
                              }
                            </div>
                          </div>
                          
                          <div className="pt-1">
                            <Button
                              onClick={() => onManageSubscription(subdomain.id)}
                              variant="ghost"
                              size="sm"
                              icon={Settings}
                              disabled={stripeLoading}
                              className="w-full"
                            >
                              {stripeLoading ? 'Loading...' : 'Manage Subscription'}
                            </Button>
                          </div>
                        </div>
                      </td>
                      
                      {/* Desktop-only columns */}
                      {/* <td className="py-3 px-4 font-minecraft text-sm text-stone-800 hidden md:table-cell align-top">
                        <div>
                          <div className="font-bold text-grass-700">
                            {getPlanName(subscription?.price_id || null)}
                          </div>
                          <div className="text-xs text-stone-600">
                            {getPlanPrice(subscription?.price_id || null)}
                          </div>
                        </div>
                      </td> */}
                      
                      <td className="py-3 px-4 font-minecraft text-sm text-stone-800 hidden md:table-cell align-top">
                        <div className="font-bold text-stone-700">
                          {subscription?.current_period_end 
                            ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
                            : 'N/A'
                          }
                        </div>
                        <div className="text-xs text-stone-500">
                          {subscription?.cancel_at_period_end ? 'Cancels on renewal' : 'Auto-renews'}
                        </div>
                      </td>
                      
                      <td className="py-3 px-4 hidden md:table-cell align-top">
                        <Button
                          onClick={() => onManageSubscription(subdomain.id)}
                          variant="ghost"
                          size="sm"
                          icon={Settings}
                          disabled={stripeLoading}
                        >
                          {stripeLoading ? 'Loading...' : 'Manage Subscription'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}