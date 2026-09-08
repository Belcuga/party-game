'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Skull } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { WastedPrompt } from '@/app/types/wastedPrompt';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#ef4444';

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function GetWastedPage() {
  return (
    <Suspense fallback={null}>
      <GetWastedPageInner />
    </Suspense>
  );
}

function GetWastedPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { players } = useGame();

  const [pool, setPool] = useState<WastedPrompt[]>([]);
  const usedIds = useRef<number[]>([]);
  const startedRef = useRef(false);

  const [roundPlayersLeft, setRoundPlayersLeft] = useState<string[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<WastedPrompt | null>(null);

  function pickPrompt(sourcePool: WastedPrompt[]): WastedPrompt | null {
    let candidates = sourcePool.filter((p) => !usedIds.current.includes(p.id));
    if (candidates.length === 0) {
      candidates = sourcePool;
      usedIds.current = [];
    }
    if (candidates.length === 0) return null;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    usedIds.current = [...usedIds.current, picked.id];
    return picked;
  }

  function startTurn(playersLeft: string[], sourcePool: WastedPrompt[]) {
    if (playersLeft.length === 0) return;
    const nextPlayer = playersLeft[Math.floor(Math.random() * playersLeft.length)];
    setCurrentPlayerId(nextPlayer);
    setCurrentPrompt(pickPrompt(sourcePool));
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, WastedPrompt>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('wasted_prompts')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch prompts:', error.message);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as WastedPrompt[]).forEach((p) => map.set(p.id, p));
          from += pageSize;
        } else {
          moreData = false;
        }
      }

      if (cancelled) return;
      const all = Array.from(map.values());
      setPool(spicy ? all : all.filter((p) => !p.dirty));
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pool.length > 0 && !startedRef.current) {
      startedRef.current = true;
      const initialPlayers = shuffleArray(players.map((p) => p.id));
      setRoundPlayersLeft(initialPlayers);
      startTurn(initialPlayers, pool);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool]);

  function handleNext() {
    if (!currentPlayerId) return;
    const remaining = roundPlayersLeft.filter((id) => id !== currentPlayerId);
    const nextPlayersLeft = remaining.length > 0 ? remaining : shuffleArray(players.map((p) => p.id));

    setRoundPlayersLeft(nextPlayersLeft);
    startTurn(nextPlayersLeft, pool);
  }

  if (players.length < 2) return null;

  const currentPlayer = players.find((p) => p.id === currentPlayerId);

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

          <div className="flex items-center gap-3">
            <HowToPlayButton
              modeName="Get Wasted"
              color={MODE_COLOR}
              description="Each turn, everyone gets a prompt - some are solo, some tell you to pick someone else at the table. Either way, drinking isn't optional here. No answering out of it."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0">
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0"
              style={{ borderColor: MODE_COLOR, boxShadow: `0 0 28px ${MODE_COLOR}55` }}
            >
              <Skull className="w-6 h-6" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
            </div>

            {currentPlayer && (
              <p className="text-base text-white/70">
                <span className="text-xl font-extrabold text-white">{currentPlayer.name}</span>, it&apos;s your turn
              </p>
            )}

            <div
              key={currentPrompt?.id}
              className="max-w-md"
              style={{ animation: 'statPopIn 0.4s ease-out' }}
            >
              <p className="text-2xl sm:text-3xl font-extrabold leading-snug">
                {currentPrompt?.text ?? 'Loading…'}
              </p>
            </div>
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              Done - Next
            </button>
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
