import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Wingman',
  alternates: { canonical: '/game/wingman' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function WingmanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
