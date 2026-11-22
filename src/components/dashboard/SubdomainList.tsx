import React from 'react';
import { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Server, Plus, Grid3X3, List } from 'lucide-react';
import { Subdomain } from '../../types';
import toast from 'react-hot-toast';
import { SubdomainListView } from './SubdomainListView';
import { SubdomainItem } from './SubdomainItem';

interface SubdomainListProps {
  subdomains: Subdomain[];
  hasActiveSubscription: boolean;
  onDelete: (id: string) => void;
  onUpgrade: (subdomainId: string) => void;
  onShowAddForm: () => void;
  onEdit: (subdomain: Subdomain) => void;
  checkSubdomainAvailability: (subdomain: string) => Promise<boolean>;
}

export function SubdomainList({ 
  subdomains, 
  hasActiveSubscription, 
  onDelete, 
  onUpgrade, 
  onShowAddForm,
  onEdit,
  checkSubdomainAvailability,
}: SubdomainListProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

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
    <div className="w-full">
      {/* Minecraft Block Header - Full Width */}
      <div className="relative mb-0">
        {/* Main header block with grass-dirt gradient and shadows */}
        <div className="relative bg-gradient-to-b from-grass-500 to-minecraft-800 border-stone-400 rounded-t-lg shadow-minecraft">
          {/* Top grass layer */}
          <div className="bg-grass-500 h-4 rounded-t-md border-b-2 border-grass-600"></div>
          
          {/* Main content area */}
          <div className="px-8 py-4 bg-grass-500">
            <h2 className="text-xl font-minecraft font-bold text-white text-center drop-shadow-sm">
              Subdomains
            </h2>
          </div>
          
          {/* Bottom dirt layer */}
          <div className="bg-minecraft-800 h-3 rounded-b-sm border-t-2 border-amber-800"></div>
          
          {/* 3D shadow effect */}
          <div className="absolute top-2 left-2 w-full h-full bg-stone-600 rounded-t-lg -z-10"></div>
        </div>
      </div>
      
      {/* Main Container - starts right below the header */}
      <Card variant="minecraft" className="border-t-0 rounded-t-none shadow-minecraft">
        <CardContent className="pt-6">
          {/* View Toggle Buttons - centered below header */}
          {/* View Toggle Buttons - only show if there are subdomains */}
          {subdomains.length > 0 && (
            <div className="flex justify-center mb-6">
              <div className="bg-stone-100 rounded-lg p-1 flex shadow-minecraft border-2 border-stone-300">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-md font-minecraft font-bold text-sm transition-all flex items-center gap-2 ${
                    viewMode === 'cards' 
                      ? 'bg-grass-500 text-white shadow-minecraft border-2 border-grass-600' 
                      : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md font-minecraft font-bold text-sm transition-all flex items-center gap-2 ${
                    viewMode === 'list' 
                      ? 'bg-grass-500 text-white shadow-minecraft border-2 border-grass-600' 
                      : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          )}
          
          {viewMode === 'list' ? (
            <SubdomainListView
              subdomains={subdomains}
              hasActiveSubscription={hasActiveSubscription}
              onUpgrade={onUpgrade}
              onShowAddForm={onShowAddForm}
              onEdit={onEdit}
              checkSubdomainAvailability={checkSubdomainAvailability}
            />
          ) : subdomains.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-4">
                <img src="/logo.svg" alt="HostMinecraft Logo" className="w-16 h-16 mx-auto opacity-40" />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {subdomains.map((subdomain) => (
                <SubdomainItem
                  key={subdomain.id}
                  subdomain={subdomain}
                  hasActiveSubscription={hasActiveSubscription}
                  onUpgrade={onUpgrade}
                  onEdit={onEdit}
                  viewMode="cards"
                  copiedId={copiedId}
                  onCopy={handleCopyDomain}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}