import React, { useState, useEffect } from 'react';
import { useSubdomainCount } from '../../hooks/useSubdomainCount';
import { useSignupModal } from '../../hooks/useSignupModal';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Check } from 'lucide-react';
import { SignupModal } from '../modals/SignupModal';

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const { availableSubdomains, isLoading: isLoadingCount } = useSubdomainCount();
  const { isSignupModalOpen, openSignupModal, closeSignupModal } = useSignupModal();

  return (
    <>
      <div className="bg-gradient-to-r from-grass-50 to-dirt-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl md:text-3xl font-minecraft font-bold text-minecraft-900 mb-4">
            Start Your Journey Today
          </h3>
          <p className="text-lg font-minecraft text-stone-600 mb-8">
            Start free, upgrade when you're ready • Pay per subdomain
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-6 max-w-3xl mx-auto">
            <Card className="border-2 border-stone-200">
              <CardContent className="p-6 text-center">
                <h4 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">Free Trial</h4>
                <div className="text-3xl font-minecraft font-bold text-grass-600 mb-2">$0</div>
                <p className="text-sm font-minecraft text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors mb-4">1 day free • 1 subdomain</p>
                <ul className="text-sm font-minecraft text-stone-600 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-grass-600" />
                    <span>1 custom subdomain</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-grass-600" />
                    <span>DNS management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-grass-600" />
                    <span>Basic support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-grass-600" />
                    <span className="text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors">No credit card required</span>
                  </li>
                </ul>
                <Button
                  onClick={openSignupModal}
                  variant="primary"
                  className="w-full"
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
            
            <div className="relative">
              {/* Pricing Toggle - positioned above this specific card */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-white rounded-lg p-1 shadow-minecraft border-2 border-stone-300">
                  <div className="flex items-center">
                    <button
                      onClick={() => setIsYearly(false)}
                      className={`px-4 py-2 rounded-md font-minecraft font-bold text-sm transition-all ${
                        !isYearly 
                          ? 'bg-grass-500 text-white shadow-minecraft' 
                          : 'text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setIsYearly(true)}
                      className={`px-4 py-2 rounded-md font-minecraft font-bold text-sm transition-all relative ${
                        isYearly 
                          ? 'bg-grass-500 text-white shadow-minecraft' 
                          : 'text-stone-600 hover:text-stone-800'
                      }`}
                    >
                      Yearly
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-minecraft">
                        50% OFF
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <Card className="border-2 border-grass-500">
                <CardContent className="p-6 text-center">
                  <h4 className="relative top-4 font-minecraft font-bold text-lg text-minecraft-800 mb-4 mt-2">Per Subdomain Pricing</h4>
                  
                  <div className="text-3xl font-minecraft font-bold text-grass-600 mb-1">
                    ${isYearly ? '30' : '5'}
                  </div>
                  <div className="text-sm font-minecraft text-grass-600 hover:text-grass-700 font-minecraft text-sm font-bold transition-colors mb-1">
                    per subdomain/{isYearly ? 'year' : 'month'}
                  </div>
                  {isYearly && (
                    <div className="mb-2">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-minecraft font-bold">
                        SAVE 50%
                      </span>
                    </div>
                  )}
                  {isYearly && (
                    <div className="text-xs font-minecraft text-red-600 mb-3">
                      Save 50% per year vs monthly
                    </div>
                  )}
                  <div className="bg-blue-50 border bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-l p-3 mb-4">
                    <div className="text-xs font-minecraft text-blue-800">
                      <div className="font-bold mb-1">Global Availability</div>
                      <div>Create unlimited subdomains*</div>
                      <div className="text-blue-600 mt-1">
                        *Up to {isLoadingCount ? (
                          <span className="inline-flex items-center gap-1">
                            <div className="w-2 h-2 bg-blue-600 rounded animate-pulse"></div>
                            loading...
                          </span>
                        ) : availableSubdomains.toLocaleString()} remaining globally
                      </div>
                    </div>
                  </div>
                  <ul className="text-sm font-minecraft text-stone-600 space-y-2 mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-grass-600" />
                      <span>Priority support you can count on</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-grass-600" />
                      <span>Edit server records anytime</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-grass-600" />
                      <span>50% Annual Discount</span>
                    </li>
                  </ul>
                  <div className="mt-4">
                    <Button
                      onClick={openSignupModal}
                      variant="primary"
                      className="w-full"
                    >
                      Start Free Trial
                    </Button>
                  </div>
                  <div className="text-xs font-minecraft text-stone-500 mt-2">
                    {isYearly ? 'Billed annually' : 'Billed monthly'} • Cancel anytime
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="bg-white rounded-lg p-4 shadow-minecraft border-2 border-stone-300 max-w-2xl mx-auto">
              <h4 className="font-minecraft font-bold text-minecraft-800 mb-2">Pricing Example</h4>
              <div className="text-sm font-minecraft text-stone-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-bold">3 subdomains monthly:</div>
                    <div>3 × $5 = $15/month</div>
                  </div>
                  <div>
                    <div className="font-bold">3 subdomains yearly:</div>
                    <div>3 × $30 = $90/year <span className="text-red-600">(save $90!)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-6">
            <Button
              onClick={openSignupModal}
              variant="ghost"
              className="text-grass-600 hover:text-grass-700"
            >
              Get started with your free trial →
            </Button>
          </div>
        </div>
      </div>
      
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
      />
    </>
  );
}