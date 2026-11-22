import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubdomainCount } from '../../hooks/useSubdomainCount';
import { useSubdomainManagement } from '../../hooks/useSubdomainManagement';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent } from '../ui/Card';
import { Server, Eye, EyeOff, CheckCircle, Clock, TrendingUp, Users, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeroSignupSectionProps {
  showSignInForm?: boolean;
}

type SignupStep = 'subdomainInput' | 'signupOptions' | 'emailPassword';

export function HeroSignupSection({ showSignInForm = false }: HeroSignupSectionProps) {
  const { user, signUp, signInWithPassword, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignupStep>('subdomainInput');
  const [subdomainName, setSubdomainName] = useState('');
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { availableSubdomains, isLoading: isLoadingCount, error: countError } = useSubdomainCount();
  const { checkSubdomainAvailability, checkingAvailability } = useSubdomainManagement();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Store subdomain in sessionStorage for persistence across auth flows
  const storeSubdomainForSignup = (subdomain: string) => {
    sessionStorage.setItem('pending_subdomain', subdomain);
  };

  const clearStoredSubdomain = () => {
    sessionStorage.removeItem('pending_subdomain');
  };

  // Use the prop to control form visibility
  useEffect(() => {
    if (showSignInForm) {
      setIsLogin(true);
      setCurrentStep('emailPassword');
    }
  }, [showSignInForm]);

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

  // Debounced availability check
  const debouncedAvailabilityCheck = useCallback(
    (subdomain: string) => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(async () => {
        if (subdomain && subdomain.trim() !== '') {
          const available = await checkSubdomainAvailability(subdomain);
          setIsSubdomainAvailable(available);
        } else {
          setIsSubdomainAvailable(null);
        }
      }, 300); // 300ms debounce
    },
    [checkSubdomainAvailability]
  );

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setIsSubdomainAvailable(null);
    setSubdomainName(cleanValue);
    
    // Trigger debounced availability check
    if (cleanValue && cleanValue.trim() !== '') {
      debouncedAvailabilityCheck(cleanValue);
    }
  };

  const handleSubdomainBlur = () => {
    if (subdomainName && subdomainName.trim() !== '') {
      debouncedAvailabilityCheck(subdomainName);
    }
  };

  const getAvailabilityDisplay = () => {
    if (!subdomainName) return null;
    
    if (checkingAvailability) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-blue-600 mt-1">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking availability...</span>
        </div>
      );
    }

    if (isSubdomainAvailable === true) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-grass-600 mt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Available!</span>
        </div>
      );
    }

    if (isSubdomainAvailable === false) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-red-600 mt-1">
          <XCircle className="w-4 h-4" />
          <span>Already taken</span>
        </div>
      );
    }

    return null;
  };

  const handleStartFreeTrial = () => {
    if (isSubdomainAvailable === true && subdomainName) {
      setCurrentStep('signupOptions');
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'microsoft') => {
    setLoading(true);
    try {
      // Store subdomain before social auth redirect
      if (subdomainName) {
        storeSubdomainForSignup(subdomainName);
      }
      
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
          // Store subdomain for after email verification
          if (subdomainName) {
            storeSubdomainForSignup(subdomainName);
          }
          toast.success('Account created! Please check your email to verify your account, then you can sign in.');
        } else {
          toast.success('Welcome! Redirecting to dashboard...');
          // Store subdomain and redirect to dashboard for immediate subdomain creation
          if (subdomainName) {
            storeSubdomainForSignup(subdomainName);
          }
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
    setCurrentStep(isLogin ? 'subdomainInput' : 'emailPassword');
  };

  const renderSubdomainInputStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
          Choose Your Subdomain
        </h2>
        <p className="text-stone-600 font-minecraft text-sm">
          Pick a memorable name for your Minecraft server
        </p>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex flex-col lg:flex-row lg:items-end gap-2">
            <div className="flex-1 lg:w-auto w-full flex justify-center">
              <div className="w-full lg:w-auto max-w-none lg:max-w-full" style={{ width: window.innerWidth < 1024 ? '90%' : '100%' }}>
              <Input
                label="Subdomain Name"
                value={subdomainName}
                onChange={handleSubdomainChange}
                onBlur={handleSubdomainBlur}
                placeholder="myserver"
                required
              />
              </div>
            </div>
            <div className="text-center lg:text-left lg:pb-2">
              <span className="text-stone-600 font-minecraft text-sm">
                .hostminecraft.com
              </span>
            </div>
          </div>
        </div>
        {getAvailabilityDisplay()}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-xs font-minecraft text-blue-800 text-center">
          <p className="font-bold mb-1">💡 Pro Tip</p>
          <p>Choose something easy to remember!</p>
        </div>
      </div>

      <Button
        onClick={handleStartFreeTrial}
        variant="primary"
        className="w-full text-lg py-3"
        disabled={loading || !isSubdomainAvailable || checkingAvailability}
        icon={Server}
      >
        {checkingAvailability ? 'Checking...' : 'Start Free Trial'}
      </Button>

      <div className="text-center">
        <button
          onClick={() => {
            setIsLogin(true);
            setCurrentStep('emailPassword');
          }}
          className="text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );

  const renderSignupOptionsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
          Create Your Account
        </h2>
        <p className="text-stone-600 font-minecraft text-sm mb-3">
          Your subdomain: <span className="font-bold text-grass-700">{subdomainName}.hostminecraft.com</span>
        </p>
        <p className="text-stone-500 font-minecraft text-xs">
          Choose how you'd like to sign up
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => handleSocialAuth('microsoft')}
          variant="secondary"
          className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          Continue with Microsoft
        </Button>

        <Button
          onClick={() => handleSocialAuth('google')}
          variant="secondary"
          className="w-full text-lg py-3 bg-red-600 hover:bg-red-700 text-white"
          disabled={loading}
        >
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-stone-500 font-minecraft">or</span>
          </div>
        </div>

        <Button
          onClick={() => setCurrentStep('emailPassword')}
          variant="ghost"
          className="w-full text-lg py-3 border-2 border-stone-300 hover:border-grass-400"
          disabled={loading}
        >
          Use My Email
        </Button>
      </div>

      <div className="text-center">
        <Button
          onClick={() => setCurrentStep('subdomainInput')}
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          disabled={loading}
        >
          Back to subdomain
        </Button>
      </div>
    </div>
  );

  const renderEmailPasswordStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
          {isLogin ? 'Welcome Back!' : 'Create Your Account'}
        </h2>
        {!isLogin && (
          <p className="text-stone-600 font-minecraft text-sm mb-3">
            Your subdomain: <span className="font-bold text-grass-700">{subdomainName}.hostminecraft.com</span>
          </p>
        )}
        <p className="text-stone-600 font-minecraft text-sm">
          {isLogin ? 'Sign in to manage your subdomains' : '1 day free • No credit card required'}
        </p>
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
          className="w-full text-lg py-3"
          disabled={loading || (!isLogin && !showPasswordField)}
          icon={Server}
        >
          {loading 
            ? 'Processing...' 
            : isLogin 
              ? 'Sign In' 
              : 'Start Free Trial'
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
          className="text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors"
        >
          {isLogin 
            ? "Don't have an account? Sign up free" 
            : 'Already have an account? Sign in'
          }
        </button>
      </div>

      {!isLogin && (
        <div className="text-center">
          <Button
            onClick={() => setCurrentStep('signupOptions')}
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            disabled={loading}
          >
            Back to signup options
          </Button>
        </div>
      )}

      {!isLogin && (
        <div className="pt-6 border-t border-stone-200">
          <p className="text-xs text-stone-500 font-minecraft text-center leading-relaxed">
            By signing up, you agree to our terms of service and privacy policy. 
            Cancel anytime during your free trial.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div id="signup-section" className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:gap-16 lg:items-center">
          
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-3xl sm:text-3xl lg:text-5xl font-minecraft font-bold text-minecraft-900 mb-6 leading-tight">
              Instant Domain For<span className="block text-grass-600 mt-2"> Minecraft Servers</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-stone-600 font-minecraft mb-8 leading-relaxed max-w-2xl lg:max-w-none mx-auto">
              Instantly create a domain and start sharing it. <br></br>
              <span className="font-bold text-grass-700"> yourserver.hostminecraft.com</span>
            </p>

            {/* Mobile: Signup Form - moved up */}
            <div className="lg:hidden mb-8">
              <div id="sform" className="w-full max-w-md mx-auto">
                {user ? (
                  <Card variant="minecraft" className="shadow-2xl">
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <CheckCircle className="w-16 h-16 text-grass-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
                          Welcome Back!
                        </h2>
                        <p className="text-stone-600 font-minecraft text-sm">
                          You're already signed in. Ready to manage your subdomains?
                        </p>
                      </div>
                      <Link to="/dashboard">
                        <Button variant="primary" className="w-full text-lg py-3" icon={Server}>
                          Go to Dashboard
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Card variant="minecraft" className="shadow-2xl">
                    <CardContent className="p-8">
                      {currentStep === 'subdomainInput' && renderSubdomainInputStep()}
                      {currentStep === 'signupOptions' && renderSignupOptionsStep()}
                      {currentStep === 'emailPassword' && renderEmailPasswordStep()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Mobile Features - moved up */}
            <div className="lg:hidden mb-8 space-y-3">
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700 text-sm">Instant Domain Setup</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700 text-sm">Link IP or Existing Domain</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700 text-sm">Reliable Cloudflare DNS</span>
              </div>
              <div className="flex items-center gap-3 justify-center">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700 text-sm"> Use Any Hosting Provider</span>
              </div>
            </div>

            {/* Scarcity Counter */}
            <div className="mb-8 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <Clock className="w-5 h-5 text-red-600" />
                <span className="font-minecraft font-bold text-red-800">LIMITED AVAILABILITY</span>
                {isLoadingCount && (
                  <div className="w-4 h-4 bg-red-600 rounded animate-pulse"></div>
                )}
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                  <span className="text-2xl font-minecraft font-bold text-red-800">
                    {isLoadingCount ? (
                      <span className="inline-flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-600 rounded animate-pulse"></div>
                        Loading...
                      </span>
                    ) : (countError ? '3200+' : availableSubdomains.toLocaleString())}
                  </span>
                  <span className="font-minecraft text-red-700">subdomains remaining</span>
                </div>
                <p className="text-sm font-minecraft text-red-600">
                  {isLogin ? 'Sign in to manage your subdomains' : `Only ${isLoadingCount ? 'loading' : (countError ? '3200+' : availableSubdomains.toLocaleString())} spots left • 1 day free trial`}
                </p>
                {countError && (
                  <p className="text-xs font-minecraft text-red-500 mt-1">
                    ⚠️ Live count unavailable - showing estimate
                  </p>
                )}
                <div className="mt-2 bg-red-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${isLoadingCount ? 0 : (countError ? 5 : Math.max(8, ((3333 - availableSubdomains) / 3333) * 100))}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-sm text-stone-600">
                  <span className="font-bold text-grass-700">Easy to remember</span> for your friends
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-sm text-stone-600">
                  <span className="font-bold text-grass-700">99.9%</span> uptime guaranteed
                </span>
              </div>
            </div>

            {/* Features List - Desktop Only */}
            <div className="hidden lg:block space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700">Instant setup in under 30 seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700">Powered by Cloudflare's global network</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-grass-600" />
                <span className="font-minecraft text-stone-700">Works with any hosting provider</span>
              </div>
            </div>
          </div>

          {/* Right Column - Signup Form */}
          <div id="sform" className="hidden lg:block w-full max-w-md mx-auto lg:max-w-none order-1 lg:order-2">
            {user ? (
              <Card variant="minecraft" className="shadow-2xl">
                <CardContent className="p-8 text-center">
                  <div className="mb-6">
                    <CheckCircle className="w-16 h-16 text-grass-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
                      Welcome Back!
                    </h2>
                    <p className="text-stone-600 font-minecraft text-sm">
                      You're already signed in. Ready to manage your subdomains?
                    </p>
                  </div>
                  <Link to="/dashboard">
                    <Button variant="primary" className="w-full text-lg py-3" icon={Server}>
                      Go to Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card variant="minecraft" className="shadow-2xl">
                <CardContent className="p-8">
                  {currentStep === 'subdomainInput' && renderSubdomainInputStep()}
                  {currentStep === 'signupOptions' && renderSignupOptionsStep()}
                  {currentStep === 'emailPassword' && renderEmailPasswordStep()}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}