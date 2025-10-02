import { supabase } from './supabase';
import { Contract } from '@/types';
import { getContractCategories } from './categoryExtractor';
import { extractBaseCategories } from './categoryUtils';

// Map database contract to frontend Contract type
function mapDatabaseContract(dbContract: Record<string, unknown>): Contract {
  // Category is now a direct field, default to 'Other' if not set
  const category = String(dbContract.category || 'Other');

  // Map source to frontend display names
  let source: 'E&I' | 'Sourcewell' | 'OMNIA Partners' = 'OMNIA Partners';
  if (dbContract.source === 'OMNIA') {
    source = 'OMNIA Partners';
  } else if (dbContract.source === 'E&I' || dbContract.source === 'Sourcewell') {
    source = dbContract.source as 'E&I' | 'Sourcewell';
  }

  return {
    id: String(dbContract.id),
    source,
    contractId: String(dbContract.contract_number || 'Not Provided'),
    url: String(dbContract.contract_url || ''),
    supplierName: String(dbContract.supplier_name || 'Unknown'),
    supplierNormalized: String(dbContract.supplier_normalized || ''),
    contractTitle: String(dbContract.title || 'Untitled'),
    contractDescription: String(dbContract.description || ''),
    category: category,
    eligibleIndustries: String(dbContract.eligible_industries || ''),
    contractType: String(dbContract.contract_type || ''),
    startDate: dbContract.start_date ? new Date(String(dbContract.start_date)) : null,
    endDate: dbContract.end_date ? new Date(String(dbContract.end_date)) : null,
    geographicCoverage: String(dbContract.geographic_coverage || ''),
    diversityStatus: String(dbContract.diversity_status || ''),
    supplierUrl: String(dbContract.supplier_url || ''),
    status: String(dbContract.status || 'active'),
    productTags: Array.isArray(dbContract.product_tags) ? dbContract.product_tags as string[] : undefined,
    createdAt: new Date(String(dbContract.created_at)),
    updatedAt: new Date(String(dbContract.updated_at))
  };
}

export interface ContractFilters {
  search?: string;
  sources?: string[];
  categories?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  sortBy?: 'relevance' | 'date' | 'supplier' | 'title' | 'end_date';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  // AI enhancement (pre-expanded on client before sending)
  enhancedKeywords?: string[];
  enhancedSuppliers?: string[];
  enhancedCategories?: string[];
}

export class ContractService {
  static async getContracts(filters: ContractFilters = {}): Promise<{ contracts: Contract[], total: number }> {
    try {
      let query = supabase
        .from('contracts')
        .select('*', { count: 'exact' });

      // Apply search filter (with optional pre-expanded AI keywords/suppliers/categories from client)
      if (filters.search) {
        const searchConditions: string[] = [
          `title.ilike.%${filters.search}%`,
          `supplier_name.ilike.%${filters.search}%`,
          `description.ilike.%${filters.search}%`
        ];

        // Add enhanced keywords (if provided from client-side AI enhancement)
        if (filters.enhancedKeywords && filters.enhancedKeywords.length > 0) {
          console.log('[ContractService] Enhanced keywords:', filters.enhancedKeywords);
          filters.enhancedKeywords.forEach(keyword => {
            searchConditions.push(`title.ilike.%${keyword}%`);
            searchConditions.push(`description.ilike.%${keyword}%`);
          });
        }

        // Add enhanced suppliers (if provided from client-side AI enhancement)
        if (filters.enhancedSuppliers && filters.enhancedSuppliers.length > 0) {
          console.log('[ContractService] Enhanced suppliers:', filters.enhancedSuppliers);
          filters.enhancedSuppliers.forEach(supplier => {
            searchConditions.push(`supplier_name.ilike.%${supplier}%`);
          });
        }

        // Add enhanced categories to SEARCH (not as filter) - helps find contracts in related categories
        if (filters.enhancedCategories && filters.enhancedCategories.length > 0) {
          console.log('[ContractService] Enhanced categories (for search):', filters.enhancedCategories);
          filters.enhancedCategories.forEach(category => {
            searchConditions.push(`category.ilike.%${category}%`);
          });
        }

        console.log('[ContractService] Search conditions:', searchConditions);
        query = query.or(searchConditions.join(','));
      }

      // Use only user-selected categories as filters (NOT AI-enhanced categories)
      const uniqueCategories = filters.categories || [];

      // Apply source filter (map frontend source names to database values)
      if (filters.sources && filters.sources.length > 0) {
        const dbSources = filters.sources.map(source => {
          if (source === 'OMNIA Partners') return 'OMNIA';
          return source; // E&I and Sourcewell remain the same
        });
        query = query.in('source', dbSources);
      }

      // Apply category filter (partial matching for comma-separated categories)
      // Use uniqueCategories which includes both user-selected and AI-enhanced categories
      if (uniqueCategories.length > 0) {
        // Build OR conditions for partial matching
        const categoryConditions = uniqueCategories.map(cat => `category.ilike.%${cat}%`).join(',');
        query = query.or(categoryConditions);
      }


      // Apply date range filters
      if (filters.dateRange?.start) {
        query = query.gte('start_date', filters.dateRange.start);
      }
      if (filters.dateRange?.end) {
        query = query.lte('end_date', filters.dateRange.end);
      }

      // Apply sorting
      if (filters.sortBy) {
        const ascending = filters.sortOrder === 'asc';
        switch (filters.sortBy) {
          case 'date':
            query = query.order('created_at', { ascending });
            break;
          case 'supplier':
            query = query.order('supplier_name', { ascending });
            break;
          case 'title':
            query = query.order('title', { ascending });
            break;
          case 'end_date':
            query = query.order('end_date', { ascending });
            break;
          default:
            query = query.order('created_at', { ascending: false }); // Default relevance = newest first
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching contracts:', error);
        throw error;
      }

      const contracts = data?.map(mapDatabaseContract) || [];

      return {
        contracts,
        total: count || 0
      };

    } catch (error) {
      console.error('Contract service error:', error);
      throw error;
    }
  }

  static async getContractById(id: string): Promise<Contract | null> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching contract:', error);
        return null;
      }

      return data ? mapDatabaseContract(data) : null;
    } catch (error) {
      console.error('Contract service error:', error);
      return null;
    }
  }

  static async getContractsByIds(ids: string[]): Promise<Contract[]> {
    try {
      if (ids.length === 0) return [];

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .in('id', ids);

      if (error) {
        console.error('Error fetching contracts by IDs:', error);
        return [];
      }

      return data?.map(mapDatabaseContract) || [];
    } catch (error) {
      console.error('Contract service error:', error);
      return [];
    }
  }

  static async getAllSources(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('source')
        .not('source', 'is', null);

      if (error) {
        console.error('Error fetching sources:', error);
        return [];
      }

      // Map database source names to frontend display names
      const sources = [...new Set(data?.map(item => {
        if (item.source === 'OMNIA') return 'OMNIA Partners';
        return item.source;
      }) || [])];
      return sources.sort();
    } catch (error) {
      console.error('Contract service error:', error);
      return [];
    }
  }

  static async getAllCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('category')
        .not('category', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      // Extract and return base categories (split comma-separated values)
      const allCategories = data?.map(item => item.category) || [];
      return extractBaseCategories(allCategories);
    } catch (error) {
      console.error('Contract service error:', error);
      return [];
    }
  }


  static async getRelatedContracts(contract: Contract, limit = 4): Promise<Contract[]> {
    try {
      const query = supabase
        .from('contracts')
        .select('*')
        .neq('id', contract.id)
        .limit(limit);

      // Try to find contracts from the same supplier first
      const { data: sameSupplier } = await query
        .eq('supplier_name', contract.supplierName);

      if (sameSupplier && sameSupplier.length >= limit) {
        return sameSupplier.map(mapDatabaseContract);
      }

      // If not enough from same supplier, get contracts from same source
      // Map frontend source name back to database value
      const dbSource = contract.source === 'OMNIA Partners' ? 'OMNIA' : contract.source;
      const { data: sameSource } = await query
        .eq('source', dbSource);

      if (sameSource && sameSource.length > 0) {
        return sameSource.slice(0, limit).map(mapDatabaseContract);
      }

      // Fallback to any contracts
      const { data: anyContracts } = await query;
      return anyContracts?.slice(0, limit).map(mapDatabaseContract) || [];

    } catch (error) {
      console.error('Error fetching related contracts:', error);
      return [];
    }
  }
}