"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Poem } from '@/lib/types';
import { fetchPoemById } from '@/lib/supabase-client';
import { analyzePoem, AnalyzePoemOutput } from '@/ai/flows/ai-poem-analysis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ChevronLeft, Loader2, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export default function PoemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<AnalyzePoemOutput | null>(null);

  useEffect(() => {
    const loadPoem = async () => {
      const data = await fetchPoemById(id as string);
      setPoem(data);
      setLoading(false);
    };
    loadPoem();
  }, [id]);

  const handleAnalyze = async () => {
    if (!poem) return;
    setAnalyzing(true);
    try {
      const result = await analyzePoem({ title: poem.title, poemText: poem.content });
      setInsight(result);
    } catch (error) {
      console.error('Analysis failed', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!poem) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Poem not found.</p>
        <Button variant="ghost" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

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
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-primary transition-colors -ml-3 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Archive
          </Button>

          {/* Poem Header */}
          <header className="space-y-4 text-center">
            <Badge variant="outline" className="font-normal tracking-[0.2em] border-primary/20 text-primary uppercase text-[10px] px-3">
              {poem.theme}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline tracking-tight leading-tight">
              {poem.title}
            </h1>
            <div className="flex items-center justify-center space-x-2 text-muted-foreground font-light italic">
              <span>by {poem.author}</span>
            </div>
          </header>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* Poem Content */}
          <article className="reading-container">
            <div className="font-headline text-xl md:text-2xl leading-[1.8] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium">
              {poem.content}
            </div>
          </article>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* AI Insight Section */}
          <footer className="space-y-8 pt-12">
            {!insight ? (
              <div className="flex flex-col items-center space-y-6">
                <p className="text-sm text-muted-foreground text-center italic max-w-sm">
                  Wish to explore the deeper resonance and emotional colors of this verse?
                </p>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  variant="outline"
                  className="rounded-full px-8 py-6 border-primary/30 hover:border-primary text-primary/90 hover:bg-primary/5 group"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  )}
                  {analyzing ? 'Consulting the Muse...' : 'Reveal AI Insight'}
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card/30 border border-primary/10 rounded-2xl p-8 space-y-8"
              >
                <div className="flex items-center space-x-2 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-sm tracking-widest uppercase font-medium">Literary Insight</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Thematic Essence</h4>
                    <p className="text-sm leading-relaxed text-foreground/80 font-light">
                      {insight.thematicAnalysis}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Emotional Resonance</h4>
                    <p className="text-sm leading-relaxed text-foreground/80 font-light italic">
                      {insight.emotionalSummary}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </footer>
        </motion.div>
      </main>
    </div>
  );
}
