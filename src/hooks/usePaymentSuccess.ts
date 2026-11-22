// Hook to manage payment success state and prevent duplicate toasts
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';

interface PaymentSuccessData {
  sessionId?: string;
  subdomainName?: string;
  target?: string;
  port?: string;
}

export function usePaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [hasProcessedSuccess, setHasProcessedSuccess] = useState(false);

  useEffect(() => {
    // Check if we've already processed payment success in this session
    const processedKey = 'payment_success_processed';
    const alreadyProcessed = sessionStorage.getItem(processedKey);
    
    if (alreadyProcessed) {
      setHasProcessedSuccess(true);
      return;
    }

    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    const paymentSuccess = urlParams.get('payment_success');
    const subdomainName = urlParams.get('subdomain');
    const target = urlParams.get('target');
    const port = urlParams.get('port');

    // Check if this is a payment success scenario
    const isPaymentSuccess = sessionId || paymentSuccess === 'true';
    
    if (isPaymentSuccess && !hasProcessedSuccess) {
      console.log('🎉 Processing payment success - showing unified toast');
      
      // Mark as processed to prevent duplicates
      sessionStorage.setItem(processedKey, 'true');
      setHasProcessedSuccess(true);
      
      // Show single unified success toast
      addToast({
        type: 'success',
        title: 'Payment Successful!',
        message: subdomainName 
          ? `Your subdomain ${subdomainName}.hostminecraft.com is now active`
          : 'Your subscription is now active',
        sticky: true
      });

      // Handle auto-copy functionality if subdomain info is available
      if (subdomainName) {
        const fullDomain = `${subdomainName}.hostminecraft.com`;
        const domainWithPort = port && port !== '25565' 
          ? `${fullDomain}:${port}`
          : fullDomain;
        
        // Small delay to let the success toast show first
        setTimeout(async () => {
          try {
            await navigator.clipboard.writeText(domainWithPort);
            addToast({
              type: 'success',
              title: 'Copied to Clipboard!',
              message: `${domainWithPort} is ready to share with your players!`,
              sticky: true
            });
          } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Show fallback toast with domain info
            addToast({
              type: 'info',
              title: 'Subdomain Ready!',
              message: `Your domain: ${domainWithPort}`,
              sticky: true
            });
          }
        }, 2000);
      }

      // Clean up URL parameters after processing
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search, addToast, hasProcessedSuccess]);

  // Clear the processed flag when navigating away from success-related pages
  useEffect(() => {
    const currentPath = location.pathname;
    if (!currentPath.includes('/success') && !currentPath.includes('/dashboard')) {
      sessionStorage.removeItem('payment_success_processed');
      setHasProcessedSuccess(false);
    }
  }, [location.pathname]);

  return {
    hasProcessedSuccess,
    clearProcessedFlag: () => {
      sessionStorage.removeItem('payment_success_processed');
      setHasProcessedSuccess(false);
    }
  };
}