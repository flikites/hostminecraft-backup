import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { HostingProvidersSection } from '../components/home/HostingProvidersSection';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Server } from 'lucide-react';

export function HomePageOriginal() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50">
      <HeroSection isAuthenticated={!!user} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturesSection />
      </div>
      <HostingProvidersSection />
      
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-minecraft-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-minecraft font-bold mb-6">
            Ready to Get Your Custom Subdomain?
          </h2>
          <p className="text-xl font-minecraft text-stone-300 mb-8">
            Join thousands of server owners who've made their servers more memorable.
          </p>
          {!user && (
            <Link to="/auth">
              <Button variant="primary" size="lg" icon={Server}>
                Start Your Free Trial
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}