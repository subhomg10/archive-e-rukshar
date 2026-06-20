import { Metadata } from 'next';
import ArchiveClient from './ArchiveClient';

export const metadata: Metadata = {
  title: "Poetry Archive",
  description: "Browse the complete collection of poems in Rukshar's Archive. Filter by resonance and theme to find verses that speak to you.",
};

export default function ArchivePage() {
  return <ArchiveClient />;
}
