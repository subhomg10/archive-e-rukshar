export interface Poem {
  id: string;
  title: string;
  theme: string;
  date: string;
  author: string;
  featured: boolean;
  roman: string;
  hindi?: string | null;
  urdu?: string | null;
  description: string;
  emotional_engine?: string | null;
}
