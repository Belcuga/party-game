import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Privacy Policy (Website)',
  description: 'Privacy policy for the Tipsy Trials website: what information we collect, how we collect it, and how it is used.',
  alternates: { canonical: '/policy-web' },
  openGraph: {
    title: 'Privacy Policy | Tipsy Trials',
    description: 'The Tipsy Trials website privacy policy.',
    url: '/policy-web',
  },
};

export default function PolicyWebLayout({ children }: { children: React.ReactNode }) {
  return children;
}
