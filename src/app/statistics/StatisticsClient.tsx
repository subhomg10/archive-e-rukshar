"use client";

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { ArchiveStats } from '@/components/ArchiveStats';
import { fetchArchiveStats } from '@/lib/supabase-client';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatisticsClient() {
  const [stats, setStats] = useState({
    totalPoems: 0,
    totalThemes: 0,
    featuredPoems: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const statsData = await fetchArchiveStats();
        setStats(statsData);
      } catch (err) {
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
      
      <main className="max-w-5xl mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
        >
          <header className="space-y-4 text-center">
            <h1 className="text-5xl md:text-7xl font-headline tracking-tight">Archive Analytics</h1>
            <p className="text-primary tracking-[0.2em] uppercase text-xs font-light">Measuring the weight of words</p>
          </header>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground tracking-[0.2em] uppercase">Calculating resonance...</p>
            </div>
          ) : (
            <section className="space-y-12">
              <ArchiveStats stats={stats} />
              
              <div className="pt-12 border-t border-border/30 text-center">
                <p className="text-sm text-muted-foreground font-light italic max-w-lg mx-auto">
                  Every statistic represents a fragment of memory, a shared resonance, or a voice preserved within this digital sanctuary.
                </p>
              </div>
            </section>
          )}
        </motion.div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-20 text-center opacity-30 mt-20">
        <p className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground">Rukshar's Archive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
