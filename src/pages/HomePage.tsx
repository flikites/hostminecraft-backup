import React from 'react';
import { HeroSignupSection } from '../components/home/HeroSignupSection';
import { TrustIndicatorsSection } from '../components/home/TrustIndicatorsSection';
import { PricingSection } from '../components/home/PricingSection';
import { FAQSection } from '../components/home/FAQSection';

interface HomePageProps {
  showSignInForm?: boolean;
  onToggleSignIn?: () => void;
  prefilledSubdomain?: string;
}

export function HomePage({ showSignInForm = false, onToggleSignIn, prefilledSubdomain }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-50 via-white to-dirt-50">
      <HeroSignupSection showSignInForm={showSignInForm} prefilledSubdomain={prefilledSubdomain} />
      <TrustIndicatorsSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
}