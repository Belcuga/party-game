import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "./providers/GameContext";

export const metadata: Metadata = {
  title: 'Tipsy Trials',
  description: 'Get the party started with Tipsy Trials — a hilarious, chaotic drinking party game for friends.',
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ['party game', 'drinking game', 'friends', 'fun', 'questions', 'challenges', 'tipsy', 'trials'],
  metadataBase: new URL('https://tipsytrials.com'),
  openGraph: {
    title: 'Tipsy Trials',
    description: 'Hilarious challenges. Ridiculous questions. The perfect way to get the party going.',
    url: 'https://tipsytrials.com',
    siteName: 'Tipsy Trials',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tipsy Trials Game Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tipsy Trials - The Ultimate Party Game',
    description: 'Play the ultimate party game with your friends.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-950 to-blue-900 text-white">
        <GameProvider>
          <main>{children}</main>
        </GameProvider>
      </body>
    </html>
  );
}
