import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Privacy Policy (App)',
  description: "Tipsy Trials mobile app privacy policy: what information we do and don't collect, and how the app handles your data.",
  alternates: { canonical: '/policy' },
  openGraph: {
    title: 'Privacy Policy | Tipsy Trials',
    description: "The Tipsy Trials app's privacy policy.",
    url: '/policy',
  },
};

export default function PolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
