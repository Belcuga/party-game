import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "./providers/GameContext";
import Script from "next/script";

export const metadata: Metadata = {
  title: 'Tipsy Trials',
  description: 'Get the party started with Tipsy Trials — a hilarious, chaotic drinking party game for friends.',
  keywords: ['party game', 'drinking game', 'friends', 'fun', 'questions', 'challenges', 'tipsy', 'trials'],
  icons: { icon: '/favicon.ico' },
  metadataBase: new URL('https://tipsytrials.com'),
  openGraph: {
    title: 'Tipsy Trials',
    description: 'Hilarious challenges. Ridiculous questions. The perfect way to get the party going.',
    url: 'https://tipsytrials.com',
    siteName: 'Tipsy Trials',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tipsy Trials Game Banner' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tipsy Trials - The Ultimate Party Game',
    description: 'Play the ultimate party game with your friends.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true, nocache: false },
  themeColor: '#0f172a',
  alternates: { canonical: 'https://tipsytrials.com' },
  other: { viewport: 'width=device-width, initial-scale=1' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Tipsy Trials",
    "url": "https://tipsytrials.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://tipsytrials.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KJVJ6BZL');
          `}
        </Script>
        
        {/* Optional: Remove this if GA4 is configured in GTM */}
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=G-HCHCCKG80B`} />
        <Script
          id="ga4-config"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-HCHCCKG80B');
            `
          }}
        />
        
        <link rel="canonical" href="https://tipsytrials.com" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Get the party started with Tipsy Trials — a hilarious, chaotic drinking party game for friends." />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </head>
      <body className="bg-gradient-to-br from-blue-950 to-blue-900 text-white">
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KJVJ6BZL"
            height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
        </noscript>
        <GameProvider>
          <main>{children}</main>
        </GameProvider>
      </body>
    </html>
  );
}
