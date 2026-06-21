"use client";

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Sparkles, MessageSquare, Layers } from 'lucide-react';

interface Stats {
  totalPoems: number;
  totalThemes: number;
  featuredPoems: number;
  totalReviews: number;
}

interface ArchiveStatsProps {
  stats: Stats;
}

export function ArchiveStats({ stats }: ArchiveStatsProps) {
  const statItems = [
    { 
      label: 'Total Fragments', 
      value: stats.totalPoems, 
      icon: BookOpen,
      color: 'text-primary'
    },
    { 
      label: 'Resonance Themes', 
      value: stats.totalThemes, 
      icon: Layers,
      color: 'text-primary/80'
    },
    { 
      label: 'Featured Echoes', 
      value: stats.featuredPoems, 
      icon: Sparkles,
      color: 'text-primary/70'
    },
    { 
      label: 'Public Impressions', 
      value: stats.totalReviews, 
      icon: MessageSquare,
      color: 'text-primary/60'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.8 }}
        >
          <Card className="bg-card/20 border-border/40 hover:border-primary/20 transition-all duration-500 overflow-hidden group h-full">
            <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center space-y-2 sm:space-y-3">
              <div className={`p-1.5 sm:p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors ${item.color}`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <motion.span 
                  className="text-xl sm:text-2xl md:text-3xl font-headline block"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.5 + index * 0.1 }}
                >
                  {item.value}
                </motion.span>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-light leading-tight block">
                  {item.label}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}