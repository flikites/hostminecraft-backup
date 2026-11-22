export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  trial_started_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subdomain {
  id: string;
  user_id: string;
  unique_id: string;
  subdomain: string;
  minecraft_server_ip: string;
  minecraft_server_port: number;
  status: 'active' | 'trial' | 'cancelled' | 'expired' | 'pending_payment';
  trial_ends_at: string | null;
  stripe_subscription_id: string | null;
  cloudflare_record_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HostingProvider {
  id: string;
  name: string;
  description: string;
  rating: number;
  price_range: string;
  features: string[];
  website_url: string;
  logo_url?: string;
}