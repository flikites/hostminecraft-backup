import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface CloudflareDNSParams {
  action: 'create' | 'update' | 'delete';
  subdomain_id: string;
  target?: string;
}

interface CloudflareDNSResponse {
  success: boolean;
  record_id?: string;
  record_type?: 'A' | 'CNAME';
  message?: string;
  error?: string;
}

export function useCloudflareDNS() {
  const [loading, setLoading] = useState(false);
  const { supabaseUser } = useAuth();

  const manageDNSRecord = async ({
    action,
    subdomain_id,
    target,
  }: CloudflareDNSParams): Promise<CloudflareDNSResponse | null> => {
    if (!supabaseUser) {
      toast.error('Please sign in to continue');
      return null;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Authentication required');
        return null;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cloudflare-dns`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          subdomain_id,
          target,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to manage DNS record');
      }

      if (data.success) {
        switch (action) {
          case 'create':
            toast.success(`DNS record created successfully (${data.record_type} record)`);
            break;
          case 'update':
            toast.success(`DNS record updated successfully (${data.record_type} record)`);
            break;
          case 'delete':
            toast.success('DNS record deleted successfully');
            break;
        }
      }

      return data;
    } catch (error: any) {
      console.error('DNS management error:', error);
      toast.error(error.message || 'Failed to manage DNS record');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDNSRecord = async (subdomain_id: string, target: string) => {
    return manageDNSRecord({ action: 'create', subdomain_id, target });
  };

  const updateDNSRecord = async (subdomain_id: string, target: string) => {
    return manageDNSRecord({ action: 'update', subdomain_id, target });
  };

  const deleteDNSRecord = async (subdomain_id: string) => {
    return manageDNSRecord({ action: 'delete', subdomain_id });
  };

  return {
    createDNSRecord,
    updateDNSRecord,
    deleteDNSRecord,
    loading,
  };
}