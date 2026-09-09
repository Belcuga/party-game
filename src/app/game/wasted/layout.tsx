import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Get Wasted',
  alternates: { canonical: '/game/wasted' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function WastedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
