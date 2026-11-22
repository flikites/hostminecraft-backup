import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubdomainManagement } from '../../hooks/useSubdomainManagement';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Server, Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MultiStepSignupFormProps {
  onClose?: () => void;
  className?: string;
  prefilledSubdomain?: string;
}

type SignupStep = 'subdomainInput' | 'signupOptions' | 'emailPassword';

export function MultiStepSignupForm({ onClose, className = '', prefilledSubdomain }: MultiStepSignupFormProps) {
  const { signUp, signInWithPassword, signInWithGoogle, signInWithMicrosoft } = useAuth();
  const [isLogin, setIsLogin] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignupStep>('subdomainInput');
  const [subdomainName, setSubdomainName] = useState('');
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayedAnimatedText, setDisplayedAnimatedText] = useState('');
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isCursorVisible, setIsCursorVisible] = useState(true);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const { checkSubdomainAvailability, checkingAvailability } = useSubdomainManagement();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cursorTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Animation constants
  const FULL_PLACEHOLDER_TEXT = 'enter a subdomain';
  const TYPING_SPEED = 150; // milliseconds per character
  const CURSOR_BLINK_SPEED = 530; // milliseconds for cursor blink

  // Handle prefilled subdomain
  useEffect(() => {
    if (prefilledSubdomain) {
      setSubdomainName(prefilledSubdomain);
      setIsUserInteracting(true);
      // Immediately check availability for prefilled subdomain
      debouncedAvailabilityCheck(prefilledSubdomain);
    }
  }, [prefilledSubdomain]);
  // Store subdomain in sessionStorage for persistence across auth flows
  const storeSubdomainForSignup = (subdomain: string) => {
    sessionStorage.setItem('pending_subdomain', subdomain);
  };

  // Typing animation effect
  useEffect(() => {
    if (isUserInteracting || currentStep !== 'subdomainInput' || prefilledSubdomain) {
      return;
    }

    let currentIndex = 0;
    setDisplayedAnimatedText('');
    setIsTypingComplete(false);

    const typeNextCharacter = () => {
      if (currentIndex < FULL_PLACEHOLDER_TEXT.length) {
        setDisplayedAnimatedText(FULL_PLACEHOLDER_TEXT.substring(0, currentIndex + 1));
        currentIndex++;
        typingTimerRef.current = setTimeout(typeNextCharacter, TYPING_SPEED);
      } else {
        setIsTypingComplete(true);
      }
    };

    // Start typing after a brief delay
    typingTimerRef.current = setTimeout(typeNextCharacter, 500);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [isUserInteracting, currentStep, prefilledSubdomain]);

  // Cursor blinking effect
  useEffect(() => {
    if (isUserInteracting || currentStep !== 'subdomainInput' || prefilledSubdomain) {
      return;
    }

    cursorTimerRef.current = setInterval(() => {
      setIsCursorVisible(prev => !prev);
    }, CURSOR_BLINK_SPEED);

    return () => {
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current);
      }
    };
  }, [isUserInteracting, currentStep, prefilledSubdomain]);

  // Reset animation when step changes
  useEffect(() => {
    if (currentStep === 'subdomainInput' && !isUserInteracting && !prefilledSubdomain) {
      setDisplayedAnimatedText('');
      setIsTypingComplete(false);
      setIsCursorVisible(true);
    }
  }, [currentStep, prefilledSubdomain]);

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
    setIsUserInteracting(true);
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

  const handleInputFocus = () => {
    setIsUserInteracting(true);
  };

  const getAvailabilityDisplay = () => {
    if (!subdomainName) return null;
    
    if (checkingAvailability) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-blue-600 mt-1 justify-center">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking availability...</span>
        </div>
      );
    }

    if (isSubdomainAvailable === true) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-grass-600 mt-1 justify-center">
          <CheckCircle2 className="w-4 h-4" />
          <span>Available!</span>
        </div>
      );
    }

    if (isSubdomainAvailable === false) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-red-600 mt-1 justify-center">
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
        onClose?.();
      } else {
        const result = await signUp(formData.email, formData.password);
        if (result.user && !result.user.email_confirmed_at) {
          // Store subdomain for after email verification
          if (subdomainName) {
            storeSubdomainForSignup(subdomainName);
          }
          toast.success('Account created! Please check your email to verify your account, then you can sign in.');
          onClose?.();
        } else {
          toast.success('Welcome! Redirecting to dashboard...');
          // Store subdomain and redirect to dashboard for immediate subdomain creation
          if (subdomainName) {
            storeSubdomainForSignup(subdomainName);
          }
          navigate('/dashboard');
          onClose?.();
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
      <div className="text-center mb-2">
        <h2 className="sm:text-xl md:text-2xl lg:text-2xl font-minecraft font-bold text-minecraft-900 mb-3">
          Choose Your Subdomain
        </h2>
        <p className="text-stone-600 font-minecraft text-sm">
          Pick a memorable name for your Minecraft server
        </p> 
      </div>

      <div className="space-y-1">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-red-700 font-minecraft text-center">
           1 day free trial - no cc required
          </label>
          <div className="relative flex flex-col md:flex-row items-stretch md:items-center border-2 border-stone-400 rounded-md shadow-minecraft bg-white focus-within:border-grass-500 focus-within:shadow-minecraft-hover transition-all duration-200">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={subdomainName}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                onBlur={handleSubdomainBlur}
                onFocus={handleInputFocus}
                placeholder={isUserInteracting ? "enter a subdomain" : ""}
                required
                className={`w-full px-4 py-3 bg-transparent border-none outline-none font-minecraft text-lg text-minecraft-900 placeholder-stone-400 ${
                  !isUserInteracting && !subdomainName ? 'text-transparent' : ''
                }`}
              />
              {!isUserInteracting && !subdomainName && (
                <div 
                  className="absolute inset-0 px-4 py-3 pointer-events-none flex items-center"
                >
                  <span className="font-minecraft text-lg text-stone-400">
                    {displayedAnimatedText}
                    <span className={`text-grass-500 font-bold ${isCursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}>
                      |
                    </span>
                  </span>
                </div>
              )}
            </div>
            <span className="w-full md:w-auto px-4 py-3 text-stone-600 font-minecraft text-lg border-t md:border-t-0 md:border-l border-stone-300 bg-stone-50 text-center md:text-left">
              .hostminecraft.com
            </span>
          </div>
          <p className="text-xs font-minecraft text-stone-500 text-center">
            This will be your server's easy-to-remember address
          </p>
        </div>
        {getAvailabilityDisplay()}
      </div>

      <Button
        onClick={handleStartFreeTrial}
        variant="primary"
        className="w-full text-lg py-3"
        disabled={loading || !isSubdomainAvailable || checkingAvailability}
      >
        <span className="flex items-center justify-center gap-2">
          <img src="/logo.svg" alt="HostMinecraft Logo" className="w-5 h-5" />
          {checkingAvailability ? 'Checking...' : 'Start Your Journey'}
        </span>
      </Button>
    </div>
  );

  const renderSignupOptionsStep = () => (
    <div className="relative space-y-6">
      {/* Back Button - Top Left Corner */}
      <div className="absolute -top-2 -left-2 z-10">
        <button
          onClick={() => setCurrentStep('subdomainInput')}
          disabled={loading}
          className="w-10 h-10 bg-white border-2 border-stone-300 hover:border-grass-400 rounded-full shadow-minecraft hover:shadow-minecraft-hover transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600 group-hover:text-grass-600 transition-colors" />
        </button>
      </div>

      <div className="text-center mb-6 pt-2">
        <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2">
          Get Started
        </h2>
        <p className="text-stone-600 font-minecraft text-sm">
          Choose how you'd like to sign up
        </p>
      </div>

      <div className="space-y-4">
        <Button
          onClick={() => handleSocialAuth('microsoft')}
          className="w-4/5 mx-auto block text-base py-3 bg-blue-600 hover:bg-black focus:ring-blue-500 text-white border-2 border-stone-300 hover:border-black shadow-minecraft hover:shadow-minecraft-hover transition-all duration-200"
          disabled={loading}
          icon={() => (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
            </svg>
          )}
        >
          Microsoft Login
        </Button>

        <Button
          onClick={() => handleSocialAuth('google')}
          className="w-4/5 mx-auto block py-3 bg-grass hover:bg-black focus:ring-stone-500 text-black hover:text-white border-2 border-stone-300 hover:border-black shadow-minecraft  transition-all duration-200"
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
          Google Login
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-300 mx-4"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-stone-500 font-minecraft font-bold">or</span>
          </div>
        </div>

        <Button
          onClick={() => setCurrentStep('emailPassword')}
          className="w-4/5 mx-auto block text-base py-3 bg-minecraft-700 hover:bg-minecraft-600 text-white shadow-minecraft hover:shadow-lg active:shadow-sm active:translate-y-1 transition-all duration-150 transform"
          disabled={loading}
        >
          Use My Email
        </Button>
      </div>

      {/* Subdomain Display - Bottom of Card */}
      <div className="flex justify-center">
        <div className="bg-white border-2 border-stone-400 rounded-md shadow-minecraft inline-block min-w-[200px] max-w-[85%]">
          <div className="px-6 py-3 bg-stone-50 text-center">
            <span className="font-minecraft text-lg text-stone-700 font-bold whitespace-nowrap">
              {subdomainName}.hostminecraft.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailPasswordStep = () => (
    <div className="relative space-y-4">
      {/* Back Button - Top Left Corner */}
      <div className="absolute -top-2 -left-2 z-10">
        <button
          onClick={() => setCurrentStep('signupOptions')}
          disabled={loading}
          className="w-10 h-10 bg-white border-2 border-stone-300 hover:border-grass-400 rounded-full shadow-minecraft hover:shadow-minecraft-hover transition-all duration-200 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600 group-hover:text-grass-600 transition-colors" />
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-minecraft font-bold text-minecraft-900 mb-2 pt-2">
          {isLogin ? 'Welcome Back!' : 'Enter Email'}
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

      <form onSubmit={handleSubmit} className="w-4/5 mx-auto block space-y-4">
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
    <div className={`space-y-6 ${className}`}>
      {currentStep === 'subdomainInput' && renderSubdomainInputStep()}
      {currentStep === 'signupOptions' && renderSignupOptionsStep()}
      {currentStep === 'emailPassword' && renderEmailPasswordStep()}
    </div>
  );
}