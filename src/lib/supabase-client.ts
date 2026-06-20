
import { createClient } from '@supabase/supabase-js';
import { Poem } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("Supabase Client Initializing with URL:", supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchPoems = async (filter?: { theme?: string; search?: string }): Promise<Poem[]> => {
  console.log("Supabase Diagnostic: Attempting to fetch all poems from 'poems' table...");
  
  let query = supabase.from('poems').select('*');

  if (filter?.theme) {
    query = query.eq('theme', filter.theme);
  }

  if (filter?.search) {
    const s = filter.search;
    query = query.or(`title.ilike.%${s}%,theme.ilike.%${s}%,emotional_engine.ilike.%${s}%,roman.ilike.%${s}%,description.ilike.%${s}%`);
  }

  const response = await query.order('date', { ascending: false });
  
  console.log("--- RAW SUPABASE RESPONSE (fetchPoems) ---");
  console.log("Data:", response.data);
  console.log("Error:", response.error);
  console.log("Status:", response.status);
  console.log("StatusText:", response.statusText);
  console.log("------------------------------------------");

  if (response.error) {
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
    console.error(`Supabase Error (fetchPoemById ${id}):`, error.message);
    return null;
  }
  
  return data as Poem;
};

export const fetchThemes = async (): Promise<string[]> => {
  const response = await supabase
    .from('poems')
    .select('theme');

  if (response.error) {
    console.error('Supabase Error (fetchThemes):', response.error.message);
    return [];
  }
  
  const themes = Array.from(new Set(response.data.map(i => i.theme))).filter(Boolean) as string[];
  return themes;
};

export const fetchFeaturedPoems = async (): Promise<Poem[]> => {
  console.log("Supabase Diagnostic: Attempting to fetch featured poems (featured=true)...");
  const response = await supabase
    .from('poems')
    .select('*')
    .eq('featured', true)
    .order('date', { ascending: false });

  console.log("--- RAW SUPABASE RESPONSE (fetchFeaturedPoems) ---");
  console.log("Data:", response.data);
  console.log("Error:", response.error);
  console.log("-------------------------------------------------");

  if (response.error) {
    throw new Error(`Supabase Error [${response.error.code}]: ${response.error.message}`);
  }
  
  return (response.data || []) as Poem[];
};
