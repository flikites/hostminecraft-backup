import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { HelpCircle } from 'lucide-react';
import { Accordion } from '../components/ui/Accordion';
import { SupportModal } from '../components/support/SupportModal';

const faqData = [
  {
    question: "What is HostMinecraft and how does it work?",
    answer: "HostMinecraft provides custom subdomains for your Minecraft server. Instead of sharing a confusing IP address like 192.168.1.100:25565, you can give your players a memorable domain like myserver.hostminecraft.com. We handle all the DNS management automatically."
  },
  {
    question: "How long is the free trial?",
    answer: "You get a 1-day free trial that includes one custom subdomain. No credit card is required to start your trial. After the trial period, you can upgrade to a paid plan to keep your subdomain active if it is still available."
  },
  {
    question: "What happens to my subdomain after the free trial ends?",
    answer: "If you don't upgrade to a paid plan, your subdomain will be marked as expired and will stop working. However, you can upgrade at any time during or after your trial to keep your subdomain active if it is still available."
  },
  {
    question: "Can I point my subdomain to any server?",
    answer: "Yes! You can point your subdomain to any IP address or domain name. This works with any hosting provider including self-hosted servers, dedicated servers, VPS, or cloud hosting services."
  },
  {
    question: "How quickly does my subdomain start working?",
    answer: "Your subdomain is active immediately after creation. DNS propagation typically takes under 5 minutes globally, so your players can connect right away."
  },
  {
    question: "Can I change where my subdomain points?",
    answer: "Absolutely! You can update your subdomain's target IP address or domain at any time from your dashboard. Changes take effect within minutes."
  },
  {
    question: "What's the difference between IP address and domain name targeting?",
    answer: "IP address targeting creates an A record that points directly to your server's IP (e.g., 192.168.1.100). Domain name targeting creates a CNAME record that points to another domain (e.g., myserver.example.com). Both work the same for players."
  },
  {
    question: "How many subdomains can I create?",
    answer: "During your free trial, you can create one subdomain. With a paid subscription, each subdomain costs $5/month or $30/year. You can create as many as you need, but we're limited to 3,333 total subdomains in our first year."
  },
  {
    question: "Are there only 3,333 subdomains available total?",
    answer: "Yes, we're limiting our initial launch to 3,333 unique subdomains to ensure quality service and exclusivity. Once these are claimed, no new subdomains will be available until we expand our capacity."
  },
  {
    question: "How much does each subdomain cost?",
    answer: "Each subdomain costs $5 per month or $30 per year (save $30 annually). You pay per subdomain, so if you have 3 subdomains, you'd pay $15/month or $90/year total."
  },
  {
    question: "Can I use custom ports?",
    answer: "Yes! While Minecraft's default port is 25565, you can specify any port your server uses. Players will still connect using just your subdomain - the port is handled automatically."
  },
  {
    question: "What if my subdomain name is already taken?",
    answer: "Subdomain names are first-come, first-served. If your preferred name is taken, you'll need to choose a different one. We recommend having a few backup options ready."
  },
  {
    question: "Do you provide server hosting?",
    answer: "No, we only provide custom subdomains. You'll need to have your Minecraft server hosted elsewhere. We work with all hosting providers and self-hosted servers."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel your subscription at any time from your billing page. Your subdomains will remain active until the end of your current billing period."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express) through our secure Stripe payment processor."
  },
  {
    question: "Is there a setup fee?",
    answer: "No setup fees! You only pay $5/month per subdomain or $30/year per subdomain (annual discount available)."
  },
  {
    question: "What happens if I forget to renew my subscription?",
    answer: "If your subscription expires, your subdomains will be marked as expired and stop working. You can reactivate them by renewing your subscription, but we recommend setting up automatic billing to avoid interruptions."
  }
];

export function FAQPage() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-grass-50 to-dirt-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            {/* logo 
            <div className="flex items-center justify-center space-x-2 mb-6">
              <img src="/logo.svg" alt="HostMinecraft Logo" className="w-8 h-8 shadow-minecraft" />
              <span className="font-minecraft font-bold text-xl text-minecraft-900">HostMinecraft</span>
              <HelpCircle className="w-6 h-6 text-grass-600 ml-2" />
            </div>
            */}
            <h1 className="text-4xl font-minecraft font-bold text-minecraft-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-stone-600 font-minecraft">
              Find answers to common questions about HostMinecraft
            </p>
          </div>

          {/* FAQ Items */}
          <Accordion items={faqData} allowMultiple={true} />

          {/* Contact Support */}
          <Card variant="minecraft" className="mt-12">
            <CardContent className="text-center py-8">
              <h3 className="font-minecraft font-bold text-xl text-minecraft-800 mb-4">
                Still Have Questions?
              </h3>
              <p className="text-stone-600 font-minecraft mb-6">
                Can't find the answer you're looking for? Our support team is ready to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setShowSupportModal(true)}
                  className="bg-grass-500 hover:bg-grass-600 text-white font-minecraft font-bold px-6 py-3 rounded shadow-minecraft hover:shadow-minecraft-hover transition-all"
                >
                  Contact Support
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <SupportModal 
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
}