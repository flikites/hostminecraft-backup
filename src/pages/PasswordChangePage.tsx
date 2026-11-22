import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Key, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PasswordChangeSuccessModal } from '../components/auth/PasswordChangeSuccessModal';

export function PasswordChangePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Check if we have valid session parameters and verify the token
  useEffect(() => {
    const verifyAndSetSession = async () => {
      try {
        // Get the token hash and type from URL parameters
        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        console.log('URL parameters:', { type, tokenHash: !!tokenHash });

        if (type !== 'recovery' || !tokenHash) {
          console.log('Missing required parameters');
          setIsValidSession(false);
          return;
        }

        // Verify the OTP token and establish session
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        });

        if (error) {
          console.error('Token verification error:', error);
          setIsValidSession(false);
          return;
        }

        if (data.session && data.user) {
          console.log('Session established successfully');
          setIsValidSession(true);
          setSessionVerified(true);
          
          // Clear URL parameters to prevent reuse
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        } else {
          console.log('No session returned from verification');
          setIsValidSession(false);
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        setIsValidSession(false);
      }
    };

    verifyAndSetSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('No active session found. Please request a new password reset link.');
      }

      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (error) {
        throw error;
      }

      // Set success state immediately
      setSuccess(true);
      toast.success('Password updated successfully! Redirecting to sign in...');
      
      // Sign out the user to ensure they use the new password
      await supabase.auth.signOut();
      
      // Start redirect countdown
      setIsRedirecting(true);
      
      // Redirect to sign in page after a short delay
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 5000);
    } catch (error: any) {
      console.error('Password update error:', error);
      
      if (error.message.includes('session_not_found') || 
          error.message.includes('invalid_token') ||
          error.message.includes('No active session')) {
        toast.error('Password reset session has expired. Please request a new reset link.');
        setTimeout(() => {
          navigate('/password-reset', { replace: true });
        }, 2000);
      } else if (error.message.includes('Password should be at least')) {
        toast.error('Password must be at least 6 characters long');
      } else if (error.message.includes('New password should be different')) {
        toast.error('New password must be different from your current password');
      } else if (error.message.includes('Password is too weak')) {
        toast.error('Password is too weak. Please choose a stronger password');
      } else {
        toast.error(error.message || 'Failed to update password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session validity
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card variant="minecraft" className="text-center">
            <CardContent className="py-12">
              <div className="w-12 h-12 bg-grass-500 rounded-lg mx-auto mb-4 animate-pulse"></div>
              <p className="font-minecraft text-stone-600">
                Verifying reset link...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show error if session is invalid
  if (isValidSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card variant="minecraft" className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-stone-600 font-minecraft">
                This password reset link is invalid or has expired.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm font-minecraft text-red-800">
                  <p className="font-bold mb-2">Possible reasons:</p>
                  <ul className="space-y-1 text-red-700 text-left">
                    <li>• The link has expired (links are valid for 1 hour)</li>
                    <li>• The link has already been used</li>
                    <li>• The link was copied incorrectly</li>
                    <li>• The link is missing required parameters</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate('/password-reset')}
                >
                  Request New Reset Link
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Back to Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  // Show password change form
  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/logo.svg" alt="HostMinecraft Logo" className="w-8 h-8 shadow-minecraft" />
            <span className="font-minecraft font-bold text-xl text-minecraft-900">HostMinecraft</span>
          </div>
          <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-2">
            Set New Password
          </h1>
          <p className="text-stone-600 font-minecraft">
            Enter your new password below to complete the reset process.
          </p>
        </div>

        <Card variant="minecraft">
          <CardHeader>
            <h2 className="text-xl font-minecraft font-bold text-minecraft-800 text-center flex items-center justify-center gap-2">
              <Key className="w-5 h-5 text-grass-600" />
              Update Password
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {sessionVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-minecraft text-green-800 font-bold">
                    Reset link verified successfully
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  placeholder="Enter your new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-stone-500 hover:text-stone-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
                  placeholder="Confirm your new password"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-stone-500 hover:text-stone-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm font-minecraft text-blue-800">
                  <p className="font-bold mb-2">Password Requirements:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`w-3 h-3 ${formData.password.length >= 6 ? 'text-green-600' : 'text-stone-400'}`} />
                      <span>At least 6 characters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className={`w-3 h-3 ${formData.password === formData.confirmPassword && formData.password.length > 0 ? 'text-green-600' : 'text-stone-400'}`} />
                      <span>Passwords match</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || formData.password.length < 6 || formData.password !== formData.confirmPassword}
                icon={Key}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>

            <div className="pt-6 border-t border-stone-200">
              <p className="text-xs text-stone-500 font-minecraft text-center leading-relaxed">
                After updating your password, you'll be signed out and redirected to sign in with your new credentials.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <PasswordChangeSuccessModal
        isOpen={success}
        onClose={() => setSuccess(false)}
        isRedirecting={isRedirecting}
        onSignInNow={() => navigate('/auth', { replace: true })}
        onGoToHomepage={() => navigate('/', { replace: true })}
      />
    </div>
  );
}