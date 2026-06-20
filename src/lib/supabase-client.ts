
import { createClient } from '@supabase/supabase-js';
import { Poem } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchPoems = async (filter?: { theme?: string; search?: string }): Promise<Poem[]> => {
  console.log("Supabase Diagnostic: Fetching all poems...", { filter });
  
  let query = supabase.from('poems').select('*');

  if (filter?.theme) {
    query = query.eq('theme', filter.theme);
  }

  if (filter?.search) {
    const s = filter.search;
    query = query.or(`title.ilike.%${s}%,theme.ilike.%${s}%,emotional_engine.ilike.%${s}%,roman.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) {
    console.error("Supabase Diagnostic Error (fetchPoems):", error);
    throw new Error(`Supabase Error (${error.code}): ${error.message}`);
  }
  
  console.log(`Supabase Diagnostic: Successfully fetched ${data?.length || 0} poems.`);
  return (data || []) as Poem[];
};

export const fetchPoemById = async (id: string): Promise<Poem | null> => {
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase Diagnostic Error (fetchPoemById ${id}):`, error.message);
    return null;
  }
  
  return data as Poem;
};

export const fetchThemes = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('poems')
    .select('theme');

  if (error) {
    console.error('Supabase Diagnostic Error (fetchThemes):', error.message);
    return [];
  }
  
  const themes = Array.from(new Set(data.map(i => i.theme))).filter(Boolean) as string[];
  return themes;
};

export const fetchFeaturedPoems = async (): Promise<Poem[]> => {
  console.log("Supabase Diagnostic: Fetching featured poems...");
  const { data, error } = await supabase
    .from('poems')
    .select('*')
    .eq('featured', true)
    .order('date', { ascending: false });

  if (error) {
    console.error('Supabase Diagnostic Error (fetchFeaturedPoems):', error);
    throw new Error(`Supabase Error (${error.code}): ${error.message}`);
  }
  
  console.log(`Supabase Diagnostic: Successfully fetched ${data?.length || 0} featured poems.`);
  return (data || []) as Poem[];
};
