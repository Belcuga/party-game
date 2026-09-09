import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Most Likely To',
  alternates: { canonical: '/game/mostlikely' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function MostLikelyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
