'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Timer as TimerIcon, Check } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { CategoryPrompt } from '@/app/types/categoryPrompt';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#2dd4bf';
const URGENT_THRESHOLD = 3;
const SECONDS_PER_ITEM = 2;
const BASE_SECONDS = 6;

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function timeForCount(count: number): number {
  return BASE_SECONDS + count * SECONDS_PER_ITEM;
}

export default function CategoryCountdownPage() {
  return (
    <Suspense fallback={null}>
      <CategoryCountdownPageInner />
    </Suspense>
  );
}

function CategoryCountdownPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { players } = useGame();

  const [pool, setPool] = useState<CategoryPrompt[]>([]);
  const usedIds = useRef<number[]>([]);
  const startedRef = useRef(false);

  const [roundPlayersLeft, setRoundPlayersLeft] = useState<string[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryPrompt | null>(null);
  const [namedCount, setNamedCount] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'active' | 'success' | 'timeup'>('ready');
  const [turnSeconds, setTurnSeconds] = useState(BASE_SECONDS);
  const [secondsLeft, setSecondsLeft] = useState(BASE_SECONDS);

  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function pickCategory(sourcePool: CategoryPrompt[]): CategoryPrompt | null {
    let candidates = sourcePool.filter((c) => !usedIds.current.includes(c.id));
    if (candidates.length === 0) {
      candidates = sourcePool;
      usedIds.current = [];
    }
    if (candidates.length === 0) return null;
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    usedIds.current = [...usedIds.current, picked.id];
    return picked;
  }

  function startTurn(playersLeft: string[], sourcePool: CategoryPrompt[]) {
    if (playersLeft.length === 0) return;
    const nextPlayer = playersLeft[Math.floor(Math.random() * playersLeft.length)];
    const category = pickCategory(sourcePool);
    const duration = category ? timeForCount(category.count) : BASE_SECONDS;

    if (tickTimer.current) clearInterval(tickTimer.current);

    setCurrentPlayerId(nextPlayer);
    setCurrentCategory(category);
    setNamedCount(0);
    setPhase('ready');
    setTurnSeconds(duration);
    setSecondsLeft(duration);
  }

  function beginCountdown() {
    if (phase !== 'ready') return;
    setPhase('active');

    if (tickTimer.current) clearInterval(tickTimer.current);
    tickTimer.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (tickTimer.current) clearInterval(tickTimer.current);
          setPhase('timeup');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, CategoryPrompt>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('category_prompts')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch categories:', error.message);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as CategoryPrompt[]).forEach((c) => map.set(c.id, c));
          from += pageSize;
        } else {
          moreData = false;
        }
      }

      if (cancelled) return;
      const all = Array.from(map.values());
      setPool(spicy ? all : all.filter((c) => !c.dirty));
    }

    load();
    return () => {
      cancelled = true;
      if (tickTimer.current) clearInterval(tickTimer.current);
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

  function advanceTurn() {
    if (tickTimer.current) clearInterval(tickTimer.current);
    if (!currentPlayerId) return;

    const remaining = roundPlayersLeft.filter((id) => id !== currentPlayerId);
    const nextPlayersLeft = remaining.length > 0 ? remaining : shuffleArray(players.map((p) => p.id));

    setRoundPlayersLeft(nextPlayersLeft);
    startTurn(nextPlayersLeft, pool);
  }

  function handleTap() {
    if (phase !== 'active' || !currentCategory) return;
    const next = namedCount + 1;
    setNamedCount(next);
    if (next >= currentCategory.count) {
      if (tickTimer.current) clearInterval(tickTimer.current);
      setPhase('success');
      setTimeout(() => advanceTurn(), 700);
    }
  }

  function handleGiveUp() {
    if (phase !== 'active') return;
    if (tickTimer.current) clearInterval(tickTimer.current);
    setPhase('timeup');
  }

  if (players.length < 2) return null;

  const currentPlayer = players.find((p) => p.id === currentPlayerId);
  const urgent = phase === 'active' && secondsLeft <= URGENT_THRESHOLD;
  const barPct = phase === 'active' ? (secondsLeft / turnSeconds) * 100 : 0;
  const activeColor = urgent ? '#ef4444' : MODE_COLOR;
  const target = currentCategory?.count ?? 0;

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
              modeName="Category Countdown"
              color={MODE_COLOR}
              description="Each turn you get a category asking for several things - name them out loud, tapping the button once for each one, before time runs out. Get them all before the clock hits zero, or take a sip."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0">
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5">
            {currentPlayer && (
              <p className="text-base text-white/70">
                <span className="text-xl font-extrabold text-white">{currentPlayer.name}</span>, you&apos;re up
              </p>
            )}

            {phase === 'ready' && (
              <p className="text-sm text-white/50 max-w-xs">
                Get everyone&apos;s attention, then hit Start - the category shows up when the clock starts.
              </p>
            )}

            {(phase === 'active' || phase === 'success') && (
              <div className="max-w-md">
                <p className="text-base text-white/50">Category</p>
                <p className="text-2xl sm:text-3xl font-extrabold leading-snug mt-2">
                  {currentCategory?.text ?? 'Loading…'}
                </p>
              </div>
            )}

            {phase === 'active' && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-sm font-bold transition-colors duration-500" style={{ color: activeColor }}>
                  {secondsLeft}s left
                </span>
                <div className="w-full max-w-xs h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: activeColor,
                      transition: 'width 1s linear, background-color 0.5s',
                    }}
                  />
                </div>
              </div>
            )}

            {phase === 'active' && (
              <div className="flex flex-wrap justify-center gap-2 max-w-xs">
                {Array.from({ length: target }).map((_, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border-2 transition-colors duration-200"
                    style={{
                      borderColor: MODE_COLOR,
                      backgroundColor: i < namedCount ? MODE_COLOR : 'transparent',
                    }}
                  />
                ))}
              </div>
            )}

            {phase === 'success' && (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white/5"
                  style={{ borderColor: MODE_COLOR, boxShadow: `0 0 28px ${MODE_COLOR}55` }}
                >
                  <Check className="w-7 h-7" style={{ color: MODE_COLOR }} strokeWidth={2.2} />
                </div>
                <p className="text-2xl font-extrabold" style={{ color: MODE_COLOR }}>Nailed It!</p>
              </div>
            )}

            {phase === 'timeup' && (
              <>
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0"
                  style={{ borderColor: '#ef4444', boxShadow: '0 0 28px rgba(239,68,68,0.35)' }}
                >
                  <TimerIcon className="w-9 h-9" style={{ color: '#ef4444' }} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold" style={{ color: '#ef4444' }}>Time&apos;s Up!</p>
                  <p className="text-sm text-white/60 mt-2">
                    {currentPlayer?.name} only got {namedCount} of {target} - take a sip.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2">
            {phase === 'ready' && (
              <button
                onClick={beginCountdown}
                className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Start
              </button>
            )}

            {phase === 'active' && (
              <>
                <button
                  onClick={handleTap}
                  className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
                >
                  {namedCount} / {target} - Tap for Each One
                </button>
                <button
                  onClick={handleGiveUp}
                  className="w-full text-center text-xs text-white/40 hover:text-white/70 mt-3 cursor-pointer underline"
                >
                  Can&apos;t get them all? Take a sip.
                </button>
              </>
            )}

            {phase === 'success' && (
              <button
                disabled
                className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] text-white font-bold rounded-lg opacity-70"
              >
                Next up…
              </button>
            )}

            {phase === 'timeup' && (
              <button
                onClick={advanceTurn}
                className="w-full py-4 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer"
              >
                Took the Sip - Next
              </button>
            )}
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
