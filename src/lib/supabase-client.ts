import { createClient } from '@supabase/supabase-js';
import { Poem, Review } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchPoems = async (filter?: { theme?: string; search?: string }): Promise<Poem[]> => {
  let query = supabase.from('poems').select('*');

  if (filter?.theme) {
    query = query.eq('theme', filter.theme);
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

export const fetchPoemById = async (id: string): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`fetchPoemById Error:`, error.message);
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
  
  const themes = Array.from(new Set(response.data.map(i => i.theme))).filter(Boolean) as string[];
  return themes;
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

/**
 * Reviews fetching and submission
 * Updated to use 'reviews' table as suggested by the database schema hint.
 */
export const fetchReviews = async (poemId: string): Promise<Review[]> => {
  try {
    const { data, error, status } = await supabase
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
