
import { Metadata } from 'next';
import { AboutClient } from './AboutClient';

export const metadata: Metadata = {
  title: "About the Archive",
  description: "Discover the vision behind Rukshar's Archive. Learn about the poet, the writing philosophy, and why this sanctuary for narrative poetry exists.",
};

export default function AboutPage() {
  return <AboutClient />;
}
