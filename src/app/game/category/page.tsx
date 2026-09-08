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
import { usePersistedState } from '@/app/lib/usePersistedState';
import { glowStyle, GLOW_CLASSES } from '@/app/lib/glow';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#2dd4bf';
const URGENT_THRESHOLD = 5;
const TURN_SECONDS = 15;
const SESSION_KEY = 'tipsy:session:category';

type CategorySession = {
  roundPlayersLeft: string[];
  currentPlayerId: string | null;
  currentCategory: CategoryPrompt | null;
  usedIds: number[];
};

const EMPTY_SESSION: CategorySession = {
  roundPlayersLeft: [],
  currentPlayerId: null,
  currentCategory: null,
  usedIds: [],
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
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
  const startedRef = useRef(false);

  const [session, setSession, sessionHydrated] = usePersistedState<CategorySession>(SESSION_KEY, EMPTY_SESSION);
  const [namedCount, setNamedCount] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'active' | 'success' | 'timeup'>('ready');
  const [secondsLeft, setSecondsLeft] = useState(TURN_SECONDS);

  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      audioCtxRef.current = new Ctor();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function playBeep(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = getAudioContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  function playTickSound() {
    playBeep(880, 0.1, 'sine');
  }

  function playTimeUpSound() {
    playBeep(220, 0.4, 'square');
  }

  function playHitSound() {
    playBeep(660, 0.09, 'sine');
    setTimeout(() => playBeep(990, 0.12, 'sine'), 60);
  }

  function pickCategory(sourcePool: CategoryPrompt[], currentUsedIds: number[]): { category: CategoryPrompt | null; usedIds: number[] } {
    let candidates = sourcePool.filter((c) => !currentUsedIds.includes(c.id));
    let usedIds = currentUsedIds;
    if (candidates.length === 0) {
      candidates = sourcePool;
      usedIds = [];
    }
    if (candidates.length === 0) return { category: null, usedIds };
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    return { category: picked, usedIds: [...usedIds, picked.id] };
  }

  function startTurn(playersLeft: string[], sourcePool: CategoryPrompt[], currentUsedIds: number[]) {
    if (playersLeft.length === 0) return;
    const nextPlayer = playersLeft[Math.floor(Math.random() * playersLeft.length)];
    const { category, usedIds: nextUsedIds } = pickCategory(sourcePool, currentUsedIds);

    if (tickTimer.current) clearInterval(tickTimer.current);

    setSession({ roundPlayersLeft: playersLeft, currentPlayerId: nextPlayer, currentCategory: category, usedIds: nextUsedIds });
    setNamedCount(0);
    setPhase('ready');
    setSecondsLeft(TURN_SECONDS);
  }

  function beginCountdown() {
    if (phase !== 'ready') return;
    getAudioContext();
    setPhase('active');

    if (tickTimer.current) clearInterval(tickTimer.current);
    tickTimer.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (tickTimer.current) clearInterval(tickTimer.current);
          setPhase('timeup');
          playTimeUpSound();
          return 0;
        }
        const next = prev - 1;
        if (next <= URGENT_THRESHOLD) {
          playTickSound();
        }
        return next;
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
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pool.length === 0 || startedRef.current || !sessionHydrated) return;
    startedRef.current = true;

    const resumablePlayer = session.currentPlayerId && players.some((p) => p.id === session.currentPlayerId);
    if (session.currentCategory && resumablePlayer) {
      // Resume the turn that was in progress before the refresh - keep who's up and the
      // category, just reset the transient bits (tap count, timer) back to their start.
      setNamedCount(0);
      setPhase('ready');
      setSecondsLeft(TURN_SECONDS);
      return;
    }

    const initialPlayers = shuffleArray(players.map((p) => p.id));
    startTurn(initialPlayers, pool, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, sessionHydrated]);

  function advanceTurn() {
    if (tickTimer.current) clearInterval(tickTimer.current);
    if (!session.currentPlayerId) return;

    const remaining = session.roundPlayersLeft.filter((id) => id !== session.currentPlayerId);
    const nextPlayersLeft = remaining.length > 0 ? remaining : shuffleArray(players.map((p) => p.id));

    startTurn(nextPlayersLeft, pool, session.usedIds);
  }

  function handleTap() {
    if (phase !== 'active' || !session.currentCategory) return;
    playHitSound();
    const next = namedCount + 1;
    setNamedCount(next);
    if (next >= session.currentCategory.count) {
      if (tickTimer.current) clearInterval(tickTimer.current);
      setPhase('success');
    }
  }

  if (players.length < 2) return null;

  const currentPlayer = players.find((p) => p.id === session.currentPlayerId);
  const currentCategory = session.currentCategory;
  const urgent = phase === 'active' && secondsLeft <= URGENT_THRESHOLD;
  const barPct = phase === 'active' ? (secondsLeft / TURN_SECONDS) * 100 : 0;
  const activeColor = urgent ? '#ef4444' : MODE_COLOR;
  const target = currentCategory?.count ?? 0;
  const sipsOwed = Math.max(target - namedCount, 0);

  return (
    <AdsLayout>
      <main className="flex flex-col items-center h-full max-lg:landscape:relative">
        <div className="w-full flex items-center justify-between px-6 mb-6 max-lg:landscape:mb-1 flex-shrink-0 max-lg:landscape:gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-300 cursor-pointer">
              <ArrowLeft />
            </button>

            {/* Landscape: logo + title join the back button on the left, matching the other modes. */}
            <div className="hidden max-lg:landscape:flex items-center gap-2">
              <Logo className="w-12 h-12" />
              <h1 className="text-xl font-extrabold drop-shadow-lg whitespace-nowrap">Tipsy Trials</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 max-lg:landscape:hidden">
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

        {/* Landscape: icon overlays the header itself, matching the other modes. It's
            positioned relative to `main` and lives outside the scrollable box below so
            that box's overflow-y-auto can't clip it. */}
        {phase !== 'timeup' && phase !== 'success' && (
          <div className="hidden max-lg:landscape:flex flex-col items-center absolute top-1 inset-x-0 z-20 pointer-events-none">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
              style={glowStyle(MODE_COLOR)}
            >
              <TimerIcon className="w-6 h-6" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0 max-lg:landscape:max-w-xl max-lg:landscape:py-0">
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5 max-lg:landscape:gap-1.5 overflow-y-auto">
            {phase !== 'timeup' && phase !== 'success' && (
              <div
                className={`w-20 h-20 max-lg:landscape:hidden rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
                style={glowStyle(MODE_COLOR)}
              >
                <TimerIcon className="w-9 h-9" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
              </div>
            )}

            {currentPlayer && (
              <p className="text-xl max-lg:landscape:text-lg text-white/70 max-lg:landscape:mt-1">
                <span className="text-2xl max-lg:landscape:text-xl font-extrabold text-white">{currentPlayer.name}</span>, you&apos;re up
              </p>
            )}

            {phase === 'ready' && (
              <p className="text-lg max-lg:landscape:text-sm text-white/50 max-w-xs">
                Get everyone&apos;s attention, then hit Start - the category shows up when the clock starts.
              </p>
            )}

            {(phase === 'active' || phase === 'success') && (
              <div
                className="rounded-3xl max-lg:landscape:rounded-2xl shadow-lg w-full max-w-md overflow-hidden border flex-shrink-0 px-7 py-6 max-lg:landscape:px-5 max-lg:landscape:py-4"
                style={{ backgroundColor: '#3b1b5e', borderColor: `${MODE_COLOR}33`, boxShadow: `0 0 32px ${MODE_COLOR}22` }}
              >
                <p className="text-lg max-lg:landscape:text-base text-white/50">Category</p>
                <p className="text-3xl sm:text-4xl max-lg:landscape:text-2xl font-extrabold leading-snug mt-2 max-lg:landscape:mt-1">
                  {currentCategory?.text ?? 'Loading…'}
                </p>
              </div>
            )}

            {phase === 'active' && (
              <div className="flex flex-col items-center gap-2 max-lg:landscape:gap-1">
                <span className="text-lg max-lg:landscape:text-base font-bold transition-colors duration-500" style={{ color: activeColor }}>
                  {secondsLeft}s left
                </span>
                <div className="w-full max-w-xs h-2 max-lg:landscape:h-1.5 rounded-full bg-white/10 overflow-hidden">
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
              <div className="flex flex-wrap justify-center gap-2.5 max-lg:landscape:gap-2 max-w-xs">
                {Array.from({ length: target }).map((_, i) => (
                  <span
                    key={i}
                    className="w-5 h-5 max-lg:landscape:w-4 max-lg:landscape:h-4 rounded-full border-2 transition-colors duration-200"
                    style={{
                      borderColor: MODE_COLOR,
                      backgroundColor: i < namedCount ? MODE_COLOR : 'transparent',
                    }}
                  />
                ))}
              </div>
            )}

            {phase === 'success' && (
              <div className="flex flex-col items-center gap-2 max-lg:landscape:gap-1 max-lg:landscape:mt-1">
                <div
                  className={`w-20 h-20 max-lg:landscape:w-14 max-lg:landscape:h-14 rounded-full flex items-center justify-center border-2 bg-white/5 ${GLOW_CLASSES}`}
                  style={glowStyle(MODE_COLOR)}
                >
                  <Check className="w-9 h-9 max-lg:landscape:w-6 max-lg:landscape:h-6" style={{ color: MODE_COLOR }} strokeWidth={2.2} />
                </div>
                <p className="text-3xl max-lg:landscape:text-lg font-extrabold" style={{ color: MODE_COLOR }}>Nailed It!</p>
              </div>
            )}

            {phase === 'timeup' && (
              <>
                <div
                  className={`w-20 h-20 max-lg:landscape:w-14 max-lg:landscape:h-14 max-lg:landscape:mt-1 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
                  style={glowStyle('#ef4444')}
                >
                  <TimerIcon className="w-9 h-9 max-lg:landscape:w-6 max-lg:landscape:h-6" style={{ color: '#ef4444' }} strokeWidth={1.7} />
                </div>
                <div>
                  <p className="text-3xl max-lg:landscape:text-lg font-extrabold" style={{ color: '#ef4444' }}>Time&apos;s Up!</p>
                  <p className="text-lg text-white/60 mt-2 max-lg:landscape:mt-1">
                    {currentPlayer?.name} only got {namedCount} of {target} - take {sipsOwed} sip{sipsOwed === 1 ? '' : 's'}.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2 max-lg:landscape:pb-2 max-lg:landscape:pt-1">
            {phase === 'ready' && (
              <button
                onClick={beginCountdown}
                className="w-full py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-base bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Start
              </button>
            )}

            {phase === 'active' && (
              <button
                onClick={handleTap}
                className="w-full py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-base bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                {namedCount} / {target} - Tap for Each One
              </button>
            )}

            {phase === 'success' && (
              <button
                onClick={advanceTurn}
                className="w-full py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-base bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Next
              </button>
            )}

            {phase === 'timeup' && (
              <button
                onClick={advanceTurn}
                className="w-full py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-base bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer active:scale-[0.98]"
              >
                Took {sipsOwed} Sip{sipsOwed === 1 ? '' : 's'} - Next
              </button>
            )}
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
