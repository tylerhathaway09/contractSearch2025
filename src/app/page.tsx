'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContractService } from '@/lib/contractService';
import { Contract } from '@/types';
import { saveContract, removeSavedContract, isContractSaved } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const [featuredContracts, setFeaturedContracts] = useState<Contract[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [savedContractsMap, setSavedContractsMap] = useState<Record<string, boolean>>({});
  const [refreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load featured contracts and sources on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [contractsResult, sources] = await Promise.all([
          ContractService.getContracts({ limit: 3 }),
          ContractService.getAllSources()
        ]);
        setFeaturedContracts(contractsResult.contracts);
        setAvailableSources(sources);

        // Load saved contracts status for authenticated users
        if (user) {
          const savedMap: Record<string, boolean> = {};
          for (const contract of contractsResult.contracts) {
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
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [refreshKey, user]);

  const handleBookmarkClick = async (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Redirect to signup if not logged in
      window.location.href = '/signup';
      return;
    }

    try {
      // Toggle bookmark
      if (savedContractsMap[contractId]) {
        await removeSavedContract(user.id, contractId);
        setSavedContractsMap(prev => ({ ...prev, [contractId]: false }));
      } else {
        await saveContract(user.id, contractId);
        setSavedContractsMap(prev => ({ ...prev, [contractId]: true }));
      }
    } catch (error) {
      console.error('Error toggling saved contract:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Contracts
            <span className="block text-blue-200">Faster & Easier</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Search and compare contracts from E&I, Sourcewell, OMNIA Partners, and more. Save time and find the best deals for your organization.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 text-lg font-semibold rounded-lg" asChild>
              <Link href="/signup">GET STARTED FREE</Link>
            </Button>
            <Link href="/search" className="text-white hover:text-blue-200 transition-colors flex items-center gap-1">
              Search contracts
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ContractSearch?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We aggregate contracts from multiple sources to give you the most comprehensive view of available opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Comprehensive Search</h3>
              <p className="text-gray-600">
                Search across multiple contract sources with advanced filters to find exactly what you need.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Sources</h3>
              <p className="text-gray-600">
                Access contracts from E&I, Sourcewell, OMNIA Partners, and other verified government contracting sources.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">
                Stay up-to-date with the latest contract opportunities as they become available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Contracts Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Contracts
            </h2>
            <p className="text-xl text-gray-600">
              Discover some of our most popular contract opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-3 text-center py-8">
                <div className="text-gray-500">Loading contracts...</div>
              </div>
            ) : (
              featuredContracts.map((contract) => (
                <Card key={contract.id} className="hover:shadow-lg transition-shadow relative">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{contract.source}</Badge>
                        <Badge variant="outline">{contract.category}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={`/contract/${contract.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {contract.contractTitle}
                      </Link>
                    </CardTitle>
                    <CardDescription>
                      {contract.supplierName}
                    </CardDescription>
                  </CardHeader>

                  {/* Bookmark Icon */}
                  <button
                    onClick={(e) => handleBookmarkClick(contract.id, e)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title={savedContractsMap[contract.id] ? "Remove from saved" : "Save contract"}
                  >
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
                  </button>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Expires: {contract.endDate ? contract.endDate.toLocaleDateString() : 'Not Provided'}
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/contract/${contract.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/search">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse All Contracts
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sources Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted Contract Sources
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {availableSources.map((source) => (
              <div key={source} className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold text-gray-700">{source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Next Contract?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses finding government contracts through our platform.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}