import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'How to Play',
  description: 'Learn the rules for every Tipsy Trials mode - Classic Trials, Never Have I Ever, Most Likely To, Truth or Dare, Category Countdown, Get Wasted, Wingman and Bonding.',
  alternates: { canonical: '/how-to-play' },
  openGraph: {
    title: 'How to Play | Tipsy Trials',
    description: 'A quick rundown of every Tipsy Trials game mode before you start your party.',
    url: '/how-to-play',
  },
};

export default function HowToPlayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
