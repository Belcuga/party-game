import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Play',
  description: 'Add your players and pick a mode - Classic Trials, Never Have I Ever, Most Likely To, Truth or Dare, Category Countdown, Get Wasted, Wingman or Bonding - to start your Tipsy Trials party.',
  alternates: { canonical: '/game' },
  openGraph: {
    title: 'Play Tipsy Trials',
    description: 'Add your players and pick a mode to start your party.',
    url: '/game',
  },
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
