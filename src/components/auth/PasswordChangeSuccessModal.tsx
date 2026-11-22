import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CheckCircle, Home } from 'lucide-react';

interface PasswordChangeSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRedirecting: boolean;
  onSignInNow: () => void;
  onGoToHomepage: () => void;
}

export function PasswordChangeSuccessModal({
  isOpen,
  onClose,
  isRedirecting,
  onSignInNow,
  onGoToHomepage
}: PasswordChangeSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full">
        <Card variant="minecraft" className="text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-grass-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-minecraft animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-4">
              Password Updated!
            </h1>
            <p className="text-stone-600 font-minecraft">
              Your password has been successfully changed and is now active.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-grass-50 border border-grass-200 rounded-lg p-4">
              <div className="text-sm font-minecraft text-grass-800">
                <p className="font-bold mb-3 text-center">What happens next:</p>
                <ul className="space-y-1 text-grass-700 text-left">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-grass-600" />
                    <span>You've been signed out for security</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-grass-600" />
                    <span>Your new password is now active</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {isRedirecting ? (
                      <div className="w-4 h-4 border-2 border-grass-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-grass-600" />
                    )}
                    <span>Redirecting to sign in page...</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={onSignInNow}
                icon={CheckCircle}
              >
                Sign In Now
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={onGoToHomepage}
                icon={Home}
              >
                Go to Homepage
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-xs text-blue-800 font-minecraft text-center">
                <p className="font-bold mb-1">🔒 Security Notice</p>
                <p>For your security, you've been automatically signed out. Please sign in with your new password.</p>
              </div>
            </div>
            
            <div className="text-xs text-stone-500 font-minecraft text-center">
              {isRedirecting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></div>
                  Redirecting automatically in a few seconds...
                </span>
              ) : (
                'Preparing redirect...'
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}