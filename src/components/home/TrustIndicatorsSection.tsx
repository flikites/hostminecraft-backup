import React from 'react';
import { Zap, Shield, Users } from 'lucide-react';

export function TrustIndicatorsSection() {
  return (
    <div className="bg-white py-12 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-minecraft font-bold text-stone-800 mb-4">
            Trusted by Minecraft communities worldwide
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-grass-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-6 h-6 text-grass-600" />
            </div>
            <h4 className="font-minecraft font-bold text-minecraft-800 mb-2">Lightning Fast</h4>
            <p className="text-sm font-minecraft text-stone-600">
              DNS propagation in under 5 minutes globally
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-grass-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Shield className="w-6 h-6 text-grass-600" />
            </div>
            <h4 className="font-minecraft font-bold text-minecraft-800 mb-2">Enterprise Security</h4>
            <p className="text-sm font-minecraft text-stone-600">
              DDoS protection and 99.9% uptime SLA
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-grass-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Users className="w-6 h-6 text-grass-600" />
            </div>
            <h4 className="font-minecraft font-bold text-minecraft-800 mb-2">Community Loved</h4>
            <p className="text-sm font-minecraft text-stone-600">
              Join the growing community of server owners
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}