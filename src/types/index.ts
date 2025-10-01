export interface Contract {
  id: string;
  source: 'E&I' | 'Sourcewell' | 'OMNIA Partners';
  contractId: string;
  url: string;
  supplierName: string;
  supplierNormalized?: string;
  contractTitle: string;
  contractDescription: string;
  category: string;
  eligibleIndustries?: string;
  contractType?: string;
  startDate: Date;
  endDate: Date;
  geographicCoverage?: string;
  diversityStatus?: string;
  supplierUrl?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  subscriptionTier: 'free' | 'pro';
  searchCount: number;
  savedContracts: string[];
  createdAt: Date;
}

export interface SearchFilters {
  query?: string;
  source?: string[];
  category?: string[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  sortBy?: 'relevance' | 'date' | 'supplier' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
