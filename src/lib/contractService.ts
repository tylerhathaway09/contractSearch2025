import { supabase } from './supabase';
import { Contract } from '@/types';

// Map database contract to frontend Contract type
function mapDatabaseContract(dbContract: Record<string, unknown>): Contract {
  // Extract first category from items array
  const items = dbContract.items as Array<{category?: string}> | null;
  const category = items && items.length > 0 ? items[0].category || 'Other' : 'Other';

  // Map purchasing_org to frontend source names
  let source: 'E&I' | 'Sourcewell' | 'OMNIA Partners' | 'Other' = 'Other';
  if (dbContract.purchasing_org === 'OMNIA') {
    source = 'OMNIA Partners';
  } else if (dbContract.purchasing_org === 'E&I' || dbContract.purchasing_org === 'Sourcewell') {
    source = dbContract.purchasing_org as 'E&I' | 'Sourcewell';
  }

  return {
    id: String(dbContract.id),
    source,
    contractId: String(dbContract.contract_number || dbContract.id),
    url: String((dbContract.document_urls as unknown[])?.[0] || ''),
    supplierName: String(dbContract.vendor_name || 'Unknown'),
    contractTitle: String(dbContract.contract_title || 'Untitled'),
    contractDescription: String(dbContract.description || ''),
    category: category,
    startDate: dbContract.contract_start_date ? new Date(String(dbContract.contract_start_date)) : new Date(),
    endDate: dbContract.contract_end_date ? new Date(String(dbContract.contract_end_date)) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year from now
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
}

export class ContractService {
  static async getContracts(filters: ContractFilters = {}): Promise<{ contracts: Contract[], total: number }> {
    try {
      let query = supabase
        .from('contracts')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (filters.search) {
        query = query.or(`contract_title.ilike.%${filters.search}%,vendor_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply source filter (map frontend source names to database values)
      if (filters.sources && filters.sources.length > 0) {
        const dbSources = filters.sources.map(source => {
          if (source === 'OMNIA Partners') return 'OMNIA';
          return source; // E&I and Sourcewell remain the same
        });
        query = query.in('purchasing_org', dbSources);
      }

      // Apply category filter using JSON query (since categories are in items array)
      if (filters.categories && filters.categories.length > 0) {
        // Use PostgreSQL JSON operators to filter by category in items array
        const categoryConditions = filters.categories.map(category =>
          `items @> '[{"category": "${category}"}]'`
        ).join(' OR ');
        query = query.or(categoryConditions);
      }


      // Apply date range filters
      if (filters.dateRange?.start) {
        query = query.gte('contract_start_date', filters.dateRange.start);
      }
      if (filters.dateRange?.end) {
        query = query.lte('contract_end_date', filters.dateRange.end);
      }

      // Apply sorting
      if (filters.sortBy) {
        const ascending = filters.sortOrder === 'asc';
        switch (filters.sortBy) {
          case 'date':
            query = query.order('created_at', { ascending });
            break;
          case 'supplier':
            query = query.order('vendor_name', { ascending });
            break;
          case 'title':
            query = query.order('contract_title', { ascending });
            break;
          case 'end_date':
            query = query.order('contract_end_date', { ascending });
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
        contracts: contracts,
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
        .select('purchasing_org')
        .not('purchasing_org', 'is', null);

      if (error) {
        console.error('Error fetching sources:', error);
        return [];
      }

      // Map database source names to frontend display names
      const sources = [...new Set(data?.map(item => {
        if (item.purchasing_org === 'OMNIA') return 'OMNIA Partners';
        return item.purchasing_org;
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
        .select('items')
        .not('items', 'is', null);

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      const categories = new Set<string>();

      data?.forEach(contract => {
        if (contract.items && Array.isArray(contract.items)) {
          contract.items.forEach((item: Record<string, unknown>) => {
            if (item.category) {
              categories.add(String(item.category));
            }
          });
        }
      });

      return Array.from(categories).sort();
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
        .eq('vendor_name', contract.supplierName);

      if (sameSupplier && sameSupplier.length >= limit) {
        return sameSupplier.map(mapDatabaseContract);
      }

      // If not enough from same supplier, get contracts from same source
      const { data: sameSource } = await query
        .eq('purchasing_org', contract.source);

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