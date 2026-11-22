import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Settings, CheckCircle, Clock, XCircle, Globe, Monitor, Copy, Check, RefreshCw } from 'lucide-react';
import { Subdomain } from '../../types';
import toast from 'react-hot-toast';

interface SubdomainItemProps {
  subdomain: Subdomain;
  hasActiveSubscription: boolean;
  onUpgrade: (subdomainId: string) => void;
  onEdit: (subdomain: Subdomain) => void;
  viewMode: 'cards' | 'list';
  copiedId: string | null;
  onCopy: (subdomain: Subdomain) => void;
}

export function SubdomainItem({
  subdomain,
  hasActiveSubscription,
  onUpgrade,
  onEdit,
  viewMode,
  copiedId,
  onCopy
}: SubdomainItemProps) {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-grass-500" />;
      case 'trial':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-stone-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'trial':
        return 'Trial';
      case 'cancelled':
        return 'Cancelled';
      case 'expired':
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-grass-100 text-grass-800';
      case 'trial':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-stone-100 text-stone-800';
    }
  };

  const getTrialDaysRemaining = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date(trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isValidIP = (target: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(target);
  };

  const getTargetIcon = (target: string) => {
    return isValidIP(target) ? <Monitor className="w-4 h-4" /> : <Globe className="w-4 h-4" />;
  };

  const getTargetType = (target: string) => {
    return isValidIP(target) ? 'IP' : 'Domain';
  };

  const formatDomainDisplay = (subdomain: Subdomain) => {
    const fullDomain = `${subdomain.subdomain}.hostminecraft.com`;
    return subdomain.minecraft_server_port !== 25565 
      ? `${fullDomain}:${subdomain.minecraft_server_port}`
      : fullDomain;
  };

  const renderActionButtons = () => {
    const isExpired = subdomain.status === 'expired';
    
    if (isExpired) {
      // For expired subdomains, show reactivate button (always available to original owner)
      return (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onUpgrade(subdomain.id)}
            variant="primary"
            size="sm"
            icon={RefreshCw}
            className="w-full"
          >
            Reactivate
          </Button>
        </div>
      );
    }

    // For non-expired subdomains, show normal buttons
    return (
      <div className="flex flex-col gap-2">
        {/* Copy Button */}
        <Button
          onClick={() => onCopy(subdomain)}
          variant="ghost"
          className="w-full border-2 border-dashed border-stone-300 hover:border-grass-400 hover:bg-grass-50 transition-all duration-200"
        >
          <div className="flex items-center justify-center gap-2">
            {copiedId === subdomain.id ? (
              <>
                <Check className="w-4 h-4 text-grass-600" />
                <span className="font-minecraft text-grass-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-stone-600" />
                <span className="font-minecraft text-stone-600">Click to copy</span>
              </>
            )}
          </div>
        </Button>

        {/* Upgrade Button for Trials */}
        {subdomain.status === 'trial' && !hasActiveSubscription && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUpgrade(subdomain.id)}
            className="w-full"
          >
            Upgrade to Keep
          </Button>
        )}

        {/* Edit DNS Button */}
        <Button 
          variant="ghost"
          size="sm" 
          icon={Settings}
          onClick={() => onEdit(subdomain)}
          className="w-full"
        >
          Edit DNS
        </Button>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <tr className="border-b border-stone-100 hover:bg-stone-50">
        <td className="py-3 px-4 font-minecraft text-sm text-stone-800 align-top">
          {/* Domain Name */}
          <div className="font-bold text-minecraft-800 mb-1 break-all">
            {formatDomainDisplay(subdomain)}
          </div>
          
          {/* Mobile-only content */}
          <div className="md:hidden space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(subdomain.status)}
              <span className={`px-2 py-1 rounded text-xs font-minecraft ${getStatusColor(subdomain.status)}`}>
                {getStatusText(subdomain.status)}
              </span>
              {subdomain.status === 'trial' && subdomain.trial_ends_at && (
                <span className="text-xs font-minecraft text-yellow-700 bg-yellow-100 px-2 py-1 rounded border">
                  {getTrialDaysRemaining(subdomain.trial_ends_at)} day left
                </span>
              )}
            </div>
            
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                {getTargetIcon(subdomain.minecraft_server_ip)}
                <span className="font-bold">Target ({getTargetType(subdomain.minecraft_server_ip)}):</span>
              </div>
              <span className="font-mono text-stone-800">{subdomain.minecraft_server_ip}:{subdomain.minecraft_server_port}</span>
            </div>
            
            <div className="text-sm">
              <span className="font-bold">Created:</span>
              <div className="text-stone-800">{new Date(subdomain.created_at).toLocaleDateString()}</div>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              {subdomain.status === 'expired' ? (
                <Button
                  onClick={() => onUpgrade(subdomain.id)}
                  variant="primary"
                  size="sm"
                  icon={RefreshCw}
                  className="w-full"
                >
                  Reactivate
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => onCopy(subdomain)}
                    variant="primary"
                    size="sm"
                    className="w-full bg-grass-500 hover:bg-grass-600 text-white"
                  >
                    <div className="flex items-center justify-center gap-1">
                      {copiedId === subdomain.id ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span className="font-minecraft text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="font-minecraft text-xs">Copy</span>
                        </>
                      )}
                    </div>
                  </Button>
                  {subdomain.status === 'trial' && !hasActiveSubscription && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onUpgrade(subdomain.id)}
                      className="w-full"
                    >
                      Upgrade
                    </Button>
                  )}
                  <Button 
                    variant="ghost"
                    size="sm" 
                    icon={Settings}
                    onClick={() => onEdit(subdomain)}
                    className="w-full"
                  >
                    Edit DNS
                  </Button>
                </>
              )}
            </div>
          </div>
        </td>
        
        {/* Desktop-only columns */}
        <td className="py-3 px-4 font-minecraft text-sm text-stone-800 hidden md:table-cell align-top">
          <div className="flex items-center gap-2 mb-1">
            {getTargetIcon(subdomain.minecraft_server_ip)}
            <span className="font-bold">({getTargetType(subdomain.minecraft_server_ip)})</span>
          </div>
          <span className="font-mono">{subdomain.minecraft_server_ip}:{subdomain.minecraft_server_port}</span>
        </td>
        
        <td className="py-3 px-4 hidden md:table-cell align-top">
          <div className="flex items-center gap-2 mb-1">
            {getStatusIcon(subdomain.status)}
            <span className={`px-2 py-1 rounded text-xs font-minecraft ${getStatusColor(subdomain.status)}`}>
              {getStatusText(subdomain.status)}
            </span>
          </div>
          {subdomain.status === 'trial' && subdomain.trial_ends_at && (
            <span className="text-xs font-minecraft text-yellow-700 bg-yellow-100 px-2 py-1 rounded border">
              {getTrialDaysRemaining(subdomain.trial_ends_at)} days left
            </span>
          )}
        </td>
        
        <td className="py-3 px-4 font-minecraft text-sm text-stone-800 hidden md:table-cell align-top">
          <div className="font-bold">{new Date(subdomain.created_at).toLocaleDateString()}</div>
          <div className="text-xs text-stone-500">{new Date(subdomain.created_at).toLocaleTimeString()}</div>
          {subdomain.trial_ends_at && (
            <div className="text-xs text-stone-500 mt-1">
              <span className="font-bold">
                {subdomain.status === 'trial' ? 'Trial ends:' : 'Trial ended:'}
              </span>
              <div>{new Date(subdomain.trial_ends_at).toLocaleDateString()}</div>
            </div>
          )}
        </td>
        
        <td className="py-3 px-4 hidden md:table-cell align-top">
          {subdomain.status === 'expired' ? (
            <Button
              onClick={() => onUpgrade(subdomain.id)}
              variant="primary"
              size="sm"
              icon={RefreshCw}
            >
              Reactivate
            </Button>
          ) : (
            <Button
              onClick={() => onCopy(subdomain)}
              variant="primary"
              size="sm"
              className="bg-grass-500 hover:bg-grass-600 text-white"
            >
              <div className="flex items-center justify-center gap-2">
                {copiedId === subdomain.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="font-minecraft">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="font-minecraft">Copy</span>
                  </>
                )}
              </div>
            </Button>
          )}
        </td>
        
        <td className="py-3 px-4 hidden md:table-cell align-top">
          <div className="flex flex-col gap-2">
            {subdomain.status === 'trial' && !hasActiveSubscription && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onUpgrade(subdomain.id)}
              >
                Upgrade to Keep
              </Button>
            )}
            {subdomain.status !== 'expired' && (
              <Button 
                variant="ghost"
                size="sm" 
                icon={Settings}
                onClick={() => onEdit(subdomain)}
              >
                Edit
              </Button>
            )}
          </div>
        </td>
      </tr>
    );
  }

  // Card view
  return (
    <div className="border-2 border-stone-300 rounded-lg p-6 hover:shadow-minecraft transition-all bg-white shadow-minecraft flex flex-col">
      <div className="space-y-4">
        {/* Status and Subdomain Name */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(subdomain.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-minecraft font-bold border ${getStatusColor(subdomain.status)} border-stone-300`}>
              {getStatusText(subdomain.status)}
            </span>
            {subdomain.status === 'trial' && subdomain.trial_ends_at && (
              <span className="text-xs font-minecraft text-yellow-700 bg-yellow-100 px-2 py-1 rounded border border-yellow-300">
                {getTrialDaysRemaining(subdomain.trial_ends_at)} day left
              </span>
            )}
          </div>
          
          <h3 className="font-minecraft font-bold text-base lg:text-lg text-minecraft-800 break-all leading-tight">
            {formatDomainDisplay(subdomain)}
          </h3>
        </div>

        {/* Spacer */}
        <div className="border-t border-stone-200"></div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 text-sm font-minecraft text-stone-600">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getTargetIcon(subdomain.minecraft_server_ip)}
              <span className="font-bold">Target ({getTargetType(subdomain.minecraft_server_ip)}):</span>
            </div>
            <span className="font-mono text-stone-800 text-xs lg:text-sm break-all">{subdomain.minecraft_server_ip}:{subdomain.minecraft_server_port}</span>
          </div>
          <div>
            <span className="font-bold">Created:</span>
            <div className="text-stone-800">{new Date(subdomain.created_at).toLocaleDateString()}</div>
          </div>
          {subdomain.trial_ends_at && (
            <div>
              <span className="font-bold">
                {subdomain.status === 'trial' ? 'Trial ends:' : 'Trial ended:'}
              </span>
              <div className="text-stone-800">
                {new Date(subdomain.trial_ends_at).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="border-t border-stone-200"></div>
        
        {/* Action Buttons */}
        <div className="mt-auto">
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
}