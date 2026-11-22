import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Accordion } from '../ui/Accordion';
import { SupportModal } from '../support/SupportModal';

const faqData = [
  {
    question: "What is HostMinecraft and how does it work?",
    answer: "HostMinecraft provides custom subdomains for your Minecraft server. Instead of sharing a confusing IP address like 192.168.1.100:25565, you can give your players a memorable domain like myserver.hostminecraft.com. We handle all the DNS management automatically."
  },
  {
    question: "How long is the free trial?",
    answer: "You get a 1-day free trial that includes one custom subdomain. No credit card is required to start your trial. After the trial period, you can upgrade to a paid plan to keep your subdomain active."
  },
  {
    question: "What happens to my subdomain after the free trial ends?",
    answer: "If you don't upgrade to a paid plan, your subdomain will be marked as expired and will stop working. However, you can upgrade at any time during or after your trial to keep your subdomain active."
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
  }
];

export function FAQSection() {
  const [showSupportModal, setShowSupportModal] = useState(false);

  return (
    <>
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-minecraft font-bold text-minecraft-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg font-minecraft text-stone-600">
              Get answers to common questions about HostMinecraft
            </p>
          </div>
          
          <Accordion items={faqData} allowMultiple={true} />
          
          <div className="text-center mt-8">
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
      </div>
      
      <SupportModal 
        isOpen={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
}