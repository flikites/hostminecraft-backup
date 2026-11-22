import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMfaManagement } from '../hooks/useMfaManagement';
import { useToast } from '../components/ui/Toast';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { User, Shield, Smartphone, Key, Save, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export function SettingsPage() {
  const { user, supabaseUser } = useAuth();
  const { addToast } = useToast();
  const {
    mfaFactors,
    loading: mfaLoading,
    showMfaSetup,
    qrCode,
    verificationCode,
    setVerificationCode,
    handleEnrollMfa,
    handleVerifyMfa,
    handleUnenrollMfa,
    closeMfaSetup,
  } = useMfaManagement();
  
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profileData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully',
        sticky: true
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
        sticky: true
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-2">
            Account Settings
          </h1>
          <p className="text-stone-600 font-minecraft">
            Manage your profile and security settings
          </p>
        </div>

        {!user && (
          <div className="py-12">
            <LoadingSpinner message="Loading settings..." />
          </div>
        )}

        {user && (
          <>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card variant="minecraft">
            <CardHeader>
              <h2 className="text-xl font-minecraft font-bold text-minecraft-800 flex items-center gap-3">
                <User className="w-5 h-5 text-grass-600" />
                Profile Information
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileData.full_name}
                  onChange={(value) => setProfileData({ ...profileData, full_name: value })}
                  placeholder="Steve Minecraft"
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="opacity-60"
                />
                <p className="text-xs text-stone-500 font-minecraft">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={Save}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card variant="minecraft">
            <CardHeader>
              <h2 className="text-xl font-minecraft font-bold text-minecraft-800 flex items-center gap-3">
                <Shield className="w-5 h-5 text-grass-600" />
                Security Settings
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MFA Section */}
              {/* <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-minecraft font-bold text-lg text-minecraft-800 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm font-minecraft text-stone-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>

                {mfaFactors.length > 0 ? (
                  <div className="space-y-3">
                    {mfaFactors.map((factor) => (
                      <div key={factor.id} className="bg-grass-50 border border-grass-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-minecraft font-bold text-grass-800">
                              {factor.friendly_name || 'TOTP Authenticator'}
                            </p>
                            <p className="text-sm font-minecraft text-grass-600">
                              Status: {factor.status}
                            </p>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUnenrollMfa(factor.id)}
                            disabled={mfaLoading}
                          >
                            Disable
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-minecraft font-bold text-yellow-800 mb-2">
                          MFA Not Enabled
                        </p>
                        <p className="text-sm font-minecraft text-yellow-700 mb-3">
                          Enable two-factor authentication to secure your account with an authenticator app.
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleEnrollMfa}
                          disabled={mfaLoading}
                          icon={Key}
                        >
                          {mfaLoading ? 'Setting up...' : 'Enable MFA'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div> */}

              {/* Password Reset */}
              <div className="pt-6 border-t border-stone-200">
                <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                  Password
                </h3>
                <p className="text-sm font-minecraft text-stone-600 mb-3">
                  Reset your password to keep your account secure.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/password-reset'}
                  icon={Key}
                >
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MFA Setup Modal */}
        {showMfaSetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-md w-full">
              <Card variant="minecraft">
                <CardHeader>
                  <h2 className="text-xl font-minecraft font-bold text-minecraft-800">
                    Set Up Two-Factor Authentication
                  </h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-minecraft text-stone-600 mb-4">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    
                    {/* Manual Setup Code */}
                    <div className="mb-4 p-3 bg-stone-100 rounded-lg">
                      <p className="text-xs font-minecraft text-stone-600 mb-2">
                        Can't scan? Enter this code manually:
                      </p>
                      <code className="text-sm font-minecraft font-bold text-stone-800 break-all">
                        {qrCode ? 'JBSWY3DPEHPK3PXP' : 'Loading...'}
                      </code>
                    </div>
                    
                    {qrCode && (
                      <div className="bg-white p-4 rounded-lg border-2 border-stone-300 inline-block">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                      </div>
                    )}
                  </div>

                  <Input
                    label="Verification Code"
                    value={verificationCode}
                    onChange={setVerificationCode}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />

                  <div className="flex gap-4">
                    <Button
                      variant="primary"
                      onClick={handleVerifyMfa}
                      disabled={mfaLoading || !verificationCode}
                      className="flex-1"
                    >
                      {mfaLoading ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        closeMfaSetup();
                      }}
                      disabled={mfaLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}