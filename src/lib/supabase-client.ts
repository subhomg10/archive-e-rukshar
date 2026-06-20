import { createClient } from '@supabase/supabase-js';
import { Poem } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Explicitly log the URL being used to the console for verification
console.log("Supabase Client initialized with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Diagnostic helper to get raw row count
 */
export const fetchPoemsCount = async (): Promise<{ count: number | null; error: any }> => {
  const { count, error } = await supabase
    .from('poems')
    .select('*', { count: 'exact', head: true });
  
  return { count, error };
};

export const fetchPoems = async (filter?: { theme?: string; search?: string }): Promise<Poem[]> => {
  let query = supabase.from('poems').select('*');

  if (filter?.theme) {
    query = query.eq('theme', filter.theme);
  }

  if (filter?.search) {
    const s = filter.search;
    query = query.or(`title.ilike.%${s}%,theme.ilike.%${s}%,roman.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const response = await query.order('date', { ascending: false });
  
  if (response.error) {
    console.error("fetchPoems Error:", response.error);
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
    throw new Error(`Supabase Error [${response.error.code}]: ${response.error.message}`);
  }
  
  return (response.data || []) as Poem[];
};