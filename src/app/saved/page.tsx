'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, removeSavedContract, isContractSaved } from '@/data/mockUsers';
import { getContractById } from '@/lib/contractUtils';
import { User, Contract } from '@/types';

export default function SavedContractsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [savedContracts, setSavedContracts] = useState<Contract[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
  }, [router, refreshKey]);

  const handleRemoveContract = (contractId: string) => {
    removeSavedContract(contractId);
    setRefreshKey(prev => prev + 1);
  };

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
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <h3 className="text-lg font-medium mb-2">No saved contracts</h3>
                <p className="text-sm mb-4">
                  Start exploring contracts and save the ones you're interested in.
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
