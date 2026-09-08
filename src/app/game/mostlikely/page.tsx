'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Users, Check, PartyPopper } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { MostLikelyStatement } from '@/app/types/mostLikelyStatement';
import { GameMessage, GameMessageCategory } from '@/app/types/gameMessage';
import { pickMessage } from '@/app/lib/gameMessages';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import Button from '@/app/components/ui/Button';
import { usePersistedState } from '@/app/lib/usePersistedState';
import { glowStyle, GLOW_CLASSES } from '@/app/lib/glow';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#9156f3';
const AVATAR_COLORS = ['#00E676', '#ff6fd8', '#9156f3', '#ffb703', '#2dd4bf', '#fb7185', '#818cf8'];
const SESSION_KEY = 'tipsy:session:mostlikely';

type MostLikelySession = {
  currentId: number | null;
  answeredIds: number[];
  finished: boolean;
  sipCounts: Record<string, number>;
};

const EMPTY_SESSION: MostLikelySession = {
  currentId: null,
  answeredIds: [],
  finished: false,
  sipCounts: {},
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function MostLikelyToPage() {
  return (
    <Suspense fallback={null}>
      <MostLikelyToPageInner />
    </Suspense>
  );
}

function MostLikelyToPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { setLoading, players, playersHydrated } = useGame();

  const [pool, setPool] = useState<MostLikelyStatement[]>([]);
  const [session, setSession, sessionHydrated] = usePersistedState<MostLikelySession>(SESSION_KEY, EMPTY_SESSION);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [gameMessagesPool, setGameMessagesPool] = useState<GameMessage[]>([]);
  const startedRef = useRef(false);

  const current = pool.find((s) => s.id === session.currentId) ?? null;
  const finished = session.finished;

  useEffect(() => {
    if (playersHydrated && players.length < 2) {
      router.replace('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playersHydrated]);

  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase.from('game_messages').select('*').range(0, 999);
      if (error) console.error('Failed to fetch game messages:', error.message);
      else setGameMessagesPool((data as unknown as GameMessage[]) ?? []);
    }
    loadMessages();
  }, []);

  function getMilestoneMessage(count: number, name: string): string | null {
    if (count < 5 || count % 5 !== 0) return null;
    const tier: GameMessageCategory = count === 5 ? 'milestone_five' : count === 10 ? 'milestone_ten' : 'milestone_legend';
    return pickMessage(gameMessagesPool, tier, { name, count: String(count) }) || null;
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, MostLikelyStatement>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('most_likely_statements')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch statements:', error.message);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as MostLikelyStatement[]).forEach((s) => map.set(s.id, s));
          from += pageSize;
        } else {
          moreData = false;
        }
      }

      if (cancelled) return;

      const all = Array.from(map.values());
      const filtered = spicy ? all : all.filter((s) => !s.dirty);
      const shuffled = shuffleArray(filtered);

      setPool(shuffled);
      setLoading(false);
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

    // Resuming mid-round: the persisted statement is still in the (freshly reshuffled)
    // pool, so keep it and its tally exactly as they were before the refresh.
    if (session.finished || (session.currentId !== null && pool.some((s) => s.id === session.currentId))) return;

    const next = pool.find((s) => !session.answeredIds.includes(s.id));
    setSession((prev) => (next ? { ...prev, currentId: next.id } : { ...prev, finished: true, currentId: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, sessionHydrated]);

  if (players.length < 2) {
    return null;
  }

  function pickNext(justAnsweredIds: number[]) {
    const next = pool.find((s) => !justAnsweredIds.includes(s.id));
    if (!next) {
      setSession((prev) => ({ ...prev, finished: true, currentId: null, answeredIds: justAnsweredIds }));
      return;
    }
    setSession((prev) => ({ ...prev, currentId: next.id, answeredIds: justAnsweredIds }));
  }

  function handleNext() {
    if (!current || !pickedId) return;
    const updatedAnsweredIds = [...session.answeredIds, current.id];
    setVotedType(null);
    setPickedId(null);

    const picked = players.find((p) => p.id === pickedId) ?? null;
    if (picked) {
      const newCount = (session.sipCounts[pickedId] ?? 0) + 1;
      setSession((prev) => ({ ...prev, sipCounts: { ...prev.sipCounts, [pickedId]: newCount } }));

      const message = getMilestoneMessage(newCount, picked.name);
      if (message) setMilestone(message);
    }

    pickNext(updatedAnsweredIds);
  }

  function handlePlayAgain() {
    const reshuffled = shuffleArray(pool);
    setPool(reshuffled);
    setSession({ currentId: reshuffled[0]?.id ?? null, answeredIds: [], finished: false, sipCounts: {} });
    setVotedType(null);
    setPickedId(null);
    setMilestone(null);
  }

  async function handleVote(type: 'like' | 'dislike') {
    if (!current) return;

    const column = type === 'like' ? 'like_count' : 'dislike_count';
    const { data, error } = await supabase
      .from('most_likely_statements')
      .select(column)
      .eq('id', current.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch current vote count:', error?.message);
      return;
    }

    const currentCount = (data as unknown as MostLikelyStatement)[column] ?? 0;

    const { error: updateError } = await supabase
      .from('most_likely_statements')
      .update({ [column]: currentCount + 1 })
      .eq('id', current.id);

    if (updateError) {
      console.error('Failed to update vote count:', updateError.message);
      return;
    }

    setVotedType(type);
  }

  const pickedPlayer = players.find((p) => p.id === pickedId) ?? null;

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
              modeName="Most Likely To"
              color={MODE_COLOR}
              description="Read the statement, then everyone points at whoever fits it best. Tap that person to lock it in - they drink."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0 max-lg:landscape:max-w-xl max-lg:landscape:py-0">
          {!finished && current && (
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-4 max-lg:landscape:gap-2 overflow-y-auto max-lg:landscape:overflow-visible">
              {/* Icon lays over the header row in landscape, same treatment as Classic Trials
                  and Never Have I Ever. */}
              <div className="flex flex-col items-center flex-shrink-0 max-lg:landscape:absolute max-lg:landscape:top-1 max-lg:landscape:inset-x-0 max-lg:landscape:z-20 max-lg:landscape:pointer-events-none">
                <div
                  className={`w-16 h-16 max-lg:landscape:w-11 max-lg:landscape:h-11 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
                  style={glowStyle(MODE_COLOR)}
                >
                  <Users className="w-7 h-7 max-lg:landscape:w-5 max-lg:landscape:h-5" style={{ color: MODE_COLOR }} strokeWidth={1.7} />
                </div>
              </div>

              <div
                className="rounded-[28px] max-lg:landscape:rounded-2xl shadow-lg w-full overflow-hidden border flex-shrink-0 max-lg:landscape:mt-3"
                style={{ backgroundColor: '#3b1b5e', borderColor: `${MODE_COLOR}33`, boxShadow: `0 0 32px ${MODE_COLOR}22` }}
              >
                <div className="px-6 pt-6 pb-5 max-lg:landscape:px-6 max-lg:landscape:pt-4 max-lg:landscape:pb-3">
                  <p className="text-white/50 text-sm mb-1.5 max-lg:landscape:text-xs max-lg:landscape:mb-1">Most likely to</p>
                  <p className="text-white text-2xl max-lg:landscape:text-3xl font-bold leading-snug">{current.statement}</p>
                </div>
              </div>

              {/* Like/dislike right under the question, same order as Classic Trials and Never
                  Have I Ever - the player picker comes after. */}
              <div className="flex justify-center gap-8 max-lg:landscape:gap-6">
                <button
                  onClick={() => handleVote('dislike')}
                  disabled={votedType !== null}
                  className={`w-11 h-11 max-lg:landscape:w-9 max-lg:landscape:h-9 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer border ${votedType === 'dislike'
                      ? 'bg-red-500 border-red-500 text-white scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50'
                    } ${votedType !== null && votedType !== 'dislike' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleVote('like')}
                  disabled={votedType !== null}
                  className={`w-11 h-11 max-lg:landscape:w-9 max-lg:landscape:h-9 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer border ${votedType === 'like'
                      ? 'bg-[#00E676] border-[#00E676] text-white scale-110 shadow-[0_0_15px_rgba(0,230,118,0.5)]'
                      : 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/20 hover:border-[#00E676]/50'
                    } ${votedType !== null && votedType !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs max-lg:landscape:hidden text-white/40">Everyone point - now tap who got picked.</p>

              <div className="flex flex-wrap justify-center gap-2 max-lg:landscape:gap-1.5 max-w-md max-lg:landscape:max-w-md">
                {players.map((p, i) => {
                  const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
                  const selected = pickedId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPickedId(p.id)}
                      className="flex items-center gap-2 max-lg:landscape:gap-1.5 pl-1.5 pr-3 py-1.5 max-lg:landscape:pl-1 max-lg:landscape:pr-2.5 max-lg:landscape:py-1 rounded-full transition-all cursor-pointer"
                      style={{
                        backgroundColor: selected ? `${color}26` : 'rgba(255,255,255,0.06)',
                        border: `1.5px solid ${selected ? color : 'rgba(255,255,255,0.12)'}`,
                      }}
                    >
                      <span
                        className="w-7 h-7 max-lg:landscape:w-6 max-lg:landscape:h-6 rounded-full flex items-center justify-center text-xs max-lg:landscape:text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}33`, color }}
                      >
                        {selected ? <Check className="w-3.5 h-3.5 max-lg:landscape:w-3.5 max-lg:landscape:h-3.5" strokeWidth={3} /> : p.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-sm max-lg:landscape:text-sm font-medium">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="h-9 max-lg:landscape:h-6 flex items-center">
                {pickedPlayer && (
                  <div
                    className="inline-flex items-center px-4 py-2 max-lg:landscape:px-3 max-lg:landscape:py-1 rounded-full border bg-white/5"
                    style={{ borderColor: `${MODE_COLOR}66` }}
                  >
                    <span className="text-sm max-lg:landscape:text-xs font-medium">{pickedPlayer.name} - take a sip!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {finished && (
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5 max-lg:landscape:gap-2.5 overflow-y-auto">
              <div
                className={`w-20 h-20 max-lg:landscape:w-14 max-lg:landscape:h-14 rounded-full flex items-center justify-center border-2 bg-white/5 ${GLOW_CLASSES}`}
                style={glowStyle(MODE_COLOR)}
              >
                <Users className="w-9 h-9 max-lg:landscape:w-6 max-lg:landscape:h-6" style={{ color: MODE_COLOR }} strokeWidth={1.6} />
              </div>
              <div>
                <h2 className="text-2xl max-lg:landscape:text-lg font-extrabold">That&apos;s every statement!</h2>
                <p className="text-sm max-lg:landscape:text-xs text-white/70 mt-3 max-lg:landscape:mt-1 max-w-xs mx-auto leading-relaxed">
                  You made it through all {pool.length} - the verdict is in.
                </p>
              </div>
              <div className="w-full max-w-xs flex flex-col gap-3 pt-2">
                <Button onClick={handlePlayAgain} className="w-full">
                  Play Again
                </Button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Choose Another Mode
                </button>
              </div>
            </div>
          )}

          {!finished && current && (
            <div className="w-full pb-4 pt-2 max-lg:landscape:pb-2 max-lg:landscape:pt-1 flex-shrink-0">
              <button
                onClick={handleNext}
                disabled={!pickedId}
                className="w-full py-4 max-lg:landscape:py-2.5 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>

      {milestone && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-[#1b003c] border border-[#ffffff15] rounded-3xl p-7 flex flex-col items-center text-center gap-4 shadow-[0_0_40px_rgba(255,183,3,0.15)]">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white/5"
              style={{ borderColor: '#ffb703', boxShadow: '0 0 28px #ffb70366' }}
            >
              <PartyPopper className="w-7 h-7" style={{ color: '#ffb703' }} strokeWidth={1.7} />
            </div>
            <p className="text-lg font-bold leading-snug">{milestone}</p>
            <Button onClick={() => setMilestone(null)} className="w-full mt-1">
              Continue
            </Button>
          </div>
        </div>
      )}
    </AdsLayout>
  );
}
