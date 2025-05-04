import type { Metadata } from "next";
import "./globals.css";
import { GameProvider } from "./providers/GameContext";

export const metadata: Metadata = {
  title: "Tipsy Trials",
  description: "A fun party game app",
  icons: {
    icon: '/favicon.ico',
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GameProvider>
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
