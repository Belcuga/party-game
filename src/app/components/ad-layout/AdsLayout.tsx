'use client';

import { ReactNode } from 'react';

export default function AdsLayout({ children }: { children: ReactNode }) {
  return (
     <div className="relative min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-white flex justify-center">

      {/* LEFT Ad Banner */}
      <div className="hidden lg:flex fixed left-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Left Ad
        </div>
      </div>

      {/* RIGHT Ad Banner */}
      <div className="hidden lg:flex fixed right-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Right Ad
        </div>
      </div>

      {/* TOP Ad Banner */}
      <div className="hidden lg:flex fixed top-4 left-1/2 transform -translate-x-1/2 w-[728px] h-[90px] z-20">
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center shadow-xl rounded">
          Top Ad
        </div>
      </div>

      {/* BOTTOM Ad Banner */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[728px] h-[90px] z-20">
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center shadow-xl rounded">
          Bottom Ad
        </div>
      </div>

      {/* Page Content */}
      <div className="z-0 flex items-center justify-center w-full min-h-screen p-8">
      <div className="relative bg-blue-800/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-[728px] h-[680px] flex flex-col justify-between">
        {children}
      </div>
      </div>
    </div>
  );
}