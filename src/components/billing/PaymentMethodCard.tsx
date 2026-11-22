import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CreditCard, ExternalLink } from 'lucide-react';

interface PaymentMethodCardProps {
  stripeLoading: boolean;
  onUpdatePaymentMethod: () => void;
}

export function PaymentMethodCard({ stripeLoading, onUpdatePaymentMethod }: PaymentMethodCardProps) {
  return (
    <Card variant="minecraft" className="mb-8">
      <CardHeader>
        <h2 className="text-xl font-minecraft font-bold text-minecraft-800 flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-grass-600" />
          Update Payment Method
        </h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="font-minecraft text-stone-700 mb-2">
              Manage your payment methods and billing information
            </p>
            <p className="text-sm font-minecraft text-stone-600">
              Update your credit card, view invoices, and manage billing details through Stripe's secure portal.
            </p>
          </div>
          <Button
            onClick={onUpdatePaymentMethod}
            variant="primary"
            disabled={stripeLoading}
            icon={ExternalLink}
            className="flex-shrink-0"
          >
            {stripeLoading ? 'Loading...' : 'Update Payment Method'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}