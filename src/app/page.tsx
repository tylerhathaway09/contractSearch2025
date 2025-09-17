'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockContracts, sources } from '@/data/mockContracts';
import { getCurrentUser, saveContract, removeSavedContract, isContractSaved } from '@/data/mockUsers';
import { useState } from 'react';

export default function Home() {
  // Get some featured contracts for the homepage
  const featuredContracts = mockContracts.slice(0, 3);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookmarkClick = (contractId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      // Redirect to signup if not logged in
      window.location.href = '/signup';
      return;
    }
    
    // Toggle bookmark
    if (isContractSaved(contractId)) {
      removeSavedContract(contractId);
    } else {
      saveContract(contractId);
    }
    
    // Force re-render to update bookmark state
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find Government Contracts
            <span className="block text-blue-200">Faster & Easier</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Search and compare contracts from E&I, Sourcewell, OMNIA Partners, and more. 
            Save time and find the best deals for your organization.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg" asChild>
              <Link href="/signup">
                Get Started Free
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </Button>
            <Link 
              href="/search" 
              className="text-blue-200 hover:text-white transition-colors underline text-lg flex items-center gap-2"
            >
              Search Contracts
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ContractSearch?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We aggregate contracts from multiple sources to give you the most comprehensive view of available opportunities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <CardTitle>Powerful Search</CardTitle>
                <CardDescription>
                  Find contracts by supplier, category, date range, and more with our advanced filtering system.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <CardTitle>Trusted Sources</CardTitle>
                <CardDescription>
                  Access contracts from E&I, Sourcewell, OMNIA Partners, and other verified government contracting sources.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <CardTitle>Save & Organize</CardTitle>
                <CardDescription>
                  Save your favorite contracts and organize them for easy access and comparison.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Contracts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Contracts
            </h2>
            <p className="text-lg text-gray-600">
              Discover some of the latest contracts available through our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredContracts.map((contract) => (
              <Card key={`${contract.id}-${refreshKey}`} className="hover:shadow-lg transition-shadow relative">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{contract.source}</Badge>
                    <Badge variant="outline">{contract.category}</Badge>
                  </div>
                  <CardTitle className="text-lg">{contract.contractTitle}</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {contract.supplierName}
                  </CardDescription>
                </CardHeader>
                {/* Bookmark Icon */}
                <button
                  onClick={(e) => handleBookmarkClick(contract.id, e)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title={isContractSaved(contract.id) ? "Remove from saved" : "Save contract"}
                >
                  <svg 
                    className={`w-5 h-5 ${isContractSaved(contract.id) ? 'fill-blue-600 text-blue-600' : ''}`} 
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
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                    {contract.contractDescription}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Expires: {contract.endDate.toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/contract/${contract.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" asChild>
              <Link href="/search">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                View All Contracts
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Sources Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Trusted Contract Sources
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {sources.map((source) => (
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
            Join thousands of organizations saving time and money with ContractSearch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link href="/signup">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Start Free Trial
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/search">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Contracts
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
