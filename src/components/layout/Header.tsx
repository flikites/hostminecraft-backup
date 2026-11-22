import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useStripe } from '../../hooks/useStripe';
import { Button } from '../ui/Button';
import { Menu, LogOut, User, CreditCard, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProductByPriceId } from '../../stripe-config';

export function Header() {
  const { user, signOut } = useAuth();
  const { getSubscription } = useStripe();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [isSticky, setIsSticky] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Check if footer is coming into view
      // We'll unstick the header when the footer is within 100px of the viewport
      const shouldUnstick = footerRect.top <= viewportHeight + 100;
      
      setIsSticky(!shouldUnstick);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initial state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSubscription = async () => {
    try {
      const sub = await getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription?.price_id) return 'Free';
    const product = getProductByPriceId(subscription.price_id);
    return product ? product.name.replace('HostMinecraft Subdomain - ', '') : 'Unknown';
  };

  return (
    <header className={`bg-minecraft-800 text-white shadow-lg z-50 transition-all duration-300 ${
      isSticky ? 'sticky top-0' : 'relative'
    }`}>
      {/* Disclaimer Bar */}
      <div className="bg-yellow-500 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-black font-minecraft text-xs font-bold">
            NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="HostMinecraft Logo" className="w-8 h-8" />
            <span className="font-minecraft font-bold text-xl">HostMinecraft</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!user && (
              <>
                <Link to="/" className="font-minecraft hover:text-grass-400 transition-colors">
                  Start Free Trial
                </Link>
                <Link to="/docs" className="font-minecraft hover:text-grass-400 transition-colors">
                  Documentation
                </Link>
                <Link to="/faq#root" className="font-minecraft hover:text-grass-400 transition-colors">
                  FAQ
                </Link>
              </>
            )}
            {user && (
              <>
                <Link to="/dashboard" className="font-minecraft hover:text-grass-400 transition-colors">
                  Dashboard
                </Link>
                <Link to="/billing" className="font-minecraft hover:text-grass-400 transition-colors">
                  Billing
                </Link>
                <Link to="/settings" className="font-minecraft hover:text-grass-400 transition-colors">
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 hover:text-grass-400 transition-colors"
                >
                  <div className="w-8 h-8 bg-stone-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-minecraft text-sm hidden sm:block">
                    {user.full_name || user.email}
                  </span>
                  {subscription?.subscription_status === 'active' && (
                    <span className="text-xs font-minecraft text-grass-400 hidden sm:block">
                      {getCurrentPlan()}
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-stone-800 rounded-lg shadow-lg border border-stone-200 py-2 z-50">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-stone-100 font-minecraft"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/billing"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-stone-100 font-minecraft"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Billing</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-stone-100 font-minecraft"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-stone-200 my-2"></div>
                    <Link
                      to="/docs"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-stone-100 font-minecraft"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>Documentation</span>
                    </Link>
                    <Link
                      to="/faq"
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-stone-100 font-minecraft"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>FAQ</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-stone-100 font-minecraft w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button 
                  variant="primary" 
                  size="sm"
                >
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            {!user && (
              <button
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - only show for non-logged-in users */}
        {!user && isMobileMenuOpen && (
          <div className="md:hidden border-t border-minecraft-700 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                to="/"
                className="font-minecraft hover:text-grass-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/docs"
                className="font-minecraft hover:text-grass-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Documentation
              </Link>
              <Link
                to="/faq"
                className="font-minecraft hover:text-grass-400 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}