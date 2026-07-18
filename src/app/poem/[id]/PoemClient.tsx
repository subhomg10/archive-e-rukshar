"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { Poem, Review } from '@/lib/types';
import { fetchReviews, addReview } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, Loader2, Star, Send, MessageCircle, BookOpen, ChevronDown, Clock, Heart } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PoemClientProps {
  initialPoem: Poem;
  prevPoem: Poem | null;
  nextPoem: Poem | null;
  allPoems: Poem[];
}

function InteractiveWord({ word, meaning }: { word: string; meaning: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className="cursor-help underline underline-offset-4 decoration-primary/20 hover:decoration-primary/50 transition-colors duration-300"
          onMouseEnter={() => {
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
              setIsOpen(true);
            }
          }}
          onMouseLeave={() => {
            if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
              setIsOpen(false);
            }
          }}
          onClick={(e) => {
            if (typeof window !== 'undefined' && !window.matchMedia('(hover: hover)').matches) {
              setIsOpen(!isOpen);
            }
          }}
        >
          {word}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        side="bottom" 
        className="w-auto max-w-[220px] p-3 bg-card/95 backdrop-blur-md border-border/50 shadow-xl rounded-xl z-[70] pointer-events-none select-none"
      >
        <p className="text-xs md:text-sm font-light italic text-primary leading-relaxed">
          {meaning}
        </p>
      </PopoverContent>
    </Popover>
  );
}

function InteractivePoem({ text, vocabMap, isClient }: { text: string; vocabMap: Map<string, string>; isClient: boolean }) {
  if (!vocabMap.size) {
    return <div className="whitespace-pre-line text-center">{text}</div>;
  }

  const seenWords = new Set<string>();
  const vocabWords = Array.from(vocabMap.keys()).sort((a, b) => b.length - a.length);
  const escapedWords = vocabWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(\\b(?:${escapedWords})\\b)`, 'gi');

  const lines = text.split('\n');

  return (
    <div className="space-y-1 text-center">
      {lines.map((line, lineIdx) => (
        <div key={`line-${lineIdx}`} className="min-h-[1.5em] leading-[1.8] md:leading-[2] text-center">
          {line.split(regex).map((part, partIdx) => {
            const lowerPart = part.toLowerCase();
            const meaning = vocabMap.get(lowerPart);
            
            if (meaning && !seenWords.has(lowerPart) && isClient) {
              seenWords.add(lowerPart);
              return <InteractiveWord key={`word-${lineIdx}-${partIdx}`} word={part} meaning={meaning} />;
            }
            return <span key={`part-${lineIdx}-${partIdx}`}>{part}</span>;
          })}
        </div>
      ))}
    </div>
  );
}

export function PoemClient({ initialPoem: poem, prevPoem, nextPoem, allPoems }: PoemClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start center", "end center"]
  });
  
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showVocabulary, setShowVocabulary] = useState(false);

  const vocabMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!poem.vocab_words || !poem.vocab_meanings) return map;

    const words = poem.vocab_words.split('|').map(w => w.trim());
    const meanings = poem.vocab_meanings.split('|').map(m => m.trim());

    words.forEach((word, index) => {
      const lowerWord = word.toLowerCase();
      const meaning = meanings[index];
      if (lowerWord && meaning) {
        map.set(lowerWord, meaning);
      }
    });

    return map;
  }, [poem.vocab_words, poem.vocab_meanings]);

  const vocabCount = useMemo(() => {
    if (!poem.vocab_words) return 0;
    return poem.vocab_words.split('|').filter(w => w.trim().length > 0).length;
  }, [poem.vocab_words]);

  const readingTime = useMemo(() => {
    const allText = [poem.roman, poem.hindi, poem.urdu].filter(Boolean).join(' ');
    const wordsCount = allText.trim().split(/\s+/).length;
    return wordsCount > 0 ? Math.max(1, Math.round(wordsCount / 200)) : 0;
  }, [poem.roman, poem.hindi, poem.urdu]);

  const relatedPoems = useMemo(() => {
    if (!allPoems.length) return [];
    
    const currentThemes = poem.theme ? poem.theme.split(/[|,]+/).map(t => t.trim().toLowerCase()) : [];
    
    return allPoems
      .filter(p => p.id !== poem.id)
      .map(p => {
        const pThemes = p.theme ? p.theme.split(/[|,]+/).map(t => t.trim().toLowerCase()) : [];
        const shared = pThemes.filter(t => currentThemes.includes(t)).length;
        return { ...p, sharedCount: shared };
      })
      .filter(p => p.sharedCount > 0)
      .sort((a, b) => b.sharedCount - a.sharedCount || b.date.localeCompare(a.date))
      .slice(0, 5);
  }, [poem.id, poem.theme, allPoems]);

  const themes = useMemo(() => {
    return poem.theme ? poem.theme.split(/[|,]+/).map(t => t.trim()).filter(Boolean) : [];
  }, [poem.theme]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const textReviews = useMemo(() => {
    return reviews.filter(r => r.comment && r.comment.trim().length > 0);
  }, [reviews]);

  useEffect(() => {
    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const reviewData = await fetchReviews(poem.id);
        setReviews(reviewData || []);
      } catch (err) {
        console.error("Error loading reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [poem.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || newReview.rating === 0) {
      toast({
        title: "Information required",
        description: "Please provide your name and a rating."
      });
      return;
    }

    setSubmittingReview(true);
    try {
      await addReview({
        poem_id: poem.id,
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment.trim() || null
      });
      
      const updatedReviews = await fetchReviews(poem.id);
      setReviews(updatedReviews);
      setNewReview({ name: '', rating: 0, comment: '' });
      
      toast({
        title: "Impression saved",
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

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {mounted && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[60]"
            style={{ scaleX }}
          />
        )}
      </AnimatePresence>
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-3 md:px-6 py-12 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-10 md:space-y-16"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/archive')}
            className="text-muted-foreground hover:text-primary transition-colors -ml-3 group h-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Archive
          </Button>

          <header className="space-y-4 md:space-y-6 text-center relative">
            {poem.favorite && (
              <div className="flex items-center justify-center gap-2 text-primary animate-in fade-in slide-in-from-top-2 duration-1000 mb-2">
                <Heart className="w-3 h-3 fill-current" />
                <span className="text-[9px] uppercase tracking-[0.4em] font-medium">Author's Favorite</span>
              </div>
            )}
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              {themes.map((theme, i) => (
                <Badge 
                  key={i}
                  variant="outline" 
                  className="font-normal tracking-[0.2em] border-primary/20 text-primary uppercase text-[8px] md:text-[10px] px-3 py-1 w-fit"
                >
                  {theme}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-center gap-10 group/title relative">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-headline tracking-tight leading-tight px-2">
                {poem.title}
              </h1>
              
              {mounted && relatedPoems.length > 0 && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <Popover>
                      <TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5 hover:scale-110 transition-all shrink-0 active:scale-95 opacity-70"
                          >
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              height="24px" 
                              viewBox="0 -960 960 960" 
                              width="24px" 
                              fill="currentColor"
                              className="w-6 h-6 md:w-7 md:h-7 opacity-70 group-hover/title:opacity-100 transition-opacity"
                            >
                              <path d="M120-240v-80h520v80H120Zm664-40L584-480l200-200 56 56-144 144 144 144-56 56ZM120-440v-80h400v80H120Zm0-200v-80h520v80H120Z"/>
                            </svg>
                          </Button>
                        </PopoverTrigger>
                      </TooltipTrigger>
                      <PopoverContent className="w-64 p-0 bg-card/95 backdrop-blur-md border-border/50 shadow-2xl rounded-2xl overflow-hidden" align="center" side="bottom" sideOffset={12}>
                        <div className="p-4 bg-primary/5 border-b border-border/30">
                          <h4 className="text-[10px] uppercase tracking-[0.2em] font-medium text-primary/80">Related Echoes</h4>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {relatedPoems.map((p) => (
                            <Link 
                              key={p.id} 
                              href={`/poem/${p.id}`}
                              className="block p-4 hover:bg-primary/5 transition-colors border-b border-border/10 last:border-none group/item"
                            >
                              <div className="space-y-1">
                                <p className="text-sm font-headline group-hover/item:text-primary transition-colors line-clamp-1">{p.title}</p>
                                <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60">{p.theme}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <TooltipContent side="right" className="bg-card text-foreground border-border/50 hidden md:block">
                      <p className="text-[10px] tracking-widest uppercase">Show Related Poems</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-muted-foreground font-light italic text-sm md:text-base">
              <span>by {poem.author}</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="font-body text-[10px] md:text-xs tracking-wider uppercase">
                {poem.date}
              </span>
              {readingTime > 0 && (
                <>
                  <span className="hidden sm:inline opacity-30">|</span>
                  <span className="flex items-center gap-1.5 font-body text-[10px] md:text-xs tracking-wider uppercase">
                    <Clock className="w-3 h-3 opacity-60" />
                    {readingTime} min read
                  </span>
                </>
              )}
            </div>
          </header>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          <div ref={contentRef} className="py-8">
            {!mounted ? (
              <article className="reading-container px-0 md:px-2">
                <div className="font-headline text-[17px] sm:text-xl md:text-2xl leading-[1.7] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium text-center">
                  {poem.roman}
                </div>
              </article>
            ) : (
              <Tabs defaultValue="roman" className="w-full">
                <div className="flex justify-center mb-8 md:mb-12">
                  <TabsList className="bg-card/50 border border-border/50 rounded-full h-auto p-1 flex-wrap justify-center">
                    <TabsTrigger value="roman" className="rounded-full px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-widest">Roman</TabsTrigger>
                    {poem.hindi && <TabsTrigger value="hindi" className="rounded-full px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-widest">Hindi</TabsTrigger>}
                    {poem.urdu && <TabsTrigger value="urdu" className="rounded-full px-4 md:px-6 py-1.5 md:py-2 text-[10px] md:text-xs uppercase tracking-widest">Urdu</TabsTrigger>}
                  </TabsList>
                </div>

                <TabsContent value="roman">
                  <article className="reading-container px-0 md:px-2">
                    <div className="font-headline text-[17px] sm:text-xl md:text-2xl leading-[1.7] md:leading-[2] text-foreground/90 font-medium">
                      <InteractivePoem text={poem.roman} vocabMap={vocabMap} isClient={mounted} />
                    </div>
                  </article>
                </TabsContent>
                
                {poem.hindi && (
                  <TabsContent value="hindi">
                    <article className="reading-container px-0 md:px-2">
                      <div className="font-headline text-[17px] sm:text-xl md:text-2xl leading-[1.7] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium text-center">
                        {poem.hindi}
                      </div>
                    </article>
                  </TabsContent>
                )}

                {poem.urdu && (
                  <TabsContent value="urdu">
                    <article className="reading-container px-0 md:px-2">
                      <div className="font-headline text-[17px] sm:text-xl md:text-2xl leading-[1.7] md:leading-[2] whitespace-pre-line text-foreground/90 font-medium text-center dir-rtl">
                        {poem.urdu}
                      </div>
                    </article>
                  </TabsContent>
                )}
              </Tabs>
            )}
          </div>

          <Separator className="bg-border/30 max-w-[80px] md:max-w-[100px] mx-auto" />

          <section className="space-y-4 md:space-y-6 max-w-2xl mx-auto px-2">
            <div className="flex items-center space-x-3 text-primary/70">
              <h3 className="text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">About this Fragment</h3>
            </div>
            <div className="space-y-4">
              <p className="text-base md:text-lg font-light leading-relaxed text-muted-foreground italic">
                {poem.description}
              </p>
              {poem.emotional_engine && (
                <div className="pt-4 border-l-2 border-primary/10 pl-4 md:pl-6">
                  <p className="text-xs md:text-sm font-light text-muted-foreground/80 leading-relaxed">
                    <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-primary/40 block mb-1">Emotional Echo</span>
                    {poem.emotional_engine}
                  </p>
                </div>
              )}
            </div>
          </section>

          {vocabCount > 0 && (
            <>
              <Separator className="bg-border/30 max-w-[80px] md:max-w-[100px] mx-auto" />
              <section className="space-y-4 max-w-2xl mx-auto px-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowVocabulary(!showVocabulary)}
                  className="w-full flex items-center justify-between py-6 h-auto border border-border/30 rounded-2xl hover:bg-primary/5 transition-all group px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/5 text-primary/60 group-hover:text-primary transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {showVocabulary ? 'Hide Vocabulary' : `Vocabulary (${vocabCount})`}
                    </span>
                  </div>
                  <div className={cn("transition-transform duration-500", showVocabulary ? "rotate-180" : "")}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
                <AnimatePresence>
                  {showVocabulary && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 md:p-8 rounded-2xl bg-card/10 border border-border/20">
                        <div className="text-sm md:text-base font-light leading-relaxed text-muted-foreground whitespace-pre-line italic text-center">
                          {poem.vocabulary}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </>
          )}

          <Separator className="bg-border/30 max-w-[80px] md:max-w-[100px] mx-auto" />

          <section className="max-w-2xl mx-auto px-2 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-left">
                {nextPoem && (
                  <Link 
                    href={`/poem/${nextPoem.id}`}
                    className="group flex flex-col items-start space-y-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                      Next Fragment
                    </span>
                    <span className="font-headline text-lg sm:text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {nextPoem.title}
                    </span>
                  </Link>
                )}
              </div>
              
              <div className="flex-1 text-right">
                {prevPoem && (
                  <Link 
                    href={`/poem/${prevPoem.id}`}
                    className="group flex flex-col items-end space-y-2 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-[9px] uppercase tracking-[0.2em] text-primary/60 flex items-center gap-1">
                      Previous Fragment
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <span className="font-headline text-lg sm:text-xl line-clamp-1 group-hover:text-primary transition-colors">
                      {prevPoem.title}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </section>

          <Separator className="bg-border/30 max-w-[80px] md:max-w-[100px] mx-auto" />

          <section className="space-y-10 md:space-y-12 max-w-3xl mx-auto pt-8 md:pt-12 px-2">
            <header className="space-y-2 text-center">
              <div className="flex items-center justify-center space-x-3 text-primary/70 mb-2">
                <MessageCircle className="w-4 h-4" />
                <h2 className="text-[10px] md:text-sm uppercase tracking-[0.3em] font-medium">Public Impressions</h2>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground font-light">Share your own resonance with these words.</p>
              {reviews.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= Number(averageRating) ? 'text-primary fill-primary' : 'text-muted-foreground/20'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-headline text-primary/80">{averageRating} / 5</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest ml-1">({reviews.length})</span>
                </div>
              )}
            </header>

            <Card className="bg-card/20 border-border/40 rounded-2xl md:rounded-3xl overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleReviewSubmit} className="space-y-6 md:space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Name</label>
                      <Input 
                        placeholder=""
                        value={newReview.name}
                        onChange={(e) => setNewReview({...newReview, name: e.target.value})}
                        className="bg-background/40 border-border/50 rounded-xl focus:border-primary/50 text-sm h-10 md:h-11"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Rating <span className="text-primary">*</span></label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({...newReview, rating: star})}
                            className="focus:outline-none transition-transform active:scale-90"
                          >
                            <Star 
                              className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${
                                star <= newReview.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] md:text-[10px] uppercase tracking-widest text-muted-foreground">Impression (Optional)</label>
                      <span className="text-[8px] uppercase tracking-widest text-muted-foreground/40 italic">You may leave this blank</span>
                    </div>
                    <Textarea 
                      placeholder=""
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      className="min-h-[100px] md:min-h-[120px] bg-background/40 border-border/50 rounded-xl md:rounded-2xl focus:border-primary/50 resize-none font-light text-sm"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submittingReview || !newReview.name || newReview.rating === 0}
                    className="w-full md:w-auto rounded-full px-8 py-5 md:py-6 bg-primary text-primary-foreground hover:bg-primary/90 group h-auto"
                  >
                    {submittingReview ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    {newReview.comment.trim() ? 'Leave Impression' : 'Save Rating'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6 md:space-y-8">
              {textReviews.length > 0 && (
                <h3 className="text-lg md:text-xl font-headline text-center mb-6 md:mb-8 italic text-primary/60">Written Reflections</h3>
              )}
              
              {loadingReviews ? (
                <div className="flex justify-center py-10 md:py-12">
                  <Loader2 className="w-5 h-5 md:w-6 md:h-6 text-primary animate-spin" />
                </div>
              ) : textReviews.length > 0 ? (
                <div className="grid gap-4 md:gap-6">
                  <AnimatePresence mode="popLayout">
                    {textReviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-card/10 border-border/30 border-dashed rounded-xl md:rounded-2xl">
                          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6 pb-2">
                            <div className="space-y-1">
                              <CardTitle className="text-xs md:text-sm font-medium">{review.name}</CardTitle>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-2.5 h-2.5 md:w-3 md:h-3 ${i < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/20'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <time className="text-[8px] md:text-[10px] text-muted-foreground tracking-widest uppercase">
                              {review.created_at ? format(new Date(review.created_at), 'MMM d, yyyy') : ''}
                            </time>
                          </CardHeader>
                          <CardContent className="p-4 md:p-6 pt-2">
                            <p className="text-xs md:text-sm text-foreground/70 font-light italic leading-relaxed">
                              "{review.comment}"
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : reviews.length > 0 ? (
                <div className="text-center py-10 md:py-12 border border-dashed border-border/30 rounded-2xl">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-light tracking-widest italic px-6">
                    Visitors have shared their ratings above, but the silence here awaits a written impression.
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 md:py-12 border border-dashed border-border/30 rounded-2xl">
                  <p className="text-[10px] md:text-xs text-muted-foreground font-light tracking-widest italic">
                    The silence here awaits your impression.
                  </p>
                </div>
              )}
            </div>
          </section>
        </motion.div>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-center opacity-30 mt-12 md:mt-20">
        <p className="text-[8px] md:text-[10px] tracking-[0.5em] uppercase">Rukshar's Archive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
