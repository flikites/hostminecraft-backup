import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';
import { Subdomain } from '../../types';
import { useToast } from '../ui/Toast';
import { SubdomainForm } from './SubdomainForm';
import { PlanSelection } from './PlanSelection';

// Prevent background scrolling when modal is open
const usePreventScroll = (isOpen: boolean) => {
  React.useEffect(() => {
    if (isOpen) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Get scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Disable scrolling and compensate for scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);
};

interface AddSubdomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subdomain: string; target: string; minecraft_server_port: string }, selectedPriceId?: string) => Promise<void>;
  hasActiveSubscription: boolean;
  hasActiveTrial: boolean;
  hasUsedTrial?: boolean;
  upgradeSubdomainId?: string;
  subdomains: Subdomain[];
  checkSubdomainAvailability: (subdomain: string) => Promise<boolean>;
  checkingAvailability: boolean;
  prefilledSubdomain?: string;
}

export function AddSubdomainModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  hasActiveSubscription, 
  hasActiveTrial, 
  hasUsedTrial = false,
  upgradeSubdomainId,
  subdomains,
  checkSubdomainAvailability,
  checkingAvailability,
  prefilledSubdomain
}: AddSubdomainModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    subdomain: '',
    target: '',
    minecraft_server_port: '25565',
  });
  const [loading, setLoading] = useState(false);
  const [showTargetInfo, setShowTargetInfo] = useState(false);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  // Prevent background scrolling when modal is open
  usePreventScroll(isOpen);

  // Pre-populate form data for upgrades and handle plan selection
  React.useEffect(() => {
    if (isOpen && upgradeSubdomainId) {
      // Find the subdomain to upgrade and populate form data
      const subdomainToUpgrade = subdomains.find(s => s.id === upgradeSubdomainId);
      if (subdomainToUpgrade) {
        setFormData({
          subdomain: subdomainToUpgrade.subdomain,
          target: subdomainToUpgrade.minecraft_server_ip,
          minecraft_server_port: subdomainToUpgrade.minecraft_server_port.toString(),
        });
      }
      setShowPlanSelection(true);
    } else if (isOpen && !upgradeSubdomainId && prefilledSubdomain) {
      // Pre-fill with subdomain from signup flow
      setFormData({ 
        subdomain: prefilledSubdomain, 
        target: '', 
        minecraft_server_port: '25565' 
      });
      setShowPlanSelection(false);
    } else if (isOpen && !upgradeSubdomainId && !prefilledSubdomain) {
      // Reset form for new subdomains
      setFormData({ subdomain: '', target: '', minecraft_server_port: '25565' });
      setShowPlanSelection(false);
    }
  }, [isOpen, upgradeSubdomainId, prefilledSubdomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if payment is required and we haven't shown plan selection yet
    const trialSubdomains = subdomains.filter(s => s.status === 'trial');
    const isEligibleForNewTrial = !hasUsedTrial && trialSubdomains.length === 0 && !upgradeSubdomainId;
    const needsPayment = !isEligibleForNewTrial;
    
    if (needsPayment && !showPlanSelection) {
      setShowPlanSelection(true);
      return;
    }

    setLoading(true);
    try {
      // Always pass the current form data (which is pre-populated for upgrades)
      await onSubmit(formData);
      setFormData({ subdomain: '', target: '', minecraft_server_port: '25565' });
      setShowPlanSelection(false);
      onClose();
    } catch (error) {
      console.error('Error creating subdomain:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (priceId: string) => {
    setLoading(true);
    try {
      // Show blue toast for checkout redirect
      addToast({
        type: 'info',
        title: 'Redirecting to Checkout',
        message: 'Opening Stripe payment page...',
      });

      // Always pass the current form data and selected price ID
      await onSubmit(formData, priceId);
      setFormData({ subdomain: '', target: '', minecraft_server_port: '25565' });
      setShowPlanSelection(false);
      onClose();
    } catch (error) {
      console.error('Error creating subdomain:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowPlanSelection(false);
  };

  // Determine button text and behavior
  const getButtonText = () => {
    if (loading) return 'Creating...';
    
    if (upgradeSubdomainId) {
      return 'Continue to Payment';
    }
    
    const trialSubdomains = subdomains.filter(s => s.status === 'trial');
    const isEligibleForNewTrial = !hasUsedTrial && trialSubdomains.length === 0;
    
    if (isEligibleForNewTrial) {
      return 'Start Free Trial';
    }
    
    if (!isEligibleForNewTrial) {
      return 'Continue to Payment';
    }
    return 'Create Subdomain';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card variant="minecraft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-minecraft font-bold text-minecraft-800">
                {showPlanSelection ? 'Select Your Plan' : 'Add New Subdomain'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onClose}
              />
            </div>
          </CardHeader>
          <CardContent>
            {showPlanSelection ? (
              <PlanSelection
                formData={formData}
                loading={loading}
                upgradeSubdomainId={upgradeSubdomainId}
                onSelectPlan={handleSelectPlan}
                onBackToForm={handleBackToForm}
              />
            ) : (
              <SubdomainForm
                formData={formData}
                setFormData={setFormData}
                loading={loading}
                onSubmit={handleSubmit}
                onClose={onClose}
                showTargetInfo={showTargetInfo}
                setShowTargetInfo={setShowTargetInfo}
                upgradeSubdomainId={upgradeSubdomainId}
                getButtonText={getButtonText}
                checkSubdomainAvailability={checkSubdomainAvailability}
                checkingAvailability={checkingAvailability}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}