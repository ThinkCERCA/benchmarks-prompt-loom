// src/routes/api/search/+server.js
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, fetch }) {
  const query = url.searchParams.get('q');
  console.log('Search query:', query);
  
  if (!query) {
    throw error(400, 'Search query is required');
  }
  
  // These would typically be stored in environment variables
  // Access them using process.env.VARIABLE_NAME in production
  const API_KEY = env.GOOGLE_API_KEY;
  const SEARCH_ENGINE_ID = env.SEARCH_ENGINE_ID;

  if (!API_KEY || !SEARCH_ENGINE_ID) {
    throw error(500, 'API key or Search Engine ID not configured');
  }
  
  try {
    // Add "educational resources" to focus on educational content
    const enhancedQuery = `${query} educational resources`;
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(enhancedQuery)}&num=10`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw error(response.status, errorData.error?.message || 'Google Search API error');
    }
    
    const data = await response.json();
    
    // Process the search results to match the format expected by the frontend
    const processedData = {
      items: (data.items || []).map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || '',
        formattedUrl: item.formattedUrl,
        // Add additional fields that might be useful for text analysis
        estimatedWordCount: null,
        estimatedLexileLevel: null,
        gradeLevel: null,
        lengthSuitability: null,
        isComplexityAppropriate: null
      }))
    };
    console.log(json(processedData));
    return json(processedData);
  } catch (err) {
    console.error('Search error:', err);
    throw error(500, 'Failed to fetch search results');
  }
}