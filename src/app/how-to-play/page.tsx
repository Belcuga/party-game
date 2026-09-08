'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import Logo from '@/app/components/ui/logo';
import { GAME_MODES } from '@/app/components/game/ModeSelect';

export default function HowToPlayPage() {
  const router = useRouter();

  return (
    <AdsLayout>
      <main className="flex flex-col items-center h-full">
        <div className="w-full flex items-center justify-between px-6 mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-300 cursor-pointer">
            <ArrowLeft />
          </button>
          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl sm:text-4xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>
          <div className="w-6" />
        </div>

        <div className="w-full max-w-md flex-1 min-h-0 overflow-y-auto px-4 pb-6">
          <div className="text-center mb-5">
            <h2 className="text-xl font-semibold">How to Play</h2>
            <p className="text-sm text-white/60 mt-1">A quick rundown of every mode.</p>
          </div>

          <ul className="space-y-2">
            {GAME_MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <li
                  key={mode.id}
                  className="flex items-start gap-3 p-3 rounded-2xl border bg-white/5"
                  style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border bg-white/5"
                    style={{ borderColor: mode.color }}
                  >
                    <Icon className="w-5 h-5" style={{ color: mode.color }} strokeWidth={1.8} />
                  </span>
                  <span className="flex-1 min-w-0 pt-0.5">
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{mode.name}</span>
                      {mode.comingSoon && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
                          Coming Soon
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-white/60 mt-1 leading-relaxed">
                      {mode.howToPlay ?? mode.tagline}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </AdsLayout>
  );
}
