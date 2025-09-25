// Description-based category extraction using keyword analysis
export interface CategoryKeywords {
  [category: string]: string[];
}

// Comprehensive keyword dictionary for contract categorization
export const CATEGORY_KEYWORDS: CategoryKeywords = {
  'Technology & IT': [
    'software', 'hardware', 'IT', 'computer', 'technology', 'tech', 'digital',
    'cloud', 'server', 'network', 'cybersecurity', 'data', 'analytics',
    'programming', 'development', 'web', 'mobile', 'app', 'system', 'database',
    'telecom', 'telecommunications', 'internet', 'wifi', 'voip', 'phone'
  ],

  'Healthcare & Medical': [
    'medical', 'health', 'healthcare', 'hospital', 'clinic', 'pharmaceutical',
    'dental', 'mental health', 'telemedicine', 'therapy', 'treatment', 'patient',
    'wellness', 'medicine', 'surgical', 'diagnostic', 'laboratory', 'nursing'
  ],

  'Facilities & Maintenance': [
    'cleaning', 'janitorial', 'maintenance', 'facility', 'building', 'security',
    'hvac', 'plumbing', 'electrical', 'repair', 'landscaping', 'groundskeeping',
    'pest control', 'fire safety', 'access control', 'surveillance'
  ],

  'Professional Services': [
    'consulting', 'legal', 'accounting', 'advisory', 'audit', 'compliance',
    'training', 'education', 'coaching', 'strategy', 'management', 'hr',
    'human resources', 'recruitment', 'staffing', 'payroll'
  ],

  'Office & Administrative': [
    'office', 'supplies', 'administrative', 'printing', 'paper', 'stationery',
    'furniture', 'workspace', 'desk', 'chair', 'storage', 'filing',
    'breakroom', 'cafeteria', 'kitchen', 'copier', 'scanner'
  ],

  'Transportation & Logistics': [
    'transportation', 'logistics', 'shipping', 'delivery', 'freight', 'cargo',
    'vehicle', 'fleet', 'truck', 'van', 'car', 'bus', 'travel', 'fuel',
    'warehouse', 'distribution', 'supply chain', 'moving', 'relocation'
  ],

  'Manufacturing & Industrial': [
    'manufacturing', 'industrial', 'production', 'factory', 'plant', 'machinery',
    'equipment', 'tools', 'materials', 'parts', 'components', 'assembly',
    'quality control', 'safety equipment', 'protective gear', 'uniforms'
  ],

  'Food & Hospitality': [
    'food', 'catering', 'restaurant', 'hospitality', 'kitchen', 'dining',
    'beverage', 'vending', 'snack', 'meal', 'nutrition', 'culinary',
    'banquet', 'event', 'conference', 'meeting'
  ],

  'Financial Services': [
    'financial', 'banking', 'insurance', 'investment', 'loan', 'credit',
    'payment', 'billing', 'accounting', 'bookkeeping', 'treasury', 'audit',
    'risk management', 'compliance', 'tax', 'payroll'
  ],

  'Marketing & Communications': [
    'marketing', 'advertising', 'promotion', 'communications', 'public relations',
    'branding', 'design', 'creative', 'media', 'social media', 'website',
    'content', 'copywriting', 'photography', 'video', 'print'
  ],

  'Construction & Real Estate': [
    'construction', 'building', 'real estate', 'property', 'renovation',
    'contractor', 'architecture', 'engineering', 'roofing', 'flooring',
    'painting', 'concrete', 'steel', 'lumber', 'permits'
  ],

  'Energy & Utilities': [
    'energy', 'utilities', 'electricity', 'gas', 'water', 'sewer', 'power',
    'renewable', 'solar', 'wind', 'battery', 'generator', 'lighting',
    'heating', 'cooling', 'sustainability', 'environmental'
  ]
};

export interface CategoryScore {
  category: string;
  score: number;
  matchedKeywords: string[];
}

/**
 * Analyze contract description and title to extract relevant categories
 */
export function analyzeContractDescription(
  title: string,
  description: string
): CategoryScore[] {
  const text = `${title} ${description}`.toLowerCase();
  const scores: CategoryScore[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // Count occurrences of keyword in text
      const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi');
      const matches = text.match(regex);

      if (matches) {
        matchedKeywords.push(keyword);
        // Weight keywords by frequency and length (longer keywords = more specific)
        score += matches.length * (keywordLower.length > 4 ? 2 : 1);
      }
    }

    if (score > 0) {
      scores.push({
        category,
        score,
        matchedKeywords
      });
    }
  }

  // Sort by score (highest first)
  return scores.sort((a, b) => b.score - a.score);
}

/**
 * Get the most relevant categories for a contract (max 2-3 categories)
 */
export function getContractCategories(
  title: string,
  description: string,
  maxCategories: number = 2
): string[] {
  const scores = analyzeContractDescription(title, description);

  // Return top categories with meaningful scores
  return scores
    .filter(score => score.score >= 2) // Minimum threshold
    .slice(0, maxCategories)
    .map(score => score.category);
}

/**
 * Cache for processed categories to avoid recomputation
 */
const categoryCache = new Map<string, string[]>();

/**
 * Get categories with caching for performance
 */
export function getCachedContractCategories(
  contractId: string,
  title: string,
  description: string,
  maxCategories: number = 2
): string[] {
  const cacheKey = `${contractId}-${maxCategories}`;

  if (categoryCache.has(cacheKey)) {
    return categoryCache.get(cacheKey)!;
  }

  const categories = getContractCategories(title, description, maxCategories);
  categoryCache.set(cacheKey, categories);

  return categories;
}