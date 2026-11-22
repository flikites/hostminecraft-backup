import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';

interface AddSubdomainCardProps {
  onShowModal: () => void;
}

export function AddSubdomainCard({ onShowModal }: AddSubdomainCardProps) {
  return (
    <Card variant="minecraft" className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-minecraft font-bold text-minecraft-800">
            Add New Subdomain
          </h2>
          <Button
            onClick={onShowModal}
            variant="primary"
            icon={Plus}
          >
            Add Subdomain
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div 
            className="w-16 h-16 mx-auto mb-4 cursor-pointer hover:scale-110 transition-all duration-200 group"
            onClick={onShowModal}
          >
            <img src="/logo.svg" alt="HostMinecraft Logo" className="w-16 h-16 group-hover:scale-110 transition-transform duration-200 animate-bounce" />
          </div>
          <h3 className="font-minecraft font-bold text-lg text-minecraft-800 mb-2">
            Ready to add a subdomain?
          </h3>
          <p className="text-stone-600 font-minecraft text-sm mb-4">
            Create a memorable domain for your Minecraft server that your players will love.
          </p>
          <Button
            onClick={onShowModal}
            variant="primary"
            icon={Plus}
          >
            Add Subdomain
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}