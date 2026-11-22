import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <Card variant="minecraft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-minecraft font-bold text-minecraft-800">
                Privacy Policy
              </h2>
              <Button
                variant="primary"
                size="sm"
                icon={X}
                onClick={onClose}
                className="flex-shrink-0"
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none font-minecraft">
              <p className="text-stone-600 mb-4">
                <strong>Last updated:</strong> December 28, 2024
              </p>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">1. Information We Collect</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <strong>Account Information:</strong> When you create an account, we collect your email address, 
                    password, and optional profile information like your name.
                  </p>
                  <p>
                    <strong>Subdomain Data:</strong> We store information about your subdomains including the subdomain 
                    name, target IP addresses or domains, and port configurations.
                  </p>
                  <p>
                    <strong>Payment Information:</strong> Payment processing is handled by Stripe. We store billing 
                    history and subscription status but do not store credit card details.
                  </p>
                  <p>
                    <strong>Usage Data:</strong> We collect information about how you use our service, including 
                    login times, feature usage, and technical logs for troubleshooting.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">2. How We Use Your Information</h3>
                <div className="space-y-2 text-stone-700">
                  <p>• Provide and maintain the HostMinecraft service</p>
                  <p>• Process payments and manage subscriptions</p>
                  <p>• Send important service notifications and updates</p>
                  <p>• Provide customer support</p>
                  <p>• Improve our service and develop new features</p>
                  <p>• Ensure security and prevent fraud</p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">3. Information Sharing</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We do not sell, trade, or rent your personal information to third parties. We may share 
                    information only in these limited circumstances:
                  </p>
                  <p>
                    <strong>Service Providers:</strong> We use trusted third-party services like Stripe for payments, 
                    Supabase for data storage, and Cloudflare for DNS management.
                  </p>
                  <p>
                    <strong>Legal Requirements:</strong> We may disclose information if required by law or to 
                    protect our rights and safety.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">4. Data Security</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We implement industry-standard security measures to protect your data, including encryption 
                    in transit and at rest, secure authentication, and regular security audits.
                  </p>
                  <p>
                    However, no method of transmission over the internet is 100% secure. While we strive to 
                    protect your information, we cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">5. Your Rights</h3>
                <div className="space-y-2 text-stone-700">
                  <p>• Access and review your personal information</p>
                  <p>• Update or correct your information</p>
                  <p>• Delete your account and associated data</p>
                  <p>• Export your data</p>
                  <p>• Opt out of non-essential communications</p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">6. Data Retention</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We retain your information for as long as your account is active or as needed to provide 
                    services. When you delete your account, we will delete your personal information within 
                    30 days, except where we are required to retain it for legal purposes.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">7. Cookies and Tracking</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We use essential cookies to maintain your session and provide core functionality. We do not 
                    use tracking cookies or third-party analytics that collect personal information.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">8. Children's Privacy</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    Our service is not intended for children under 13. We do not knowingly collect personal 
                    information from children under 13. If we become aware that we have collected such 
                    information, we will delete it promptly.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">9. Changes to This Policy</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any material 
                    changes by email or through our service. Your continued use of the service after changes 
                    constitutes acceptance of the updated policy.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">10. Contact Us</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    If you have questions about this privacy policy or our data practices, please contact us 
                    through our support system or email us at privacy@hostminecraft.com.
                  </p>
                </div>
              </section>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm font-minecraft text-blue-800">
                  <strong>Note:</strong> This privacy policy applies only to HostMinecraft.com and not to any 
                  third-party services or websites that may be linked from our service.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}