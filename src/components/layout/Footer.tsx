import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSignupModal } from '../../hooks/useSignupModal';
import { SupportModal } from '../support/SupportModal';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { TermsModal } from '../legal/TermsModal';
import { SignupModal } from '../modals/SignupModal';

export function Footer() {
  const { user } = useAuth();
  const { isSignupModalOpen, openSignupModal, closeSignupModal } = useSignupModal();
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  return (
    <>
      <footer className="bg-minecraft-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo.svg" alt="HostMinecraft Logo" className="w-8 h-8 shadow-minecraft" />
              <span className="font-minecraft font-bold text-xl">HostMinecraft</span>
            </div>
            <p className="text-stone-300 font-minecraft text-sm leading-relaxed">
              Instant Domain Names for Minecraft Servers
            </p>
          </div>

          {/* Quick Links */}
          {!user && (
            <div>
              <h3 className="font-minecraft font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={openSignupModal}
                    className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm"
                  >
                    Start Free Trial
                  </button>
                </li>
                <li>
                  <Link to="/auth" className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          )}

          {/* Support */}
          <div>
            <h3 className="font-minecraft font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
             
              <li>
                <Link to="/docs#root" className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => setShowSupportModal(true)}
                  className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm text-left"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <Link to="/faq#root" className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-minecraft font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="text-stone-300 hover:text-grass-400 transition-colors font-minecraft text-sm text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-minecraft-700 mt-8 pt-8 text-center">
          <p className="text-stone-400 font-minecraft text-sm">
            © 2025 HostMinecraft.com - All rights reserved. NOT AN OFFICIAL MINECRAFT PRODUCT. NOT APPROVED BY OR ASSOCIATED WITH MOJANG OR MICROSOFT
          </p>
        </div>
      </div>
      </footer>
      
      <SupportModal 
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
      
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <TermsModal 
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={closeSignupModal}
      />
    </>
  );
}