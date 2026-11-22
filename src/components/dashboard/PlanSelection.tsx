import React from 'react';
import { Button } from '../ui/Button';
import { Check, Star } from 'lucide-react';
import { stripeProducts } from '../../stripe-config';

interface PlanSelectionProps {
  formData: {
    subdomain: string;
    target: string;
    minecraft_server_port: string;
  };
  loading: boolean;
  upgradeSubdomainId?: string;
  onSelectPlan: (priceId: string) => void;
  onBackToForm: () => void;
}

export function PlanSelection({
  formData,
  loading,
  upgradeSubdomainId,
  onSelectPlan,
  onBackToForm
}: PlanSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
    {/* <h3 className="text-xl font-minecraft font-bold text-minecraft-800 mb-2">
          {upgradeSubdomainId ? 'Upgrade to Keep Subdomain' : 'Select Your Plan'}
        </h3>
         */}
        {!upgradeSubdomainId && (
          <p className="text-stone-600 font-minecraft text-sm mb-1">
            Your subdomain: <span className="font-bold text-grass-700">{formData.subdomain}.hostminecraft.com</span>
          </p>
        )}
      </div>

      {upgradeSubdomainId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="text-center">
            <p className="text-sm font-minecraft text-yellow-800 mb-2">
              <strong>Upgrading:</strong> {formData.subdomain}.hostminecraft.com
            </p>
            <p className="text-xs font-minecraft text-yellow-700">
              Your trial subdomain will be converted to a paid subscription
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Monthly Plan */}
        <div className="border-2 border-stone-300 rounded-lg p-4 hover:border-grass-400 transition-colors bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="text-left">
              <h4 className="font-minecraft font-bold text-lg text-minecraft-800 mb-1">
                Monthly Plan
              </h4>
              <div className="text-xs font-minecraft text-stone-600">
                Billed monthly • Cancel anytime
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-minecraft font-bold text-grass-600">
                $5
              </div>
              <div className="text-xs font-minecraft text-stone-600">
                per month
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-3 text-xs font-minecraft text-stone-600">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-grass-600" />
              <span>Custom subdomain</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-grass-600" />
              <span>DNS management</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-grass-600" />
              <span>24/7 support</span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={() => onSelectPlan(stripeProducts[1].priceId)}
            disabled={loading}
          >
            {loading ? 'Processing...' : (upgradeSubdomainId ? 'Upgrade Monthly' : 'Choose Monthly')}
          </Button>
        </div>

        {/* Annual Plan */}
        <div className="relative border-2 border-grass-500 rounded-lg p-4 bg-gradient-to-br from-grass-50 to-green-50">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-minecraft font-bold flex items-center gap-1">
              <Star className="w-3 h-3" />
              SAVE 50%
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3 mt-2">
            <div className="text-left">
              <h4 className="font-minecraft font-bold text-lg text-minecraft-800 mb-1">
                Annual Plan
              </h4>
              <div className="text-xs font-minecraft text-stone-600">
                Billed yearly • Best value
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-minecraft text-stone-500 line-through">$60</span>
                <div className="text-2xl font-minecraft font-bold text-grass-600">
                  $30
                </div>
              </div>
              <div className="text-xs font-minecraft text-stone-600">
                per year
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mb-3 text-xs font-minecraft text-stone-600">
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-grass-600" />
              <span>Everything in Monthly</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-grass-600" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3 text-grass-600" />
              <span>Save $30/year</span>
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full bg-grass-600 hover:bg-grass-700 font-bold"
            onClick={() => onSelectPlan(stripeProducts[0].priceId)}
            disabled={loading}
          >
            {loading ? 'Processing...' : (upgradeSubdomainId ? 'Upgrade Annual (Save 50%)' : 'Choose Annual (Save 50%)')}
          </Button>
        </div>
      </div>

      <div className="text-center pt-2">
        <Button
          variant="ghost"
          onClick={onBackToForm}
          disabled={loading}
          size="sm"
        >
          {upgradeSubdomainId ? '← Cancel Upgrade' : '← Back to form'}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-xs font-minecraft text-blue-800 text-center">
          <p className="font-bold mb-1">🔒 Secure Payment by Stripe</p>
          <p>Cancel anytime • No hidden fees • 30-day money back guarantee</p>
        </div>
      </div>
    </div>
  );
}