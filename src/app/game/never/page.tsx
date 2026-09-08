'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Hand } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { NhieStatement } from '@/app/types/nhieStatement';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import Button from '@/app/components/ui/Button';
import Logo from '../../components/ui/logo';

const MODE_COLOR = '#ff6fd8';

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
  const [answeredIds, setAnsweredIds] = useState<number[]>([]);
  const [current, setCurrent] = useState<NhieStatement | null>(null);
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);
  const [finished, setFinished] = useState(false);

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
      setCurrent(shuffled[0] ?? null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickNext(justAnsweredIds: number[]) {
    const next = pool.find((s) => !justAnsweredIds.includes(s.id));
    if (!next) {
      setFinished(true);
      setCurrent(null);
      return;
    }
    setCurrent(next);
  }

  function handleNext() {
    if (!current) return;
    const updatedAnsweredIds = [...answeredIds, current.id];
    setAnsweredIds(updatedAnsweredIds);
    setVotedType(null);
    pickNext(updatedAnsweredIds);
  }

  function handlePlayAgain() {
    const reshuffled = shuffleArray(pool);
    setPool(reshuffled);
    setAnsweredIds([]);
    setCurrent(reshuffled[0] ?? null);
    setFinished(false);
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
              modeName="Never Have I Ever"
              color={MODE_COLOR}
              description="Read the statement out loud. If you've done it, you drink - no tapping, just honesty."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0">
          {!finished && current && (
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-7">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0"
                style={{ borderColor: MODE_COLOR, boxShadow: `0 0 28px ${MODE_COLOR}55` }}
              >
                <Hand className="w-7 h-7" style={{ color: MODE_COLOR }} strokeWidth={1.6} />
              </div>

              <div className="max-w-md">
                <p className="text-base text-white/50">Never have I ever</p>
                <p className="text-3xl sm:text-4xl font-extrabold leading-snug mt-2">{current.statement}</p>
              </div>

              <div
                className="inline-flex items-center px-4 py-2 rounded-full border bg-white/5"
                style={{ borderColor: `${MODE_COLOR}66` }}
              >
                <span className="text-sm font-medium">If you have - take a sip of your drink.</span>
              </div>

              <div className="flex justify-center gap-8">
                <button
                  onClick={() => handleVote('dislike')}
                  disabled={votedType !== null}
                  className={`w-11 h-11 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer ${votedType === 'dislike'
                      ? 'bg-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-white/10 hover:bg-white/15'
                    } ${votedType !== null && votedType !== 'dislike' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleVote('like')}
                  disabled={votedType !== null}
                  className={`w-11 h-11 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer ${votedType === 'like'
                      ? 'bg-[#00E676] scale-110 shadow-[0_0_15px_rgba(0,230,118,0.5)]'
                      : 'bg-white/10 hover:bg-white/15'
                    } ${votedType !== null && votedType !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {finished && (
            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center border-2 bg-white/5"
                style={{ borderColor: MODE_COLOR, boxShadow: `0 0 32px ${MODE_COLOR}55` }}
              >
                <Hand className="w-9 h-9" style={{ color: MODE_COLOR }} strokeWidth={1.6} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">That&apos;s every statement!</h2>
                <p className="text-sm text-white/70 mt-3 max-w-xs mx-auto leading-relaxed">
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
            <div className="w-full pb-4 pt-2 flex-shrink-0">
              <button
                onClick={handleNext}
                className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer"
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
