import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Play',
  alternates: { canonical: '/game' },
  // This is the live Classic Trials gameplay screen - it renders blank without an
  // active gameState from the home page roster/mode setup, so it's not a useful
  // standalone landing page.
  robots: { index: false, follow: true },
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return children;
}
