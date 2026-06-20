"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Poem, Review } from '@/lib/types';
import { fetchPoemById, fetchReviews, addReview } from '@/lib/supabase-client';
import { analyzePoem, AnalyzePoemOutput } from '@/ai/flows/ai-poem-analysis';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, ChevronLeft, Loader2, Star, Send, MessageCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format, isValid } from 'date-fns';

export default function PoemPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  
  const [poem, setPoem] = useState<Poem | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [insight, setInsight] = useState<AnalyzePoemOutput | null>(null);
  
  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({
    user_name: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [poemData, reviewData] = await Promise.all([
          fetchPoemById(id as string),
          fetchReviews(id as string)
        ]);
        setPoem(poemData);
        setReviews(reviewData || []);
      } catch (err) {
        console.error("Error loading poem page data:", err);
      } finally {
        setLoading(false);
        setLoadingReviews(false);
      }
    };
    loadData();
  }, [id]);

  const handleAnalyze = async () => {
    if (!poem) return;
    setAnalyzing(true);
    try {
      const result = await analyzePoem({ title: poem.title, poemText: poem.roman });
      setInsight(result);
    } catch (error) {
      console.error('Analysis failed', error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "The archive's muse is momentarily silent. Please try again."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.user_name || !newReview.comment) {
      toast({
        title: "Fragment missing",
        description: "Please provide both your name and reflection."
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview({
        poem_id: id as string,
        ...newReview
      });
      
      const updatedReviews = await fetchReviews(id as string);
      setReviews(updatedReviews);
      setNewReview({ user_name: '', rating: 5, comment: '' });
      
      toast({
        title: "Reflection saved",
        description: "Your voice has been added to the archive."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "The ink did not set. Please try again."
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getFormattedDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Date Unknown';
    const date = new Date(dateStr);
    return isValid(date) ? format(date, 'MMMM yyyy') : 'Recently';
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
      
      <main className="max-w-4xl mx-auto px-6 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-16"
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
              <span className="mx-2 opacity-30">|</span>
              <span>{getFormattedDate(poem.date)}</span>
            </div>
          </header>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* Poem Content Tabs */}
          <Tabs defaultValue="roman" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-card/50 border border-border/50 rounded-full h-auto p-1">
                <TabsTrigger value="roman" className="rounded-full px-6 py-2 text-xs uppercase tracking-widest">Roman</TabsTrigger>
                {poem.hindi && <TabsTrigger value="hindi" className="rounded-full px-6 py-2 text-xs uppercase tracking-widest">Hindi</TabsTrigger>}
                {poem.urdu && <TabsTrigger value="urdu" className="rounded-full px-6 py-2 text-xs uppercase tracking-widest">Urdu</TabsTrigger>}
              </TabsList>
            </div>

            <TabsContent value="roman">
              <article className="reading-container">
                <div className="font-headline text-2xl md:text-3xl leading-[1.8] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium text-center">
                  {poem.roman}
                </div>
              </article>
            </TabsContent>
            
            {poem.hindi && (
              <TabsContent value="hindi">
                <article className="reading-container">
                  <div className="font-headline text-2xl md:text-3xl leading-[1.8] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium text-center">
                    {poem.hindi}
                  </div>
                </article>
              </TabsContent>
            )}

            {poem.urdu && (
              <TabsContent value="urdu">
                <article className="reading-container">
                  <div className="font-headline text-2xl md:text-3xl leading-[1.8] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium text-center dir-rtl">
                    {poem.urdu}
                  </div>
                </article>
              </TabsContent>
            )}
          </Tabs>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* About this Fragment Section */}
          <section className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-3 text-primary/70">
              <Info className="w-4 h-4" />
              <h3 className="text-xs uppercase tracking-[0.2em] font-medium">About this Fragment</h3>
            </div>
            <div className="space-y-4">
              <p className="text-lg font-light leading-relaxed text-muted-foreground italic">
                {poem.description}
              </p>
              {poem.emotional_engine && (
                <div className="pt-4 border-l-2 border-primary/10 pl-6">
                  <p className="text-sm font-light text-muted-foreground/80 leading-relaxed">
                    <span className="text-[10px] uppercase tracking-widest text-primary/40 block mb-1">Emotional Echo</span>
                    {poem.emotional_engine}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* AI Insight Section */}
          <section className="space-y-8 pt-8 max-w-3xl mx-auto">
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
                className="bg-card/30 border border-primary/10 rounded-3xl p-8 md:p-12 space-y-10"
              >
                <div className="flex items-center space-x-2 text-primary">
                  <Sparkles className="w-5 h-5" />
                  <h3 className="text-sm tracking-widest uppercase font-medium">Literary Insight</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <h4 className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Thematic Essence</h4>
                    <p className="text-base leading-relaxed text-foreground/80 font-light">
                      {insight.thematicAnalysis}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em]">Emotional Resonance</h4>
                    <p className="text-base leading-relaxed text-foreground/80 font-light italic">
                      {insight.emotionalSummary}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </section>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* Public Reflections Section */}
          <section className="space-y-12 max-w-3xl mx-auto pt-12">
            <header className="space-y-2 text-center">
              <div className="flex items-center justify-center space-x-3 text-primary/70 mb-2">
                <MessageCircle className="w-4 h-4" />
                <h2 className="text-sm uppercase tracking-[0.3em] font-medium">Public Reflections</h2>
              </div>
              <p className="text-xs text-muted-foreground font-light">Share your own resonance with these words.</p>
            </header>

            {/* Review Form */}
            <Card className="bg-card/20 border-border/40 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <form onSubmit={handleReviewSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Your Name</label>
                      <Input 
                        placeholder="Anonymous wanderer"
                        value={newReview.user_name}
                        onChange={(e) => setNewReview({...newReview, user_name: e.target.value})}
                        className="bg-background/40 border-border/50 rounded-xl focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({...newReview, rating: star})}
                            className="focus:outline-none transition-transform active:scale-90"
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${
                                star <= newReview.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Your Reflection</label>
                    <Textarea 
                      placeholder="How do these words find you?"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      className="min-h-[120px] bg-background/40 border-border/50 rounded-2xl focus:border-primary/50 resize-none font-light"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submittingReview}
                    className="w-full md:w-auto rounded-full px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 group"
                  >
                    {submittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    Leave Reflection
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Reviews List */}
            <div className="space-y-8">
              {loadingReviews ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="grid gap-6">
                  <AnimatePresence mode="popLayout">
                    {reviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-card/10 border-border/30 border-dashed rounded-2xl">
                          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                            <div className="space-y-1">
                              <CardTitle className="text-sm font-medium">{review.user_name}</CardTitle>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/20'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <time className="text-[10px] text-muted-foreground tracking-widest uppercase">
                              {review.created_at ? format(new Date(review.created_at), 'MMM d, yyyy') : 'Recently'}
                            </time>
                          </CardHeader>
                          <CardContent className="p-6 pt-2">
                            <p className="text-sm text-foreground/70 font-light italic leading-relaxed">
                              "{review.comment}"
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border/30 rounded-3xl">
                  <p className="text-xs text-muted-foreground font-light tracking-widest italic">
                    The silence here awaits your reflection.
                  </p>
                </div>
              )}
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-20 text-center opacity-30 mt-20">
        <p className="text-[10px] tracking-[0.5em] uppercase">Rukshar's Archive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
