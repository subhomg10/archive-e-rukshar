"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-primary text-sm tracking-[0.3em] uppercase mb-4 font-body font-light">
            An Archive of Fragments
          </h2>
          <h1 className="text-6xl md:text-8xl font-headline text-foreground tracking-tight leading-none mb-6">
            Rukshar's <span className="italic">Archive</span>
          </h1>
          <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-lg mx-auto">
            A sanctuary for poetry, where every verse finds its home in the silence of the page.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-12 py-6 border-primary/20 hover:border-primary/50 text-primary hover:text-primary hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(201,178,143,0.15)] transition-all duration-500 text-base font-light tracking-wider bg-transparent"
          >
            <Link href="/archive">
              Enter the Archive
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5, duration: 2 }}
        className="absolute bottom-12 text-[10px] tracking-[0.5em] uppercase text-muted-foreground"
      >
        Meticulously Curated
      </motion.div>
    </main>
  );
}
