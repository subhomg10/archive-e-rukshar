"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PoemCard } from '@/components/PoemCard';
import { Poem } from '@/lib/types';
import { fetchPoems, fetchThemes, fetchFeaturedPoems } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function ArchivePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [featuredPoems, setFeaturedPoems] = useState<Poem[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [themeData, featuredData, allData] = await Promise.all([
          fetchThemes(),
          fetchFeaturedPoems(),
          fetchPoems({ theme: activeTheme || undefined, search: searchQuery })
        ]);
        
        setThemes(themeData);
        setFeaturedPoems(featuredData);
        setPoems(allData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeTheme, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        
        {error && (
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Archive Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Featured Section */}
        {featuredPoems.length > 0 && (
          <section className="space-y-8">
            <header className="space-y-2">
              <h2 className="font-headline text-3xl md:text-4xl flex items-center gap-3 text-primary">
                <Star className="w-6 h-6 fill-primary/20" />
                Featured Echoes
              </h2>
              <p className="text-muted-foreground font-light text-sm tracking-wide">Handpicked verses that resonate with the current season.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPoems.map((poem, index) => (
                <PoemCard key={`feat-${poem.id}`} poem={poem} index={index} />
              ))}
            </div>
          </section>
        )}

        <Separator className="bg-border/30" />

        {/* Search & Filters Section */}
        <section className="space-y-10">
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="space-y-4 w-full md:w-auto">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Filter by Resonance</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeTheme === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTheme(null)}
                    className="rounded-full px-5 text-xs font-light tracking-wider"
                  >
                    All Themes
                  </Button>
                  {themes.map((theme) => (
                    <Button
                      key={theme}
                      variant={activeTheme === theme ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveTheme(theme)}
                      className="rounded-full px-5 text-xs font-light tracking-wider"
                    >
                      {theme}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, theme, or fragments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-card/20 border-border/50 rounded-xl focus:border-primary/50 transition-colors placeholder:text-muted-foreground/50 font-light"
                />
              </div>
            </div>
          </div>

          {/* All Verses Section */}
          <div className="space-y-8">
            <header className="flex items-end justify-between">
              <h2 className="font-headline text-3xl md:text-4xl">All Verses</h2>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase font-light">
                {poems.length} {poems.length === 1 ? 'Fragment' : 'Fragments'}
              </span>
            </header>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">Consulting the Archive</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <AnimatePresence mode="popLayout">
                    {poems.map((poem, index) => (
                      <PoemCard key={`all-${poem.id}`} poem={poem} index={index} />
                    ))}
                  </AnimatePresence>
                </div>

                {!loading && poems.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 border border-dashed border-border/50 rounded-3xl space-y-4"
                  >
                    <div className="w-12 h-12 mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                      <Search className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-light italic">
                      No verses found matching your current filters.
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => { setActiveTheme(null); setSearchQuery(''); }}
                      className="text-primary hover:text-primary/80"
                    >
                      Clear all filters
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 text-center border-t border-border/30 mt-20">
        <p className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground/50">Rukshar's Archive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
