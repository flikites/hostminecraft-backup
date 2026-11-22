import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Zap, Shield, Globe } from 'lucide-react';

export function FeaturesSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
      <Card variant="minecraft" className="text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-grass-500 rounded-lg shadow-minecraft mx-auto mb-4 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
            Instant Setup
          </h3>
          <p className="text-stone-600 font-minecraft text-sm">
            Your subdomain is ready in seconds. No technical knowledge required.
          </p>
        </CardContent>
      </Card>

      <Card variant="minecraft" className="text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-grass-500 rounded-lg shadow-minecraft mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
            Secure & Reliable
          </h3>
          <p className="text-stone-600 font-minecraft text-sm">
            Built on Cloudflare's global network for maximum uptime and security.
          </p>
        </CardContent>
      </Card>

      <Card variant="minecraft" className="text-center">
        <CardContent className="pt-6">
          <div className="w-12 h-12 bg-grass-500 rounded-lg shadow-minecraft mx-auto mb-4 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
            Flexible Targeting
          </h3>
          <p className="text-stone-600 font-minecraft text-sm">
            Point to IP addresses or domain names. Perfect for any hosting setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}