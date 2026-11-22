export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subdomains: {
        Row: {
          id: string;
          user_id: string;
          unique_id: string;
          subdomain: string;
          minecraft_server_ip: string;
          minecraft_server_port: number;
          status: 'active' | 'trial' | 'cancelled' | 'expired';
          trial_ends_at: string | null;
          stripe_subscription_id: string | null;
          cloudflare_record_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          unique_id?: string;
          subdomain: string;
          minecraft_server_ip: string;
          minecraft_server_port?: number;
          status?: 'active' | 'trial' | 'cancelled' | 'expired';
          trial_ends_at?: string | null;
          stripe_subscription_id?: string | null;
          cloudflare_record_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          unique_id?: string;
          subdomain?: string;
          minecraft_server_ip?: string;
          minecraft_server_port?: number;
          status?: 'active' | 'trial' | 'cancelled' | 'expired' | 'pending_payment';
          trial_ends_at?: string | null;
          stripe_subscription_id?: string | null;
          cloudflare_record_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      billing_history: {
        Row: {
          id: string;
          user_id: string;
          subdomain_id: string;
          amount: number;
          currency: string;
          stripe_payment_intent_id: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subdomain_id: string;
          amount: number;
          currency?: string;
          stripe_payment_intent_id: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subdomain_id?: string;
          amount?: number;
          currency?: string;
          stripe_payment_intent_id?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
        subdomain_id: string | null;
          created_at?: string;
        };
      };
    };
  };
};