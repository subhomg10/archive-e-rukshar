export type Theme = 'Love' | 'Nature' | 'Solitude' | 'Time' | 'Memory' | 'Identity';

export interface Poem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  theme: Theme;
  publishedAt: string;
  isFeatured?: boolean;
}
