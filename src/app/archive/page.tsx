"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PoemCard } from '@/components/PoemCard';
import { Poem } from '@/lib/types';
import { fetchPoems, fetchThemes, fetchFeaturedPoems } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, AlertCircle, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

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
      try {
        const [themeData, featuredData] = await Promise.all([
          fetchThemes(),
          fetchFeaturedPoems()
        ]);
        setThemes(themeData);
        setFeaturedPoems(featuredData);
      } catch (err: any) {
        console.error("Failed to load initial archive data", err);
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
      setError(null);
      try {
        const data = await fetchPoems({ theme: activeTheme || undefined, search: searchQuery });
        setPoems(data);
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred while fetching poems.");
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
        
        {/* 1. Featured Poems Panel */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-headline text-3xl md:text-4xl flex items-center gap-3">
                <Star className="w-6 h-6 text-primary fill-primary/20" />
                Featured Verses
              </h2>
              <p className="text-muted-foreground text-sm font-light uppercase tracking-widest">Selected fragments of resonance</p>
            </div>
          </div>
          
          {featuredLoading ? (
            <div className="h-48 flex items-center justify-center border border-border/30 rounded-2xl bg-card/10">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : featuredPoems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPoems.map((poem, index) => (
                <PoemCard key={`featured-${poem.id}`} poem={poem} index={index} />
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center border border-dashed border-border/30 rounded-2xl">
              <p className="text-muted-foreground italic font-light">No featured echoes currently curated.</p>
            </div>
          )}
        </section>

        <Separator className="bg-border/20" />

        {/* 2. Search and Theme Selection Panel */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="space-y-6 w-full md:w-auto">
              <div className="space-y-1">
                <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Discover</h3>
                <h2 className="font-headline text-3xl">Filter the Archive</h2>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTheme === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTheme(null)}
                  className="rounded-full px-5 text-xs tracking-wider transition-all duration-300"
                >
                  All
                </Button>
                {themes.map((theme) => (
                  <Button
                    key={theme}
                    variant={activeTheme === theme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTheme(theme)}
                    className="rounded-full px-5 text-xs tracking-wider transition-all duration-300"
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search title, theme, essence..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-card/30 border-border/50 focus:border-primary/50 focus:ring-primary/10 transition-all rounded-xl text-sm font-light shadow-sm"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="bg-destructive/5 border-destructive/20">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Issue</AlertTitle>
              <AlertDescription>
                {error}. Please verify your Supabase project settings and table availability.
              </AlertDescription>
            </Alert>
          )}

          {/* 3. All Verses Gallery */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="font-headline text-3xl md:text-4xl whitespace-nowrap">All Verses</h2>
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

            {!loading && !error && poems.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4 border border-dashed border-border/30 rounded-2xl bg-card/5">
                <Filter className="w-8 h-8 opacity-20" />
                <p className="font-light italic">No echoes found matching your current selection.</p>
                <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(''); setActiveTheme(null); }}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </section>

      </main>
      
      {/* Footer Decoration */}
      <footer className="py-20 text-center">
        <div className="inline-flex items-center gap-4 text-muted-foreground/30">
          <div className="h-[1px] w-12 bg-current" />
          <Sparkles className="w-4 h-4" />
          <div className="h-[1px] w-12 bg-current" />
        </div>
      </footer>
    </div>
  );
}