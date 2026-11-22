import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSubdomainCount() {
  const [availableSubdomains, setAvailableSubdomains] = useState(3333);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCount = async () => {
    setError(null);
    
    try {
      console.log('🔄 Fetching subdomain count...');
      
      // Use the secure function that bypasses RLS for counting
      const { data, error } = await supabase.rpc('get_subdomain_count');

      if (error) {
        console.error('❌ RPC count query failed:', error);
        setError('Unable to fetch current count');
        setAvailableSubdomains(3200); // Conservative fallback
        return;
      }
      
      const used = data || 0;
      const available = Math.max(0, 3333 - used);
      
      console.log('📊 SUBDOMAIN COUNT RESULTS:');
      console.log(`   Total created: ${used}`);
      console.log(`   Available: ${available}`);
      console.log(`   Percentage used: ${((used / 3333) * 100).toFixed(1)}%`);
      
      setAvailableSubdomains(available);
    } catch (err: any) {
      console.error('💥 Error in useSubdomainCount:', err);
      setError(err.message);
      setAvailableSubdomains(3200); // Conservative fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCount();
    
    // Use polling instead of real-time subscriptions to avoid WebSocket issues
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for subdomain count updates...');
      fetchCount();
    }, 120000); // Poll every 2 minutes
    
    console.log('⏰ Set up polling for subdomain count updates (every 2 minutes)');

    return () => {
      console.log('🛑 Clearing subdomain count polling');
      clearInterval(pollInterval);
    };
  }, []);

  return {
    availableSubdomains,
    isLoading,
    error,
    refetch: fetchCount
  };
}