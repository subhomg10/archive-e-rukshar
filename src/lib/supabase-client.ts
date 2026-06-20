import { Poem, Theme } from './types';

const MOCK_POEMS: Poem[] = [
  {
    id: '1',
    title: 'The Silent Watch',
    excerpt: 'Between the stars and the shadow of the hill, the world remains remarkably still...',
    content: `Between the stars and the shadow of the hill,
the world remains remarkably still.
A quiet heart, a heavy mind,
seeking truths we yet must find.

In every breath, a story told,
of ancient wisdom, centuries old.
The wind whispers through the pines,
drawing secrets in fragile lines.`,
    author: 'Rukshar',
    theme: 'Solitude',
    publishedAt: '2024-02-20',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Echoes of Spring',
    excerpt: 'A delicate dance of petals on the breeze, returning life to the dormant trees...',
    content: `A delicate dance of petals on the breeze,
returning life to the dormant trees.
The river hums a melody of old,
as winter sheds its layers of cold.

Gold light spills upon the grass,
as the seasons slowly pass.
Every bloom a tiny flame,
whispering spring's eternal name.`,
    author: 'Rukshar',
    theme: 'Nature',
    publishedAt: '2024-03-15',
    isFeatured: true,
  },
  {
    id: '3',
    title: 'Fragmented Memory',
    excerpt: 'Like dust motes in a beam of light, the past flickers then fades into night...',
    content: `Like dust motes in a beam of light,
the past flickers then fades into night.
A face partially hidden, a song half-sung,
the bells of yesterday, softly rung.

We hold the threads of what was once,
lost in the rhythm of the months.
Time is a weaver, silent and deep,
crafting the promises we couldn't keep.`,
    author: 'Rukshar',
    theme: 'Memory',
    publishedAt: '2024-01-10',
  },
  {
    id: '4',
    title: 'The Unspoken Hour',
    excerpt: 'When words fail and only silence speaks, finding the solace every wanderer seeks...',
    content: `When words fail and only silence speaks,
finding the solace every wanderer seeks.
The ink is dry, the page is white,
waiting for the morning light.

In the hollow of the dark,
we search for a singular spark.
To define the undefined,
in the sanctuary of the mind.`,
    author: 'Rukshar',
    theme: 'Identity',
    publishedAt: '2024-04-01',
  }
];

export const fetchPoems = async (filter?: { theme?: Theme; search?: string }): Promise<Poem[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  let poems = [...MOCK_POEMS];
  
  if (filter?.theme) {
    poems = poems.filter(p => p.theme === filter.theme);
  }
  
  if (filter?.search) {
    const search = filter.search.toLowerCase();
    poems = poems.filter(p => 
      p.title.toLowerCase().includes(search) || 
      p.excerpt.toLowerCase().includes(search)
    );
  }
  
  return poems;
};

export const fetchPoemById = async (id: string): Promise<Poem | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_POEMS.find(p => p.id === id) || null;
};
