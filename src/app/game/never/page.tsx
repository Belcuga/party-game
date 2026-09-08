'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Hand } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { NhieStatement } from '@/app/types/nhieStatement';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import Button from '@/app/components/ui/Button';
import { usePersistedState } from '@/app/lib/usePersistedState';
import { glowStyle, GLOW_CLASSES } from '@/app/lib/glow';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#ff6fd8';
const SESSION_KEY = 'tipsy:session:never';

type NeverSession = {
  currentId: number | null;
  answeredIds: number[];
  finished: boolean;
};

const EMPTY_SESSION: NeverSession = {
  currentId: null,
  answeredIds: [],
  finished: false,
};

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function NeverHaveIEverPage() {
  return (
    <Suspense fallback={null}>
      <NeverHaveIEverPageInner />
    </Suspense>
  );
}

function NeverHaveIEverPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spicy = searchParams.get('spicy') === 'true';
  const { setLoading } = useGame();

  const [pool, setPool] = useState<NhieStatement[]>([]);
  const [session, setSession, sessionHydrated] = usePersistedState<NeverSession>(SESSION_KEY, EMPTY_SESSION);
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);
  const startedRef = useRef(false);

  const current = pool.find((s) => s.id === session.currentId) ?? null;
  const finished = session.finished;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const pageSize = 1000;
      let from = 0;
      let moreData = true;
      const map = new Map<number, NhieStatement>();

      while (moreData) {
        const to = from + pageSize - 1;
        const { data, error } = await supabase
          .from('nhie_statements')
          .select('*')
          .range(from, to)
          .order('id', { ascending: true });

        if (error) {
          console.error('Failed to fetch statements:', error.message);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          (data as unknown as NhieStatement[]).forEach((s) => map.set(s.id, s));
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

    if (session.finished || (session.currentId !== null && pool.some((s) => s.id === session.currentId))) return;

    const next = pool.find((s) => !session.answeredIds.includes(s.id));
    setSession((prev) => (next ? { ...prev, currentId: next.id } : { ...prev, finished: true, currentId: null }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, sessionHydrated]);

  function pickNext(justAnsweredIds: number[]) {
    const next = pool.find((s) => !justAnsweredIds.includes(s.id));
    if (!next) {
      setSession((prev) => ({ ...prev, finished: true, currentId: null, answeredIds: justAnsweredIds }));
      return;
    }
    setSession((prev) => ({ ...prev, currentId: next.id, answeredIds: justAnsweredIds }));
  }

  function handleNext() {
    if (!current) return;
    const updatedAnsweredIds = [...session.answeredIds, current.id];
    setVotedType(null);
    pickNext(updatedAnsweredIds);
  }

  function handlePlayAgain() {
    const reshuffled = shuffleArray(pool);
    setPool(reshuffled);
    setSession({ currentId: reshuffled[0]?.id ?? null, answeredIds: [], finished: false });
    setVotedType(null);
  }

  async function handleVote(type: 'like' | 'dislike') {
    if (!current) return;

    const column = type === 'like' ? 'like_count' : 'dislike_count';
    const { data, error } = await supabase
      .from('nhie_statements')
      .select(column)
      .eq('id', current.id)
      .single();

    if (error || !data) {
      console.error('Failed to fetch current vote count:', error?.message);
      return;
    }

    const currentCount = (data as unknown as NhieStatement)[column] ?? 0;

    const { error: updateError } = await supabase
      .from('nhie_statements')
      .update({ [column]: currentCount + 1 })
      .eq('id', current.id);

    if (updateError) {
      console.error('Failed to update vote count:', updateError.message);
      return;
    }

    setVotedType(type);
  }

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
              modeName="Never Have I Ever"
              color={MODE_COLOR}
              description="Read the statement out loud. If you've done it, you drink - no tapping, just honesty."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0 max-lg:landscape:max-w-2xl max-lg:landscape:py-0">
          {!finished && current && (
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-8 max-lg:landscape:gap-2 overflow-y-auto max-lg:landscape:overflow-visible">
              {/* Icon alone lays over the header row in landscape (same treatment as Classic
                  Trials). The "Never have I ever" label moved into the card itself, right above
                  the statement, so the two are always read together. */}
              <div className="flex flex-col items-center flex-shrink-0 max-lg:landscape:absolute max-lg:landscape:top-1 max-lg:landscape:inset-x-0 max-lg:landscape:z-20 max-lg:landscape:pointer-events-none">
                <div
                  className={`w-24 h-24 max-lg:landscape:w-14 max-lg:landscape:h-14 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 ${GLOW_CLASSES}`}
                  style={glowStyle(MODE_COLOR)}
                >
                  <Hand className="w-11 h-11 max-lg:landscape:w-6 max-lg:landscape:h-6" style={{ color: MODE_COLOR }} strokeWidth={1.6} />
                </div>
              </div>

              <div
                className="rounded-[28px] max-lg:landscape:rounded-[28px] shadow-lg w-full overflow-hidden border max-lg:landscape:flex-shrink-0 max-lg:landscape:mt-3"
                style={{ backgroundColor: '#3b1b5e', borderColor: `${MODE_COLOR}33`, boxShadow: `0 0 32px ${MODE_COLOR}22` }}
              >
                <div className="px-8 pt-9 pb-7 max-lg:landscape:px-7 max-lg:landscape:pt-5 max-lg:landscape:pb-4">
                  <p className="text-white/50 text-xl max-lg:landscape:text-lg mb-2">Never have I ever</p>
                  <p className="text-white text-4xl max-lg:landscape:text-3xl font-bold leading-snug">{current.statement}</p>
                </div>
                <div className="mx-7 mb-7 pt-5 max-lg:landscape:mx-6 max-lg:landscape:mb-4 max-lg:landscape:pt-3 border-t border-white/10">
                  <p className="text-lg max-lg:landscape:text-lg font-semibold" style={{ color: MODE_COLOR }}>
                    If you have - take a sip of your drink.
                  </p>
                </div>
              </div>

              <div className="flex justify-center gap-8 max-lg:landscape:gap-6">
                <button
                  onClick={() => handleVote('dislike')}
                  disabled={votedType !== null}
                  className={`w-14 h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer border ${votedType === 'dislike'
                      ? 'bg-red-500 border-red-500 text-white scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50'
                    } ${votedType !== null && votedType !== 'dislike' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsDown className="w-6 h-6 max-lg:landscape:w-4 max-lg:landscape:h-4" />
                </button>

                <button
                  onClick={() => handleVote('like')}
                  disabled={votedType !== null}
                  className={`w-14 h-14 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer border ${votedType === 'like'
                      ? 'bg-[#00E676] border-[#00E676] text-white scale-110 shadow-[0_0_15px_rgba(0,230,118,0.5)]'
                      : 'bg-[#00E676]/10 border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/20 hover:border-[#00E676]/50'
                    } ${votedType !== null && votedType !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp className="w-6 h-6 max-lg:landscape:w-4 max-lg:landscape:h-4" />
                </button>
              </div>
            </div>
          )}

          {finished && (
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5 max-lg:landscape:gap-2.5 overflow-y-auto">
              <div
                className={`w-20 h-20 max-lg:landscape:w-14 max-lg:landscape:h-14 rounded-full flex items-center justify-center border-2 bg-white/5 ${GLOW_CLASSES}`}
                style={glowStyle(MODE_COLOR)}
              >
                <Hand className="w-9 h-9 max-lg:landscape:w-6 max-lg:landscape:h-6" style={{ color: MODE_COLOR }} strokeWidth={1.6} />
              </div>
              <div>
                <h2 className="text-2xl max-lg:landscape:text-lg font-extrabold">That&apos;s every statement!</h2>
                <p className="text-sm max-lg:landscape:text-xs text-white/70 mt-3 max-lg:landscape:mt-1 max-w-xs mx-auto leading-relaxed">
                  You made it through all {pool.length} - at least someone&apos;s still standing.
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
                className="w-full py-5 text-lg max-lg:landscape:py-2.5 max-lg:landscape:text-base bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </AdsLayout>
  );
}
