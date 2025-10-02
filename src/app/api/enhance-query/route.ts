import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.length < 3) {
      return NextResponse.json({
        originalQuery: query,
        categories: [],
        keywords: [],
        suppliers: []
      });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // No API key, return empty enhancement
      return NextResponse.json({
        originalQuery: query,
        categories: [],
        keywords: [],
        suppliers: []
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

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

    const prompt = `You are a search query analyzer for a government contract database.

User is searching for: "${query}"

Available contract categories: ${AVAILABLE_CATEGORIES.join(', ')}

Task: Analyze this search query and expand it to help find relevant contracts.

Return a JSON object with:
1. "categories": Array of ONLY the most specific, directly relevant categories from the available list (0-1 max, prefer empty array unless extremely confident)
2. "keywords": Array of 4-8 highly specific synonym/related search terms (lowercase, exact products/services, NOT generic terms)
3. "suppliers": Array of 0-3 major supplier names that specifically offer this product/service (optional)

Rules:
- Categories must be HIGHLY specific - only include if the search term clearly falls into that category
- DO NOT include generic categories unless the search term is generic
- Keywords should be specific synonyms, NOT broader categories (e.g., "laptops" → "notebooks", "portable computers" NOT "technology" or "IT equipment")
- Suppliers must be well-known providers of the EXACT product/service searched
- Be conservative - better to return fewer, more relevant results
- Output ONLY valid JSON, no explanation

Example for "laptops":
{
  "categories": ["Technology"],
  "keywords": ["notebooks", "portable computers", "mobile computers", "laptop computers"],
  "suppliers": ["Dell", "Lenovo", "HP"]
}

Example for "cybersecurity":
{
  "categories": ["Technology", "Security"],
  "keywords": ["cyber defense", "network security", "information security", "threat protection"],
  "suppliers": ["Palo Alto Networks", "Cisco"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 300,
      temperature: 0.3,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const parsed = JSON.parse(responseText.trim());

    const response = {
      originalQuery: query,
      categories: Array.isArray(parsed.categories) ? parsed.categories : [],
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      suppliers: Array.isArray(parsed.suppliers) ? parsed.suppliers : []
    };

    console.log('[API] Enhanced query response:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Query enhancement error:', error);

    // Return empty enhancement on error
    const { query } = await request.json();
    return NextResponse.json({
      originalQuery: query || '',
      categories: [],
      keywords: [],
      suppliers: []
    });
  }
}
