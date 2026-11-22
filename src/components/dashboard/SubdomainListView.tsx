import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import { Subdomain } from '../../types';
import toast from 'react-hot-toast';
import { SubdomainItem } from './SubdomainItem';

interface SubdomainListViewProps {
  subdomains: Subdomain[];
  hasActiveSubscription: boolean;
  onUpgrade: (subdomainId: string) => void;
  onShowAddForm: () => void;
  onEdit: (subdomain: Subdomain) => void;
}

export function SubdomainListView({ 
  subdomains, 
  hasActiveSubscription, 
  onUpgrade, 
  onShowAddForm,
  onEdit,
}: SubdomainListViewProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyDomain = async (subdomain: Subdomain) => {
    const fullDomain = `${subdomain.subdomain}.hostminecraft.com`;
    const domainWithPort = subdomain.minecraft_server_port !== 25565 
      ? `${fullDomain}:${subdomain.minecraft_server_port}`
      : fullDomain;
    
    try {
      await navigator.clipboard.writeText(domainWithPort);
      setCopiedId(subdomain.id);
      toast.success(`${domainWithPort} copied to clipboard!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
      // Show fallback with domain info
      toast.info(`Your domain: ${domainWithPort}`);
    }
  };

  return (
    <Card variant="minecraft">
      <CardContent>
        {subdomains.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-stone-100 rounded-lg mx-auto flex items-center justify-center">
                <Plus className="w-8 h-8 text-stone-400" />
              </div>
              <div>
                <h3 className="font-minecraft font-bold text-lg text-stone-600 mb-2">
                  No subdomains yet
                </h3>
                <p className="text-stone-500 font-minecraft mb-4">
                  Create your first subdomain to get started.
                </p>
                <Button
                  onClick={onShowAddForm}
                  variant="primary"
                  icon={Plus}
                >
                  Add Subdomain
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600">
                    Subdomain
                  </th>
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Target
                  </th>
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Copy
                  </th>
                  <th className="text-left py-3 px-4 font-minecraft text-sm text-stone-600 hidden md:table-cell">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subdomains.map((subdomain) => (
                  <SubdomainItem
                    key={subdomain.id}
                    subdomain={subdomain}
                    hasActiveSubscription={hasActiveSubscription}
                    onUpgrade={onUpgrade}
                    onEdit={onEdit}
                    viewMode="list"
                    copiedId={copiedId}
                    onCopy={handleCopyDomain}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}