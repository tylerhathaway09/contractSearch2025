import { createClient } from '@supabase/supabase-js';
import { SearchFilters, User } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Create client without strict typing until database is properly set up
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// TEMPORARY: Testing override - set to true to test Pro features
const TESTING_PRO_MODE = false;

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const signUp = async (email: string, password: string, name: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Google OAuth Sign In - Disabled for MVP Launch
// TODO: Re-enable for future implementation based on user feedback
/*
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};
*/

// User management
export const createUserProfile = async (userId: string, email: string, name: string) => {
  console.log('Starting user profile creation for:', email, 'with userId:', userId);

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error('Invalid UUID format:', userId);
    return { data: null, error: { message: 'Invalid user ID format' } };
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingUser) {
      console.log('User profile already exists, skipping creation');
      return { data: existingUser, error: null };
    }

    // First, try to create the basic user profile without Stripe
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: email.toLowerCase().trim(),
        full_name: name.trim(),
        subscription_status: 'free' as const,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create basic user profile:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return { data, error };
    }

    console.log('Basic user profile created successfully:', data);

    // Then try to create Stripe customer in the background (non-blocking)
    try {
      const { createStripeCustomer } = await import('@/lib/stripe');

      console.log('Attempting to create Stripe customer for:', email);
      const stripeCustomer = await createStripeCustomer({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        metadata: {
          supabase_user_id: userId,
          plan: 'free'
        }
      });

      console.log('Stripe customer created:', stripeCustomer.id);
      // For free tier, we don't create a Stripe subscription - just the customer

      // Update the user profile with Stripe information
      const { error: updateError } = await supabase
        .from('users')
        .update({
          stripe_customer_id: stripeCustomer.id,
          // No subscription for free tier
          stripe_subscription_id: null,
          current_period_end: null
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user with Stripe info:', updateError);
        // Don't fail the whole process - user profile exists
      } else {
        console.log('Successfully updated user profile with Stripe integration');
      }
    } catch (stripeError) {
      console.error('Non-blocking Stripe integration error:', stripeError);
      // Don't fail the user creation - Stripe can be linked later
    }

    return { data, error: null };
  } catch (mainError) {
    console.error('Critical error in createUserProfile:', mainError);
    return { data: null, error: mainError };
  }
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);
  return { data, error };
};

// Contract operations
export const searchContracts = async (filters: SearchFilters, page = 1, limit = 20) => {
  let query = supabase
    .from('contracts')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters.query) {
    query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,supplier_name.ilike.%${filters.query}%`);
  }

  if (filters.source && filters.source.length > 0) {
    query = query.in('source', filters.source);
  }

  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  if (filters.supplier && filters.supplier.length > 0) {
    query = query.in('supplier_normalized', filters.supplier);
  }

  if (filters.eligible_industries && filters.eligible_industries.length > 0) {
    query = query.in('eligible_industries', filters.eligible_industries);
  }

  if (filters.contract_type && filters.contract_type.length > 0) {
    query = query.in('contract_type', filters.contract_type);
  }

  if (filters.geographic_coverage && filters.geographic_coverage.length > 0) {
    query = query.in('geographic_coverage', filters.geographic_coverage);
  }

  if (filters.diversity_status && filters.diversity_status.length > 0) {
    query = query.in('diversity_status', filters.diversity_status);
  }

  if (filters.dateRange?.start) {
    query = query.gte('start_date', filters.dateRange.start);
  }

  if (filters.dateRange?.end) {
    query = query.lte('end_date', filters.dateRange.end);
  }

  // Apply sorting
  if (filters.sortBy) {
    const order = filters.sortOrder || 'desc';
    query = query.order(filters.sortBy, { ascending: order === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  
  return {
    contracts: data || [],
    total: count || 0,
    page,
    limit,
    hasMore: (count || 0) > page * limit,
    error,
  };
};

export const getContractById = async (id: string) => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getContractsByCategory = async (category: string, limit = 10) => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .limit(limit);
  return { data, error };
};

export const getContractsBySupplier = async (supplier: string, limit = 10) => {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('supplier_normalized', supplier)
    .eq('status', 'active')
    .limit(limit);
  return { data, error };
};

// Saved contracts - Available for all authenticated users
export const saveContract = async (userId: string, contractId: string) => {
  try {
    // Save to database using proper saved_contracts table
    const { data, error } = await supabase
      .from('saved_contracts')
      .insert({
        user_id: userId,
        contract_id: contractId
      })
      .select()
      .single();

    if (error) {
      // If error is due to unique constraint (already saved), that's okay
      if (error.code === '23505') {
        return { data: { id: contractId }, error: null };
      }
      console.error('Error saving contract to database:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error saving contract:', error);
    return { data: null, error };
  }
};

export const removeSavedContract = async (userId: string, contractId: string) => {
  try {
    // Remove from database
    const { error } = await supabase
      .from('saved_contracts')
      .delete()
      .eq('user_id', userId)
      .eq('contract_id', contractId);

    if (error) {
      console.error('Error removing saved contract from database:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Error removing saved contract:', error);
    return { error };
  }
};

export const getSavedContracts = async (userId: string) => {
  try {
    // First, try the JOIN approach (requires foreign keys)
    const { data: joinData, error: joinError } = await supabase
      .from('saved_contracts')
      .select(`
        id,
        saved_at,
        contracts:contract_id (
          id,
          source,
          supplier_name,
          supplier_normalized,
          contract_number,
          title,
          description,
          category,
          eligible_industries,
          contract_type,
          start_date,
          end_date,
          geographic_coverage,
          diversity_status,
          contract_url,
          supplier_url,
          product_tags,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    // If JOIN works, return the data
    if (!joinError && joinData) {
      return { data: joinData, error: null };
    }

    // Fallback: If JOIN fails (e.g., missing foreign keys), use two-query approach
    console.log('JOIN query failed, using fallback two-query approach:', joinError?.message);

    // Step 1: Get saved contract IDs and metadata
    const { data: savedIds, error: idsError } = await supabase
      .from('saved_contracts')
      .select('id, contract_id, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (idsError) {
      console.error('Error fetching saved contract IDs:', idsError);
      return { data: [], error: idsError };
    }

    if (!savedIds || savedIds.length === 0) {
      return { data: [], error: null };
    }

    // Step 2: Get full contract details
    const contractIds = savedIds.map(s => s.contract_id);
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .in('id', contractIds);

    if (contractsError) {
      console.error('Error fetching contract details:', contractsError);
      return { data: [], error: contractsError };
    }

    // Step 3: Join data in JavaScript
    const result = savedIds.map(saved => ({
      id: saved.id,
      saved_at: saved.saved_at,
      contracts: contracts?.find(c => c.id === saved.contract_id) || null
    }));

    return { data: result, error: null };
  } catch (error) {
    console.error('Error getting saved contracts:', error);
    return { data: [], error };
  }
};

export const isContractSaved = async (userId: string, contractId: string) => {
  try {
    // Check if contract is saved in database
    const { data: savedContract, error } = await supabase
      .from('saved_contracts')
      .select('id')
      .eq('user_id', userId)
      .eq('contract_id', contractId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking if contract is saved:', error);
      return { data: false, error };
    }

    return { data: !!savedContract, error: null };
  } catch (error) {
    console.error('Error checking if contract is saved:', error);
    return { data: false, error };
  }
};

// Search history
export const addSearchHistory = async (userId: string, query?: string, filters?: SearchFilters, resultsCount?: number) => {
  const { data, error } = await supabase
    .from('search_history')
    .insert({
      user_id: userId,
      query,
      filters,
      results_count: resultsCount || 0,
    });
  return { data, error };
};

export const getSearchHistory = async (userId: string, limit = 20) => {
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// Search limits - using search_usage table for tracking
export const getSearchLimitInfo = async (userId: string) => {
  try {
    // TESTING: If testing mode is enabled, always return Pro limits
    if (TESTING_PRO_MODE) {
      return {
        data: {
          can_search: true,
          remaining: 999999,
          limit_count: 999999,
          is_pro: true
        },
        error: null
      };
    }

    // Get user's subscription status
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('subscription_status')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return { data: null, error: userError };
    }

    // If pro user, return unlimited
    if (user?.subscription_status === 'pro') {
      return {
        data: {
          can_search: true,
          remaining: 999999,
          limit_count: 999999,
          is_pro: true
        },
        error: null
      };
    }

    // For free users, count searches this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: searchUsage, error: usageError } = await supabase
      .from('search_usage')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString());

    if (usageError) {
      console.error('Error fetching search usage:', usageError);
      return { data: null, error: usageError };
    }

    const limit = 10;
    const used = searchUsage?.length || 0;
    const remaining = Math.max(0, limit - used);

    return {
      data: {
        can_search: remaining > 0,
        remaining,
        limit_count: limit,
        is_pro: false
      },
      error: null
    };
  } catch (error) {
    console.error('Error in getSearchLimitInfo:', error);
    return { data: null, error };
  }
};

export const incrementSearchCount = async (userId: string, query?: string) => {
  try {
    // Check if user can search first
    const { data: limitInfo } = await getSearchLimitInfo(userId);
    if (!limitInfo?.can_search) {
      return { data: false, error: { message: 'Search limit reached' } };
    }

    // Record the search in search_usage table
    const { error } = await supabase
      .from('search_usage')
      .insert({
        user_id: userId,
        search_type: 'contract_search',
        search_query: query || '',
        results_count: 0 // Will be updated after search results are known
      });

    if (error) {
      console.error('Error recording search usage:', error);
      return { data: false, error };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('Error in incrementSearchCount:', error);
    return { data: false, error };
  }
};

// Utility functions
export const getUniqueCategories = async () => {
  const { data, error } = await supabase
    .from('contracts')
    .select('category')
    .not('category', 'is', null)
    .eq('status', 'active');
  
  if (error) return { data: [], error };
  
  const categories = [...new Set(data.map(item => item.category).filter(Boolean))];
  return { data: categories, error: null };
};

export const getUniqueSuppliers = async () => {
  const { data, error } = await supabase
    .from('contracts')
    .select('supplier_name, supplier_normalized')
    .eq('status', 'active')
    .order('supplier_name');
  
  if (error) return { data: [], error };
  
  // Group by normalized name and return the first occurrence
  const uniqueSuppliers = data.reduce((acc, item) => {
    if (!acc.find(s => s.supplier_normalized === item.supplier_normalized)) {
      acc.push(item);
    }
    return acc;
  }, [] as Array<{ supplier_name: string; supplier_normalized: string }>);
  
  return { data: uniqueSuppliers, error: null };
};

export const getExpiringContracts = async () => {
  const { data, error } = await supabase
    .from('contracts_with_expiration')
    .select('*')
    .eq('expiration_status', 'expiring_soon')
    .eq('status', 'active');
  return { data, error };
};
