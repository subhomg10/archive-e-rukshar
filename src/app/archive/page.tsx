
"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PoemCard } from '@/components/PoemCard';
import { Poem } from '@/lib/types';
import { fetchPoems, fetchThemes, fetchFeaturedPoems } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, AlertCircle, Star, Sparkles, Database, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// HARDCODED TEST POEM FOR RENDERING VERIFICATION
const TEST_POEM: Poem = {
  id: "test-render-id",
  title: "UI Rendering Test (Hardcoded)",
  theme: "Diagnostic",
  date: new Date().toISOString(),
  author: "System Test",
  featured: true,
  roman: "If you can read this, the React rendering system is working correctly.\nThe issue lies with the Supabase data fetching or permissions.",
  description: "This is a temporary poem used to verify that the frontend components are functional.",
  emotional_engine: "Test/Diagnostic"
};

export default function ArchivePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [featuredPoems, setFeaturedPoems] = useState<Poem[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial data load: Themes and Featured Poems
  useEffect(() => {
    const loadInitialData = async () => {
      setFeaturedLoading(true);
      setError(null);
      try {
        console.log("Archive: Starting initial data load...");
        const [themeData, featuredData] = await Promise.all([
          fetchThemes(),
          fetchFeaturedPoems()
        ]);
        setThemes(themeData);
        // Add TEST_POEM to featured list for visual confirmation
        setFeaturedPoems([TEST_POEM, ...featuredData]);
      } catch (err: any) {
        console.error("Archive Load Error:", err);
        setError(err.message || "Failed to connect to Supabase.");
      } finally {
        setFeaturedLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Filtered load: All/Search/Theme Poems
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchPoems({ theme: activeTheme || undefined, search: searchQuery });
        // Add TEST_POEM to the main list as well for visual confirmation
        setPoems([TEST_POEM, ...data]);
      } catch (err: any) {
        console.error("Archive Fetch Error:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTheme, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-20">
        
        {/* Connection Status Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <Bug className="w-5 h-5 text-primary" />
          <div className="text-sm">
            <span className="font-semibold text-primary">Diagnostic Mode:</span> 
            Check browser console (F12) for raw Supabase response objects. 
            The "UI Rendering Test" poem below confirms the frontend is alive.
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg font-bold">Supabase Query Failed</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p className="font-mono text-sm bg-black/20 p-2 rounded">{error}</p>
              <div className="text-xs space-y-1">
                <p>Possible causes:</p>
                <ul className="list-disc pl-5">
                  <li><strong>RLS Policy:</strong> Table exists but SELECT is denied.</li>
                  <li><strong>Wrong Table Name:</strong> Table is not 'poems'.</li>
                  <li><strong>API Key/URL:</strong> Credentials invalid for this domain.</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* 1. Featured Poems Panel */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl md:text-4xl flex items-center gap-3 text-primary">
                <Star className="w-6 h-6 fill-primary/20" />
                Featured Verses
              </h2>
              <p className="text-muted-foreground text-sm font-light uppercase tracking-widest">Diagnostic Test Poem Included</p>
            </div>
          </div>
          
          {featuredLoading ? (
            <div className="h-48 flex items-center justify-center border border-border/30 rounded-2xl bg-card/10">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPoems.map((poem, index) => (
                <PoemCard key={`featured-${poem.id}`} poem={poem} index={index} />
              ))}
            </div>
          )}
        </section>

        <Separator className="bg-border/20" />

        {/* 2. Search and Theme Selection Panel */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="space-y-6 w-full md:w-auto">
              <div className="space-y-1">
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Explore</h3>
                <h2 className="font-headline text-3xl">Filter the Archive</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTheme === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTheme(null)}
                  className="rounded-full px-5 text-xs tracking-wider"
                >
                  All
                </Button>
                {themes.map((theme) => (
                  <Button
                    key={theme}
                    variant={activeTheme === theme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTheme(theme)}
                    className="rounded-full px-5 text-xs tracking-wider"
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-card/30 border-border/50 rounded-xl"
              />
            </div>
          </div>

          {/* 3. All Verses Gallery */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="font-headline text-3xl md:text-4xl">All Verses</h2>
              <div className="h-[1px] w-full bg-border/20" />
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {poems.map((poem, index) => (
                    <PoemCard key={`all-${poem.id}`} poem={poem} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {!loading && !error && poems.length <= 1 && (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4 border border-dashed border-border/30 rounded-2xl bg-card/5">
                <Database className="w-8 h-8 opacity-20" />
                <p className="font-light italic text-center px-4">
                  No poems found in Supabase table 'poems'.<br/>
                  Only the test poem is rendering.
                </p>
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setActiveTheme(null); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
