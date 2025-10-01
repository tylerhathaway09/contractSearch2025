/**
 * Utility functions for handling contract categories
 */

/**
 * Splits a comma-separated category string into an array of individual categories
 * @param category - Category string (e.g., "Corporate Services, Facilities")
 * @returns Array of individual categories
 */
export function splitCategories(category: string): string[] {
  if (!category) return [];
  return category.split(', ').map(c => c.trim()).filter(Boolean);
}

/**
 * Extracts all unique base categories from an array of category strings
 * @param categories - Array of category strings (may include comma-separated values)
 * @returns Sorted array of unique base categories
 */
export function extractBaseCategories(categories: string[]): string[] {
  const baseCategories = new Set<string>();

  categories.forEach(category => {
    splitCategories(category).forEach(cat => {
      baseCategories.add(cat);
    });
  });

  return Array.from(baseCategories).sort();
}
