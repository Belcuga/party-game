'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Layers, Flame, Beer, Brain, Dices } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { Drink } from '@/app/types/player';
import { GamePlayer, GameState } from '@/app/types/game';
import { RouletteEffect } from '@/app/types/rouletteEffect';
import { GameMessage, GameMessageCategory } from '@/app/types/gameMessage';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import { Question } from '@/app/types/question';
import SettingsMenu from '@/app/components/ui/SettingsMenu';
import HowToPlayButton from '@/app/components/ui/HowToPlayButton';
import Button from '@/app/components/ui/Button';
import { pickMessage, fillTemplate } from '@/app/lib/gameMessages';
import Logo from '../components/ui/logo';

const STAT_POPUP_COOLDOWN_ROUNDS = 3;
const STAT_POPUP_CHANCE = 0.4;
const ROULETTE_COOLDOWN_ROUNDS = 3;
const ROULETTE_CHANCE = 0.3;
const ROULETTE_SPIN_TICKS = 10;
const ROULETTE_SPIN_INTERVAL_MS = 120;
const DRY_STREAK_THRESHOLD = 4;

export default function PlayPage() {
  const router = useRouter();
  const { gameState, setGameState, setLoading } = useGame();
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);
  const [difficultyUpMessage, setDifficultyUpMessage] = useState<string | null>(null);
  const [heatMessage, setHeatMessage] = useState<string | null>(null);
  const [heatPopupOpen, setHeatPopupOpen] = useState(false);
  const [statPopup, setStatPopup] = useState<{ type: GameMessageCategory; message: string } | null>(null);
  const lastStatPopupRoundRef = useRef<Record<string, number>>({});
  const [dryStreakPopup, setDryStreakPopup] = useState<string | null>(null);

  const [roulettePhase, setRoulettePhase] = useState<'idle' | 'spinning' | 'result'>('idle');
  const [rouletteEffect, setRouletteEffect] = useState<RouletteEffect | null>(null);
  const [rouletteWinnerId, setRouletteWinnerId] = useState<string | null>(null);
  const [rouletteSpinIndex, setRouletteSpinIndex] = useState(0);
  const lastRouletteRoundRef = useRef<Record<string, number>>({});
  const rouletteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [gameMessagesPool, setGameMessagesPool] = useState<GameMessage[]>([]);
  const [rouletteEffectsPool, setRouletteEffectsPool] = useState<RouletteEffect[]>([]);

  useEffect(() => {
    if (!gameState?.pendingDifficultyBoost) {
      setHeatMessage(null);
    }
  }, [gameState?.pendingDifficultyBoost]);

  useEffect(() => {
    return () => {
      if (rouletteTimerRef.current) clearInterval(rouletteTimerRef.current);
    };
  }, []);

  useEffect(() => {
    async function loadContent() {
      const { data: messages, error: messagesError } = await supabase
        .from('game_messages')
        .select('*')
        .range(0, 999);
      if (messagesError) console.error('Failed to fetch game messages:', messagesError.message);
      else setGameMessagesPool((messages as unknown as GameMessage[]) ?? []);

      const { data: effects, error: effectsError } = await supabase
        .from('roulette_effects')
        .select('*')
        .range(0, 999);
      if (effectsError) console.error('Failed to fetch roulette effects:', effectsError.message);
      else setRouletteEffectsPool((effects as unknown as RouletteEffect[]) ?? []);
    }
    loadContent();
  }, []);

  useEffect(() => {

    if (!gameState) return;

    if (!gameState.currentPlayerId) {
      const nextPlayerId = pickNextPlayer(gameState);
      const nextQuestion = pickNextQuestion(nextPlayerId, gameState);

      setGameState({
        ...gameState,
        currentPlayerId: nextPlayerId,
        currentQuestion: nextQuestion,
      });
      if (!maybeTriggerRoulette(nextPlayerId)) maybeTriggerDryStreak(nextPlayerId);
    }
    setLoading(false);
  }, [gameState]);

  if (!gameState) {
    return <></>
  }

  const currentPlayer = gameState.players.find(p => p.playerInfo.id === gameState.currentPlayerId);
  const questionText = replacePlayerPlaceholder(
    gameState.currentQuestion?.question || '',
    gameState,
    currentPlayer?.playerInfo.id || ''
  );

  async function handleVote(type: 'like' | 'dislike') {
    if (!gameState || !gameState.currentQuestion) return;

    const questionId = gameState.currentQuestion.id;
    const column = type === 'like' ? 'like_count' : 'dislike_count';

    const { data, error } = await supabase
      .from('questions')
      .select(column)
      .eq('id', questionId)
      .single();

    if (error || !data) {
      console.error('Failed to fetch current vote count:', error?.message);
      return;
    }

    const currentCount = (data as Question)[column] ?? 0;

    const { error: updateError } = await supabase
      .from('questions')
      .update({ [column]: currentCount + 1 })
      .eq('id', questionId);

    if (updateError) {
      console.error('Failed to update vote count:', updateError.message);
      return;
    }

    setVotedType(type);
  }

  function pickNextPlayer(state: GameState): string {
    const available = state.roundPlayersLeft;
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }

  function pickNextQuestion(playerId: string, state: GameState): Question {
    const player = state.players.find(p => p.playerInfo.id === playerId);
    if (!player) {
      const availableQuestions = state.questions.filter(
        q => !state.answeredQuestionIds.includes(q.id) && q.all_players
      );

      if (availableQuestions.length === 0) {
        throw new Error('No questions available for this difficulty');
      }

      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }
    else {
      const desiredDifficulty = state.existingDifficulties[state.tableDifficultyIndex];
      let allPlayersQuestion = false;
      let desiredDifficultyRequired = true;
      if (player.playerInfo.id === '0') {
        allPlayersQuestion = true;
        desiredDifficultyRequired = false;
      }

      const otherPlayers = state.players.filter(
        p => p.playerInfo.id !== player.playerInfo.id &&
          p.playerInfo.gender !== player.playerInfo.gender &&
          p.playerInfo.single &&
          p.playerInfo.id !== '0'
      );
      let diff = desiredDifficulty;
      let availableQuestions: Question[] = [];
      // Search at the desired difficulty, then progressively easier ones. Bounded so a
      // dry pool can't spin forever; desiredDifficultyRequired=false (all_players) only
      // needs one pass since difficulty doesn't factor into that filter.
      while (diff >= 1 && availableQuestions.length === 0) {
        availableQuestions = state.questions.filter(
          q => {
            const matchCount = (q.question.match(/\$\{player\}/g) || []).length;
            const requiredPartners = Math.max(matchCount, q.need_opposite_gender ? 1 : 0);
            return (!desiredDifficultyRequired ||
              (q.difficulty === diff)) &&
              !state.answeredQuestionIds.includes(q.id) &&
              q.all_players === allPlayersQuestion &&
              requiredPartners <= otherPlayers.length &&
              (!q.need_opposite_gender || player.playerInfo.single)
          }

        );
        if (!desiredDifficultyRequired) break;
        diff--;
      }

      if (availableQuestions.length === 0) {
        // Every unanswered question at or below the desired difficulty is used up.
        // Allow repeats rather than getting stuck with nothing to show.
        availableQuestions = state.questions.filter(
          q => {
            const matchCount = (q.question.match(/\$\{player\}/g) || []).length;
            const requiredPartners = Math.max(matchCount, q.need_opposite_gender ? 1 : 0);
            return q.all_players === allPlayersQuestion &&
              requiredPartners <= otherPlayers.length &&
              (!q.need_opposite_gender || player.playerInfo.single);
          }
        );
      }

      if (availableQuestions.length === 0) {
        throw new Error('No questions available for this configuration');
      }

      return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    }

  }

  function replacePlayerPlaceholder(question: string, state: GameState, currentPlayerId: string): string {
    const PLACEHOLDER = '${player}';

    if (!question.includes(PLACEHOLDER)) return question;

    const currentPlayer = state.players.find(p => p.playerInfo.id === currentPlayerId);
    if (!currentPlayer) return question;
    // Filter eligible other players
    const otherPlayers = state.players.filter(
      p => p.playerInfo.id !== currentPlayerId &&
        p.playerInfo.gender !== currentPlayer.playerInfo.gender &&
        p.playerInfo.single &&
        p.playerInfo.id !== '0'
    );
    const placeholderCount = (question.match(/\$\{player\}/g) || []).length;
    if (otherPlayers.length === 0) return question;

    // Count how many placeholders are in the string
    // const placeholderCount = (question.match(/\$\{player\}/g) || []).length;

    // Shuffle and pick unique players for each placeholder
    const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
    const pickedPlayers = shuffled.slice(0, placeholderCount);

    let replaced = question;
    for (let i = 0; i < placeholderCount; i++) {
      const name = pickedPlayers[i % pickedPlayers.length].playerInfo.name;
      replaced = replaced.replace(PLACEHOLDER, name);
    }

    return replaced;
  }

  function evaluateStatPopup(actorId: string, players: GamePlayer[]): { type: GameMessageCategory; message: string } | null {
    const realPlayers = players.filter(p => p.playerInfo.id !== '0');
    const actor = realPlayers.find(p => p.playerInfo.id === actorId);
    if (!actor) return null;

    const total = actor.totalQuestionsAnswered + actor.drankCount;
    const maxDrank = Math.max(...realPlayers.map(p => p.drankCount));
    const maxAnswered = Math.max(...realPlayers.map(p => p.totalQuestionsAnswered));

    const isTopDrinker = actor.drankCount >= 3 && actor.drankCount === maxDrank;
    const isTopAnswerer = actor.totalQuestionsAnswered >= 3 && actor.totalQuestionsAnswered === maxAnswered;
    const heavyDrinker = total >= 4 && actor.drankCount / total >= 0.75;
    const heavyAnswerer = total >= 4 && actor.totalQuestionsAnswered / total >= 0.75;

    const name = actor.playerInfo.name;
    if (isTopDrinker) return { type: 'stat_top_drinker', message: pickMessage(gameMessagesPool, 'stat_top_drinker', { name, count: String(actor.drankCount) }) };
    if (isTopAnswerer) return { type: 'stat_top_answerer', message: pickMessage(gameMessagesPool, 'stat_top_answerer', { name, count: String(actor.totalQuestionsAnswered) }) };
    if (heavyDrinker) return { type: 'stat_heavy_drinker', message: pickMessage(gameMessagesPool, 'stat_heavy_drinker', { name, count: String(actor.drankCount) }) };
    if (heavyAnswerer) return { type: 'stat_heavy_answerer', message: pickMessage(gameMessagesPool, 'stat_heavy_answerer', { name, count: String(actor.totalQuestionsAnswered) }) };
    return null;
  }

  /** Rolled for whoever is about to come up next, before their question is revealed.
   *  Returns whether it actually triggered, so callers can skip the dry-streak reminder
   *  when the roulette popup already claimed this player's pre-turn moment. */
  function maybeTriggerRoulette(nextPlayerId: string): boolean {
    if (!gameState || !gameState.punishmentRouletteEnabled) return false;
    if (nextPlayerId === '0') return false;
    if (rouletteEffectsPool.length === 0) return false;

    const lastRound = lastRouletteRoundRef.current[nextPlayerId];
    const offCooldown = lastRound === undefined || gameState.roundNumber - lastRound > ROULETTE_COOLDOWN_ROUNDS;
    if (!offCooldown) return false;
    if (Math.random() >= ROULETTE_CHANCE) return false;

    lastRouletteRoundRef.current[nextPlayerId] = gameState.roundNumber;

    const effect = rouletteEffectsPool[Math.floor(Math.random() * rouletteEffectsPool.length)];
    setRouletteWinnerId(nextPlayerId);
    setRouletteEffect(effect);
    setRoulettePhase('spinning');
    setRouletteSpinIndex(0);

    let ticks = 0;
    if (rouletteTimerRef.current) clearInterval(rouletteTimerRef.current);
    rouletteTimerRef.current = setInterval(() => {
      ticks += 1;
      if (ticks >= ROULETTE_SPIN_TICKS) {
        if (rouletteTimerRef.current) clearInterval(rouletteTimerRef.current);
        setRoulettePhase('result');
      } else {
        setRouletteSpinIndex(Math.floor(Math.random() * rouletteEffectsPool.length));
      }
    }, ROULETTE_SPIN_INTERVAL_MS);

    return true;
  }

  function dismissRoulette() {
    setRoulettePhase('idle');
    setRouletteEffect(null);
    setRouletteWinnerId(null);
  }

  /** Checked for whoever is about to come up next, right after a roulette spin didn't
   *  already claim their pre-turn moment. Fires once their answer streak (rounds in a
   *  row where they answered instead of drinking) crosses the threshold, then resets it. */
  function maybeTriggerDryStreak(nextPlayerId: string) {
    if (!gameState) return;
    if (nextPlayerId === '0') return;
    if (gameMessagesPool.length === 0) return;

    const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
    if (!player || player.answerStreak < DRY_STREAK_THRESHOLD) return;

    const message = pickMessage(gameMessagesPool, 'dry_streak', {
      name: player.playerInfo.name,
      count: String(player.answerStreak),
    });
    if (!message) return;

    setDryStreakPopup(message);
    player.answerStreak = 0;
  }

  function recordTurnChoice(choice: 'answered' | 'drank') {
    if (!gameState || !gameState.currentPlayerId) return;

    const actor = gameState.players.find(p => p.playerInfo.id === gameState.currentPlayerId);
    if (actor && actor.playerInfo.id !== '0') {
      if (choice === 'answered') {
        actor.totalQuestionsAnswered += 1;
        actor.answerStreak += 1;
      } else {
        actor.drankCount += 1;
        actor.answerStreak = 0;
      }

      const lastPopupRound = lastStatPopupRoundRef.current[actor.playerInfo.id];
      const offCooldown = lastPopupRound === undefined || gameState.roundNumber - lastPopupRound > STAT_POPUP_COOLDOWN_ROUNDS;

      if (offCooldown) {
        const evaluation = evaluateStatPopup(actor.playerInfo.id, gameState.players);
        if (evaluation && Math.random() < STAT_POPUP_CHANCE) {
          setStatPopup(evaluation);
          lastStatPopupRoundRef.current[actor.playerInfo.id] = gameState.roundNumber;
        }
      }
    }

    handleNext();
  }

  function handleNext() {
    if (!gameState) return;
    const updatedAnsweredIds = [...gameState.answeredQuestionIds, gameState.currentQuestion?.id ?? 0];
    const updatedRoundPlayersLeft = gameState.roundPlayersLeft.filter(id => id !== gameState.currentPlayerId);
    let updatedRoundNumber = gameState.roundNumber;

    // First: If still normal players left, difficulty doesn't change mid-round.
    if (updatedRoundPlayersLeft.length > 0) {
      const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: updatedRoundPlayersLeft });

      const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
      if (!player) return;

      const nextQuestion = pickNextQuestion(nextPlayerId, {
        ...gameState,
        answeredQuestionIds: updatedAnsweredIds,
      });

      setGameState({
        ...gameState,
        answeredQuestionIds: updatedAnsweredIds,
        roundPlayersLeft: updatedRoundPlayersLeft,
        currentPlayerId: nextPlayerId,
        currentQuestion: nextQuestion,
      });
      if (!maybeTriggerRoulette(nextPlayerId)) maybeTriggerDryStreak(nextPlayerId);

      setVotedType(null);
      return;
    }

    // If players finished and bonus was done -> start new round
    const newRoundPlayers = gameState.players.map(p => p.playerInfo.id);
    updatedRoundNumber += 1;

    // The whole table climbs together: automatically every 5 rounds, or immediately
    // (well, at this next-round boundary) if someone requested it with the Heat button.
    const maxDifficultyIndex = gameState.existingDifficulties.length - 1;
    const naturalBump = updatedRoundNumber % 5 === 1 && updatedRoundNumber !== 1;
    const shouldBump = naturalBump || gameState.pendingDifficultyBoost;
    const updatedTableDifficultyIndex = shouldBump
      ? Math.min(gameState.tableDifficultyIndex + 1, maxDifficultyIndex)
      : gameState.tableDifficultyIndex;

    if (updatedTableDifficultyIndex > gameState.tableDifficultyIndex) {
      setDifficultyUpMessage(pickMessage(gameMessagesPool, 'difficulty_up', { level: String(updatedTableDifficultyIndex + 1) }));
    }

    const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: newRoundPlayers });

    const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
    if (!player) return;

    const nextQuestion = pickNextQuestion(nextPlayerId, {
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
      tableDifficultyIndex: updatedTableDifficultyIndex,
    });

    setGameState({
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
      roundPlayersLeft: newRoundPlayers,
      roundNumber: updatedRoundNumber,
      currentPlayerId: nextPlayerId,
      currentQuestion: nextQuestion,
      tableDifficultyIndex: updatedTableDifficultyIndex,
      pendingDifficultyBoost: false,
    });
    if (!maybeTriggerRoulette(nextPlayerId)) maybeTriggerDryStreak(nextPlayerId);

    setVotedType(null);
  }

  function handleRequestHeat() {
    if (!gameState || gameState.pendingDifficultyBoost) return;
    const maxDifficultyIndex = gameState.existingDifficulties.length - 1;
    if (gameState.tableDifficultyIndex >= maxDifficultyIndex) return;

    setHeatMessage(pickMessage(gameMessagesPool, 'heat_confirm'));
    setHeatPopupOpen(true);
  }

  function confirmHeat() {
    if (!gameState) return;
    setGameState({ ...gameState, pendingDifficultyBoost: true });
    setHeatPopupOpen(false);
  }

  function declineHeat() {
    setHeatPopupOpen(false);
    setHeatMessage(null);
  }

  function showNumberOfSips() {
    if (gameState?.currentQuestion?.all_players) {
      const punishment = gameState.currentQuestion.punishment ?? 0;
      const sips = [
        `Beer drinker - take ${Math.ceil(punishment * 1.5)} ${Math.ceil(punishment * 1.5) === 1 ? 'sip' : 'sips'}`,
        `Wine drinker - take ${punishment * 1} ${Math.ceil(punishment * 1.5) === 1 ? 'sip' : 'sips'}`,
        `Strong drinks - take ${Math.ceil(punishment * 0.5)} ${Math.ceil(punishment * 1.5) === 1 ? 'sip' : 'sips'}`,
      ];

      if (gameState.currentQuestion.question.includes('Everyone')) {
        sips.unshift('If your answer is yes and you are:')
      }
      else if (gameState.currentQuestion.question.includes(`Who's`)) {
        sips.unshift('The person with most votes, if they are:')
      }

      return sips.map((line, idx) => (
        <p key={idx} className={`leading-tight text-left ${idx === 0 ? 'font-semibold' : ''}`}>
          {line}
        </p>
      ));
    } else {
      const multiplier =
        currentPlayer?.playerInfo.drink === Drink.Beer
          ? 1.5
          : currentPlayer?.playerInfo.drink === Drink.Wine
            ? 1
            : 0.5;
      const sips = Math.ceil((gameState?.currentQuestion?.punishment ?? 0) * multiplier);
      return (
        <p className="leading-tight text-middle font-semibold">
          {gameState?.currentQuestion?.challenge ? 'Do' : 'Answer'} or Take {sips} {sips === 1 ? 'sip' : 'sips'}
        </p>
      );
    }
  }

  return (
    <AdsLayout>
      <main className="flex flex-col items-center h-full max-lg:landscape:relative">
        <div className="w-full flex items-center justify-between px-6 mb-6 max-lg:landscape:mb-0.5 flex-shrink-0 max-lg:landscape:gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:text-gray-300 cursor-pointer"
            >
              <ArrowLeft />
            </button>

            {/* Landscape: logo + title join the back button on the left. */}
            <div className="hidden max-lg:landscape:flex items-center gap-2">
              <Logo className="w-14 h-14" />
              <h1 className="text-2xl font-extrabold drop-shadow-lg whitespace-nowrap">Tipsy Trials</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 max-lg:landscape:hidden">
            <Logo/>
            <h1 className="text-2xl sm:text-4xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>

          <div className="flex items-center gap-3 max-lg:landscape:gap-2">
            {/* Round/level sits just left of the heat control in landscape. */}
            <div className="hidden max-lg:landscape:flex items-center gap-1.5 text-[11px] font-semibold text-white/70 whitespace-nowrap">
              <span>Round {gameState.roundNumber}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span style={{ color: '#00E676' }}>
                Level {gameState.tableDifficultyIndex + 1} of {gameState.existingDifficulties.length}
              </span>
            </div>

            {/* Heat control: icon-only in landscape, same header row. */}
            {gameState.tableDifficultyIndex < gameState.existingDifficulties.length - 1 && (
              gameState.pendingDifficultyBoost ? (
                <span
                  className="hidden max-lg:landscape:flex w-7 h-7 rounded-full items-center justify-center bg-red-500/10 border border-red-500/25 flex-shrink-0"
                  title={heatMessage ?? 'Queued for next round.'}
                >
                  <Flame className="w-3.5 h-3.5 text-red-400" fill="currentColor" />
                </span>
              ) : (
                <button
                  onClick={handleRequestHeat}
                  style={{
                    background: 'linear-gradient(135deg, #ff5b3d, #e60049)',
                    animation: 'heatPulse 2.2s ease-in-out infinite',
                  }}
                  className="hidden max-lg:landscape:flex w-7 h-7 rounded-full items-center justify-center text-white cursor-pointer flex-shrink-0"
                  aria-label="Turn Up The Heat"
                  title="Turn Up The Heat"
                >
                  <Flame className="w-3.5 h-3.5" fill="currentColor" />
                </button>
              )
            )}
            <HowToPlayButton
              modeName="Classic Trials"
              color="#00E676"
              description="Each round, everyone gets one question or dare - answer it or take the sips shown. Difficulty climbs as the night goes on, and anyone can hit Turn Up The Heat to speed that up."
            />
            <SettingsMenu />
          </div>
        </div>

        <div className="flex flex-col items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-2 flex-1 min-h-0 max-lg:landscape:max-w-xl max-lg:landscape:py-0">
          {/* Round/level + heat: top-anchored, own row - portrait only (landscape keeps this in
              the header). Kept out of the centered block below so it doesn't eat into the room
              that gives the turn/question their presence. */}
          <div className="max-lg:landscape:hidden w-full flex-shrink-0 pt-1 pb-3 flex items-center justify-center flex-wrap gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="text-xs font-semibold text-white/70">Round {gameState.roundNumber}</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-xs font-semibold" style={{ color: '#00E676' }}>
                Level {gameState.tableDifficultyIndex + 1} of {gameState.existingDifficulties.length}
              </span>
            </div>

            {gameState.tableDifficultyIndex < gameState.existingDifficulties.length - 1 && (
              gameState.pendingDifficultyBoost ? (
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-200 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 text-red-400" fill="currentColor" />
                  {heatMessage ?? 'Queued for next round.'}
                </div>
              ) : (
                <button
                  onClick={handleRequestHeat}
                  style={{
                    background: 'linear-gradient(90deg, #ff5b3d, #e60049)',
                    animation: 'heatPulse 2.2s ease-in-out infinite',
                  }}
                  className="flex items-center gap-1.5 pl-3 pr-4 py-1.5 rounded-full text-white text-xs font-extrabold transition-transform hover:scale-105 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" fill="currentColor" />
                  Turn Up The Heat
                </button>
              )
            )}
          </div>

          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center max-lg:landscape:justify-start gap-6 max-lg:landscape:gap-0 max-lg:landscape:overflow-visible overflow-y-auto">
            {/* Icon + turn: in landscape this is pulled out of the flow entirely and laid over the
                header row (position: absolute + z-index), instead of competing with it for space
                below - the card block gets a matching top offset so it starts clear of this.
                (overflow-y-auto is dropped for landscape specifically - an overflow:auto/hidden
                ancestor clips absolutely-positioned descendants no matter their containing block,
                so it would otherwise cancel the overlap; the outer AdsLayout panel still scrolls
                the whole page as a fallback.) */}
            <div className="flex flex-col items-center gap-4 max-lg:landscape:gap-0.5 flex-shrink-0 max-lg:landscape:absolute max-lg:landscape:top-1 max-lg:landscape:inset-x-0 max-lg:landscape:z-20 max-lg:landscape:pointer-events-none">
              <div
                className="w-20 h-20 max-lg:landscape:w-10 max-lg:landscape:h-10 rounded-full flex items-center justify-center border-2 bg-white/5 flex-shrink-0 shadow-[0_0_28px_#00E67655] max-lg:landscape:shadow-[0_0_10px_#00E67699,0_0_3px_#00E676cc]"
                style={{ borderColor: '#00E676' }}
              >
                <Layers className="w-9 h-9 max-lg:landscape:w-4 max-lg:landscape:h-4" style={{ color: '#00E676' }} strokeWidth={1.7} />
              </div>

              <h2 className="text-2xl max-lg:landscape:text-2xl">
                <b className="font-bold text-3xl max-lg:landscape:text-3xl" style={{ color: '#00E676' }}>{currentPlayer?.playerInfo.name}</b>
                {`${currentPlayer?.playerInfo.id === '0' ? '\'' : '\'s'} Turn`}
              </h2>
            </div>

            {/* Card + vote buttons: takes whatever room is left under the overlapping icon+turn
                group, and centers itself within it. max-lg:landscape:pt-16 clears the absolutely
                positioned icon+turn block above so the card never renders underneath it. */}
            <div className="w-full flex flex-col items-center justify-center gap-5 max-lg:landscape:flex-1 max-lg:landscape:min-h-0 max-lg:landscape:gap-2 max-lg:landscape:pt-16">
              <div
                className="rounded-[28px] max-lg:landscape:rounded-2xl shadow-lg w-full overflow-hidden max-lg:landscape:flex-shrink-0 border"
                style={{ backgroundColor: '#3b1b5e', borderColor: '#00E67633', boxShadow: '0 0 32px #00E67622' }}
              >
                <div className="px-7 pt-8 pb-5 max-lg:landscape:px-6 max-lg:landscape:pt-4 max-lg:landscape:pb-3">
                  <p className="text-white text-2xl max-lg:landscape:text-2xl font-semibold leading-snug">{questionText}</p>
                </div>
                <div className="mx-6 mb-6 pt-4 max-lg:landscape:mx-4 max-lg:landscape:mb-3 max-lg:landscape:pt-2 border-t border-white/10">
                  <div className="space-y-1 max-lg:landscape:text-sm" style={{ color: '#00E676' }}>{showNumberOfSips()}</div>
                </div>
              </div>

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
            </div>
          </div>

          <div className="w-full flex-shrink-0 pb-4 pt-2 max-lg:landscape:pb-2 max-lg:landscape:pt-1 flex flex-col items-center gap-3 max-lg:landscape:gap-1.5">
            {currentPlayer?.playerInfo.id === '0' ? (
              <button
                onClick={handleNext}
                className="w-full py-4 max-lg:landscape:py-2.5 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer"
              >
                Next
              </button>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => recordTurnChoice('answered')}
                  className="flex-1 py-4 max-lg:landscape:py-2.5 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg transition-all duration-200 cursor-pointer"
                >
                  I Answered
                </button>
                <button
                  onClick={() => recordTurnChoice('drank')}
                  className="flex-1 py-4 max-lg:landscape:py-2.5 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  I Took the Sip(s)
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {difficultyUpMessage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-[#1b003c] border border-[#ffffff15] rounded-3xl p-7 flex flex-col items-center text-center gap-4 shadow-[0_0_40px_rgba(0,230,118,0.15)]">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white/5"
              style={{ borderColor: '#00E676', boxShadow: '0 0 28px #00E67666' }}
            >
              <Flame className="w-7 h-7" style={{ color: '#00E676' }} strokeWidth={1.7} />
            </div>
            <p className="text-lg font-bold leading-snug">{difficultyUpMessage}</p>
            <Button onClick={() => setDifficultyUpMessage(null)} className="w-full mt-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {heatPopupOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-xs bg-[#1b003c] border border-[#ffffff15] rounded-3xl p-7 flex flex-col items-center text-center gap-4 shadow-[0_0_40px_rgba(255,64,64,0.2)]">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff5b3d, #e60049)', boxShadow: '0 0 28px rgba(255,64,64,0.5)' }}
            >
              <Flame className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <div>
              <p className="text-lg font-bold leading-snug">Turn Up The Heat</p>
              <p className="text-sm text-white/70 leading-relaxed mt-2">{heatMessage}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={declineHeat}
                className="flex-1 py-3 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer"
              >
                Never mind
              </button>
              <button
                onClick={confirmHeat}
                className="flex-1 py-3 rounded-lg text-white font-bold cursor-pointer transition-transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(90deg, #ff5b3d, #e60049)' }}
              >
                Bring it on
              </button>
            </div>
          </div>
        </div>
      )}

      {dryStreakPopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-[#1b003c] border border-[#ffffff15] rounded-3xl p-7 flex flex-col items-center text-center gap-4"
            style={{ boxShadow: '0 0 40px rgba(255,183,3,0.18)' }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white/5"
              style={{ borderColor: '#ffb703', boxShadow: '0 0 28px #ffb70366' }}
            >
              <Beer className="w-7 h-7" style={{ color: '#ffb703' }} strokeWidth={1.7} />
            </div>
            <p className="text-lg font-bold leading-snug">{dryStreakPopup}</p>
            <Button onClick={() => setDryStreakPopup(null)} className="w-full mt-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {statPopup && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-xs bg-[#1b003c] border border-[#ffffff15] rounded-3xl p-7 flex flex-col items-center text-center gap-4"
            style={{
              boxShadow: statPopup.type === 'stat_top_drinker' || statPopup.type === 'stat_heavy_drinker'
                ? '0 0 40px rgba(255,183,3,0.18)'
                : '0 0 40px rgba(0,230,118,0.18)',
            }}
          >
            {(() => {
              const isDrinkTheme = statPopup.type === 'stat_top_drinker' || statPopup.type === 'stat_heavy_drinker';
              const color = isDrinkTheme ? '#ffb703' : '#00E676';
              const Icon = isDrinkTheme ? Beer : Brain;
              return (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center border-2 bg-white/5"
                  style={{ borderColor: color, boxShadow: `0 0 28px ${color}66` }}
                >
                  <Icon className="w-7 h-7" style={{ color }} strokeWidth={1.7} />
                </div>
              );
            })()}
            <p className="text-lg font-bold leading-snug">{statPopup.message}</p>
            <Button onClick={() => setStatPopup(null)} className="w-full mt-1">
              Continue
            </Button>
          </div>
        </div>
      )}

      {roulettePhase !== 'idle' && rouletteEffect && (() => {
        const winner = gameState.players.find(p => p.playerInfo.id === rouletteWinnerId);
        const spinLabel = rouletteEffectsPool[rouletteSpinIndex]?.label ?? '';

        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div
              className="relative w-full max-w-xs bg-[#1b003c] border border-[#ffffff15] rounded-3xl p-7 flex flex-col items-center text-center gap-4"
              style={{ boxShadow: '0 0 40px rgba(230,0,73,0.25)' }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff5b3d, #e60049)', boxShadow: '0 0 28px rgba(230,0,73,0.5)' }}
              >
                <Dices className="w-7 h-7 text-white" />
              </div>

              <p className="text-sm text-white/60">
                <span className="font-bold text-white">{winner?.playerInfo.name}</span> hit the roulette!
              </p>

              {roulettePhase === 'spinning' && (
                <p className="text-xl font-extrabold leading-snug min-h-[3.5rem] flex items-center">{spinLabel}</p>
              )}

              {roulettePhase === 'result' && (
                <>
                  <p className="text-lg font-bold leading-snug">
                    {fillTemplate(rouletteEffect.description, { player: winner?.playerInfo.name ?? '' })}
                  </p>
                  <Button onClick={dismissRoulette} className="w-full mt-1">
                    Continue
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </AdsLayout>
  );
}
