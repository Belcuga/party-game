import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Never Have I Ever',
  alternates: { canonical: '/game/never' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function NeverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
