'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSavedContracts, removeSavedContract } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Contract } from '@/types';
import { splitCategories } from '@/lib/categoryUtils';

export default function SavedContractsPage() {
  const { user, refreshSavedCount } = useAuth();
  const [savedContracts, setSavedContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadSavedContracts = async () => {
      try {
        setLoading(true);
        const { data, error } = await getSavedContracts(user.id);

        if (error) {
          console.error('Error loading saved contracts:', JSON.stringify(error, null, 2));
          return;
        }

        // Map the saved contracts data to Contract type
        const contracts: Contract[] = (data || [])
          .filter((saved: unknown) => {
            const savedData = saved as {contracts: Record<string, unknown> | null};
            return savedData.contracts !== null;
          })
          .map((saved: unknown) => {
            const savedData = saved as {contracts: Record<string, unknown>};
            const contract = savedData.contracts;
            return {
              id: String(contract.id),
              source: contract.source as 'E&I' | 'Sourcewell' | 'OMNIA Partners',
              contractId: String(contract.contract_number || contract.id),
              url: String(contract.contract_url || '#'),
              supplierName: String(contract.supplier_name || 'Unknown Supplier'),
              contractTitle: String(contract.title || 'Untitled Contract'),
              contractDescription: String(contract.description || 'No description available'),
              category: String(contract.category || 'Other'),
              startDate: contract.start_date ? new Date(String(contract.start_date)) : null,
              endDate: contract.end_date ? new Date(String(contract.end_date)) : null,
              createdAt: new Date(String(contract.created_at)),
              updatedAt: new Date(String(contract.updated_at || contract.created_at)),
            };
          });

        setSavedContracts(contracts);
      } catch (error) {
        console.error('Error loading saved contracts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedContracts();
  }, [user, router, refreshKey]);

  const handleRemoveContract = async (contractId: string) => {
    if (!user) return;

    try {
      const { error } = await removeSavedContract(user.id, contractId);
      if (error) {
        console.error('Error removing saved contract:', error);
        return;
      }
      setRefreshKey(prev => prev + 1);
      await refreshSavedCount();
    } catch (error) {
      console.error('Error removing saved contract:', error);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Saved Contracts
            </h1>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-gray-600">
            {savedContracts.length > 0 
              ? `You have ${savedContracts.length} saved contract${savedContracts.length === 1 ? '' : 's'}`
              : 'No saved contracts yet'
            }
          </p>
        </div>

        {/* Saved Contracts */}
        {savedContracts.length > 0 ? (
          <div className="space-y-4">
            {savedContracts.map((contract) => (
              <Card key={contract.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary">{contract.source}</Badge>
                        {splitCategories(contract.category).map(cat => (
                          <Badge key={cat} variant="outline">{cat}</Badge>
                        ))}
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRemoveContract(contract.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Contract ID: {contract.contractId}</span>
                    <span>Expires: {contract.endDate ? contract.endDate.toLocaleDateString() : 'Not Provided'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <h3 className="text-lg font-medium mb-2">No saved contracts</h3>
                <p className="text-sm mb-4">
                  Start exploring contracts and save the ones you&apos;re interested in.
                </p>
                <Button asChild>
                  <Link href="/search">Browse Contracts</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
