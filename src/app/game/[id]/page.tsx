'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { Drink } from '@/app/types/player';
import { GameState } from '@/app/types/game';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import { Question } from '@/app/types/question';
import SettingsMenu from '@/app/components/ui/SettingsMenu';

export default function PlayPage() {
  const router = useRouter();
  const { gameState, setGameState, setLoading } = useGame();
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);

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
      const desiredDifficulty = player.difficultyQueue[player.difficultyIndex];
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
      while (availableQuestions.length === 0) {
        availableQuestions = state.questions.filter(
          q => {
            const matchCount = (q.question.match(/\$\{player\}/g) || []).length;
            return (!desiredDifficultyRequired ||
              (q.difficulty === diff)) &&
              !state.answeredQuestionIds.includes(q.id) &&
              q.all_players === allPlayersQuestion &&
              matchCount <= otherPlayers.length
          }

        );
        diff--;
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

  function handleNext() {
    if (!gameState) return;
    const updatedAnsweredIds = [...gameState.answeredQuestionIds, gameState.currentQuestion?.id ?? 0];
    const updatedRoundPlayersLeft = gameState.roundPlayersLeft.filter(id => id !== gameState.currentPlayerId);
    let updatedRoundNumber = gameState.roundNumber;

    // First: If still normal players left
    if (updatedRoundPlayersLeft.length > 0) {
      const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: updatedRoundPlayersLeft });

      const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
      if (!player) return;

      let updatedDifficultyIndex = player.difficultyIndex + 1;
      if (updatedDifficultyIndex >= gameState.existingDifficulties.length) {
        player.difficultyQueue = shuffleArray(gameState.existingDifficulties);
        updatedDifficultyIndex = 0;
      }
      player.difficultyIndex = updatedDifficultyIndex;

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

      setVotedType(null);
      return;
    }

    // If players finished and bonus was done -> start new round
    const newRoundPlayers = gameState.players.map(p => p.playerInfo.id);
    updatedRoundNumber += 1;

    // Give extra skip every 10 rounds
    if (updatedRoundNumber % 10 === 1 && updatedRoundNumber !== 1) {
      gameState.players.forEach(player => player.skipCount++);
    }

    const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: newRoundPlayers });

    const player = gameState.players.find(p => p.playerInfo.id === nextPlayerId);
    if (!player) return;

    let updatedDifficultyIndex = player.difficultyIndex + 1;
    if (updatedDifficultyIndex >= gameState.existingDifficulties.length) {
      player.difficultyQueue = shuffleArray(gameState.existingDifficulties);
      updatedDifficultyIndex = 0;
    }
    player.difficultyIndex = updatedDifficultyIndex;

    const nextQuestion = pickNextQuestion(nextPlayerId, {
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
    });

    setGameState({
      ...gameState,
      answeredQuestionIds: updatedAnsweredIds,
      roundPlayersLeft: newRoundPlayers,
      roundNumber: updatedRoundNumber,
      currentPlayerId: nextPlayerId,
      currentQuestion: nextQuestion,
    });

    setVotedType(null);
  }

  function showNumberOfSips() {
    if (gameState?.currentQuestion?.all_players) {
      const punishment = gameState.currentQuestion.punishment ?? 0;
      const sips = [
        `Beer drinker - take ${Math.ceil(punishment * 1.5)} sips`,
        `Wine drinker - take ${punishment * 1} sips`,
        `Strong drinks - take ${Math.ceil(punishment * 0.5)} sips`,
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
        <p className="leading-tight text-left font-semibold">
          Answer or Take {sips} Sips
        </p>
      );
    }
  }

  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function handleSkip() {
    if (!gameState) return;

    const currentPlayerId = gameState.currentPlayerId;
    const currentQuestion = gameState.currentQuestion;

    if (!currentPlayerId || !currentQuestion) return;

    const playerIndex = gameState.players.findIndex(p => p.playerInfo.id === currentPlayerId);
    if (playerIndex === -1) return;

    const player = gameState.players[playerIndex];

    // ✅ Find another question with SAME difficulty (not answered + not current)
    const availableQuestions = gameState.questions.filter(
      (q) =>
        q.difficulty === currentQuestion.difficulty &&
        !gameState.answeredQuestionIds.includes(q.id) &&
        q.id !== currentQuestion.id &&
        !q.all_players
    );

    if (availableQuestions.length === 0) {
      console.warn('No more questions available for this difficulty.');
      return;
    }

    // 🔀 Pick a random new question
    const newQuestion =
      availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    // ✅ Reduce skip count for the player (minimum 0)
    const updatedPlayers = [...gameState.players];
    updatedPlayers[playerIndex] = {
      ...player,
      skipCount: Math.max(0, player.skipCount - 1),
    };

    // ✅ Update game state with new question + updated skip count
    setGameState({
      ...gameState,
      players: updatedPlayers,
      currentQuestion: newQuestion,
    });

    setVotedType(null); // Reset like/dislike highlight
  }

  return (
    <AdsLayout>
      <div className="flex flex-col justify-between items-center text-center w-full max-w-2xl mx-auto h-full px-4 py-4">
        {/* Top: Back + Settings */}
        <div className="flex justify-between items-center w-full mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 hover:text-gray-300 cursor-pointer"
          >
            <ArrowLeft />
          </button>

          <div className="flex items-center gap-2 ml-[-20px] cursor-pointer">
            <img src="/logo.png" width={40} height={40} alt="Logo" />
            <h1 className="text-2xl font-bold">Tipsy Trials</h1>
          </div>

          <SettingsMenu/>
        </div>

        {/* Main content */}
        <div className="flex flex-col items-center w-full flex-1">

          <h2 className="text-xl mb-4">
            {`${currentPlayer?.playerInfo.id === '0'
              ? currentPlayer?.playerInfo.name + '\''
              : currentPlayer?.playerInfo.name + '\'s'
              } Turn`}
          </h2>

          {/* Question */}
          <div className="bg-white rounded-3xl shadow-lg w-full mb-6">
            <div className="p-6">
              <p className="text-[#1b003c] text-lg font-medium mb-4">{questionText}</p>
              <div className="text-[#1b003c] space-y-1.5">{showNumberOfSips()}</div>
            </div>
          </div>

          {/* Action buttons - Fixed at bottom */}
          <div className="fixed inset-x-0 bottom-16 bg-gradient-to-t from-[#1b003c] via-[#1b003c]/80 to-transparent pb-8 pt-12">
            <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto px-4">
              <div className="flex justify-center gap-10 mb-2">
                <button
                  onClick={() => handleVote('dislike')}
                  disabled={votedType !== null}
                  className={`w-12 h-12 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer ${
                    votedType === 'dislike'
                      ? 'bg-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                      : 'bg-gray-100 hover:bg-gray-200'
                    } ${
                      votedType !== null && votedType !== 'dislike'
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                >
                  <ThumbsDown className={votedType === 'dislike' ? 'text-white' : 'text-[#1b003c]'} />
                </button>

                <button
                  onClick={() => handleVote('like')}
                  disabled={votedType !== null}
                  className={`w-12 h-12 rounded-full flex justify-center items-center transition-all duration-300 cursor-pointer ${
                    votedType === 'like'
                      ? 'bg-[#00E676] scale-110 shadow-[0_0_15px_rgba(0,230,118,0.5)]'
                      : 'bg-gray-100 hover:bg-gray-200'
                    } ${
                      votedType !== null && votedType !== 'like'
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                >
                  <ThumbsUp className={votedType === 'like' ? 'text-white' : 'text-[#1b003c]'} />
                </button>
              </div>

              <div className="relative w-60">
                <button
                  onClick={handleNext}
                  className="w-full py-4 bg-gradient-to-r from-[#00E676] to-[#2196F3] hover:from-[#00E676]/90 hover:to-[#2196F3]/90 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200  cursor-pointer"
                >
                  Next
                </button>

                {(currentPlayer?.skipCount ?? 0) > 0 && currentPlayer?.playerInfo.id !== '0' && (
                  <button
                    onClick={handleSkip}
                    className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-20 py-2 bg-[#3b1b5e] hover:bg-[#4e2a8e] text-white font-bold rounded-lg transition-colors cursor-pointer duration-300"
                  >
                    Skip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdsLayout>
  );
}
