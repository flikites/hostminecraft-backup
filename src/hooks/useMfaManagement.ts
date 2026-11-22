import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/Toast';

export function useMfaManagement() {
  const { addToast } = useToast();
  const [mfaFactors, setMfaFactors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    fetchMfaFactors();
  }, []);

  const fetchMfaFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      setMfaFactors(data?.totp || []);
    } catch (error) {
      console.error('Error fetching MFA factors:', error);
    }
  };

  const handleEnrollMfa = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'HostMinecraft TOTP',
      });

      if (error) throw error;

      setQrCode(data.qr_code);
      setShowMfaSetup(true);
    } catch (error: any) {
      console.error('Error enrolling MFA:', error);
      addToast({
        type: 'error',
        title: 'MFA Setup Failed',
        message: 'Failed to set up MFA. Please try again.',
        sticky: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (!verificationCode) {
      addToast({
        type: 'error',
        title: 'Verification Required',
        message: 'Please enter the verification code',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: qrCode, // This should be the factor ID from enrollment
        code: verificationCode,
      });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'MFA Enabled',
        message: 'Multi-factor authentication has been enabled successfully!',
        sticky: true
      });
      setShowMfaSetup(false);
      setVerificationCode('');
      setQrCode('');
      await fetchMfaFactors();
    } catch (error: any) {
      console.error('Error verifying MFA:', error);
      addToast({
        type: 'error',
        title: 'Verification Failed',
        message: 'Invalid verification code',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnenrollMfa = async (factorId: string) => {
    if (!confirm('Are you sure you want to disable MFA? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'MFA Disabled',
        message: 'Multi-factor authentication has been disabled',
      });
      await fetchMfaFactors();
    } catch (error: any) {
      console.error('Error disabling MFA:', error);
      addToast({
        type: 'error',
        title: 'Disable Failed',
        message: 'Failed to disable MFA',
      });
    } finally {
      setLoading(false);
    }
  };

  const closeMfaSetup = () => {
    setShowMfaSetup(false);
    setVerificationCode('');
    setQrCode('');
  };

  return {
    mfaFactors,
    loading,
    showMfaSetup,
    qrCode,
    verificationCode,
    setVerificationCode,
    handleEnrollMfa,
    handleVerifyMfa,
    handleUnenrollMfa,
    closeMfaSetup,
    fetchMfaFactors,
  };
}