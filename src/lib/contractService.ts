import { supabase } from './supabase';
import { Contract } from '@/types';

// Map database contract to frontend Contract type
function mapDatabaseContract(dbContract: Record<string, unknown>): Contract {
  return {
    id: String(dbContract.id),
    source: mapSource(String(dbContract.source || '')),
    contractId: String(dbContract.contract_number || dbContract.id),
    url: String(dbContract.contract_url || dbContract.supplier_url || ''),
    supplierName: String(dbContract.supplier_name || 'Unknown'),
    contractTitle: String(dbContract.title || 'Untitled'),
    contractDescription: String(dbContract.description || ''),
    category: String(dbContract.category || 'Other'),
    startDate: dbContract.start_date ? new Date(String(dbContract.start_date)) : new Date(),
    endDate: dbContract.end_date ? new Date(String(dbContract.end_date)) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    createdAt: new Date(String(dbContract.created_at)),
    updatedAt: new Date(String(dbContract.updated_at))
  };
}

// Map database source to frontend source
function mapSource(source: string): 'E&I' | 'Sourcewell' | 'OMNIA Partners' | 'Other' {
  const sourceMap: Record<string, 'E&I' | 'Sourcewell' | 'OMNIA Partners'> = {
    'E&I': 'E&I',
    'Sourcewell': 'Sourcewell',
    'OMNIA': 'OMNIA Partners',
    'OMNIA Partners': 'OMNIA Partners'
  };
  return sourceMap[source] || 'Other';
}

export interface ContractFilters {
  search?: string;
  sources?: string[];
  categories?: string[];
  suppliers?: string[];
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
        query = query.or(`title.ilike.%${filters.search}%,supplier_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply source filter
      if (filters.sources && filters.sources.length > 0) {
        // Map frontend source names to database source names
        const dbSources = filters.sources.map(source => {
          if (source === 'OMNIA Partners') return 'OMNIA';
          return source;
        });
        query = query.in('source', dbSources);
      }

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }

      // Apply supplier filter
      if (filters.suppliers && filters.suppliers.length > 0) {
        query = query.in('supplier_normalized', filters.suppliers);
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
        .select('source')
        .not('source', 'is', null);

      if (error) {
        console.error('Error fetching sources:', error);
        return [];
      }

      const sources = [...new Set(data?.map(item => mapSource(item.source)) || [])];
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

      const categories = [...new Set(data?.map(item => item.category).filter(Boolean) || [])];
      return categories.sort();
    } catch (error) {
      console.error('Contract service error:', error);
      return [];
    }
  }

  static async getAllSuppliers(): Promise<Array<{supplier_name: string, supplier_normalized: string}>> {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .select('supplier_name, supplier_normalized')
        .not('supplier_name', 'is', null)
        .order('supplier_name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        return [];
      }

      // Remove duplicates based on supplier_normalized
      const uniqueSuppliers = data?.reduce((acc, item) => {
        if (!acc.find(s => s.supplier_normalized === item.supplier_normalized)) {
          acc.push(item);
        }
        return acc;
      }, [] as Array<{supplier_name: string, supplier_normalized: string}>) || [];

      return uniqueSuppliers;
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