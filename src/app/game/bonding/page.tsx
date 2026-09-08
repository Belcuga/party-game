'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, MessageCircleHeart, MousePointerClick } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { BondingQuestion } from '@/app/types/bondingQuestion';
import { fillTemplate } from '@/app/lib/gameMessages';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import { usePersistedState } from '@/app/lib/usePersistedState';
import { glowStyle, GLOW_CLASSES } from '@/app/lib/glow';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#818cf8';
const AVATAR_COLORS = ['#00E676', '#ff6fd8', '#9156f3', '#ffb703', '#2dd4bf', '#fb7185', '#818cf8'];
const CYCLE_TICKS = 12;
const CYCLE_INTERVAL_MS = 130;
const CHOICE_CHANCE = 0.25;
const SESSION_KEY = 'tipsy:session:bonding';

type BondingSession = {
  roundAskersLeft: string[];
  askerId: string | null;
  targetId: string | null;
  questionText: string;
  askedCounts: Record<string, number>;
  usedIds: number[];
};

const EMPTY_SESSION: BondingSession = {
  roundAskersLeft: [],
  askerId: null,
  targetId: null,
  questionText: '',
  askedCounts: {},
  usedIds: [],
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function BondingPage() {
  return (
    <Suspense fallback={null}>
      <BondingPageInner />
    </Suspense>
  );
}

function BondingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { players } = useGame();

  const [pool, setPool] = useState<BondingQuestion[]>([]);
  const startedRef = useRef(false);

  const [session, setSession, sessionHydrated] = usePersistedState<BondingSession>(SESSION_KEY, EMPTY_SESSION);
  const [phase, setPhase] = useState<'picking' | 'choosing' | 'revealed'>('picking');
  const [cycleIndex, setCycleIndex] = useState(0);

  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, BondingQuestion>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('bonding_questions')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch questions:', error.message);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as BondingQuestion[]).forEach((q) => map.set(q.id, q));
          from += pageSize;
        } else {
          moreData = false;
        }
      }

      if (cancelled) return;
      const all = Array.from(map.values());
      setPool(spicy ? all : all.filter((q) => !q.dirty));
    }

    load();

    return () => {
      cancelled = true;
      if (cycleTimer.current) clearInterval(cycleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pool.length === 0 || startedRef.current || !sessionHydrated) return;
    startedRef.current = true;

    const askerStillValid = session.askerId && players.some((p) => p.id === session.askerId);

    if (askerStillValid && session.targetId) {
      // Fully settled turn from before the refresh - resume it exactly, no re-roll.
      setPhase('revealed');
      return;
    }

    if (askerStillValid) {
      beginTurn(session.roundAskersLeft.length > 0 ? session.roundAskersLeft : shuffleArray(players.map((p) => p.id)), session.askedCounts, session);
      return;
    }

    const initialAskers = shuffleArray(players.map((p) => p.id));
    beginTurn(initialAskers, {}, EMPTY_SESSION);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, sessionHydrated]);

  function pickFairTarget(forAskerId: string, counts: Record<string, number>): string {
    const candidates = players.filter((p) => p.id !== forAskerId);
    const minCount = Math.min(...candidates.map((p) => counts[p.id] ?? 0));
    const fairest = candidates.filter((p) => (counts[p.id] ?? 0) === minCount);
    return fairest[Math.floor(Math.random() * fairest.length)].id;
  }

  function revealQuestionFor(targetPlayerId: string, currentUsedIds: number[]): { questionText: string; usedIds: number[] } {
    let candidates = pool.filter((q) => !currentUsedIds.includes(q.id));
    let usedIds = currentUsedIds;
    if (candidates.length === 0) {
      candidates = pool;
      usedIds = [];
    }
    if (candidates.length === 0) {
      return { questionText: '', usedIds };
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    const nextUsedIds = [...usedIds, picked.id];

    const targetPlayer = players.find((p) => p.id === targetPlayerId);
    const vars: Record<string, string> = { player: targetPlayer?.name ?? '' };
    if (picked.text.includes('{other}')) {
      const others = players.filter((p) => p.id !== targetPlayerId);
      const other = others[Math.floor(Math.random() * others.length)];
      vars.other = other?.name ?? '';
    }
    return { questionText: fillTemplate(picked.text, vars), usedIds: nextUsedIds };
  }

  function beginTurn(askersLeft: string[], counts: Record<string, number>, base: BondingSession) {
    if (askersLeft.length === 0) return;
    const nextAsker = askersLeft[Math.floor(Math.random() * askersLeft.length)];

    setCycleIndex(0);
    if (cycleTimer.current) clearInterval(cycleTimer.current);
    setSession({ ...base, roundAskersLeft: askersLeft, askedCounts: counts, askerId: nextAsker, targetId: null, questionText: '' });

    if (Math.random() < CHOICE_CHANCE) {
      setPhase('choosing');
      return;
    }

    const nextTarget = pickFairTarget(nextAsker, counts);
    setPhase('picking');

    const otherPlayers = players.filter((p) => p.id !== nextAsker);
    let ticks = 0;
    cycleTimer.current = setInterval(() => {
      ticks += 1;
      if (ticks >= CYCLE_TICKS) {
        if (cycleTimer.current) clearInterval(cycleTimer.current);
        setPhase('revealed');
        setSession((prev) => {
          const { questionText, usedIds: nextUsedIds } = revealQuestionFor(nextTarget, prev.usedIds);
          return {
            ...prev,
            targetId: nextTarget,
            questionText,
            usedIds: nextUsedIds,
            askedCounts: { ...prev.askedCounts, [nextTarget]: (prev.askedCounts[nextTarget] ?? 0) + 1 },
          };
        });
      } else {
        setCycleIndex(Math.floor(Math.random() * otherPlayers.length));
      }
    }, CYCLE_INTERVAL_MS);
  }

  function chooseTarget(id: string) {
    setSession((prev) => {
      const { questionText, usedIds: nextUsedIds } = revealQuestionFor(id, prev.usedIds);
      return {
        ...prev,
        targetId: id,
        questionText,
        usedIds: nextUsedIds,
        askedCounts: { ...prev.askedCounts, [id]: (prev.askedCounts[id] ?? 0) + 1 },
      };
    });
    setPhase('revealed');
  }

  function handleNext() {
    if (!session.askerId) return;
    const remaining = session.roundAskersLeft.filter((id) => id !== session.askerId);
    const nextAskersLeft = remaining.length > 0 ? remaining : shuffleArray(players.map((p) => p.id));

    beginTurn(nextAskersLeft, session.askedCounts, session);
  }

  if (players.length < 2) return null;

  const asker = players.find((p) => p.id === session.askerId);
  const questionText = session.questionText;
  const otherPlayers = asker ? players.filter((p) => p.id !== asker.id) : [];

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
              modeName="Bonding"
              color={MODE_COLOR}
              description="Each round, someone gets asked a question - usually the app picks fairly who asks who, but sometimes you'll get to choose. Some questions are personal, some ask what you think about someone else at the table. Don't want to answer? Take a sip instead."
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
              <MessageCircleHeart className="w-6 h-6 max-lg:landscape:w-5 max-lg:landscape:h-5" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
            </div>

            {asker && (
              <p className="text-base max-lg:landscape:text-sm text-white/70">
                <span className="text-xl max-lg:landscape:text-base font-extrabold text-white">{asker.name}</span>, it&apos;s your turn to ask
              </p>
            )}

            {phase === 'picking' ? (
              <div className="flex flex-wrap justify-center gap-2 max-w-md py-2">
                {otherPlayers.map((p, i) => {
                  const color = AVATAR_COLORS[players.findIndex((pl) => pl.id === p.id) % AVATAR_COLORS.length];
                  const isCycling = i === cycleIndex;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: isCycling ? `${color}26` : 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${isCycling ? color : 'rgba(255,255,255,0.1)'}`,
                        transform: isCycling ? 'scale(1.06)' : 'scale(1)',
                      }}
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}33`, color }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : phase === 'choosing' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ backgroundColor: `${MODE_COLOR}22`, color: MODE_COLOR }}>
                  <MousePointerClick className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wide">Your choice this time</span>
                </div>
                <p className="text-sm text-white/60">Tap who you want to ask</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-md py-1">
                  {otherPlayers.map((p) => {
                    const color = AVATAR_COLORS[players.findIndex((pl) => pl.id === p.id) % AVATAR_COLORS.length];
                    return (
                      <button
                        key={p.id}
                        onClick={() => chooseTarget(p.id)}
                        className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full transition-all cursor-pointer hover:scale-105 bg-white/5 hover:bg-white/10 border border-white/15"
                      >
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: `${color}33`, color }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium">{p.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="max-w-md" style={{ animation: 'statPopIn 0.4s ease-out' }}>
                <p className="text-2xl sm:text-3xl max-lg:landscape:text-xl font-extrabold leading-snug">
                  {questionText || 'Loading…'}
                </p>
              </div>
            )}
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2 max-lg:landscape:pb-2 max-lg:landscape:pt-1">
            <button
              onClick={handleNext}
              disabled={phase !== 'revealed'}
              className="w-full py-4 max-lg:landscape:py-2.5 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Answered - Next
            </button>
            <button
              onClick={handleNext}
              disabled={phase !== 'revealed'}
              className="w-full text-center text-xs text-white/40 hover:text-white/70 mt-3 max-lg:landscape:mt-1.5 cursor-pointer underline disabled:opacity-0"
            >
              Don&apos;t want to answer? Take a sip instead.
            </button>
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
