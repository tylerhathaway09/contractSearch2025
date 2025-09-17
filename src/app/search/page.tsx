'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilters, SearchResult } from '@/types';
import { searchContracts } from '@/lib/contractUtils';
import { categories, sources } from '@/data/mockContracts';
import Link from 'next/link';

export default function SearchPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    source: [],
    category: [],
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const results = searchContracts(filters, page, 10);
      setSearchResults(results);
      setCurrentPage(page);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    performSearch(1);
  }, [performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(1);
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      source: checked 
        ? [...(prev.source || []), source]
        : (prev.source || []).filter(s => s !== source)
    }));
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category: checked 
        ? [...(prev.category || []), category]
        : (prev.category || []).filter(c => c !== category)
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

  return (
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
              {/* Search Query */}
              <div>
                <Label htmlFor="search">Search</Label>
                <form onSubmit={handleSearch} className="flex gap-2 mt-2">
                  <Input
                    id="search"
                    placeholder="Search contracts..."
                    value={filters.query || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                  />
                  <Button type="submit" size="sm">
                    Search
                  </Button>
                </form>
              </div>

              {/* Source Filter */}
              <div>
                <Label className="text-sm font-medium">Source</Label>
                <div className="mt-2 space-y-2">
                  {sources.map((source) => (
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
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((category) => (
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Contract Search Results
            </h1>
            {searchResults && (
              <p className="text-gray-600">
                Found {searchResults.total} contracts
                {filters.query && ` for "${filters.query}"`}
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading contracts...</div>
            </div>
          ) : searchResults && searchResults.contracts.length > 0 ? (
            <>
              <div className="space-y-4">
                {searchResults.contracts.map((contract) => (
                  <Card key={contract.id} className="hover:shadow-md transition-shadow">
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
                          <CardDescription className="text-sm text-gray-600 mb-2">
                            {contract.supplierName}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                        {contract.contractDescription}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Contract ID: {contract.contractId}</span>
                        <span>Expires: {contract.endDate.toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {searchResults.total > searchResults.limit && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(searchResults.total / searchResults.limit)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => performSearch(currentPage + 1)}
                    disabled={!searchResults.hasMore}
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
  );
}
