'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, ThumbsUp, ThumbsDown, Settings } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { Drink } from '@/app/types/player';
import { GameState } from '@/app/types/game';
import AdsLayout from '@/app/components/ad-layout/AdsLayout';
import { Question } from '@/app/types/question';

export default function PlayPage() {
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  const [localLoading, setLocalLoading] = useState(true);
  const [votedType, setVotedType] = useState<'like' | 'dislike' | null>(null);
  const [showSettings, setShowSettings] = useState(false);

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

    setLocalLoading(false);
  }, [gameState]);

  if (!gameState || localLoading) {
    return <div>Loading...</div>;
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

    const currentCount = (data as any)[column] ?? 0;

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
      const availableQuestions = state.questions.filter(
        q => (!desiredDifficultyRequired || (q.difficulty === desiredDifficulty)) && !state.answeredQuestionIds.includes(q.id) && q.all_players === allPlayersQuestion
      );
      if (availableQuestions.length === 0) {
        throw new Error('No questions available for this difficulty');
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
        p.playerInfo.id !== '0'
    );

    if (otherPlayers.length === 0) return question;

    // Count how many placeholders are in the string
    const placeholderCount = (question.match(/\$\{player\}/g) || []).length;

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
        `Beer drinkers take ${punishment * 2} sips`,
        `Wine drinkers take ${punishment * 1} sips`,
        `Strong drink drinkers take ${Math.ceil(punishment * 0.5)} sips`,
      ];

      return sips.map((line, idx) => (
        <p key={idx} className="leading-tight text-left font-semibold">
          {line}
        </p>
      ));
    } else {
      const multiplier =
        currentPlayer?.playerInfo.drink === Drink.Beer
          ? 2
          : currentPlayer?.playerInfo.drink === Drink.Wine
            ? 1
            : 0.5;
      const sips = Math.ceil((gameState?.currentQuestion?.punishment ?? 0) * multiplier);
      return (
        <p className="leading-tight text-left font-semibold">
          take {sips} sips
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
      {/* Back button */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-300 cursor-pointer">
          <ArrowLeft />
          <span>Back</span>
        </button>
        <button
          onClick={() => setShowSettings((prev) => !prev)}
          className="hover:text-gray-300 cursor-pointer">
          <Settings />
        </button>
      </div>
      {/* settings popup */}
      {showSettings && (
        <div className="absolute top-18 right-0 bg-blue-600 text-black shadow-lg rounded-lg p-2 w-48 flex flex-col gap-2 z-10">
          <div className="p-2 bg-gray-200 rounded text-sm text-center font-bold cursor-pointer">
            How to play
          </div>
          <div className="p-2 bg-gray-200 rounded text-sm text-center font-bold cursor-pointer">
            Contact us
          </div>
        </div>
      )}
      {/* Center Content */}
      <div className="flex flex-col items-center text-center gap-6 flex-grow">
        <h1 className="text-2xl font-bold mb-6">Round {gameState.roundNumber}</h1>
        <h2 className="text-xl mb-4">{`${currentPlayer?.playerInfo.id === '0' ? currentPlayer?.playerInfo.name + '\'' : currentPlayer?.playerInfo.name + '\'s'}`} Turn</h2>

        <div className="bg-white text-black p-6 rounded shadow-lg max-w-lg w-full mb-6">
          <p className="text-lg mb-4 text-left">{questionText}</p>
          <div className="space-y-1">{showNumberOfSips()}</div>
        </div>

        {/* like/dislike */}
        <div className="relative w-full h-36 mt-auto">
          <div className="absolute inset-x-0 bottom-24 flex justify-center gap-10">
            <button
              onClick={() => handleVote('dislike')}
              disabled={votedType !== null}
              className={`w-12 h-12 rounded-full flex justify-center items-center transition-all duration-200 cursor-pointer ${votedType === 'dislike' ? 'bg-red-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
                } ${votedType !== null && votedType !== 'dislike' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsDown />
            </button>

            <button
              onClick={() => handleVote('like')}
              disabled={votedType !== null}
              className={`w-12 h-12 rounded-full flex justify-center items-center transition-all duration-200 cursor-pointer ${votedType === 'like' ? 'bg-green-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
                } ${votedType !== null && votedType !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp />
            </button>
          </div>
          {/* Next button */}
          <div className="absolute inset-x-0 bottom-6 flex justify-center">
            <button
              onClick={handleNext}
              className="w-60 py-4 rounded-xl bg-green-500 hover:bg-green-600 font-bold text-lg shadow-lg cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
        {/* Skip button */}
        {(currentPlayer?.skipCount ?? 0) > 0 && (
          <div className="absolute inset-x-0 bottom-1 flex justify-center">
            <button
              onClick={handleSkip}
              className="w-20  py-2 rounded-xl bg-gray-500 hover:bg-gray-600 font-bold text-lg shadow-lg cursor-pointer"
            >
              Skip
            </button>
          </div>
        )
        }
      </div>
    </AdsLayout>
  );
}
