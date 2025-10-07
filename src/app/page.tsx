'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ContractService } from '@/lib/contractService';
import { useState, useEffect } from 'react';

export default function Home() {
  const [availableSources, setAvailableSources] = useState<string[]>([]);

  // Load sources on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const sources = await ContractService.getAllSources();
        setAvailableSources(sources);
      } catch (error) {
        console.error('Failed to load homepage data:', error);
      }
    };
    loadData();
  }, []);

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
              Why Choose Understory?
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

      {/* Sources Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-wrap justify-center items-center gap-8">
            {availableSources.map((source) => (
              <div key={source} className="flex items-center justify-center px-8 py-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <span className="font-semibold text-gray-900 text-lg">{source}</span>
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