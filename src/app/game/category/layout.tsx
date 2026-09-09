import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Category Countdown',
  alternates: { canonical: '/game/category' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
