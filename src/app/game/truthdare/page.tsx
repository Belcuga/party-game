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
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#ffb703';
const AVATAR_COLORS = ['#00E676', '#ff6fd8', '#9156f3', '#ffb703', '#2dd4bf', '#fb7185', '#818cf8'];
const CYCLE_TICKS = 12;
const CYCLE_INTERVAL_MS = 130;
const CHOICE_CHANCE = 0.25;

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
  const [usedTruthIds, setUsedTruthIds] = useState<number[]>([]);
  const [usedDareIds, setUsedDareIds] = useState<number[]>([]);
  const [suggestion, setSuggestion] = useState<TruthDarePrompt | null>(null);

  const [roundNumber, setRoundNumber] = useState(1);
  const [roundAskersLeft, setRoundAskersLeft] = useState<string[]>([]);
  const [askerId, setAskerId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [askedCounts, setAskedCounts] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<'picking' | 'choosing' | 'revealed'>('picking');
  const [cycleIndex, setCycleIndex] = useState(0);

  const cycleTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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

    const initialAskers = shuffleArray(players.map((p) => p.id));
    setRoundAskersLeft(initialAskers);
    beginTurn(initialAskers, {});

    return () => {
      cancelled = true;
      if (cycleTimer.current) clearInterval(cycleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickTarget(forAskerId: string, counts: Record<string, number>): string {
    const candidates = players.filter((p) => p.id !== forAskerId);
    const minCount = Math.min(...candidates.map((p) => counts[p.id] ?? 0));
    const fairest = candidates.filter((p) => (counts[p.id] ?? 0) === minCount);
    return fairest[Math.floor(Math.random() * fairest.length)].id;
  }

  function beginTurn(askersLeft: string[], counts: Record<string, number>) {
    if (askersLeft.length === 0) return;
    const nextAsker = askersLeft[Math.floor(Math.random() * askersLeft.length)];

    setAskerId(nextAsker);
    setTargetId(null);
    setSuggestion(null);
    setCycleIndex(0);
    if (cycleTimer.current) clearInterval(cycleTimer.current);

    if (Math.random() < CHOICE_CHANCE) {
      setPhase('choosing');
      return;
    }

    const nextTarget = pickTarget(nextAsker, counts);
    setTargetId(nextTarget);
    setPhase('picking');

    const otherPlayers = players.filter((p) => p.id !== nextAsker);
    let ticks = 0;
    cycleTimer.current = setInterval(() => {
      ticks += 1;
      if (ticks >= CYCLE_TICKS) {
        if (cycleTimer.current) clearInterval(cycleTimer.current);
        setPhase('revealed');
        setAskedCounts((prev) => ({ ...prev, [nextTarget]: (prev[nextTarget] ?? 0) + 1 }));
      } else {
        setCycleIndex(Math.floor(Math.random() * otherPlayers.length));
      }
    }, CYCLE_INTERVAL_MS);
  }

  function chooseTarget(id: string) {
    setTargetId(id);
    setAskedCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setPhase('revealed');
  }

  function handleNext() {
    if (!askerId) return;
    const remaining = roundAskersLeft.filter((id) => id !== askerId);

    if (remaining.length > 0) {
      setRoundAskersLeft(remaining);
      beginTurn(remaining, askedCounts);
    } else {
      const newRound = roundNumber + 1;
      const freshAskers = shuffleArray(players.map((p) => p.id));
      setRoundNumber(newRound);
      setRoundAskersLeft(freshAskers);
      beginTurn(freshAskers, askedCounts);
    }
  }

  function suggestPrompt(type: 'truth' | 'dare') {
    const usedIds = type === 'truth' ? usedTruthIds : usedDareIds;
    const setUsedIds = type === 'truth' ? setUsedTruthIds : setUsedDareIds;

    let candidates = pool.filter((p) => p.type === type && !usedIds.includes(p.id));
    if (candidates.length === 0) {
      candidates = pool.filter((p) => p.type === type);
      setUsedIds([]);
    }
    if (candidates.length === 0) return;

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    setSuggestion(picked);
    setUsedIds((prev) => [...prev, picked.id]);
  }

  if (players.length < 2) return null;

  const asker = players.find((p) => p.id === askerId);
  const target = players.find((p) => p.id === targetId);
  const otherPlayers = asker ? players.filter((p) => p.id !== asker.id) : [];

  return (
    <AdsLayout>
      <main className="flex flex-col items-center h-full">
        <div className="w-full flex items-center justify-between px-6 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:text-gray-300 cursor-pointer"
          >
            <ArrowLeft />
          </button>

          <div className="flex items-center gap-2">
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

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0">
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0"
              style={{ borderColor: MODE_COLOR, boxShadow: `0 0 28px ${MODE_COLOR}55` }}
            >
              <Shield className="w-6 h-6" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
            </div>

            {asker && (
              <p className="text-base text-white/70">
                <span className="text-xl font-extrabold text-white">{asker.name}</span>, it&apos;s your turn to ask
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
              <>
                <div
                  key={target?.id}
                  className="flex flex-col items-center gap-2"
                  style={{ animation: 'statPopIn 0.4s ease-out' }}
                >
                  <span className="text-xs uppercase tracking-wide text-white/40" style={{ letterSpacing: '0.08em' }}>
                    Ask
                  </span>
                  <p className="text-4xl font-extrabold" style={{ color: MODE_COLOR }}>
                    {target?.name}
                  </p>
                  <p className="text-lg font-semibold text-white/80">Truth or Dare?</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => suggestPrompt('truth')}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Suggest a Truth
                  </button>
                  <button
                    onClick={() => suggestPrompt('dare')}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Suggest a Dare
                  </button>
                </div>

                {suggestion && (
                  <div className="bg-white rounded-3xl shadow-lg w-full overflow-hidden">
                    <div className="px-6 pt-5 pb-4">
                      <span
                        className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-2"
                        style={{
                          backgroundColor: suggestion.type === 'truth' ? 'rgba(33,150,243,0.12)' : 'rgba(255,183,3,0.14)',
                          color: suggestion.type === 'truth' ? '#1976d2' : '#b45309',
                        }}
                      >
                        {suggestion.type === 'truth' ? 'Truth' : 'Dare'}
                      </span>
                      <p className="text-[#1b003c] text-lg font-medium leading-snug">{suggestion.text}</p>
                    </div>
                    <div className="mx-5 mb-4 rounded-2xl px-5 py-2.5" style={{ backgroundColor: 'rgba(5,150,105,0.08)' }}>
                      <p className="text-sm font-semibold" style={{ color: '#047857' }}>
                        Can&apos;t do it? Take a sip.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2 flex gap-3">
            <button
              onClick={handleNext}
              disabled={phase !== 'revealed'}
              className="flex-1 py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Did It
            </button>
            <button
              onClick={handleNext}
              disabled={phase !== 'revealed'}
              className="flex-1 py-4 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Took the Sip(s)
            </button>
          </div>
        </div>
      </main>
    </AdsLayout>
  );
}
