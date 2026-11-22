import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth/useAuth';
import { useDashboardData } from '../hooks/useDashboardData';
import { useSubdomainManagement } from '../hooks/useSubdomainManagement';
import { usePaymentSuccess } from '../hooks/usePaymentSuccess';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { AddSubdomainModal } from '../components/dashboard/AddSubdomainModal';
import { SubdomainList } from '../components/dashboard/SubdomainList';
import { FreeTrialCard } from '../components/dashboard/FreeTrialCard';
import { EditSubdomainModal } from '../components/dashboard/EditSubdomainModal';
import { useToast } from '../components/ui/Toast';
import { Subdomain } from '../types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function DashboardPage() {
  const { user } = useAuth();
  const { hasProcessedSuccess } = usePaymentSuccess();
  const {
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
  } = useDashboardData();
  
  const {
    handleAddSubdomain,
    handleDeleteSubdomain,
    handleEditSubdomain,
    checkSubdomainAvailability,
    checkingAvailability,
    loading: managementLoading,
  } = useSubdomainManagement();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [upgradeSubdomainId, setUpgradeSubdomainId] = useState<string | null>(null);
  const [editingSubdomain, setEditingSubdomain] = useState<Subdomain | null>(null);
  const [prefilledSubdomain, setPrefilledSubdomain] = useState<string | null>(null);

  // Check for pending subdomain from signup flow
  useEffect(() => {
    if (!user) return;
    
    const pendingSubdomain = sessionStorage.getItem('pending_subdomain');
    if (pendingSubdomain && !loading && user && subdomains.length === 0) {
      console.log('🎯 Found pending subdomain from signup:', pendingSubdomain);
      
      // Clear the stored subdomain
      sessionStorage.removeItem('pending_subdomain');
      
      // Store the subdomain to pre-fill the modal
      setPrefilledSubdomain(pendingSubdomain);
      
      // Auto-open the modal
      setShowAddModal(true);
    }
  }, [loading, user, subdomains.length]);

  const onAddSubdomainSuccess = (newSubdomain: Subdomain) => {
    setSubdomains([newSubdomain, ...subdomains]);
  };

  const onDeleteSubdomainSuccess = (deletedId: string) => {
    setSubdomains(subdomains.filter(s => s.id !== deletedId));
  };

  const onEditSubdomainSuccess = () => {
    setEditingSubdomain(null);
    fetchSubdomains();
  };

  const handleShowUpgradeModal = (subdomainId: string) => {
    setUpgradeSubdomainId(subdomainId);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setUpgradeSubdomainId(null);
    setPrefilledSubdomain(null);
  };

  const handleEditSubdomainWrapper = async (subdomainId: string, updatedData: { target: string; port: number }) => {
    await handleEditSubdomain(subdomainId, {
      target: updatedData.target,
      minecraft_server_port: updatedData.port.toString(),
    }, onEditSubdomainSuccess);
  };

  // Listen for successful payments and refresh data
  useEffect(() => {
    // Check if we're returning from a successful payment
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    // Only refresh data if payment success detected and not already processed
    if ((paymentSuccess || sessionId) && !hasProcessedSuccess) {
      console.log('🔄 Payment success detected, refreshing dashboard data');
      refreshData();
    }
    
    // Give webhook time to process for session_id redirects
    if (sessionId && !hasProcessedSuccess) {
      setTimeout(() => {
        console.log('🔄 Refreshing data after webhook processing delay');
        refreshData();
      }, 2000);
    }
  }, [hasProcessedSuccess, refreshData]);

  // Auto-show modal for new users who haven't started their trial
  useEffect(() => {
    if (!user) return;
    
    if (!loading && !hasUsedTrial && subdomains.length === 0) {
      // Small delay to ensure the page has loaded
      const timer = setTimeout(() => {
        setShowAddModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [loading, hasUsedTrial, subdomains.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-2">
            Dashboard
          </h1>
          <p className="text-stone-600 font-minecraft">
            Manage your Minecraft server subdomains
          </p>
        </div>

        {loading && (
          <div className="py-12">
            <LoadingSpinner message="Loading your dashboard..." />
          </div>
        )}

        {!loading && (
          <>
        {/* Free Trial Card - only show if no active subscription */}
        {!hasActiveSubscription && (
          <FreeTrialCard
            hasActiveTrial={hasActiveTrial}
            hasUsedTrial={hasUsedTrial}
            trialSubdomain={trialSubdomains[0] ? {
              id: trialSubdomains[0].id,
              unique_id: trialSubdomains[0].unique_id,
              subdomain: trialSubdomains[0].subdomain,
              trial_ends_at: trialSubdomains[0].trial_ends_at
            } : null}
            onUpgradeToKeep={handleShowUpgradeModal}
            onShowAddForm={() => setShowAddModal(true)}
          />
        )}

        <DashboardStats 
          subdomains={subdomains} 
          onShowAddModal={() => setShowAddModal(true)} 
        />
        
        <div data-section="my-subdomains">
          <SubdomainList 
          subdomains={subdomains}
          hasActiveSubscription={hasActiveSubscription}
          onDelete={(id) => handleDeleteSubdomain(id, onDeleteSubdomainSuccess)}
          onUpgrade={handleShowUpgradeModal}
          onShowAddForm={() => setShowAddModal(true)}
          onEdit={setEditingSubdomain}
          checkSubdomainAvailability={checkSubdomainAvailability}
          />
        </div>
        
        <AddSubdomainModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          onSubmit={(formData, selectedPriceId) => 
            handleAddSubdomain(formData, selectedPriceId, subdomains, onAddSubdomainSuccess, upgradeSubdomainId)
          }
          hasActiveSubscription={hasActiveSubscription}
          hasActiveTrial={hasActiveTrial}
          hasUsedTrial={hasUsedTrial}
          upgradeSubdomainId={upgradeSubdomainId}
          subdomains={subdomains}
          checkSubdomainAvailability={checkSubdomainAvailability}
          checkingAvailability={checkingAvailability}
          prefilledSubdomain={prefilledSubdomain}
        />

        <EditSubdomainModal
          subdomain={editingSubdomain}
          onClose={() => setEditingSubdomain(null)}
          onSave={handleEditSubdomainWrapper}
          loading={managementLoading}
        />
          </>
        )}
      </div>
    </div>
  );
}