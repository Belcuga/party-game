'use client';

import { useGame } from "@/app/providers/GameContext";
import GlobalLoader from "../ui/GlobalLoader";
import { useEffect, useState } from "react";
import { MessageSquarePlus, MessageCircleQuestion } from "lucide-react";
import FeedbackModal from "../ui/FeedbackModal";
import SuggestQuestionModal from "../ui/SuggestQuestionModal";

type Props = {
  children: React.ReactNode;
  /** Mode-select and player setup aren't laid out for a short landscape viewport (labels
   *  overlap), so those screens force portrait. Once a mode actually starts, its own page
   *  doesn't pass this and landscape is allowed. */
  lockPortrait?: boolean;
};

export default function AdsLayout({ children, lockPortrait = false }: Props) {
  const { loading } = useGame();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (!lockPortrait) return;

    const handleOrientation = () => {
      const isNowLandscape = window.matchMedia("(orientation: landscape)").matches;
      const isMobile = window.innerWidth < 1024;
      setIsLandscape(isNowLandscape && isMobile);
    };

    handleOrientation();
    window.addEventListener("resize", handleOrientation);
    window.addEventListener("orientationchange", handleOrientation);

    return () => {
      window.removeEventListener("resize", handleOrientation);
      window.removeEventListener("orientationchange", handleOrientation);
    };
  }, [lockPortrait]);

  return (

    <div className="relative min-h-screen bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white flex justify-center overflow-hidden">
      {lockPortrait && isLandscape && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white text-xl text-center px-8 flex flex-col items-center justify-center gap-3">
          <span className="text-4xl">📱</span>
          Rotate back to portrait to pick a mode and add players.
        </div>
      )}
      {/* Ads and dark background: only on lg+ - hidden for now, keep markup for when ads go live */}
      <div className="hidden fixed left-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Left Ad
        </div>
      </div>
      <div className="hidden fixed right-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Right Ad
        </div>
      </div>

      {/* App store badges: only on lg+, bottom-left corner. Not live yet, so each is stamped Coming Soon. */}
      <div className="hidden lg:flex fixed left-4 bottom-4 z-10 flex-row items-center gap-3">
        <div className="relative rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/app-store-badge.png" alt="Coming soon on the App Store" className="w-[180px] h-auto block" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <span className="text-xs font-bold uppercase tracking-wide text-white">Coming Soon</span>
          </div>
        </div>
        <div className="relative rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/google-play-badge.png" alt="Coming soon on Google Play" className="w-[180px] h-auto block" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <span className="text-xs font-bold uppercase tracking-wide text-white">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Feedback + suggestion buttons: only on lg+, bottom-right corner (mobile gets them via the Settings menu). */}
      <div className="hidden lg:flex fixed right-4 bottom-4 z-10 flex-row items-center gap-3">
        <button
          onClick={() => setSuggestOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#1b003c] border border-[#ffffff20] shadow-[0_0_20px_rgba(157,23,77,0.25)] hover:bg-[#3b1b5e] transition-colors cursor-pointer text-white font-semibold text-sm"
        >
          <MessageCircleQuestion className="w-4 h-4" />
          Suggest a Question
        </button>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#1b003c] border border-[#ffffff20] shadow-[0_0_20px_rgba(157,23,77,0.25)] hover:bg-[#3b1b5e] transition-colors cursor-pointer text-white font-semibold text-sm"
        >
          <MessageSquarePlus className="w-4 h-4" />
          Send Feedback
        </button>
      </div>
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <SuggestQuestionModal isOpen={suggestOpen} onClose={() => setSuggestOpen(false)} />

      {/* Main content box: lg+ version with wrapper */}
      <div className="hidden lg:flex w-full justify-center px-[88px] py-6">
        <div className="relative bg-[#1b003c] backdrop-blur-sm border border-[#ffffff10] shadow-[0_0_20px_rgba(157,23,77,0.2)] rounded-[24px] p-6 w-[860px] h-[calc(100vh-48px)] flex flex-col animate-fadeIn overflow-hidden">
          {loading && <GlobalLoader />}
          {!loading && <>{children}</>}
        </div>
      </div>

      {/* Mobile view - direct content with background. Fixed to the viewport height so it also
          works in landscape; the inner panel scrolls instead of clipping when content runs tall. */}
      <div className="lg:hidden w-full h-[100dvh] flex justify-center items-center overflow-hidden">
        <div className="backdrop-blur-sm border border-[#ffffff10] sm:rounded-[24px] shadow-inner p-4 w-full h-full overflow-y-auto" style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}>
          {loading && <GlobalLoader />}
          {!loading && <>{children}</>}
        </div>
      </div>

      {/* Background animated particles or glow effect placeholder */}
      <div className="absolute inset-0 -z-10 animate-backgroundGlow bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#ff00cc44] via-transparent to-transparent"></div>
    </div>
  );
}