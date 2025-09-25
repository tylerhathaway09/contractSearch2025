// Updated TypeScript interfaces based on your real data structure
// Generated from ContractNormalizer script analysis

export interface Contract {
  id: string;
  source: 'OMNIA' | 'Sourcewell' | 'E&I';
  supplier_name: string;
  supplier_normalized: string; // For deduplication and search
  contract_number: string;
  title: string;
  description?: string;
  category?: string;
  eligible_industries?: string;
  contract_type?: string;
  start_date?: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
  geographic_coverage?: string;
  diversity_status?: string;
  contract_url?: string;
  supplier_url?: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  subscription_status: 'free' | 'pro';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_end?: string;
  search_count?: number;
  created_at: string;
  updated_at: string;
}

export interface SavedContract {
  id: string;
  user_id: string;
  contract_id: string;
  saved_at: string;
}

export interface SearchHistory {
  id: string;
  user_id: string;
  query?: string;
  filters?: SearchFilters;
  results_count: number;
  searched_at: string;
}

export interface SearchFilters {
  query?: string;
  source?: string[];
  category?: string[];
  supplier?: string[];
  eligible_industries?: string[];
  contract_type?: string[];
  geographic_coverage?: string[];
  diversity_status?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'relevance' | 'date' | 'supplier' | 'title' | 'end_date';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchLimitInfo {
  can_search: boolean;
  remaining: number;
  limit_count: number;
}

// Database response types
export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: Contract;
        Insert: Omit<Contract, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Contract, 'id' | 'created_at' | 'updated_at'>>;
      };
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      saved_contracts: {
        Row: SavedContract;
        Insert: Omit<SavedContract, 'id' | 'saved_at'>;
        Update: Partial<Omit<SavedContract, 'id' | 'saved_at'>>;
      };
      search_history: {
        Row: SearchHistory;
        Insert: Omit<SearchHistory, 'id' | 'searched_at'>;
        Update: Partial<Omit<SearchHistory, 'id' | 'searched_at'>>;
      };
    };
    Views: {
      contracts_with_expiration: {
        Row: Contract & { expiration_status: 'expired' | 'expiring_soon' | 'active' };
      };
      user_dashboard_data: {
        Row: {
          id: string;
          email: string;
          name: string;
          subscription_tier: 'free' | 'pro';
          search_count: number;
          saved_contracts_count: number;
          created_at: string;
        };
      };
    };
    Functions: {
      get_user_search_limit: {
        Args: { user_uuid: string };
        Returns: SearchLimitInfo;
      };
      increment_search_count: {
        Args: { user_uuid: string };
        Returns: boolean;
      };
    };
    Enums: {
      subscription_tier: 'free' | 'pro';
      contract_status: 'active' | 'inactive' | 'expired';
      contract_source: 'OMNIA' | 'Sourcewell' | 'E&I';
    };
  };
}

// Migration helper types
export interface ContractImportData {
  source: string;
  supplier_name: string;
  supplier_normalized: string;
  contract_number: string;
  title: string;
  description?: string;
  category?: string;
  eligible_industries?: string;
  contract_type?: string;
  start_date?: string;
  end_date?: string;
  geographic_coverage?: string;
  diversity_status?: string;
  contract_url?: string;
  supplier_url?: string;
  status: string;
}
