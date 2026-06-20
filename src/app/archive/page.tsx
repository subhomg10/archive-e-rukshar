"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PoemCard } from '@/components/PoemCard';
import { Poem } from '@/lib/types';
import { fetchPoems, fetchThemes } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function ArchivePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const themeData = await fetchThemes();
        setThemes(themeData);
      } catch (err: any) {
        console.error("Failed to load themes", err);
      }
    };
    loadInitialData();
  }, []);

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
      
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        {/* Header Section */}
        <div className="space-y-4 mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-headline text-5xl md:text-7xl"
          >
            The Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto font-light"
          >
            Explore a curated selection of poetry organized by theme and resonance.
          </motion.p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-12">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>
                {error}. Please check your Supabase configuration and table permissions.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between border-b border-border/50 pb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={activeTheme === null ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTheme(null)}
              className="rounded-full px-4 text-xs tracking-wider"
            >
              All
            </Button>
            {themes.map((theme) => (
              <Button
                key={theme}
                variant={activeTheme === theme ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTheme(theme)}
                className="rounded-full px-4 text-xs tracking-wider"
              >
                {theme}
              </Button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search title, theme, resonance..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-full text-sm font-light"
            />
          </div>
        </div>

        {/* Gallery Grid */}
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
                <PoemCard key={poem.id} poem={poem} index={index} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!loading && !error && poems.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Filter className="w-8 h-8 opacity-20" />
            <p className="font-light italic">No echoes found for your search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
