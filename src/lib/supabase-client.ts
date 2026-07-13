import { createClient } from '@supabase/supabase-js';
import { Poem, Review } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper to parse DD-MM-YYYY string into a sortable number (timestamp)
 */
const parseDateString = (dateStr: string): number => {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return 0;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  // Note: month is 0-indexed in JS Date
  return new Date(year, month - 1, day).getTime();
};

/**
 * Helper to sort poems by date descending (newest first)
 */
const sortPoems = (poems: Poem[]): Poem[] => {
  return [...poems].sort((a, b) => parseDateString(b.date) - parseDateString(a.date));
};

export const fetchPoems = async (filter?: { theme?: string; search?: string }): Promise<Poem[]> => {
  let query = supabase.from('poems').select('*');

  if (filter?.theme) {
    query = query.ilike('theme', `%${filter.theme}%`);
  }

  if (filter?.search) {
    const s = filter.search;
    query = query.or(`title.ilike.%${s}%,theme.ilike.%${s}%,roman.ilike.%${s}%,description.ilike.%${s}%,emotional_engine.ilike.%${s}%`);
  }

  const response = await query;
  
  if (response.error) {
    console.error("fetchPoems Error:", response.error.message, response.error.hint);
    throw new Error(`Supabase Error [${response.error.code}]: ${response.error.message}`);
  }
  
  const poems = (response.data || []) as Poem[];
  return sortPoems(poems);
};

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

export const fetchFavoritePoem = async (): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('favorite', true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("fetchFavoritePoem Error:", error.message);
    return null;
  }
  return data as Poem;
};

export const fetchThemes = async (): Promise<string[]> => {
  const response = await supabase
    .from('poems')
    .select('theme');

  if (response.error) {
    return [];
  }
  
  const themeMap = new Map<string, string>();
  
  response.data.forEach(item => {
    if (item.theme && typeof item.theme === 'string') {
      const individualThemes = item.theme.split(/[|,]+/).map(t => t.trim()).filter(Boolean);
      individualThemes.forEach(t => {
        const normalized = t.toLowerCase();
        if (!themeMap.has(normalized)) {
          themeMap.set(normalized, t);
        }
      });
    }
  });
  
  return Array.from(themeMap.values()).sort((a, b) => a.compareLocale(b));
};

export const fetchFeaturedPoems = async (): Promise<Poem[]> => {
  const response = await supabase
    .from('poems')
    .select('*')
    .eq('featured', true);

  if (response.error) {
    console.error("fetchFeaturedPoems Error:", response.error.message);
    throw new Error(`Supabase Error [${response.error.code}]: ${response.error.message}`);
  }
  
  const poems = (response.data || []) as Poem[];
  return sortPoems(poems);
};

export const fetchArchiveStats = async () => {
  try {
    const [poemsCount, featuredCount, reviewsCount, themesData] = await Promise.all([
      supabase.from('poems').select('*', { count: 'exact', head: true }),
      supabase.from('poems').select('*', { count: 'exact', head: true }).eq('featured', true),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('poems').select('theme')
    ]);

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