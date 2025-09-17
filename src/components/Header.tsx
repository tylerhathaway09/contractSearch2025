'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/data/mockUsers';

export default function Header() {
  const currentUser = getCurrentUser();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ContractSearch</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/search" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Search Contracts
            </Link>
            {currentUser && (
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {currentUser.name}
                  </span>
                  <Badge 
                    variant={currentUser.subscriptionTier === 'pro' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {currentUser.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
