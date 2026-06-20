"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { PoemCard } from '@/components/PoemCard';
import { Poem } from '@/lib/types';
import { fetchPoems, fetchThemes, fetchFeaturedPoems, fetchPoemsCount } from '@/lib/supabase-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle, Star, Database, ShieldAlert, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

const TEST_POEM: Poem = {
  id: "render-test",
  title: "Frontend Rendering Verification",
  theme: "Diagnostic",
  date: new Date().toISOString(),
  author: "System",
  featured: true,
  roman: "This poem is hardcoded to prove that the UI components are functioning.\nIf you see this but no other poems, the issue is strictly with the data connection or RLS policies.",
  description: "A temporary diagnostic placeholder.",
  emotional_engine: "Stable"
};

export default function ArchivePage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [featuredPoems, setFeaturedPoems] = useState<Poem[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Diagnostic states
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [currentUrl] = useState(process.env.NEXT_PUBLIC_SUPABASE_URL);

  useEffect(() => {
    const runDiagnostics = async () => {
      const { count, error } = await fetchPoemsCount();
      if (error) {
        console.error("Diagnostic Count Error:", error);
      } else {
        setDbCount(count);
      }
    };
    runDiagnostics();
  }, []);

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
        setFeaturedPoems([TEST_POEM, ...featuredData]);
        setPoems([TEST_POEM, ...allData]);
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
      
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        {/* Diagnostic Panel */}
        <section className="bg-card/50 border border-primary/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Activity className="w-5 h-5" />
            <h2 className="font-headline text-xl">Connection Diagnostics</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
            <div className="p-3 bg-black/20 rounded-lg">
              <span className="text-muted-foreground block mb-1">Target URL:</span>
              <span className="text-primary break-all">https://amkkbzjblsuzruzyurfc.supabase.co</span>
            </div>
            <div className="p-3 bg-black/20 rounded-lg">
              <span className="text-muted-foreground block mb-1">Active URL in App:</span>
              <span className={currentUrl?.includes('amkkbzjbl') ? "text-green-400" : "text-red-400"}>
                {currentUrl || "NOT FOUND"}
              </span>
            </div>
            <div className="p-3 bg-black/20 rounded-lg flex justify-between items-center">
              <div>
                <span className="text-muted-foreground block mb-1">Rows visible to Public Key:</span>
                <span className="text-2xl font-bold text-foreground">{dbCount ?? "0"}</span>
              </div>
              {dbCount === 0 && (
                <div className="flex items-center gap-2 text-yellow-500">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[10px] uppercase">Possible RLS Block</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Featured Section */}
        <section className="space-y-8">
          <h2 className="font-headline text-3xl md:text-4xl flex items-center gap-3 text-primary">
            <Star className="w-6 h-6 fill-primary/20" />
            Featured Echoes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPoems.map((poem, index) => (
              <PoemCard key={`feat-${poem.id}`} poem={poem} index={index} />
            ))}
          </div>
        </section>

        <Separator />

        {/* Filter & All Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTheme === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTheme(null)}
                  className="rounded-full"
                >
                  All Themes
                </Button>
                {themes.map((theme) => (
                  <Button
                    key={theme}
                    variant={activeTheme === theme ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTheme(theme)}
                    className="rounded-full"
                  >
                    {theme}
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-96">
              <Input
                placeholder="Search the archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 h-12 bg-card/30 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="font-headline text-3xl md:text-4xl">All Verses</h2>
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                  {poems.map((poem, index) => (
                    <PoemCard key={`all-${poem.id}`} poem={poem} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {!loading && poems.length <= 1 && dbCount === 0 && (
              <div className="text-center py-20 border border-dashed rounded-3xl space-y-4">
                <Database className="w-12 h-12 mx-auto text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">
                  The rendering test is visible, but no data was returned from Supabase.<br/>
                  Check RLS policies if your table is not empty.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}