import { createClient } from '@supabase/supabase-js';
import { Poem, Review } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchPoems = async (filter?: { theme?: string; search?: string }): Promise<Poem[]> => {
  let query = supabase.from('poems').select('*');

  if (filter?.theme) {
    // Use ilike to match the theme within potentially combined theme strings (e.g., "Melancholy, Solitude")
    query = query.ilike('theme', `%${filter.theme}%`);
  }

  if (filter?.search) {
    const s = filter.search;
    query = query.or(`title.ilike.%${s}%,theme.ilike.%${s}%,roman.ilike.%${s}%,description.ilike.%${s}%,emotional_engine.ilike.%${s}%`);
  }

  const response = await query.order('date', { ascending: false });
  
  if (response.error) {
    console.error("fetchPoems Error:", response.error.message, response.error.hint);
    throw new Error(`Supabase Error [${response.error.code}]: ${response.error.message}`);
  }
  
  return (response.data || []) as Poem[];
};

/**
 * Fetches a single poem by ID.
 */
export const fetchPoemById = async (id: string): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error(`fetchPoemById Error:`, error.message);
    return null;
  }
  
  return data as Poem;
};

/**
 * Fetches all unique individual themes by splitting combined theme strings.
 * Supports both comma and pipe as separators.
 * Normalizes themes for consistent display and uniqueness.
 */
export const fetchThemes = async (): Promise<string[]> => {
  const response = await supabase
    .from('poems')
    .select('theme');

  if (response.error) {
    return [];
  }
  
  // Use a map to handle case-insensitive uniqueness while preserving a preferred display casing
  const themeMap = new Map<string, string>();
  
  response.data.forEach(item => {
    if (item.theme && typeof item.theme === 'string') {
      // Split by comma or pipe, trim whitespace, and filter out empty strings
      const individualThemes = item.theme.split(/[|,]+/).map(t => t.trim()).filter(Boolean);
      
      individualThemes.forEach(t => {
        const normalized = t.toLowerCase();
        if (!themeMap.has(normalized)) {
          themeMap.set(normalized, t); // Store the first version encountered as the display version
        }
      });
    }
  });
  
  return Array.from(themeMap.values()).sort((a, b) => a.localeCompare(b));
};

export const fetchFeaturedPoems = async (): Promise<Poem[]> => {
  const response = await supabase
    .from('poems')
    .select('*')
    .eq('featured', true)
    .order('date', { ascending: false });

  if (response.error) {
    console.error("fetchFeaturedPoems Error:", response.error.message);
    throw new Error(`Supabase Error [${response.error.code}]: ${response.error.message}`);
  }
  
  return (response.data || []) as Poem[];
};

export const fetchArchiveStats = async () => {
  try {
    const [poemsCount, featuredCount, reviewsCount, themesData] = await Promise.all([
      supabase.from('poems').select('*', { count: 'exact', head: true }),
      supabase.from('poems').select('*', { count: 'exact', head: true }).eq('featured', true),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('poems').select('theme')
    ]);

    // Calculate unique themes by splitting and counting individual entries
    // Normalize to lowercase to ensure consistent comparison (e.g. "Love" and "love" are the same)
    const uniqueThemes = new Set<string>();
    themesData.data?.forEach(p => {
      if (p.theme && typeof p.theme === 'string') {
        const parts = p.theme.split(/[|,]+/);
        parts.forEach(part => {
          const trimmed = part.trim().toLowerCase();
          if (trimmed) {
            uniqueThemes.add(trimmed);
          }
        });
      }
    });

    return {
      totalPoems: poemsCount.count || 0,
      featuredPoems: featuredCount.count || 0,
      totalReviews: reviewsCount.count || 0,
      totalThemes: uniqueThemes.size
    };
  } catch (err) {
    console.error("Error fetching archive stats:", err);
    return {
      totalPoems: 0,
      featuredPoems: 0,
      totalReviews: 0,
      totalThemes: 0
    };
  }
};

/**
 * Reviews fetching and submission
 */
export const fetchReviews = async (poemId: string): Promise<Review[]> => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('poem_id', poemId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("fetchReviews Error:", error.message, error.hint || '');
      return [];
    }
    return (data || []) as Review[];
  } catch (err) {
    console.error("Unexpected error fetching reviews:", err);
    return [];
  }
};

export const addReview = async (review: Omit<Review, 'id' | 'created_at'>) => {
  const { error } = await supabase
    .from('reviews')
    .insert([review]);

  if (error) {
    console.error("addReview Error:", error.message, error.hint || '');
    throw new Error(error.message);
  }
};
