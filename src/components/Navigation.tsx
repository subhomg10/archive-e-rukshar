"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Home', path: '/archive' },
  { name: 'Stats', path: '/statistics' },
  { name: 'About', path: '/about' },
];

export function Navigation() {
  const pathname = usePathname();

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
        </ul>
      </div>
    </nav>
  );
}
