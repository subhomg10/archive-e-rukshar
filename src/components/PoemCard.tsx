"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Poem } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Star, Heart } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PoemCardProps {
  poem: Poem;
  index: number;
}

export function PoemCard({ poem, index }: PoemCardProps) {
  // Split the themes into individual entries
  const themes = poem.theme ? poem.theme.split(/[|,]+/).map(t => t.trim()).filter(Boolean) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1] 
      }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Link href={`/poem/${poem.id}`}>
        <Card className="h-full bg-card/40 border-border/40 overflow-hidden transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_0_20px_-5px_rgba(201,178,143,0.1)] group-hover:bg-card/60">
          <CardHeader className="p-6">
            <div className="flex flex-col gap-4 mb-2">
              <div className="flex justify-between items-start gap-4">
                <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                  {themes.map((theme, i) => (
                    <Badge 
                      key={i}
                      variant="outline" 
                      className="text-[10px] uppercase tracking-widest border-primary/20 text-primary/80 font-normal py-0.5 px-2 w-fit whitespace-nowrap"
                    >
                      {theme}
                    </Badge>
                  ))}
                  {poem.featured && (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary font-normal py-0.5 border-none shrink-0 px-2 w-fit">
                      <Star className="w-2.5 h-2.5 mr-1 fill-primary" />
                      Featured
                    </Badge>
                  )}
                  {poem.favorite && (
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary font-normal py-0.5 shrink-0 px-2 w-fit cursor-default border-none">
                            <Heart className="w-2.5 h-2.5 mr-1 fill-current" />
                            Author's Favorite
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card text-foreground border-border/50 text-[10px] tracking-widest uppercase py-2">
                          One of the author's most cherished poems
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-widest font-body shrink-0 whitespace-nowrap mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {poem.date}
                </div>
              </div>
            </div>
            <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors duration-300 leading-tight">
              {poem.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6 italic">
              {poem.description}
            </p>
            <div className="flex items-center text-primary text-xs font-medium tracking-wide opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
              Read Poem <ArrowRight className="w-3 h-3 ml-2" />
            </div>
          </CardContent>
          <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </Card>
      </Link>
    </motion.div>
  );
}
