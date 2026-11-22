import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Clock, Plus, AlertTriangle, CheckCircle } from 'lucide-react';

interface FreeTrialCardProps {
  hasActiveTrial: boolean;
  hasUsedTrial: boolean;
  trialSubdomain?: {
    id: string;
    unique_id: string;
    subdomain: string;
    trial_ends_at: string | null;
  } | null;
  onUpgradeToKeep?: (subdomainId: string) => void;
  onShowAddForm?: () => void;
  showAddButton?: boolean;
}

export function FreeTrialCard({ 
  hasActiveTrial, 
  hasUsedTrial, 
  trialSubdomain,
  onUpgradeToKeep,
  onShowAddForm,
  showAddButton = true
}: FreeTrialCardProps) {
  const getTrialDaysRemaining = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getTrialHoursRemaining = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return Math.max(0, diffHours);
  };

  if (hasActiveTrial && trialSubdomain) {
    const daysRemaining = getTrialDaysRemaining(trialSubdomain.trial_ends_at);
    const hoursRemaining = getTrialHoursRemaining(trialSubdomain.trial_ends_at);
    
    return (
      <Card variant="minecraft" className="border-yellow-400 bg-yellow-50 mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-minecraft font-bold text-lg text-yellow-800 mb-2">
              Active Free Trial
            </h3>
            <p className="text-sm font-minecraft text-yellow-700 mb-2">
              <strong>{trialSubdomain.subdomain}.hostminecraft.com</strong>
            </p>
            
            {trialSubdomain.trial_ends_at && (
              <div className="mb-4 ">
                <p className="text-xs font-minecraft text-yellow-600 mb-1">
                  Expires: {new Date(trialSubdomain.trial_ends_at).toLocaleDateString()} at{' '}
                  {new Date(trialSubdomain.trial_ends_at).toLocaleTimeString()}
                </p>
                <p className="text-sm font-minecraft text-yellow-800 font-bold">
                  {daysRemaining === 0 ? 
                    hoursRemaining <= 1 ? 'Expires in less than 1 hour' : `${hoursRemaining} hours remaining` :
                    `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`
                  }
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                variant="primary" 
                size="sm" 
                className="w-full"
                onClick={() => onUpgradeToKeep?.(trialSubdomain.id)}
              >
                Upgrade to Keep
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasUsedTrial) {
    return (
      <Card variant="minecraft" className="border-red-400 bg-red-50 mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="font-minecraft font-bold text-lg text-red-800 mb-2">
              Trial Used
            </h3>
            <p className="text-sm font-minecraft text-red-700 mb-4">
              You have already used your one-time free trial. Create a new subdomain with a paid plan.
            </p>
            {showAddButton && onShowAddForm && (
              <Button 
                variant="primary" 
                size="sm" 
                className="w-full"
                onClick={() => onShowAddForm?.()}
                icon={Plus}
              >
                Add Subdomain
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="minecraft" className="border-green-400 bg-green-50 mb-8">
      <CardContent className="pt-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-minecraft font-bold text-lg text-green-800 mb-2">
            Free Trial Available
          </h3>
          <p className="text-sm font-minecraft text-green-700 mb-4">
            Get started with a 1-day free trial - no credit card required!
          </p>
          {showAddButton && (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon={Plus}
              onClick={() => onShowAddForm?.()}
            >
              Start Free Trial
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}