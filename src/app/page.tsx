'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Pre-Negotiated Contracts
            <span className="block text-blue-200">For Higher Education</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Search 1,357 cooperative purchasing contracts from E&I, Sourcewell, and OMNIA Partners—designed for colleges and universities.
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
              Built for Campus Procurement Teams
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Search contracts across cooperative purchasing organizations that specialize in higher education—all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Find What Your Campus Needs</h3>
              <p className="text-gray-600">
                Search 283 IT contracts, 227 facilities agreements, and more—filtered by category, supplier, and expiration date.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted Cooperative Contracts</h3>
              <p className="text-gray-600">
                Every contract is pre-negotiated through E&I, Sourcewell, or OMNIA Partners—organizations that specialize in higher education procurement.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Save Time on Procurement</h3>
              <p className="text-gray-600">
                Skip the RFP process. Find competitively-bid contracts your institution can use immediately—saving your team weeks of work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sources Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              1,357 Contracts from Leading Education Cooperatives
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We aggregate contracts from the most trusted cooperative purchasing organizations serving higher education.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">600</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Sourcewell</div>
              <p className="text-gray-600 text-sm">Cooperative purchasing solutions for education, government, and nonprofits</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">247</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">E&I</div>
              <p className="text-gray-600 text-sm">The only member-owned, non-profit cooperative exclusively serving education</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-8 text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">153</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">OMNIA Partners</div>
              <p className="text-gray-600 text-sm">National cooperative purchasing organization with education-focused contracts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Streamline Campus Procurement?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join procurement teams across higher education finding pre-negotiated contracts faster.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}