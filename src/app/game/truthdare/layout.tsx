import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Truth or Dare',
  alternates: { canonical: '/game/truthdare' },
  // Requires an active player roster from /game - not a useful standalone landing page.
  robots: { index: false, follow: true },
};

export default function TruthDareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
