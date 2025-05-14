'use client';

import { useGame } from "@/app/providers/GameContext";
import GlobalLoader from "../ui/GlobalLoader";

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useGame();
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white flex justify-center overflow-hidden">
      {/* Ads and dark background: only on lg+ */}
      {/* <div className="hidden lg:flex fixed left-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Left Ad
        </div>
      </div>
      <div className="hidden lg:flex fixed right-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Right Ad
        </div>
      </div>
      <div className="hidden lg:flex fixed top-4 left-1/2 transform -translate-x-1/2 w-[728px] h-[90px] z-20">
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center shadow-xl rounded">
          Top Ad
        </div>
      </div>
      <div className="hidden lg:flex fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[728px] h-[90px] z-20">
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center shadow-xl rounded">
          Bottom Ad
        </div>
      </div> */}

      {/* Main content box: lg+ version with wrapper */}
      <div className="hidden lg:flex w-full justify-center px-[88px] py-[120px]">
        <div className="relative bg-[#1b003c] backdrop-blur-sm border border-[#ffffff10] shadow-[0_0_20px_rgba(157,23,77,0.2)] rounded-[24px] p-6 w-[728px] h-[calc(100vh-240px)] flex flex-col animate-fadeIn overflow-hidden">
          {loading && <GlobalLoader />}
          {!loading && <>{children}</>}
        </div>
      </div>

      {/* Mobile view - direct content with background */}
      <div className="lg:hidden w-full h-screen flex justify-center items-center overflow-hidden">
        <div className="bg-[#2D0B45] backdrop-blur-sm border border-[#ffffff10] sm:rounded-[24px] shadow-inner p-4 w-full max-w-[420px] h-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Background animated particles or glow effect placeholder */}
      <div className="absolute inset-0 -z-10 animate-backgroundGlow bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#ff00cc44] via-transparent to-transparent"></div>
    </div>
  );
}