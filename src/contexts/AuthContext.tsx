'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, getUserProfile, getSavedContracts } from '@/lib/supabase';
import { User as UserProfile } from '@/types/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  savedCount: number;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSavedCount: () => Promise<void>;
}

// TEMPORARY: Testing override - set to true to test Pro features
const TESTING_PRO_MODE = false;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedContracts, setSavedContracts] = useState<any[]>([]); // Store full contract data like dashboard

  // Derive count from savedContracts array using useMemo to ensure proper re-rendering
  const savedCount = useMemo(() => {
    const count = savedContracts.length;
    console.log('[AuthContext] Computing savedCount from savedContracts.length:', count);
    console.log('[AuthContext] savedContracts array:', savedContracts);
    return count;
  }, [savedContracts]);

  // Helper function to load saved contracts (full data, not just count)
  const loadSavedContracts = async (userId: string) => {
    try {
      console.log('[AuthContext] Loading saved contracts for user:', userId);

      // Use the same getSavedContracts function that works on dashboard
      const { data, error } = await getSavedContracts(userId);

      if (error) {
        console.error('[AuthContext] Error fetching saved contracts:', error);
        return;
      }

      // Filter out null contracts (same logic as dashboard)
      const validContracts = (data || []).filter((saved: any) => saved.contracts !== null);

      console.log('[AuthContext] Loaded', validContracts.length, 'saved contracts for user:', userId);
      console.log('[AuthContext] Previous savedContracts.length:', savedContracts.length);
      console.log('[AuthContext] New validContracts.length:', validContracts.length);

      // Force new array reference to ensure React detects the change
      setSavedContracts([...validContracts]);

      console.log('[AuthContext] State updated with new contracts');
    } catch (error) {
      console.error('[AuthContext] Error loading saved contracts:', error);
    }
  };

  useEffect(() => {
    console.log('[AuthContext] useEffect running - initializing session');

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[AuthContext] Got session:', session ? `user ${session.user.id}` : 'no session');
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('[AuthContext] Loading profile and saved contracts for user:', session.user.id);
          await loadUserProfile(session.user.id);
          await loadSavedContracts(session.user.id);
        } else {
          console.log('[AuthContext] No user session, skipping data load');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session ? 'session exists' : 'no session');

        if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setProfile(null);
          setSavedContracts([]);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          try {
            await loadUserProfile(session.user.id);
            await loadSavedContracts(session.user.id);
          } catch (error) {
            console.error('Failed to load user profile:', error);
            // Don't break the auth flow for profile errors
          }
        } else {
          setProfile(null);
          setSavedContracts([]);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await getUserProfile(userId);
      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }
      // Apply testing override if enabled
      const profileData = TESTING_PRO_MODE && data ? {
        ...data,
        subscription_status: 'pro' as const
      } : data;
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      setUser(null);
      setProfile(null);
      setSavedContracts([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const refreshSavedCount = async () => {
    console.log('[AuthContext] refreshSavedCount called, user:', user?.id);
    console.log('[AuthContext] Current savedCount before refresh:', savedCount);

    if (!user) {
      console.log('[AuthContext] No user, clearing saved contracts');
      setSavedContracts([]);
      return;
    }

    await loadSavedContracts(user.id);
    console.log('[AuthContext] refreshSavedCount completed');
  };

  const value = {
    user,
    profile,
    loading,
    savedCount,
    signOut,
    refreshProfile,
    refreshSavedCount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
