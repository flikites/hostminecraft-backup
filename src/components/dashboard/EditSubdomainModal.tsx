import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Save, Info, Monitor, Globe } from 'lucide-react';
import { Subdomain } from '../../types';

interface EditSubdomainModalProps {
  subdomain: Subdomain | null;
  onClose: () => void;
  onSave: (id: string, data: { target: string; port: number }) => void;
  loading?: boolean;
}

export function EditSubdomainModal({ subdomain, onClose, onSave, loading = false }: EditSubdomainModalProps) {
  const [formData, setFormData] = useState({
    target: '',
    minecraft_server_port: '25565',
  });

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (subdomain) {
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift from scrollbar
    } else {
      // Re-enable scrolling
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup function to ensure scrolling is re-enabled
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [subdomain]);
  useEffect(() => {
    if (subdomain) {
      setFormData({
        target: subdomain.minecraft_server_ip,
        minecraft_server_port: subdomain.minecraft_server_port.toString(),
      });
    }
  }, [subdomain]);

  const isValidIP = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const getTargetType = () => {
    if (!formData.target) return null;
    return isValidIP(formData.target) ? 'IP Address' : 'Domain Name';
  };

  const getTargetIcon = () => {
    if (!formData.target) return null;
    return isValidIP(formData.target) ? <Monitor className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subdomain) {
      onSave(subdomain.id, {
        target: formData.target,
        port: parseInt(formData.minecraft_server_port)
      });
    }
  };

  const handleClose = () => {
    // Ensure scrolling is re-enabled before closing
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    onClose();
  };
  if (!subdomain) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full">
        <Card variant="minecraft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-minecraft font-bold text-minecraft-800">
                Edit Subdomain
              </h2>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={handleClose}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 bg-stone-100 rounded-lg">
              <p className="font-minecraft text-sm text-stone-700">
                <span className="font-bold">Subdomain:</span> {subdomain.subdomain}.hostminecraft.com
              </p>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm font-minecraft text-blue-800">
                  <p className="font-bold mb-2">Target Options:</p>
                  <ul className="space-y-1 text-blue-700">
                    <li>• <strong>IP Address:</strong> Point directly to your server's IP</li>
                    <li>• <strong>Domain Name:</strong> Point to another domain</li>
                  </ul>
                  {formData.target && (
                    <div className="mt-2 flex items-center gap-2 font-bold text-blue-900">
                      {getTargetIcon()}
                      <span>Detected: {getTargetType()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Target (IP Address or Domain)"
                value={formData.target}
                onChange={(value) => setFormData({ ...formData, target: value })}
                placeholder="192.168.1.100 or myserver.example.com"
                required
              />
              <Input
                label="Port"
                type="number"
                value={formData.minecraft_server_port}
                onChange={(value) => setFormData({ ...formData, minecraft_server_port: value })}
                placeholder="25565"
                required
              />
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  icon={Save}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}