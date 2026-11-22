import React from 'react';
import { HeroSignupSectionV2 } from '../components/home/HeroSignupSectionV2';
import { TrustIndicatorsSection } from '../components/home/TrustIndicatorsSection';
import { PricingSection } from '../components/home/PricingSection';
import { FAQSection } from '../components/home/FAQSection';

interface HomePage2Props {
  showSignInForm?: boolean;
  onToggleSignIn?: () => void;
}

export function HomePage2({ showSignInForm = false, onToggleSignIn }: HomePage2Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-50 via-white to-dirt-50">
      <HeroSignupSectionV2 showSignInForm={showSignInForm} />
      <TrustIndicatorsSection />
      <PricingSection />
      <FAQSection />
    </div>
  );
}