import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSubdomainCount } from '../../hooks/useSubdomainCount';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Server, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { MultiStepSignupForm } from '../auth/MultiStepSignupForm';

interface HeroSignupSectionProps {
  showSignInForm?: boolean;
  prefilledSubdomain?: string;
}

export function HeroSignupSection({ showSignInForm = false, prefilledSubdomain }: HeroSignupSectionProps) {
  const { user } = useAuth();
  const { availableSubdomains, isLoading: isLoadingCount, error: countError } = useSubdomainCount();

  // Determine if this is a personalized landing page
  const isPersonalizedLanding = !!prefilledSubdomain;
  return (
    <div id="signup-section" className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-20">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:gap-16 lg:items-center">
          
          {/* Left Column - Hero Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {isPersonalizedLanding ? (
              <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-minecraft font-bold text-minecraft-900 mb-4 leading-tight">
                Claim Your Domain<span className="block text-grass-600 mt-2"> Now</span>
              </h1>
            ) : (
              <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-minecraft font-bold text-minecraft-900 mb-4 leading-tight">
                Instant Domains For<span className="block text-grass-600 mt-2"> Minecraft Servers</span>
              </h1>
            )}
            
            {isPersonalizedLanding ? (
              <p className="text-lg sm:text-xl text-stone-600 font-minecraft mb-4 leading-relaxed max-w-2xl lg:max-w-none mx-auto">
                Your custom domain <span className="font-bold text-grass-700">{prefilledSubdomain}.hostminecraft.com</span> is waiting for you!
              </p>
            ) : (
              <p className="text-lg sm:text-xl text-stone-600 font-minecraft mb-4 leading-relaxed max-w-2xl lg:max-w-none mx-auto">
                Instantly create a domain and start sharing it.
              </p>
            )}

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
                      <MultiStepSignupForm prefilledSubdomain={prefilledSubdomain} />
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
            {!isPersonalizedLanding && (
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
                  Only {isLoadingCount ? 'loading' : (countError ? '3200+' : availableSubdomains.toLocaleString())} spots left • 1 day free trial
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
            )}

            {/* Personalized CTA for influencer landing pages */}
            {isPersonalizedLanding && (
              <div className="mb-8 p-4 bg-gradient-to-r from-grass-50 to-green-50 border-2 border-grass-200 rounded-xl">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <CheckCircle className="w-6 h-6 text-grass-600" />
                    <span className="text-xl font-minecraft font-bold text-grass-800">
                      Perfect Domain Available!
                    </span>
                  </div>
                  <p className="text-sm font-minecraft text-grass-700">
                    <span className="font-bold">{prefilledSubdomain}.hostminecraft.com</span> is ready to claim • 1 day free trial
                  </p>
                </div>
              </div>
            )}
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
                  <MultiStepSignupForm prefilledSubdomain={prefilledSubdomain} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}