'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Settings, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useGame, GameState, GameQuestion } from '@/app/providers/GameContext';
import { supabase } from '@/app/lib/SupabaseClient';
import { GamePlayer } from '@/app/types/game';
import { Drink } from '@/app/types/player';

export default function PlayPage() {
  const router = useRouter();
  const { gameState, setGameState } = useGame();
  const [localLoading, setLocalLoading] = useState(true);
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

    setLocalLoading(false);
  }, [gameState]);

  if (!gameState || localLoading) {
    return <div>Loading...</div>;
  }

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const questionText = replacePlayerPlaceholder(
    gameState.currentQuestion?.question || '',
    gameState,
    currentPlayer?.id || ''
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

  function pickNextQuestion(playerId: string, state: GameState): GameQuestion {
    const player = state.players.find(p => p.id === playerId);
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
      let desiredDifficulty = player.difficultyQueue[player.difficultyIndex];
      let allPlayersQuestion = false;
      let desiredDifficultyRequired = true;
      if (player.id === '0') {
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

    const currentPlayer = state.players.find(p => p.id === currentPlayerId);
    if (!currentPlayer) return question;

    // Filter eligible other players
    const otherPlayers = state.players.filter(
      p => p.id !== currentPlayerId &&
        p.gender !== currentPlayer.gender &&
        p.id !== '0'
    );

    if (otherPlayers.length === 0) return question;

    // Count how many placeholders are in the string
    const placeholderCount = (question.match(/\$\{player\}/g) || []).length;

    // Shuffle and pick unique players for each placeholder
    const shuffled = [...otherPlayers].sort(() => Math.random() - 0.5);
    const pickedPlayers = shuffled.slice(0, placeholderCount);

    let replaced = question;
    for (let i = 0; i < placeholderCount; i++) {
      const name = pickedPlayers[i % pickedPlayers.length].name;
      replaced = replaced.replace(PLACEHOLDER, name);
    }

    return replaced;
  }

  function handleNext() {
    if (!gameState) return;
    const updatedAnsweredIds = [...gameState.answeredQuestionIds, gameState.currentQuestion?.id ?? 0];
    let updatedRoundPlayersLeft = gameState.roundPlayersLeft.filter(id => id !== gameState.currentPlayerId);
    let updatedRoundNumber = gameState.roundNumber;

    // First: If still normal players left
    if (updatedRoundPlayersLeft.length > 0) {
      const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: updatedRoundPlayersLeft });

      const player = gameState.players.find(p => p.id === nextPlayerId);
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
    const newRoundPlayers = gameState.players.map(p => p.id);
    updatedRoundNumber += 1;

    // Give extra skip every 10 rounds
    if (updatedRoundNumber % 10 === 1 && updatedRoundNumber !== 1) {
      gameState.players.forEach(player => player.skipCount++);
    }

    const nextPlayerId = pickNextPlayer({ ...gameState, roundPlayersLeft: newRoundPlayers });

    const player = gameState.players.find(p => p.id === nextPlayerId);
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
        currentPlayer?.drink === Drink.Beer
          ? 2
          : currentPlayer?.drink === Drink.Wine
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

  // function handleSkip() {
  //   console.log('Skip logic here...');
  // }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-white flex justify-center">
      {/* LEFT Ad Banner */}
      <div className="hidden lg:flex fixed left-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Left Ad
        </div>
      </div>

      {/* RIGHT Ad Banner */}
      <div className="hidden lg:flex fixed right-4 top-0 h-screen w-[160px] items-center justify-center z-10">
        <div className="w-[160px] h-[600px] bg-gray-700 text-white flex items-center justify-center shadow-xl rounded">
          Right Ad
        </div>
      </div>

      {/* TOP Ad Banner */}
      <div className="hidden lg:flex fixed top-4 left-1/2 transform -translate-x-1/2 w-[728px] h-[90px] z-20">
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center shadow-xl rounded">
          Top Ad
        </div>
      </div>

      {/* BOTTOM Ad Banner */}
      <div className="hidden lg:flex fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[728px] h-[90px] z-20">
        <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center shadow-xl rounded">
          Bottom Ad
        </div>
      </div>

      {/* Centered Game Card */}
      <div className="z-0 flex items-center justify-center w-full min-h-screen p-8">
        <div className="relative bg-blue-800/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-[728px] h-[680px] flex flex-col justify-between">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-300">
              <ArrowLeft />
              <span>Back</span>
            </button>
            {/* <button className="hover:text-gray-300">
              <Settings />
            </button> */}
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center text-center gap-6 flex-grow">
            <h1 className="text-2xl font-bold mb-6">Round {gameState.roundNumber}</h1>
            <h2 className="text-xl mb-4">{`${currentPlayer?.id === '0' ? currentPlayer?.name + '\'' : currentPlayer?.name + '\'s'}`} Turn</h2>

            <div className="bg-white text-black p-6 rounded shadow-lg max-w-lg w-full mb-6">
              <p className="text-lg mb-4 text-left">{questionText}</p>
              <div className="space-y-1">{showNumberOfSips()}</div>
            </div>

            {/* Like / Dislike Buttons */}
            <div className="relative w-full h-36 mt-auto">
              <div className="absolute inset-x-0 bottom-24 flex justify-center gap-10">
                <button
                  onClick={() => handleVote('dislike')}
                  disabled={votedType !== null}
                  className={`w-12 h-12 rounded-full flex justify-center items-center transition-all duration-200 ${votedType === 'dislike' ? 'bg-red-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
                    } ${votedType !== null && votedType !== 'dislike' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsDown />
                </button>

                <button
                  onClick={() => handleVote('like')}
                  disabled={votedType !== null}
                  className={`w-12 h-12 rounded-full flex justify-center items-center transition-all duration-200 ${votedType === 'like' ? 'bg-green-600 scale-110' : 'bg-gray-700 hover:bg-gray-600'
                    } ${votedType !== null && votedType !== 'like' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ThumbsUp />
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-6 flex justify-center">
                <button
                  onClick={handleNext}
                  className="w-60 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-lg shadow-lg"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-between items-center mt-8">
            <button
              onClick={handleSkip}
              className="px-4 py-2 rounded border border-white hover:bg-white hover:text-purple-900"
            >
              Skip
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
