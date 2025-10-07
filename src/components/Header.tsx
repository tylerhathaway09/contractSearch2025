'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, profile, savedCount } = useAuth();

  // Debug: log savedCount
  console.log('[Header] Rendering with savedCount:', savedCount);

  // Track when savedCount changes
  useEffect(() => {
    console.log('[Header] savedCount changed to:', savedCount);
  }, [savedCount]);

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/understory-logoDark.svg"
              alt="Understory"
              width={180}
              height={40}
              priority
              className="h-10 w-auto"
            />
          </Link>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="Search Contracts"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <Link
              href="/pricing"
              className="hidden sm:block text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 text-sm font-medium"
            >
              Pricing
            </Link>
            
            {user ? (
              <>
                {/* Saved Contracts Icon */}
                <Link
                  href="/saved"
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  title="Saved Contracts"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </Link>
                
                {/* Account Button */}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {profile?.full_name || user?.user_metadata?.name || 'Account'}
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Get Started Free</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
