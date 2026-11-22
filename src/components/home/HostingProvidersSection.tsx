import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Star, ExternalLink } from 'lucide-react';
import { HostingProvider } from '../../types';

const hostingProviders: HostingProvider[] = [
  {
    id: '1',
    name: 'Apex Hosting',
    description: 'Premium Minecraft hosting with 24/7 support and instant setup.',
    rating: 4.8,
    price_range: '$4.49 - $89.99/month',
    features: ['DDoS Protection', '24/7 Support', 'Instant Setup', 'Free Subdomain'],
    website_url: 'https://apexminecrafthosting.com/',
  },
  {
    id: '2',
    name: 'Shockbyte',
    description: 'Affordable and reliable Minecraft server hosting worldwide.',
    rating: 4.7,
    price_range: '$2.50 - $40.00/month',
    features: ['Global Locations', 'Easy Setup', 'Mod Support', 'Backups'],
    website_url: 'https://shockbyte.com/',
  },
  {
    id: '3',
    name: 'BisectHosting',
    description: 'High-performance Minecraft hosting with exceptional uptime.',
    rating: 4.9,
    price_range: '$2.99 - $96.00/month',
    features: ['99.9% Uptime', 'NVMe SSD', 'Free Migrations', 'Expert Support'],
    website_url: 'https://www.bisecthosting.com/',
  },
  {
    id: '4',
    name: 'ScalaCube',
    description: 'User-friendly Minecraft hosting with free plan available.',
    rating: 4.6,
    price_range: 'Free - $26.99/month',
    features: ['Free Plan', 'Easy Management', 'Plugin Support', 'Mobile App'],
    website_url: 'https://scalacube.com/',
  },
  {
    id: '5',
    name: 'Hostinger',
    description: 'Budget-friendly Minecraft hosting with solid performance.',
    rating: 4.5,
    price_range: '$6.95 - $29.95/month',
    features: ['Budget Friendly', 'SSD Storage', 'Weekly Backups', 'Control Panel'],
    website_url: 'https://www.hostinger.com/minecraft-server-hosting',
  },
];

export function HostingProvidersSection() {
  return (
    <section id="hosting-providers" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-minecraft font-bold text-minecraft-900 mb-4">
            Top-Rated Minecraft Hosting Providers
          </h2>
          <p className="text-lg text-stone-600 font-minecraft max-w-2xl mx-auto">
            Need a server to host your Minecraft world? Check out these trusted providers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hostingProviders.map((provider) => (
            <Card key={provider.id} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-minecraft font-bold text-xl text-minecraft-800 mb-2">
                      {provider.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(provider.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-minecraft text-stone-600">
                        {provider.rating}/5
                      </span>
                    </div>
                    <p className="text-stone-600 font-minecraft text-sm mb-3">
                      {provider.description}
                    </p>
                    <p className="text-grass-600 font-minecraft font-bold text-sm mb-3">
                      {provider.price_range}
                    </p>
                  </div>
                  <a
                    href={provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="primary" size="sm" icon={ExternalLink}>
                      Visit Site
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {provider.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-grass-100 text-grass-800 rounded-md text-xs font-minecraft"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}