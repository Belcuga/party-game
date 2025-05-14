'use client';

import { useGame } from "@/app/providers/GameContext";
import GlobalLoader from "../ui/GlobalLoader";

export default function AdsLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useGame();
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1a0142] via-[#2a064e] to-[#4b0c5e] text-white flex justify-center overflow-hidden">
      {/* Ads and dark background: only on lg+ */}
      <div className="hidden lg:flex fixed left-4 top-0 h-screen w-[160px] items-center justify-center z-10">
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
      </div>

      {/* Main content box: lg+ version with wrapper */}
      <div className="hidden lg:flex z-0 w-full justify-center px-[88px] pt-[130px] pb-[130px]">
        <div className="relative bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_0_30px_#ff00cc66] rounded-2xl p-6 w-[728px] min-h-[calc(100vh-300px)] flex flex-col animate-fadeIn">
          {loading && <GlobalLoader />}
          {!loading && <>{children}</>}
        </div>
      </div>

      {/* Mobile view - direct content with background */}
      <div className="lg:hidden w-full px-4 py-6">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-inner p-4">
          {children}
        </div>
      </div>

      {/* Background animated particles or glow effect placeholder */}
      <div className="absolute inset-0 -z-10 animate-backgroundGlow bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#ff00cc44] via-transparent to-transparent"></div>
    </div>
  );
}