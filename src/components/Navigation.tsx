"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Instagram, Mail, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { name: 'Home', path: '/archive' },
  { name: 'Stats', path: '/statistics' },
  { name: 'About', path: '/about' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full premium-blur border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        <Link 
          href="/" 
          className="font-headline text-lg sm:text-xl tracking-wide text-primary hover:opacity-80 transition-opacity truncate shrink-0"
        >
          Rukshar's Archive
        </Link>
        
        <ul className="flex gap-4 sm:gap-6 md:gap-8 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={cn(
                    "relative py-1 text-xs sm:text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
          
          <li>
            {!mounted ? (
              <span className="relative py-1 text-xs sm:text-sm font-medium text-muted-foreground cursor-pointer">
                Contact
              </span>
            ) : (
              <Popover>
                <PopoverTrigger className="relative py-1 text-xs sm:text-sm font-medium transition-colors hover:text-primary text-muted-foreground whitespace-nowrap outline-none">
                  Contact
                </PopoverTrigger>
                <PopoverContent 
                  align="end" 
                  sideOffset={16}
                  className="w-auto min-w-[200px] p-2 bg-card/95 backdrop-blur-md border-border/50 shadow-2xl rounded-2xl overflow-hidden"
                >
                  <div className="space-y-1">
                    <a 
                      href="https://instagram.com/seventhsky._" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Instagram className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-light tracking-wide">@seventhsky._</span>
                      </div>
                      <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary ml-2" />
                    </a>
                    
                    <a 
                      href="mailto:subhomghosh06@gmail.com"
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-light tracking-wide whitespace-nowrap">subhomghosh06@gmail.com</span>
                      </div>
                      <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary ml-2" />
                    </a>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
