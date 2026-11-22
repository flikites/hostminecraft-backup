import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Server } from 'lucide-react';

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-grass-500 rounded-lg shadow-minecraft mb-6">
            <Server className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-minecraft font-bold text-minecraft-900 mb-3">
            Instant Domains for
            <span className="block text-grass-600">Minecraft Servers</span>
          </h1>
          <p className="text-xl text-stone-600 font-minecraft max-w-3xl mx-auto leading-relaxed">
            Transform your server IP into a memorable domain. Let your players connect to 
            <strong> yourserver.hostminecraft.com</strong> instead of confusing numbers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button variant="primary" size="lg" icon={Server}>
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="primary" size="lg" icon={Server}>
                Start Free Trial
              </Button>
            </Link>
          )}
          <div className="text-center">
            <p className="text-stone-600 font-minecraft text-sm">
              1-day free trial • $10/year per subdomain
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}