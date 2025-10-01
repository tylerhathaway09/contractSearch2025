import { Contract, SearchFilters, SearchResult } from '@/types';
import { mockContracts } from '@/data/mockContracts';
import { incrementSearchCount, canPerformSearch } from '@/data/mockUsers';

export const searchContracts = (
  filters: SearchFilters,
  page: number = 1,
  limit: number = 10
): SearchResult => {
  // Check if user can perform search (for free users with limits)
  if (!canPerformSearch()) {
    return {
      contracts: [],
      total: 0,
      page,
      limit,
      hasMore: false,
    };
  }

  // Increment search count for the user
  incrementSearchCount();

  let filteredContracts = [...mockContracts];

  // Apply search query
  if (filters.query) {
    const query = filters.query.toLowerCase();
    filteredContracts = filteredContracts.filter(contract =>
      contract.contractTitle.toLowerCase().includes(query) ||
      contract.contractDescription.toLowerCase().includes(query) ||
      contract.supplierName.toLowerCase().includes(query) ||
      contract.category.toLowerCase().includes(query)
    );
  }

  // Apply source filter
  if (filters.source && filters.source.length > 0) {
    filteredContracts = filteredContracts.filter(contract =>
      filters.source!.includes(contract.source)
    );
  }

  // Apply category filter
  if (filters.category && filters.category.length > 0) {
    filteredContracts = filteredContracts.filter(contract =>
      filters.category!.includes(contract.category)
    );
  }

  // Apply date range filter
  if (filters.dateRange) {
    if (filters.dateRange.start) {
      filteredContracts = filteredContracts.filter(contract =>
        contract.startDate && contract.startDate >= filters.dateRange!.start!
      );
    }
    if (filters.dateRange.end) {
      filteredContracts = filteredContracts.filter(contract =>
        contract.endDate && contract.endDate <= filters.dateRange!.end!
      );
    }
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'relevance';
  const sortOrder = filters.sortOrder || 'desc';

  filteredContracts.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        // Handle null dates in sorting - null dates go to end
        if (!a.startDate && !b.startDate) comparison = 0;
        else if (!a.startDate) comparison = 1;
        else if (!b.startDate) comparison = -1;
        else comparison = a.startDate.getTime() - b.startDate.getTime();
        break;
      case 'supplier':
        comparison = a.supplierName.localeCompare(b.supplierName);
        break;
      case 'title':
        comparison = a.contractTitle.localeCompare(b.contractTitle);
        break;
      case 'relevance':
      default:
        // For relevance, we'll use creation date as a proxy
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Apply pagination
  const total = filteredContracts.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  return {
    contracts: paginatedContracts,
    total,
    page,
    limit,
    hasMore: endIndex < total,
  };
};

export const getContractById = (id: string): Contract | undefined => {
  return mockContracts.find(contract => contract.id === id);
};

export const getRelatedContracts = (contract: Contract, limit: number = 4): Contract[] => {
  return mockContracts
    .filter(c => 
      c.id !== contract.id && 
      (c.category === contract.category || c.supplierName === contract.supplierName)
    )
    .slice(0, limit);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateRange = (startDate: Date | null, endDate: Date | null): string => {
  if (!startDate && !endDate) return 'Not Provided';
  if (!startDate) return `Not Provided - ${formatDate(endDate!)}`;
  if (!endDate) return `${formatDate(startDate)} - Not Provided`;

  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

export const getDaysUntilExpiration = (endDate: Date | null): number | null => {
  if (!endDate) return null;

  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isContractExpiringSoon = (endDate: Date | null, daysThreshold: number = 90): boolean => {
  if (!endDate) return false;

  const daysUntil = getDaysUntilExpiration(endDate);
  return daysUntil !== null && daysUntil <= daysThreshold;
};
