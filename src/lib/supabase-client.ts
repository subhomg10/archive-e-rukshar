import { createClient } from '@supabase/supabase-js';
import { Poem } from './types';

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
    // Search across title, theme, emotional_engine, roman, and description
    query = query.or(`title.ilike.%${s}%,theme.ilike.%${s}%,emotional_engine.ilike.%${s}%,roman.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) {
    throw new Error(`Supabase Query Error: ${error.message}`);
  }
  
  return data as Poem[];
};

export const fetchPoemById = async (id: string): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching poem ${id}:`, error.message);
    return null;
  }
  
  return data as Poem;
};

export const fetchThemes = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('poems')
    .select('theme');

  if (error) {
    console.error('Error fetching themes:', error.message);
    return [];
  }
  
  const themes = Array.from(new Set(data.map(i => i.theme))).filter(Boolean);
  return themes;
};

export const fetchFeaturedPoems = async (): Promise<Poem[]> => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('featured', true)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching featured poems:', error.message);
    return [];
  }
  
  return data as Poem[];
};
