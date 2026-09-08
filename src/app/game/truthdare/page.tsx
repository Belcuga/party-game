'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Shield, MousePointerClick } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { TruthDarePrompt } from '@/app/types/truthDarePrompt';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import { usePersistedState } from '@/app/lib/usePersistedState';
import { glowStyle, GLOW_CLASSES } from '@/app/lib/glow';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#ffb703';
const AVATAR_COLORS = ['#00E676', '#ff6fd8', '#9156f3', '#ffb703', '#2dd4bf', '#fb7185', '#818cf8'];
const CYCLE_TICKS = 12;
const CYCLE_INTERVAL_MS = 130;
const CHOICE_CHANCE = 0.25;
const SESSION_KEY = 'tipsy:session:truthdare';

type TruthDareSession = {
  roundNumber: number;
  roundAskersLeft: string[];
  askerId: string | null;
  targetId: string | null;
  suggestion: TruthDarePrompt | null;
  askedCounts: Record<string, number>;
  usedTruthIds: number[];
  usedDareIds: number[];
};

const EMPTY_SESSION: TruthDareSession = {
  roundNumber: 1,
  roundAskersLeft: [],
  askerId: null,
  targetId: null,
  suggestion: null,
  askedCounts: {},
  usedTruthIds: [],
  usedDareIds: [],
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function TruthOrDarePage() {
  return (
    <Suspense fallback={null}>
      <TruthOrDarePageInner />
    </Suspense>
  );
}

function TruthOrDarePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { players } = useGame();

  const [pool, setPool] = useState<TruthDarePrompt[]>([]);
  const [session, setSession, sessionHydrated] = usePersistedState<TruthDareSession>(SESSION_KEY, EMPTY_SESSION);
  const [phase, setPhase] = useState<'picking' | 'choosing' | 'revealed'>('picking');
  const [cycleIndex, setCycleIndex] = useState(0);

  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, TruthDarePrompt>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('truth_dare_prompts')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch prompts:', error.message);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as TruthDarePrompt[]).forEach((p) => map.set(p.id, p));
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
      if (cycleTimer.current) clearInterval(cycleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (startedRef.current || !sessionHydrated) return;
    startedRef.current = true;

    const askerStillValid = session.askerId && players.some((p) => p.id === session.askerId);

    if (askerStillValid && session.targetId) {
      // Fully settled turn from before the refresh - resume it exactly, no re-roll.
      setPhase('revealed');
      return;
    }

    if (askerStillValid) {
      // Round was in progress but this asker's target hadn't been picked yet - re-roll
      // just this turn's pick/animation, keeping the same round roster and tally.
      beginTurn(session.roundAskersLeft.length > 0 ? session.roundAskersLeft : shuffleArray(players.map((p) => p.id)), session.askedCounts, session);
      return;
    }

    const initialAskers = shuffleArray(players.map((p) => p.id));
    beginTurn(initialAskers, {}, EMPTY_SESSION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionHydrated]);

  function pickTarget(forAskerId: string, counts: Record<string, number>): string {
    const candidates = players.filter((p) => p.id !== forAskerId);
    const minCount = Math.min(...candidates.map((p) => counts[p.id] ?? 0));
    const fairest = candidates.filter((p) => (counts[p.id] ?? 0) === minCount);
    return fairest[Math.floor(Math.random() * fairest.length)].id;
  }

  function beginTurn(askersLeft: string[], counts: Record<string, number>, base: TruthDareSession) {
    if (askersLeft.length === 0) return;
    const nextAsker = askersLeft[Math.floor(Math.random() * askersLeft.length)];

    setCycleIndex(0);
    if (cycleTimer.current) clearInterval(cycleTimer.current);
    setSession({ ...base, roundAskersLeft: askersLeft, askedCounts: counts, askerId: nextAsker, targetId: null, suggestion: null });

    if (Math.random() < CHOICE_CHANCE) {
      setPhase('choosing');
      return;
    }

    const nextTarget = pickTarget(nextAsker, counts);
    setPhase('picking');

    const otherPlayers = players.filter((p) => p.id !== nextAsker);
    let ticks = 0;
    cycleTimer.current = setInterval(() => {
      ticks += 1;
      if (ticks >= CYCLE_TICKS) {
        if (cycleTimer.current) clearInterval(cycleTimer.current);
        setPhase('revealed');
        setSession((prev) => ({
          ...prev,
          targetId: nextTarget,
          askedCounts: { ...prev.askedCounts, [nextTarget]: (prev.askedCounts[nextTarget] ?? 0) + 1 },
        }));
      } else {
        setCycleIndex(Math.floor(Math.random() * otherPlayers.length));
      }
    }, CYCLE_INTERVAL_MS);
  }

  function chooseTarget(id: string) {
    setSession((prev) => ({
      ...prev,
      targetId: id,
      askedCounts: { ...prev.askedCounts, [id]: (prev.askedCounts[id] ?? 0) + 1 },
    }));
    setPhase('revealed');
  }

  function handleNext() {
    if (!session.askerId) return;
    const remaining = session.roundAskersLeft.filter((id) => id !== session.askerId);

    if (remaining.length > 0) {
      beginTurn(remaining, session.askedCounts, session);
    } else {
      const freshAskers = shuffleArray(players.map((p) => p.id));
      beginTurn(freshAskers, session.askedCounts, { ...session, roundNumber: session.roundNumber + 1 });
    }
  }

  function suggestPrompt(type: 'truth' | 'dare') {
    const usedIds = type === 'truth' ? session.usedTruthIds : session.usedDareIds;

    let candidates = pool.filter((p) => p.type === type && !usedIds.includes(p.id));
    let nextUsedIds = usedIds;
    if (candidates.length === 0) {
      candidates = pool.filter((p) => p.type === type);
      nextUsedIds = [];
    }
    if (candidates.length === 0) return;

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const updatedUsedIds = [...nextUsedIds, picked.id];

    setSession((prev) => ({
      ...prev,
      suggestion: picked,
      ...(type === 'truth' ? { usedTruthIds: updatedUsedIds } : { usedDareIds: updatedUsedIds }),
    }));
  }

  if (players.length < 2) return null;

  const asker = players.find((p) => p.id === session.askerId);
  const target = players.find((p) => p.id === session.targetId);
  const suggestion = session.suggestion;
  const otherPlayers = asker ? players.filter((p) => p.id !== asker.id) : [];

  return (
    <AdsLayout>
      <main className="flex flex-col items-center h-full max-lg:landscape:relative">
        <div className="w-full flex items-center justify-between px-6 mb-6 max-lg:landscape:mb-1 flex-shrink-0 max-lg:landscape:gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:text-gray-300 cursor-pointer"
            >
              <ArrowLeft />
            </button>

            {/* Landscape: logo + title join the back button on the left, matching Classic Trials. */}
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
              modeName="Truth or Dare"
              color={MODE_COLOR}
              description="Each round, everyone gets a turn to ask someone - usually the app picks fairly, but sometimes you'll get to choose yourself. Ask 'Truth or Dare?' and make one up, or tap Suggest if you're stuck. Can't do it? Take a sip."
            />
            <SettingsMenu />
          </div>
        </div>

        {/* Landscape: icon overlays the header itself, matching the other modes. It's
            positioned relative to `main` (not the scrollable box below) and lives outside
            that box in the DOM so its overflow-y-auto can't clip it. */}
        <div className="hidden max-lg:landscape:flex flex-col items-center absolute top-1 inset-x-0 z-20 pointer-events-none">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
            style={glowStyle(MODE_COLOR)}
          >
            <Shield className="w-6 h-6" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0 max-lg:landscape:max-w-xl max-lg:landscape:py-0">
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5 max-lg:landscape:gap-2 overflow-y-auto">
            {/* Portrait icon, in normal flow. Landscape uses the overlay above instead. */}
            <div className="flex flex-col items-center flex-shrink-0 max-lg:landscape:hidden">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
                style={glowStyle(MODE_COLOR)}
              >
                <Shield className="w-9 h-9" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
              </div>
            </div>

            {asker && (
              <p className="text-xl max-lg:landscape:text-base text-white/70 max-lg:landscape:mt-1">
                <span className="text-2xl max-lg:landscape:text-xl font-extrabold text-white">{asker.name}</span>, it&apos;s your turn to ask
              </p>
            )}

            {phase === 'picking' ? (
              <div className="flex flex-wrap justify-center gap-2.5 max-w-md py-2">
                {otherPlayers.map((p, i) => {
                  const color = AVATAR_COLORS[players.findIndex((pl) => pl.id === p.id) % AVATAR_COLORS.length];
                  const isCycling = i === cycleIndex;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full transition-all"
                      style={{
                        backgroundColor: isCycling ? `${color}26` : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${isCycling ? color : 'rgba(255,255,255,0.1)'}`,
                        transform: isCycling ? 'scale(1.06)' : 'scale(1)',
                      }}
                    >
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}33`, color }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-base font-medium">{p.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : phase === 'choosing' ? (
              <div className="flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full" style={{ backgroundColor: `${MODE_COLOR}22`, color: MODE_COLOR }}>
                  <MousePointerClick className="w-4 h-4" />
                  <span className="text-sm font-bold uppercase tracking-wide">Your choice this time</span>
                </div>
                <p className="text-lg text-white/60">Tap who you want to ask</p>
                <div className="flex flex-wrap justify-center gap-2.5 max-w-md py-1">
                  {otherPlayers.map((p) => {
                    const color = AVATAR_COLORS[players.findIndex((pl) => pl.id === p.id) % AVATAR_COLORS.length];
                    return (
                      <button
                        key={p.id}
                        onClick={() => chooseTarget(p.id)}
                        className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full transition-all cursor-pointer hover:scale-105 bg-white/5 hover:bg-white/10 border border-white/15"
                      >
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ backgroundColor: `${color}33`, color }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-base font-medium">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div
                  key={target?.id}
                  className="flex flex-col items-center gap-2 max-lg:landscape:gap-1"
                  style={{ animation: 'statPopIn 0.4s ease-out' }}
                >
                  <span className="text-sm max-lg:landscape:hidden uppercase tracking-wide text-white/40" style={{ letterSpacing: '0.08em' }}>
                    Ask
                  </span>
                  <p className="text-5xl max-lg:landscape:text-3xl font-extrabold" style={{ color: MODE_COLOR }}>
                    {target?.name}
                  </p>
                  <p className="text-2xl max-lg:landscape:text-lg font-semibold text-white/80">Truth or Dare?</p>
                </div>

                {!suggestion && (
                  <div className="flex gap-3 max-lg:landscape:gap-2">
                    <button
                      onClick={() => suggestPrompt('truth')}
                      className="px-5 py-2.5 max-lg:landscape:px-3 max-lg:landscape:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm max-lg:landscape:text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Suggest a Truth
                    </button>
                    <button
                      onClick={() => suggestPrompt('dare')}
                      className="px-5 py-2.5 max-lg:landscape:px-3 max-lg:landscape:py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm max-lg:landscape:text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Suggest a Dare
                    </button>
                  </div>
                )}

                {suggestion && (
                  <div
                    className="rounded-3xl max-lg:landscape:rounded-2xl shadow-lg w-full overflow-hidden border flex-shrink-0"
                    style={{ backgroundColor: '#3b1b5e', borderColor: `${MODE_COLOR}33`, boxShadow: `0 0 32px ${MODE_COLOR}22` }}
                  >
                    <div className="px-7 pt-6 pb-5 max-lg:landscape:px-4 max-lg:landscape:pt-2 max-lg:landscape:pb-1.5">
                      <span
                        className="inline-block text-xs max-lg:landscape:text-[11px] font-bold px-3 py-1 max-lg:landscape:px-2.5 max-lg:landscape:py-0.5 rounded-full mb-2.5 max-lg:landscape:mb-1"
                        style={{
                          backgroundColor: suggestion.type === 'truth' ? 'rgba(56,189,248,0.18)' : 'rgba(255,183,3,0.2)',
                          color: suggestion.type === 'truth' ? '#7dd3fc' : '#fbbf24',
                        }}
                      >
                        {suggestion.type === 'truth' ? 'Truth' : 'Dare'}
                      </span>
                      <p className="text-white text-2xl max-lg:landscape:text-lg font-medium leading-snug">{suggestion.text}</p>
                    </div>
                    <div className="mx-6 mb-6 pt-4 max-lg:landscape:mx-3 max-lg:landscape:mb-1 max-lg:landscape:pt-1 border-t border-white/10">
                      <p className="text-lg max-lg:landscape:text-sm font-semibold" style={{ color: MODE_COLOR }}>
                        Can&apos;t do it? Take a sip.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2 max-lg:landscape:pb-2 max-lg:landscape:pt-1 flex gap-3 max-lg:landscape:gap-2">
            <button
              onClick={handleNext}
              disabled={phase !== 'revealed'}
              className="flex-1 py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-base bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Did It
            </button>
            <button
              onClick={handleNext}
              disabled={phase !== 'revealed'}
              className="flex-1 py-4 max-lg:landscape:py-2.5 text-lg max-lg:landscape:text-base bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Took the Sip(s)
            </button>
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
