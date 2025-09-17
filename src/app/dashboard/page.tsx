'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/data/mockUsers';
import { getContractById } from '@/lib/contractUtils';
import { User, Contract } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [savedContracts, setSavedContracts] = useState<Contract[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setUser(currentUser);
    
    // Load saved contracts
    const contracts = currentUser.savedContracts
      .map(id => getContractById(id))
      .filter((contract): contract is Contract => contract !== undefined);
    
    setSavedContracts(contracts);
  }, [router]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}
          </h1>
          <div className="flex items-center gap-4">
            <Badge 
              variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {user.subscriptionTier === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </Badge>
            <span className="text-sm text-gray-600">
              {user.subscriptionTier === 'free' 
                ? `${user.searchCount}/10 searches used this month`
                : 'Unlimited searches'
              }
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with your contract search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button asChild className="h-20 flex flex-col">
                    <Link href="/search">
                      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Contracts
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-20 flex flex-col">
                    <Link href="/search?category=Technology">
                      <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Browse by Category
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Saved Contracts */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Saved Contracts</CardTitle>
                    <CardDescription>
                      {savedContracts.length} contract{savedContracts.length !== 1 ? 's' : ''} saved
                    </CardDescription>
                  </div>
                  {user.subscriptionTier === 'free' && (
                    <Badge variant="outline" className="text-xs">
                      Pro Feature
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {user.subscriptionTier === 'pro' ? (
                  savedContracts.length > 0 ? (
                    <div className="space-y-4">
                      {savedContracts.slice(0, 5).map((contract) => (
                        <div key={contract.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="text-xs">
                                  {contract.source}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {contract.category}
                                </Badge>
                              </div>
                              <h3 className="font-medium text-sm mb-1">
                                <Link 
                                  href={`/contract/${contract.id}`}
                                  className="hover:text-blue-600 transition-colors"
                                >
                                  {contract.contractTitle}
                                </Link>
                              </h3>
                              <p className="text-xs text-gray-600 mb-2">
                                {contract.supplierName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Expires: {contract.endDate.toLocaleDateString()}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                      {savedContracts.length > 5 && (
                        <div className="text-center">
                          <Button variant="outline" size="sm">
                            View All Saved Contracts
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No saved contracts yet</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Start saving contracts to access them quickly from your dashboard.
                      </p>
                      <Button asChild>
                        <Link href="/search">Search Contracts</Link>
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upgrade to Pro</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Save and organize your favorite contracts with a Pro subscription.
                    </p>
                    <Button>
                      Upgrade to Pro - $20/month
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                      {user.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                    </Badge>
                    {user.subscriptionTier === 'free' && (
                      <Button size="sm" variant="outline">
                        Upgrade
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {user.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Usage This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Searches</span>
                      <span className="text-sm font-medium">
                        {user.searchCount}
                        {user.subscriptionTier === 'free' && '/10'}
                      </span>
                    </div>
                    {user.subscriptionTier === 'free' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(user.searchCount / 10) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Saved Contracts</span>
                      <span className="text-sm font-medium">
                        {user.subscriptionTier === 'pro' ? savedContracts.length : 'Pro Only'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Account created
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {user.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  {user.searchCount > 0 && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {user.searchCount} search{user.searchCount !== 1 ? 'es' : ''} performed
                      </div>
                      <div className="text-xs text-gray-500 ml-4">
                        This month
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
