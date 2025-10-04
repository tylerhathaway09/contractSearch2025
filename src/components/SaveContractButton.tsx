'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { saveContract, removeSavedContract, isContractSaved } from '@/lib/supabase';
import Link from 'next/link';

interface SaveContractButtonProps {
  contractId: string;
}

export function SaveContractButton({ contractId }: SaveContractButtonProps) {
  const { user, profile } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if contract is saved on mount
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user) {
        const { data } = await isContractSaved(user.id, contractId);
        setIsSaved(!!data);
      }
    };
    checkSavedStatus();
  }, [user, contractId]);

  const handleToggleSave = async () => {
    if (!user) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isSaved) {
        const { error } = await removeSavedContract(user.id, contractId);
        if (error) {
          setError((error as { message?: string })?.message || 'Failed to remove bookmark');
          return;
        }
        setIsSaved(false);
      } else {
        const { error } = await saveContract(user.id, contractId);
        if (error) {
          setError((error as { message?: string })?.message || 'Failed to save contract');
          return;
        }
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling saved contract:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <>
      <Button
        className="w-full"
        variant="outline"
        onClick={handleToggleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : isSaved ? (
          <>
            <svg className="w-4 h-4 mr-2 fill-current" viewBox="0 0 24 24">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save Contract
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </>
  );
}
