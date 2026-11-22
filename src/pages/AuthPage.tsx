import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Server, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { signUp, signInWithPassword } = useAuth();
  const { signInWithGoogle, signInWithMicrosoft } = useAuth();
  const navigate = useNavigate();

  // Hide header on auth page
  useEffect(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }

    // Cleanup: show header when leaving the page
    return () => {
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  const handleSocialAuth = async (provider: 'google' | 'microsoft') => {
    setLoading(true);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithMicrosoft();
      }
      // The auth redirect will handle the rest
    } catch (error: any) {
      console.error(`${provider} auth error:`, error);
      toast.error(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email field changes for signup
  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    
    // For signup mode, show password field when valid email is entered
    if (!isLogin) {
      setShowPasswordField(isValidEmail(value));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithPassword(formData.email, formData.password);
        toast.success('Welcome back! Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        const result = await signUp(formData.email, formData.password);
        if (result.user && !result.user.email_confirmed_at) {
          toast.success('Account created! Please check your email to verify your account, then you can sign in.');
          setIsLogin(true); // Switch to login mode after signup
        } else {
          toast.success('Welcome! Redirecting to dashboard...');
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      // Handle specific error cases with appropriate toast messages
      if (isLogin) {
        // Login error handling
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('Invalid email or password')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not found')) {
          toast.error('No account found with this email address. Please sign up first.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a few minutes before trying again.');
        } else {
          toast.error('Sign in failed. Please check your credentials and try again.');
        }
      } else {
        // Signup error handling
        if (error.message.includes('User already registered') || 
            error.message.includes('Email address is already registered')) {
          toast.error('An account with this email already exists. Please sign in instead.');
          setIsLogin(true);
          setFormData({ email: formData.email, password: '' });
        } else if (error.message.includes('Password should be at least')) {
          toast.error('Password must be at least 6 characters long.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (error.message.includes('Signup is disabled')) {
          toast.error('Account creation is currently disabled. Please contact support.');
        } else if (error.message.includes('Email rate limit exceeded')) {
          toast.error('Too many signup attempts. Please wait before trying again.');
        } else {
          toast.error('Account creation failed. Please try again or contact support.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '' });
    setShowPasswordField(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 flex items-center justify-center px-4 sm:px-6 lg:px-6">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/logo.svg" alt="HostMinecraft Logo" className="w-8 h-8" />
            <span className="font-minecraft font-bold text-xl text-minecraft-900">HostMinecraft</span>
          </div>
      {/*  <div className="text-center mb-8 mt-8">
           h1 tags 
          <h1 className="text-3xl font-minecraft font-bold text-minecraft-900 mb-2">
            HostMinecraft
          </h1>
          
          <p className="text-stone-600 font-minecraft">
            Sign in to manage your subdomains
          </p>
        </div>
*/}
        <Card variant="minecraft">
          <CardHeader>
            <h2 className="text-xl font-minecraft font-bold text-minecraft-800 text-center">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Social Login Options */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialAuth('microsoft')}
                variant="primary"
                className="w-full text-base py-3 bg-blue-600 hover:bg-black focus:ring-blue-500 text-white border-2 border-stone-300 hover:border-black shadow-minecraft hover:shadow-minecraft-hover transition-all duration-200"
                disabled={loading}
                icon={() => (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                  </svg>
                )}
              >
                {isLogin ? 'Sign in with Microsoft' : 'Continue with Microsoft'}
              </Button>

              <Button
                onClick={() => handleSocialAuth('google')}
                variant="primary"
                className="w-full text-base py-3 bg-grass hover:bg-black focus:ring-stone-500 text-black hover:text-white border-2 border-stone-300 hover:border-black shadow-minecraft hover:shadow-minecraft-hover transition-all duration-200"
                disabled={loading}
                icon={() => (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
              >
                {isLogin ? 'Sign in with Google' : 'Continue with Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-stone-500 font-minecraft">or</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                placeholder="steve@minecraft.com"
                required
              />

              {(isLogin || showPasswordField) && (
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(value) => setFormData({ ...formData, password: value })}
                    placeholder={isLogin ? "Enter your password" : "Create a secure password"}
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
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full text-base py-3 bg-minecraft-700 hover:bg-minecraft-600 text-white shadow-minecraft hover:shadow-lg active:shadow-sm active:translate-y-1 transition-all duration-150 transform"
                disabled={loading || (!isLogin && !showPasswordField)}
              >
                {loading 
                  ? 'Processing...' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'
                }
              </Button>
            </form>

            {isLogin && (
              <div className="text-center">
                <Link
                  to="/password-reset"
                  className="text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={toggleMode}
                className="text-minecraft-700 hover:text-minecraft-900 font-minecraft text-sm font-bold transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up free" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>

            {!isLogin && (
              <div className="pt-6 border-t border-stone-200">
                <p className="text-xs text-stone-500 font-minecraft text-center leading-relaxed">
                  By creating an account, you agree to our terms of service and privacy policy.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-stone-600 font-minecraft">
            {isLogin 
              ? 'New to HostMinecraft? Create an account to get started with your 1-day free trial.'
              : 'Get started with your 1-day free trial - no credit card required!'
            }
          </p>
        </div>
      </div>
    </div>
  );
}