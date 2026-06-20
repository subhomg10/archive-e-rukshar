import { Metadata } from 'next';
import StatisticsClient from './StatisticsClient';

export const metadata: Metadata = {
  title: "Archive Statistics",
  description: "Explore the numbers behind the silence. A detailed look at the growth and resonance of Rukshar's Archive.",
};

export default function StatisticsPage() {
  return <StatisticsClient />;
}
