'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, HeartHandshake } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { WingmanPrompt } from '@/app/types/wingmanPrompt';
import { fillTemplate } from '@/app/lib/gameMessages';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import { usePersistedState } from '@/app/lib/usePersistedState';
import { glowStyle, GLOW_CLASSES } from '@/app/lib/glow';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#f472b6';
const SESSION_KEY = 'tipsy:session:wingman';

type WingmanSession = {
  roundPlayersLeft: string[];
  currentPlayerId: string | null;
  currentText: string;
  usedIds: number[];
};

const EMPTY_SESSION: WingmanSession = {
  roundPlayersLeft: [],
  currentPlayerId: null,
  currentText: '',
  usedIds: [],
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function WingmanPage() {
  return (
    <Suspense fallback={null}>
      <WingmanPageInner />
    </Suspense>
  );
}

function WingmanPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { players } = useGame();

  const [pool, setPool] = useState<WingmanPrompt[]>([]);
  const startedRef = useRef(false);

  const [session, setSession, sessionHydrated] = usePersistedState<WingmanSession>(SESSION_KEY, EMPTY_SESSION);

  function pickPrompt(sourcePool: WingmanPrompt[], currentUsedIds: number[]): { prompt: WingmanPrompt | null; usedIds: number[] } {
    let candidates = sourcePool.filter((p) => !currentUsedIds.includes(p.id));
    let usedIds = currentUsedIds;
    if (candidates.length === 0) {
      candidates = sourcePool;
      usedIds = [];
    }
    if (candidates.length === 0) return { prompt: null, usedIds };
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { prompt: picked, usedIds: [...usedIds, picked.id] };
  }

  function startTurn(playersLeft: string[], sourcePool: WingmanPrompt[], currentUsedIds: number[]) {
    if (playersLeft.length === 0) return;
    const nextPlayerId = playersLeft[Math.floor(Math.random() * playersLeft.length)];
    const nextPlayer = players.find((p) => p.id === nextPlayerId);

    const { prompt, usedIds: nextUsedIds } = pickPrompt(sourcePool, currentUsedIds);
    if (!prompt || !nextPlayer) {
      setSession({ roundPlayersLeft: playersLeft, currentPlayerId: nextPlayerId, currentText: '', usedIds: nextUsedIds });
      return;
    }

    const vars: Record<string, string> = { player: nextPlayer.name };
    if (prompt.text.includes('{other}')) {
      const others = players.filter((p) => p.id !== nextPlayerId);
      const other = others[Math.floor(Math.random() * others.length)];
      vars.other = other?.name ?? '';
    }
    setSession({ roundPlayersLeft: playersLeft, currentPlayerId: nextPlayerId, currentText: fillTemplate(prompt.text, vars), usedIds: nextUsedIds });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, WingmanPrompt>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('wingman_prompts')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch prompts:', error.message);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as WingmanPrompt[]).forEach((p) => map.set(p.id, p));
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
    if (pool.length === 0 || startedRef.current || !sessionHydrated) return;
    startedRef.current = true;

    const resumablePlayer = session.currentPlayerId && players.some((p) => p.id === session.currentPlayerId);
    if (resumablePlayer && session.currentText) return;

    const initialPlayers = shuffleArray(players.map((p) => p.id));
    startTurn(initialPlayers, pool, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, sessionHydrated]);

  function handleNext() {
    if (!session.currentPlayerId) return;
    const remaining = session.roundPlayersLeft.filter((id) => id !== session.currentPlayerId);
    const nextPlayersLeft = remaining.length > 0 ? remaining : shuffleArray(players.map((p) => p.id));

    startTurn(nextPlayersLeft, pool, session.usedIds);
  }

  if (players.length < 2) return null;

  const currentText = session.currentText;

  return (
    <AdsLayout>
      <main className="flex flex-col items-center h-full">
        <div className="w-full flex items-center justify-between px-6 mb-6 max-lg:landscape:mb-2 flex-shrink-0">
          <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-300 cursor-pointer">
            <ArrowLeft />
          </button>

          <div className="flex items-center gap-2">
            <Logo />
            <h1 className="text-2xl sm:text-4xl max-lg:landscape:text-lg font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>

          <div className="flex items-center gap-3">
            <HowToPlayButton
              modeName="Wingman"
              color={MODE_COLOR}
              description="Each turn, everyone gets a prompt. Sometimes you'll pair up two other players, sometimes the app pairs you with someone, and sometimes you pick who you're paired with. Not feeling it? Take a sip instead - no pressure."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0 max-lg:landscape:max-w-xl max-lg:landscape:py-0">
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5 max-lg:landscape:gap-2.5 overflow-y-auto">
            <div
              className={`w-14 h-14 max-lg:landscape:w-11 max-lg:landscape:h-11 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
              style={glowStyle(MODE_COLOR)}
            >
              <HeartHandshake className="w-6 h-6 max-lg:landscape:w-5 max-lg:landscape:h-5" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
            </div>

            <div className="max-w-md" style={{ animation: 'statPopIn 0.4s ease-out' }}>
              <p className="text-2xl sm:text-3xl max-lg:landscape:text-xl font-extrabold leading-snug">
                {currentText || 'Loading…'}
              </p>
            </div>
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2 max-lg:landscape:pb-2 max-lg:landscape:pt-1">
            <button
              onClick={handleNext}
              className="w-full py-4 max-lg:landscape:py-2.5 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
            >
              Done - Next
            </button>
            <button
              onClick={handleNext}
              className="w-full text-center text-xs text-white/40 hover:text-white/70 mt-3 max-lg:landscape:mt-1.5 cursor-pointer underline"
            >
              Not feeling it? Take a sip instead.
            </button>
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
