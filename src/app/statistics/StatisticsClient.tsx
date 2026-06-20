"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { ArchiveStats } from '@/components/ArchiveStats';
import { fetchArchiveStats } from '@/lib/supabase-client';
import { Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function StatisticsClient() {
  const [stats, setStats] = useState({
    totalPoems: 0,
    totalThemes: 0,
    featuredPoems: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const statsData = await fetchArchiveStats();
        setStats(statsData);
      } catch (err) {
        setError("Unable to calculate archive statistics at this time.");
        console.error("Error loading stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12 md:space-y-16"
        >
          <header className="space-y-4 text-center px-2">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-headline tracking-tight leading-tight">Archive Analytics</h1>
            <p className="text-primary tracking-[0.2em] uppercase text-[10px] md:text-xs font-light">Measuring the weight of words</p>
          </header>

          {error && (
            <Alert variant="destructive" className="max-w-md mx-auto border-destructive/20 bg-destructive/5">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stats Unavailable</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4">
              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-primary/40" />
              <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">Calculating resonance...</p>
            </div>
          ) : !error ? (
            <section className="space-y-10 md:space-y-12">
              <ArchiveStats stats={stats} />
              
              <div className="pt-8 md:pt-12 border-t border-border/30 text-center">
                <p className="text-xs md:text-sm text-muted-foreground font-light italic max-w-md md:max-w-lg mx-auto px-4">
                  Every statistic represents a fragment of memory, a shared resonance, or a voice preserved within this digital sanctuary.
                </p>
              </div>
            </section>
          ) : null}
        </motion.div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center opacity-30 mt-12 md:mt-20">
        <p className="text-[8px] md:text-[10px] tracking-[0.5em] uppercase text-muted-foreground">Rukshar's Archive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
