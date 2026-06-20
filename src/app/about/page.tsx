"use client";

import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-headline tracking-tight">The Vision</h1>
            <p className="text-primary tracking-[0.2em] uppercase text-xs">Curating the Unspoken</p>
          </header>

          <article className="space-y-8 text-lg font-light leading-relaxed text-muted-foreground">
            <p>
              Rukshar's Archive was born from a desire to create a quiet space in a noisy world. It is a digital sanctuary where poetry isn't just displayed, but given the room it needs to breathe.
            </p>
            <p>
              Every verse in this collection is curated to evoke a sense of resonance—whether it's the stillness of solitude, the ache of memory, or the fleeting beauty of nature. We believe that reading poetry is an act of presence, and our design reflects that.
            </p>
            <p>
              Combining traditional literary sensibilities with modern technology, we offer AI-driven insights to help readers bridge the gap between word and feeling, uncovering the layers of meaning hidden beneath the surface.
            </p>
          </article>

          <div className="pt-12 border-t border-border/50">
            <p className="font-headline italic text-2xl text-foreground/80">
              "Poetry is the shadow cast by our imaginations."
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
