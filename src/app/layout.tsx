import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: "Rukshar's Archive | A Sanctuary for Poetry",
    template: "%s | Rukshar's Archive"
  },
  description: 'An elegant, minimalist archive for long-form poetry and literary insights. Curating the unspoken through verses of resonance.',
  keywords: ['poetry', 'archive', 'literature', 'poems', 'hindi poetry', 'urdu poetry', 'literary analysis'],
  authors: [{ name: "Rukshar" }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rukshars-archive.vercel.app',
    siteName: "Rukshar's Archive",
    title: "Rukshar's Archive | A Poetry Collection",
    description: 'A sanctuary for poetry, where every verse finds its home in the silence of the page.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Rukshar's Archive",
    description: 'An elegant, minimalist archive for long-form poetry.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Rukshar's Archive",
              "description": "An elegant, minimalist archive for long-form poetry and literary insights.",
              "url": "https://rukshars-archive.vercel.app"
            })
          }}
        />
      </head>
      <body className="font-body antialiased selection:bg-primary/20 selection:text-primary">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
