import { fetchPoemById } from '@/lib/supabase-client';
import { PoemClient } from './PoemClient';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = (await params).id;
  const poem = await fetchPoemById(id);

  if (!poem) {
    return {
      title: 'Poem Not Found',
    };
  }

  const description = poem.description || `Read "${poem.title}" by ${poem.author} on Rukshar's Archive.`;
  const siteName = "Rukshar's Archive";

  return {
    title: poem.title,
    description: description,
    openGraph: {
      title: poem.title,
      description: description,
      type: 'article',
      siteName: siteName,
      authors: [poem.author],
      tags: [poem.theme, poem.emotional_engine].filter(Boolean) as string[],
    },
    twitter: {
      card: 'summary_large_image',
      title: poem.title,
      description: description,
    },
  };
}

export default async function PoemPage({ params }: Props) {
  const id = (await params).id;
  const poem = await fetchPoemById(id);

  if (!poem) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": poem.title,
    "author": {
      "@type": "Person",
      "name": poem.author
    },
    "genre": "Poetry",
    "description": poem.description,
    "keywords": `${poem.theme}, ${poem.emotional_engine || ''}`,
    "datePublished": poem.date
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PoemClient initialPoem={poem} />
    </>
  );
}
