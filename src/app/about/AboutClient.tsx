"use client";

import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Instagram, Mail, BookOpen, PenTool, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function AboutClient() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-6 py-20 md:py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-20 md:space-y-24"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="space-y-6 text-center">
            <h1 className="text-5xl md:text-8xl font-headline tracking-tight">The Archive</h1>
            <p className="text-primary tracking-[0.3em] uppercase text-[10px] md:text-xs font-light">A Sanctuary for Narrative Verse</p>
          </motion.header>

          {/* Profile Identity */}
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-transparent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-2 border-border/50 p-1.5 bg-background relative">
                <AvatarImage 
                  src="https://amkkbzjblsuzruzyurfc.supabase.co/storage/v1/object/public/profile-image/rukshar_pfp.jpeg" 
                  alt="Rukshar" 
                  className="rounded-full object-cover"
                />
                <AvatarFallback className="bg-muted text-primary text-2xl">R</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-3xl md:text-4xl font-headline tracking-tight">Rukshar</h3>
              <p className="text-[10px] tracking-[0.4em] uppercase text-primary/60 font-medium">Poet & Storyteller</p>
            </div>
          </motion.div>

          {/* About Rukshar */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 text-primary/60">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium">About Rukshar</h2>
            </div>
            <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-muted-foreground">
              <p>
                <span className="text-foreground font-medium italic">Rukshar</span> is the literary identity through which these verses find their voice. It is a persona born from the quiet moments between observation and reflection, serving as a vessel for stories that often go unheard.
              </p>
              <p>
                Behind this pen name is <span className="text-foreground font-medium">Subhom Ghosh</span>, a writer dedicated to the art of preserving fragments of memory and human experience through the rhythmic architecture of poetry.
              </p>
            </div>
          </motion.section>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* Why This Archive Exists */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 text-primary/60">
              <BookOpen className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium">The Purpose</h2>
            </div>
            <div className="space-y-6 text-lg md:text-xl font-light leading-relaxed text-muted-foreground">
              <p>
                Rukshar's Archive was established as a digital sanctuary—a place where poems are not just posted, but preserved. In an age of fleeting content, this archive exists to build a growing literary collection that invites readers to slow down.
              </p>
              <p>
                It is a bridge between the word and the reader, designed to foster a deep connection through shared stories, raw emotions, and the timeless resonance of the poetic form.
              </p>
            </div>
          </motion.section>

          <Separator className="bg-border/30 max-w-[100px] mx-auto" />

          {/* Writing Philosophy */}
          <motion.section variants={itemVariants} className="space-y-8">
            <div className="flex items-center gap-4 text-primary/60">
              <PenTool className="w-4 h-4" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-medium">Philosophy</h2>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl md:text-4xl font-headline italic">Ordinary Storytellers</h3>
              <p className="text-lg md:text-xl font-light leading-relaxed text-muted-foreground">
                My work is rooted in narrative poetry. I believe that ordinary objects, overlooked places, and the silent elements of nature are the truest storytellers. They carry our memories, witness our most intimate relationships, and silently reveal how time transforms our souls.
              </p>
            </div>
          </motion.section>

          {/* Contact Details Only */}
          <motion.section variants={itemVariants} className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-headline">Connect with the Words</h2>
              <p className="text-sm text-muted-foreground font-light">For inquiries, collaborations, or shared reflections.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <a 
                href="https://instagram.com/seventhsky._" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-6 rounded-2xl border border-border/50 bg-card/20 hover:border-primary/30 transition-all duration-500"
              >
                <div className="flex items-center gap-4">
                  <Instagram className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-light tracking-wide">@seventhsky._</span>
                </div>
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </a>
              
              <a 
                href="mailto:subhomghosh06@gmail.com"
                className="group flex items-center justify-between p-6 rounded-2xl border border-border/50 bg-card/20 hover:border-primary/30 transition-all duration-500"
              >
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-light tracking-wide">subhomghosh06@gmail.com</span>
                </div>
                <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
              </a>
            </div>
          </motion.section>

          {/* Closing Note */}
          <motion.section variants={itemVariants} className="pt-20 text-center space-y-8">
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent w-full" />
            <p className="font-headline italic text-xl md:text-3xl text-foreground/80 max-w-none mx-auto leading-relaxed whitespace-nowrap">
              "I do not write about objects. I write about the lives they witness."
            </p>
            <p className="text-[10px] tracking-[0.5em] uppercase text-muted-foreground/50">— Rukshar</p>
          </motion.section>

        </motion.div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 md:py-20 text-center opacity-30">
        <p className="text-[8px] md:text-[10px] tracking-[0.5em] uppercase text-muted-foreground">Rukshar's Archive &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
