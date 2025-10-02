/**
 * Query Enhancement Service
 *
 * Uses Claude Haiku 3.5 to intelligently expand user search queries via API route
 * Cost: ~$0.0003 per search (~$3/month for 10K searches)
 *
 * Example:
 * - User searches "laptops"
 * - Claude expands to: categories: ["Technology", "Corporate Services"],
 *                     keywords: ["computers", "IT hardware", "desktop computers"]
 */

// In-memory cache for common queries (5 minute TTL)
const queryCache = new Map<string, { result: EnhancedQuery, timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface EnhancedQuery {
  originalQuery: string;
  categories: string[];
  keywords: string[];
  suppliers: string[];
}

// Available categories in the system
const AVAILABLE_CATEGORIES = [
  'Technology',
  'Facilities',
  'Corporate Services',
  'Furniture',
  'Healthcare',
  'Transportation',
  'Construction',
  'Food Service',
  'Education',
  'Security'
];

/**
 * Enhance a user search query using Claude AI via API route
 */
export async function enhanceSearchQuery(query: string): Promise<EnhancedQuery> {
  // Normalize query for caching
  const cacheKey = query.toLowerCase().trim();

  // Check cache first
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[QueryEnhancer] Cache hit for: "${query}"`);
    return cached.result;
  }

  // Skip enhancement for very short queries (< 3 chars)
  if (query.length < 3) {
    return {
      originalQuery: query,
      categories: [],
      keywords: [],
      suppliers: []
    };
  }

  try {
    console.log(`[QueryEnhancer] Enhancing query: "${query}"`);

    // Call API route for enhancement
    const response = await fetch('/api/enhance-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result: EnhancedQuery = await response.json();

    // Cache the result
    queryCache.set(cacheKey, { result, timestamp: Date.now() });

    // Clean old cache entries (simple cleanup)
    if (queryCache.size > 1000) {
      const entries = Array.from(queryCache.entries());
      const expired = entries.filter(([_, v]) => Date.now() - v.timestamp > CACHE_TTL_MS);
      expired.forEach(([k]) => queryCache.delete(k));
    }

    console.log(`[QueryEnhancer] Enhanced:`, result);
    return result;

  } catch (error) {
    console.error('[QueryEnhancer] Error enhancing query:', error);

    // Fallback: return original query with no enhancements
    return {
      originalQuery: query,
      categories: [],
      keywords: [],
      suppliers: []
    };
  }
}

/**
 * Clear the query cache (useful for testing)
 */
export function clearQueryCache(): void {
  queryCache.clear();
  console.log('[QueryEnhancer] Cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  const entries = Array.from(queryCache.entries());
  const validEntries = entries.filter(([_, v]) => now - v.timestamp < CACHE_TTL_MS);

  return {
    total: queryCache.size,
    valid: validEntries.length,
    expired: entries.length - validEntries.length
  };
}
