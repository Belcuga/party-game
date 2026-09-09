import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Bonding',
  alternates: { canonical: '/game/bonding' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function BondingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
