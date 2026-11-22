import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { X } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <Card variant="minecraft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-minecraft font-bold text-minecraft-800">
                Terms of Service
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
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">1. Acceptance of Terms</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    By accessing and using HostMinecraft ("the Service"), you accept and agree to be bound by 
                    these Terms of Service. If you do not agree to these terms, you may not use the Service.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">2. Description of Service</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    HostMinecraft provides custom subdomain services for Minecraft servers. We allow users to 
                    create memorable subdomains (e.g., yourserver.hostminecraft.com) that point to their 
                    Minecraft server IP addresses.
                  </p>
                  <p>
                    <strong>Important:</strong> HostMinecraft is not affiliated with, endorsed by, or associated 
                    with Mojang Studios or Microsoft Corporation. Minecraft is a trademark of Mojang Studios.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">3. Account Registration</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    To use our Service, you must create an account with accurate and complete information. 
                    You are responsible for maintaining the security of your account and password.
                  </p>
                  <p>
                    You must be at least 13 years old to use this Service. Users under 18 should have 
                    parental consent.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">4. Subdomain Usage</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <strong>Availability:</strong> We offer a limited number of subdomains (3,333 total). 
                    Subdomains are assigned on a first-come, first-served basis.
                  </p>
                  <p>
                    <strong>Naming:</strong> Subdomain names must be appropriate and not infringe on 
                    trademarks or copyrights. We reserve the right to refuse or revoke inappropriate names.
                  </p>
                  <p>
                    <strong>Usage:</strong> Subdomains must be used for legitimate Minecraft servers only. 
                    Prohibited uses include illegal activities, spam, malware distribution, or any activity 
                    that violates applicable laws.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">5. Free Trial and Billing</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    <strong>Free Trial:</strong> New users receive a 1-day free trial with one subdomain. 
                    Each user is entitled to only one free trial.
                  </p>
                  <p>
                    <strong>Pricing:</strong> After the trial, subdomains cost $5/month or $30/year per 
                    subdomain. Payments are processed through Stripe.
                  </p>
                  <p>
                    <strong>Billing:</strong> Subscriptions automatically renew unless cancelled. You can 
                    cancel at any time, and your subdomain will remain active until the end of the billing period.
                  </p>
                  <p>
                    <strong>Refunds:</strong> We do not offer refunds for partial months or years, except 
                    as required by law.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">6. Service Availability</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We may 
                    perform maintenance that temporarily affects service availability.
                  </p>
                  <p>
                    We reserve the right to modify, suspend, or discontinue the Service at any time with 
                    reasonable notice.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">7. Prohibited Activities</h3>
                <div className="space-y-2 text-stone-700">
                  <p>You may not:</p>
                  <p>• Use the Service for illegal activities</p>
                  <p>• Attempt to hack, disrupt, or overload our systems</p>
                  <p>• Create multiple accounts to circumvent trial limitations</p>
                  <p>• Use subdomains for non-Minecraft purposes</p>
                  <p>• Violate any applicable laws or regulations</p>
                  <p>• Infringe on intellectual property rights</p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">8. Intellectual Property</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    The HostMinecraft service, including its design, code, and content, is owned by us and 
                    protected by intellectual property laws. You may not copy, modify, or distribute our 
                    service without permission.
                  </p>
                  <p>
                    You retain ownership of your content (subdomain configurations, etc.), but grant us 
                    the right to use it to provide the Service.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">9. Limitation of Liability</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    The Service is provided "as is" without warranties. We are not liable for any indirect, 
                    incidental, or consequential damages arising from your use of the Service.
                  </p>
                  <p>
                    Our total liability to you for any claims related to the Service is limited to the 
                    amount you paid us in the 12 months preceding the claim.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">10. Termination</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    You may terminate your account at any time. We may terminate or suspend your account 
                    for violations of these terms or for any reason with reasonable notice.
                  </p>
                  <p>
                    Upon termination, your subdomains will be deactivated and your data will be deleted 
                    according to our Privacy Policy.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">11. Changes to Terms</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    We may update these terms from time to time. We will notify you of material changes 
                    by email or through the Service. Continued use after changes constitutes acceptance 
                    of the updated terms.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">12. Governing Law</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    These terms are governed by the laws of the jurisdiction where HostMinecraft operates. 
                    Any disputes will be resolved through binding arbitration.
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h3 className="text-lg font-bold text-minecraft-800 mb-3">13. Contact Information</h3>
                <div className="space-y-3 text-stone-700">
                  <p>
                    If you have questions about these terms, please contact us through our support system 
                    or email us at legal@hostminecraft.com.
                  </p>
                </div>
              </section>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                <p className="text-sm font-minecraft text-red-800">
                  <strong>Disclaimer:</strong> HostMinecraft is not an official Minecraft product. It is not 
                  approved by or associated with Mojang Studios or Microsoft Corporation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}