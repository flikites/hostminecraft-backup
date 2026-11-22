import React, { useState, useCallback, useRef } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Info, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';

interface SubdomainFormProps {
  formData: {
    subdomain: string;
    target: string;
    minecraft_server_port: string;
  };
  setFormData: (data: { subdomain: string; target: string; minecraft_server_port: string }) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  showTargetInfo: boolean;
  setShowTargetInfo: (show: boolean) => void;
  upgradeSubdomainId?: string;
  getButtonText: () => string;
  checkSubdomainAvailability: (subdomain: string) => Promise<boolean>;
  checkingAvailability: boolean;
}

export function SubdomainForm({
  formData,
  setFormData,
  loading,
  onSubmit,
  onClose,
  showTargetInfo,
  setShowTargetInfo,
  upgradeSubdomainId,
  getButtonText,
  checkSubdomainAvailability,
  checkingAvailability
}: SubdomainFormProps) {
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced availability check
  const debouncedAvailabilityCheck = useCallback(
    (subdomain: string) => {
      // Clear existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer
      timerRef.current = setTimeout(async () => {
        if (subdomain && subdomain.trim() !== '') {
          const available = await checkSubdomainAvailability(subdomain);
          setIsSubdomainAvailable(available);
        } else {
          setIsSubdomainAvailable(null);
        }
      }, 300); // 300ms debounce
    },
    [checkSubdomainAvailability]
  );

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    // Reset availability status when user starts typing
    setIsSubdomainAvailable(null);
    setFormData({ ...formData, subdomain: cleanValue });
  };

  const handleSubdomainBlur = () => {
    // Only check availability on blur if not upgrading and subdomain has value
    if (!upgradeSubdomainId && formData.subdomain && formData.subdomain.trim() !== '') {
      debouncedAvailabilityCheck(formData.subdomain);
    }
  };

  const handleTargetFocus = () => {
    // Check subdomain availability when user focuses on target field
    // This ensures the form becomes valid for submission
    if (!upgradeSubdomainId && formData.subdomain && formData.subdomain.trim() !== '' && isSubdomainAvailable === null) {
      debouncedAvailabilityCheck(formData.subdomain);
    }
  };

  const isValidIP = (ip: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const getTargetType = () => {
    if (!formData.target) return null;
    return isValidIP(formData.target) ? 'IP Address' : 'Domain Name';
  };

  const getAvailabilityDisplay = () => {
    if (upgradeSubdomainId) return null;
    if (!formData.subdomain) return null;
    
    if (checkingAvailability) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-blue-600 mt-1">
          <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking availability...</span>
        </div>
      );
    }

    if (isSubdomainAvailable === true) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-grass-600 mt-1">
          <CheckCircle className="w-4 h-4" />
          <span>Available!</span>
        </div>
      );
    }

    if (isSubdomainAvailable === false) {
      return (
        <div className="flex items-center gap-2 text-sm font-minecraft text-red-600 mt-1">
          <XCircle className="w-4 h-4" />
          <span>Already taken</span>
        </div>
      );
    }

    return null;
  };

  const isFormValid = () => {
    if (upgradeSubdomainId) {
      // For upgrades, don't check availability since subdomain already exists
      return formData.subdomain && formData.target && formData.minecraft_server_port;
    }
    
    // For new subdomains, require availability check to pass
    return (
      formData.subdomain &&
      formData.target &&
      formData.minecraft_server_port &&
      isSubdomainAvailable === true &&
      !checkingAvailability
    );
  };

  return (
    <div className="space-y-6">
      {upgradeSubdomainId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <p className="text-sm font-minecraft text-blue-800 mb-2">
              <strong>Upgrading Trial Subdomain</strong>
            </p>
            <p className="text-xs font-minecraft text-blue-700">
              The form below shows your current subdomain settings. You can modify them before upgrading.
            </p>
          </div>
        </div>
      )}

      {/* Collapsible Target Options */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowTargetInfo(!showTargetInfo)}
          className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-minecraft text-blue-800 font-bold">
                Target Options
              </span>
              {formData.target && (
                <span className="text-xs font-minecraft text-blue-700 bg-blue-200 px-2 py-1 rounded">
                  Detected: {getTargetType()}
                </span>
              )}
            </div>
            {showTargetInfo ? (
              <ChevronUp className="w-4 h-4 text-blue-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-600" />
            )}
          </div>
        </button>
        
        {showTargetInfo && (
          <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg border-t-0 rounded-t-none">
            <div className="text-sm font-minecraft text-blue-800">
              <p className="font-bold mb-2">Choose your target type:</p>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-0 flex-shrink-0">IP Address:</span>
                  <span>Point directly to your server's IP (e.g., 192.168.1.100)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold min-w-0 flex-shrink-0">Domain Name:</span>
                  <span>Point to another domain (e.g., myserver.example.com)</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Input
              label="Subdomain Name"
              value={formData.subdomain}
              onChange={handleSubdomainChange}
              onBlur={handleSubdomainBlur}
              placeholder="myserver"
              required
              disabled={upgradeSubdomainId ? true : false}
            />
            {getAvailabilityDisplay()}
          </div>
          <div className="flex items-end">
            <span className="text-stone-600 font-minecraft text-sm pb-2">
              .hostminecraft.com
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Target (IP Address or Domain)"
            value={formData.target}
            onChange={(value) => setFormData({ ...formData, target: value })}
            onFocus={handleTargetFocus}
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
        </div>
        <div className="flex gap-4">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading || !isFormValid()}
          >
            {getButtonText()}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}