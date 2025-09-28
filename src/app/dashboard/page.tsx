'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSavedContracts, getSearchLimitInfo } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Contract } from '@/types';

export default function DashboardPage() {
  const { user, profile, signOut } = useAuth();
  const [savedContracts, setSavedContracts] = useState<Contract[]>([]);
  const [searchLimitInfo, setSearchLimitInfo] = useState<{can_search: boolean, remaining: number, limit_count: number, is_pro: boolean} | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success messages from auth callback
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setSuccessMessage(messageParam);
      // Clear the message from URL after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load search limit info
        const { data: limitInfo, error: limitError } = await getSearchLimitInfo(user.id);
        if (!limitError) {
          setSearchLimitInfo(limitInfo);
        }

        // Load saved contracts
        const { data: savedData, error: savedError } = await getSavedContracts(user.id);
        if (!savedError && savedData) {
          // Map the saved contracts data to Contract type
          const contracts: Contract[] = savedData.map((saved: unknown) => {
            const savedData = saved as {contracts: Record<string, unknown>};
            const contract = savedData.contracts;
            return {
              id: String(contract.id),
              source: contract.purchasing_org as 'E&I' | 'Sourcewell' | 'OMNIA Partners',
              contractId: String(contract.contract_number || contract.id),
              url: String((contract.document_urls as unknown[])?.[0] || '#'),
              supplierName: String(contract.vendor_name || 'Unknown Supplier'),
              contractTitle: String(contract.contract_title || 'Untitled Contract'),
              contractDescription: String(contract.description || 'No description available'),
              category: String((contract.items as Array<{category?: string}>)?.[0]?.category || 'Other'),
              startDate: contract.contract_start_date ? new Date(String(contract.contract_start_date)) : new Date(),
              endDate: contract.contract_end_date ? new Date(String(contract.contract_end_date)) : new Date(),
              createdAt: new Date(String(contract.created_at)),
              updatedAt: new Date(String(contract.updated_at || contract.created_at)),
            };
          });
          setSavedContracts(contracts);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'No email';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {displayName}
            </h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant={profile?.subscription_status === 'pro' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {profile?.subscription_status === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </Badge>
            <span className="text-sm text-gray-600">
              {profile?.subscription_status === 'free'
                ? `0/${searchLimitInfo?.limit_count || 10} searches used this month`
                : 'Unlimited searches'
              }
            </span>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {successMessage}
            </div>
          </div>
        )}

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

            {/* Saved Contracts Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle>Saved Contracts</CardTitle>
                <CardDescription>
                  {savedContracts.length} contract{savedContracts.length !== 1 ? 's' : ''} saved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {savedContracts.length > 0 ? 'View Your Saved Contracts' : 'No saved contracts yet'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {savedContracts.length > 0 
                      ? 'Access and manage all your saved contracts in one place.'
                      : 'Start saving contracts to access them quickly from your dashboard.'
                    }
                  </p>
                  <Button asChild>
                    <Link href="/saved">
                      {savedContracts.length > 0 ? 'View Saved Contracts' : 'Search Contracts'}
                    </Link>
                  </Button>
                </div>
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
                  <p className="text-sm text-gray-900">{displayName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Plan</label>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile?.subscription_status === 'pro' ? 'default' : 'secondary'}>
                      {profile?.subscription_status === 'pro' ? 'Pro' : 'Free'}
                    </Badge>
                    {profile?.subscription_status === 'free' && (
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/pricing">
                          Upgrade
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
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
                        0
                        {searchLimitInfo?.limit_count && `/${searchLimitInfo.limit_count}`}
                      </span>
                    </div>
                    {searchLimitInfo?.limit_count && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (searchLimitInfo.remaining || 0) <= 2 ? 'bg-red-500' :
                            (searchLimitInfo.remaining || 0) <= 5 ? 'bg-yellow-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `0%` }}
                        ></div>
                      </div>
                    )}
                    {searchLimitInfo?.remaining !== undefined && (
                      <div className="text-xs text-gray-500 mt-1">
                        {searchLimitInfo.remaining} searches remaining
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Saved Contracts</span>
                      <span className="text-sm font-medium">
                        {profile?.subscription_status === 'pro' ? savedContracts.length : 'Pro Only'}
                      </span>
                    </div>
                  </div>

                  {profile?.subscription_status === 'free' && (
                    <div className="pt-4 border-t">
                      <Button size="sm" className="w-full" asChild>
                        <Link href="/pricing">
                          Upgrade to Pro for Unlimited Access
                        </Link>
                      </Button>
                    </div>
                  )}
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
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  {false && (
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        0 searches performed
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
