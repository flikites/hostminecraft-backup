import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Server,
  Settings,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Globe,
} from 'lucide-react';
import { SupportModal } from '../components/support/SupportModal';

export function DocumentationPage() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-minecraft font-bold text-minecraft-900 mb-4">
              Documentation
            </h1>
            <p className="text-lg text-stone-600 font-minecraft">
              Learn how to set up and manage your Minecraft server subdomains
            </p>
          </div>

          {/* Quick Start Guide */}
          <Card variant="minecraft" className="mb-8">
            <CardHeader>
              <h2 className="text-2xl font-minecraft font-bold text-minecraft-800 flex items-center gap-3">
                <Server className="w-6 h-6 text-grass-600" />
                Getting Started: Your First Subdomain
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-minecraft text-blue-800 text-sm">
                  <strong>What you'll learn:</strong> How to sign up for
                  HostMinecraft and create your first custom subdomain in under
                  5 minutes.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-grass-500 text-white rounded-full flex items-center justify-center font-minecraft font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                    Create Your Account
                  </h3>
                  <p className="text-stone-600 font-minecraft mb-3">
                    Start by creating your free HostMinecraft account. You'll
                    get a 1-day free trial with one subdomain included.
                  </p>
                  <div className="bg-stone-100 rounded-lg p-3 mb-3">
                    <p className="font-minecraft text-sm text-stone-700">
                      <strong>Steps:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm font-minecraft text-stone-600 mt-1 space-y-1">
                      <li>Visit the homepage and click "Start Free Trial"</li>
                      <li>
                        Enter your email address and create a secure password
                      </li>
                      <li>Confirm your password and click "Start Free Trial"</li>
                      <li>Check your email for a verification link</li>
                    </ul>
                  </div>
                  <Link to="/">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      onClick={() => {
                        // Navigate to homepage and scroll to form
                        window.location.href = '/#sform';
                      }}
                    >
                      Start Your Free Trial
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-grass-500 text-white rounded-full flex items-center justify-center font-minecraft font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                    Access Your Dashboard
                  </h3>
                  <p className="text-stone-600 font-minecraft mb-3">
                    Once you've verified your email, you'll be automatically
                    redirected to your dashboard where you can manage your
                    subdomains.
                  </p>
                  <div className="bg-stone-100 rounded-lg p-3">
                    <p className="font-minecraft text-sm text-stone-700">
                      <strong>What you'll see:</strong> Your dashboard shows
                      your current subdomains, subscription status, and quick
                      stats.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-grass-500 text-white rounded-full flex items-center justify-center font-minecraft font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                    Create Your First Subdomain
                  </h3>
                  <p className="text-stone-600 font-minecraft mb-3">
                    Now for the exciting part - creating your custom subdomain
                    that players will use to connect to your server.
                  </p>
                  <div className="bg-stone-100 rounded-lg p-3 mb-3">
                    <p className="font-minecraft text-sm text-stone-700 mb-2">
                      <strong>Required Information:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm font-minecraft text-stone-600 space-y-1">
                      <li>
                        <strong>Subdomain Name:</strong> Choose a memorable name
                        (e.g., "myserver" becomes "myserver.hostminecraft.com")
                      </li>
                      <li>
                        <strong>Target:</strong> Your server's IP address or
                        domain name
                      </li>
                      <li>
                        <strong>Port:</strong> Your Minecraft server port
                        (default is 25565)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <Globe className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-minecraft text-blue-800">
                        <p className="font-bold mb-1">Target Options:</p>
                        <p>
                          <strong>IP Address:</strong> Point directly to your
                          server (e.g., 192.168.1.100)
                        </p>
                        <p>
                          <strong>Domain Name:</strong> Point to another domain
                          (e.g., myserver.example.com)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-grass-500 text-white rounded-full flex items-center justify-center font-minecraft font-bold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                    Test Your Connection
                  </h3>
                  <p className="text-stone-600 font-minecraft mb-3">
                    After creating your subdomain, it's ready to use
                    immediately! DNS propagation typically takes under 5
                    minutes.
                  </p>
                  <div className="bg-grass-50 border border-grass-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-grass-600 mt-0.5" />
                      <div className="text-sm font-minecraft text-grass-800">
                        <p>
                          <strong>Test it:</strong> Open Minecraft and try
                          connecting to your new subdomain
                          (e.g., myserver.hostminecraft.com)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-grass-500 text-white rounded-full flex items-center justify-center font-minecraft font-bold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
                    Share With Your Players
                  </h3>
                  <p className="text-stone-600 font-minecraft mb-3">
                    Your custom subdomain is now live! Share it with your
                    players so they can easily connect to your server.
                  </p>
                  <div className="bg-stone-100 rounded-lg p-3">
                    <p className="font-minecraft text-sm text-stone-700">
                      <strong>Pro tip:</strong> Your subdomain is much easier to
                      remember than an IP address, making it simple for friends
                      to join your server.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Resources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="minecraft">
              <CardHeader>
                <h3 className="font-minecraft font-bold text-lg text-minecraft-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-grass-600" />
                  Managing Subdomains
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600 font-minecraft text-sm mb-3">
                  Learn how to edit, update, and manage your existing subdomains.
                </p>
                <ul className="text-sm font-minecraft text-stone-600 space-y-1 mb-4">
                  <li>• Updating target IP addresses</li>
                  <li>• Changing server ports</li>
                  <li>• Switching between IP and domain targets</li>
                  <li>• Deleting unused subdomains</li>
                </ul>
                <Button variant="ghost" size="sm">
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card variant="minecraft">
              <CardHeader>
                <h3 className="font-minecraft font-bold text-lg text-minecraft-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-grass-600" />
                  Billing & Subscriptions
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600 font-minecraft text-sm mb-3">
                  Understand pricing, billing cycles, and subscription management.
                </p>
                <ul className="text-sm font-minecraft text-stone-600 space-y-1 mb-4">
                  <li>• Free trial details</li>
                  <li>• $5/month or $30/year per subdomain</li>
                  <li>• Upgrading to paid plans</li>
                  <li>• Managing payment methods</li>
                  <li>• Canceling subscriptions</li>
                </ul>
                <Link to="/billing">
                  <Button variant="ghost" size="sm">
                    View Billing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Need Help */}
          <Card variant="minecraft" className="mt-8">
            <CardContent className="text-center py-8">
              <h3 className="font-minecraft font-bold text-xl text-minecraft-800 mb-4">
                Need Additional Help?
              </h3>
              <p className="text-stone-600 font-minecraft mb-6">
                Can't find what you're looking for? Our support team is here to
                help you get your subdomain set up perfectly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/faq">
                  <Button variant="ghost">View FAQ</Button>
                </Link>
                <Button
                  variant="primary"
                  onClick={() => setShowSupportModal(true)}
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <SupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      </div>
    </>
  );
}
