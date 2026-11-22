import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card variant="minecraft" className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-grass-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-stone-600 font-minecraft">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-minecraft text-blue-800">
                    <p className="font-bold mb-1">Next Steps:</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Check your email inbox</li>
                      <li>• Click the reset link in the email</li>
                      <li>• Create a new password</li>
                      <li>• Sign in with your new password</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link to="/auth" className="block">
                  <Button variant="primary" className="w-full" icon={ArrowLeft}>
                    Back to Sign In
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  className="text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors"
                >
                  Send to a different email
                </button>
              </div>

              <div className="text-xs text-stone-500 font-minecraft">
                <p>
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          
          <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-2">
            Reset Your Password
          </h1>
          <p className="text-stone-600 font-minecraft">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Card variant="minecraft">
          <CardHeader>
            <h2 className="text-xl font-minecraft font-bold text-minecraft-800 text-center">
              Password Reset
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="steve@minecraft.com"
                required
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
                icon={Mail}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="text-center">
              <Link
                to="/auth"
                className="text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>

            <div className="pt-6 border-t border-stone-200">
              <p className="text-xs text-stone-500 font-minecraft text-center leading-relaxed">
                Remember your password? <Link to="/auth" className="text-grass-600 hover:text-grass-700 font-bold">Sign in here</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}