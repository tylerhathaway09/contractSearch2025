'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Contract } from '@/types';
import { ContractService, ContractFilters } from '@/lib/contractService';
import { saveContract, removeSavedContract, isContractSaved, getSearchLimitInfo as getSearchLimitInfoFromSupabase, incrementSearchCount } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SearchPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<{
    query: string;
    source: string[];
    category: string[];
    sortBy: string;
    sortOrder: string;
  }>({
    query: '',
    source: [],
    category: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [searchResults, setSearchResults] = useState<{contracts: Contract[], total: number} | null>(null);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLimitInfo, setSearchLimitInfo] = useState<{can_search: boolean, remaining: number, limit_count: number, is_pro: boolean} | null>(null);
  const [savedContractsMap, setSavedContractsMap] = useState<Record<string, boolean>>({});
  const [bookmarkLoadingMap, setBookmarkLoadingMap] = useState<Record<string, boolean>>({});
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);

  const performSearch = useCallback(async (page: number = 1, trackSearch: boolean = true) => {
    setIsLoading(true);
    try {
      // Check search limits and track search for authenticated users (only on first page)
      if (user && page === 1 && trackSearch) {
        const { data: canSearch } = await incrementSearchCount(user.id, filters.query);
        if (!canSearch) {
          // Refresh search limit info to show updated status
          const { data: limitInfo } = await getSearchLimitInfoFromSupabase(user.id);
          setSearchLimitInfo(limitInfo);
          setSearchResults({ contracts: [], total: 0 });
          return;
        }
      }

      const contractFilters: ContractFilters = {
        search: filters.query || undefined,
        sources: filters.source.length > 0 ? filters.source : undefined,
        categories: filters.category.length > 0 ? filters.category : undefined,
        sortBy: filters.sortBy as ContractFilters['sortBy'],
        sortOrder: filters.sortOrder as 'asc' | 'desc',
        page,
        limit: 10
      };
      const results = await ContractService.getContracts(contractFilters);
      setSearchResults(results);
      setCurrentPage(page);

      // Load saved contracts status for authenticated users
      if (user) {
        const savedMap: Record<string, boolean> = {};
        for (const contract of results.contracts) {
          try {
            const { data } = await isContractSaved(user.id, contract.id);
            savedMap[contract.id] = data;
          } catch (error) {
            console.error('Error checking saved status:', error);
            savedMap[contract.id] = false;
          }
        }
        setSavedContractsMap(savedMap);
      }

      // Update search limit info after search
      if (user) {
        const { data: limitInfo } = await getSearchLimitInfoFromSupabase(user.id);
        setSearchLimitInfo(limitInfo);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults({ contracts: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters, user]);

  // Load available sources and categories on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const sources = await ContractService.getAllSources();
        setAvailableSources(sources);

        const categories = await ContractService.getAllCategories();
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    };
    loadFilterOptions();
  }, []);

  // Load search limit info when user changes
  useEffect(() => {
    const loadSearchLimitInfo = async () => {
      if (user) {
        try {
          const { data } = await getSearchLimitInfoFromSupabase(user.id);
          setSearchLimitInfo(data);
        } catch (error) {
          console.error('Failed to load search limit info:', error);
        }
      }
    };
    loadSearchLimitInfo();
  }, [user]);

  useEffect(() => {
    performSearch(1);
  }, [performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      source: checked
        ? [...(prev.source || []), source]
        : (prev.source || []).filter((s: string) => s !== source)
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      category: checked
        ? [...(prev.category || []), category]
        : (prev.category || []).filter((c: string) => c !== category)
    }));
  };


  const clearFilters = () => {
    setFilters({
      query: '',
      source: [],
      category: [],
      sortBy: 'relevance',
      sortOrder: 'desc',
    });
  };

  const handleBookmarkClick = async (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to signup if not logged in
      window.location.href = '/signup';
      return;
    }

    // Set loading state for this specific contract
    setBookmarkLoadingMap(prev => ({ ...prev, [contractId]: true }));
    setBookmarkError(null);

    try {
      // Toggle bookmark
      if (savedContractsMap[contractId]) {
        const { error } = await removeSavedContract(user.id, contractId);
        if (error) {
          setBookmarkError((error as {message?: string})?.message || 'Failed to remove bookmark');
          return;
        }
        setSavedContractsMap(prev => ({ ...prev, [contractId]: false }));
      } else {
        const { error } = await saveContract(user.id, contractId);
        if (error) {
          setBookmarkError((error as {message?: string})?.message || 'Failed to save contract');
          return;
        }
        setSavedContractsMap(prev => ({ ...prev, [contractId]: true }));
      }
    } catch (error) {
      console.error('Error toggling saved contract:', error);
      setBookmarkError('An unexpected error occurred');
    } finally {
      // Clear loading state
      setBookmarkLoadingMap(prev => ({ ...prev, [contractId]: false }));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Search Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">
            Every contract at every top supplier and government source
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="Search contract title, supplier, category..."
                  value={filters.query || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  className="text-lg py-4 pl-12 pr-12 bg-white text-black border-0 rounded-lg"
                />
                {filters.query && (
                  <button
                    type="button"
                    onClick={() => setFilters(prev => ({ ...prev, query: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Search Limit Warning */}
      {searchLimitInfo && !searchLimitInfo.can_search && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Search limit reached!</strong> You&apos;ve used all {searchLimitInfo.limit_count} free searches this month. 
                  <Link href="/signup" className="font-medium underline text-red-700 hover:text-red-600 ml-1">
                    Upgrade to Pro for unlimited searches
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Limit Info for Free Users */}
      {searchLimitInfo && !searchLimitInfo.is_pro && searchLimitInfo.can_search && searchLimitInfo.remaining > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Free Plan:</strong> {searchLimitInfo.remaining} searches remaining this month. 
                  <Link href="/signup" className="font-medium underline text-blue-700 hover:text-blue-600 ml-1">
                    Upgrade to Pro for unlimited searches
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookmark Error Banner */}
      {bookmarkError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 000 2v4a1 1 0 002 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-700">
                  <strong>Bookmark Error:</strong> {bookmarkError}
                </p>
              </div>
              <button
                onClick={() => setBookmarkError(null)}
                className="ml-4 text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Source Filter */}
              <div>
                <Label className="text-sm font-medium">Source</Label>
                <div className="mt-2 space-y-2">
                  {availableSources.map((source) => (
                    <div key={source} className="flex items-center space-x-2">
                      <Checkbox
                        id={`source-${source}`}
                        checked={filters.source?.includes(source) || false}
                        onCheckedChange={(checked) => handleSourceChange(source, checked as boolean)}
                      />
                      <Label htmlFor={`source-${source}`} className="text-sm">
                        {source}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {availableCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={filters.category?.includes(category) || false}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={`category-${category}`} className="text-sm">
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <Label className="text-sm font-medium">Sort By</Label>
                <div className="mt-2 space-y-2">
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value: 'relevance' | 'date' | 'supplier' | 'title') => setFilters(prev => ({ ...prev, sortBy: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value: 'asc' | 'desc') => setFilters(prev => ({ ...prev, sortOrder: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descending</SelectItem>
                      <SelectItem value="asc">Ascending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results */}
        <div className="lg:w-3/4">
          {searchResults && (
            <div className="mb-6">
              <p className="text-gray-600">
                Found {searchResults.total} contracts
                {filters.query && ` for "${filters.query}"`}
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading contracts...</div>
            </div>
          ) : searchResults && searchResults.contracts.length > 0 ? (
            <>
              <div className="space-y-4">
                {searchResults.contracts.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{contract.source}</Badge>
                            <Badge variant="outline">{contract.category}</Badge>
                          </div>
                          <CardTitle className="text-lg mb-2">
                            <Link
                              href={`/contract/${contract.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {contract.contractTitle}
                            </Link>
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {contract.supplierName}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {/* Bookmark Icon */}
                    <button
                      onClick={(e) => handleBookmarkClick(contract.id, e)}
                      disabled={bookmarkLoadingMap[contract.id]}
                      className={`absolute top-4 right-4 p-2 transition-colors ${
                        bookmarkLoadingMap[contract.id]
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                      title={
                        bookmarkLoadingMap[contract.id]
                          ? 'Processing...'
                          : savedContractsMap[contract.id]
                            ? "Remove from saved"
                            : "Save contract"
                      }
                    >
                      {bookmarkLoadingMap[contract.id] ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg
                          className={`w-5 h-5 ${savedContractsMap[contract.id] ? 'fill-blue-600 text-blue-600' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      )}
                    </button>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Contract ID: {contract.contractId}</span>
                        <span>Expires: {contract.endDate ? contract.endDate.toLocaleDateString() : 'Not Provided'}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {searchResults.total > 10 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(currentPage - 1, false)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(searchResults.total / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(currentPage + 1, false)}
                    disabled={!(searchResults.total > currentPage * 10)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No contracts found</h3>
                  <p className="text-sm">
                    Try adjusting your search criteria or filters to find more results.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
