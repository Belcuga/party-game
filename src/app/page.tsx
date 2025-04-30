'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Drink, Gender, Player } from './types/player';
import AddPlayerModal from './components/game/AddPlayerModal';
import { supabase } from './lib/SupabaseClient';
import { GameState } from './types/game';
import { useGame } from './providers/GameContext';
import { TrashIcon } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([
    {
      id: uuid(),
      name: "Zensko pivo single",
      gender: Gender.Female,
      drink: Drink.Beer,
      single: true,
      skipCount: 1,
    },
    {
      id: uuid(),
      name: "Zensko vino single",
      gender: Gender.Female,
      drink: Drink.Wine,
      single: true,
      skipCount: 1,
    },
    {
      id: uuid(),
      name: "Zensko rakija taken",
      gender: Gender.Female,
      drink: Drink.Strong,
      single: false,
      skipCount: 1,
    },
    {
      id: uuid(),
      name: "Musko pivo single",
      gender: Gender.Male,
      drink: Drink.Beer,
      single: true,
      skipCount: 1,
    },
    {
      id: uuid(),
      name: "Musko vino taken",
      gender: Gender.Male,
      drink: Drink.Wine,
      single: false,
      skipCount: 1,
    },
    {
      id: uuid(),
      name: "Musko rakija single",
      gender: Gender.Female,
      drink: Drink.Strong,
      single: true,
      skipCount: 1,
    },

  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    adultMode: false,
    challenges: false,
  });
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const { setGameState } = useGame();

  const toggleSetting = (key: 'adultMode' | 'challenges') => {
    setGameSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startGame = async () => {
    if (players.length < 2) return;

    setLoadingQuestions(true);
    const id = uuid();

    const { data, error } = await supabase.from('questions').select('*');

    if (error || !data) {
      console.error('Failed to fetch questions:', error?.message);
      setLoadingQuestions(false);
      return;
    }

    let filteredQuestions = data.filter((q: Question) => {
      if (!gameSettings.adultMode && q.dirty) return false;
      if (!gameSettings.challenges && q.challenge) return false;
      return true;
    });

    // Check if we can allow ${player} questions
    // const hasOppositeGenderSingles = players.some((p1) =>
    //   players.some(
    //     (p2) =>
    //       p1.gender !== p2.gender &&
    //       p1.gender !== 'none' &&
    //       p2.gender !== 'none'
    //   )
    // );

    // if (!hasOppositeGenderSingles) {
    //   filteredQuestions = filteredQuestions.filter((q) => !q.question.includes('${player}'));
    // }

    // Initialize Game Players
    const initializedPlayers = players.map((p) => ({
      id: String(p.id),
      name: p.name,
      gender: p.gender,
      drink: p.drink,
      skipCount: 1,
      difficultyQueue: shuffleArray([1, 2, 3, 4, 5]),
      difficultyIndex: 0,
      totalQuestionsAnswered: 0,
    }));

    initializedPlayers.push({
      id: String(0),
      name: 'All players',
      gender: Gender.None,
      drink: Drink.None,
      skipCount: 0,
      difficultyQueue: [],
      difficultyIndex: 0,
      totalQuestionsAnswered: 0,
    })

    // Initialize Game State
    const gameState: GameState = {
      players: initializedPlayers,
      questions: filteredQuestions,
      answeredQuestionIds: [],
      roundPlayersLeft: initializedPlayers.map(p => p.id),
      currentPlayerId: null,
      currentQuestion: null,
      roundNumber: 1,
      bonusReady: false,
    };

    setLoadingQuestions(false);
    setGameState(gameState);
    router.push(`/game/${id}`);
  };

  const removePlayer = (index: number) => {
    setPlayers((prev) => prev.filter((_, i) => i !== index));
  };

  function shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }

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

      {/* Centered Game Card Wrapper */}
      <div className="z-0 flex items-center justify-center w-full min-h-screen p-8">
        <div className="relative bg-blue-800/80 backdrop-blur-md shadow-2xl rounded-2xl p-10 w-[728px] h-[680px] flex flex-col justify-between">
          <main className="flex flex-col justify-center items-center text-white">
            <h1 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">
              Party Game
            </h1>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Players</h2>
              <ul className="space-y-1 mb-4 max-h-[400px] overflow-y-auto">
                {players.map((player, i) => (
                  <li key={i} className="flex items-center justify-between gap-2">
                    <span>{player.name}</span>
                    <button
                      onClick={() => removePlayer(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setModalOpen(true)}
                className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
              >
                ➕ Add Player
              </button>
            </section>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-3">
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 text-white">
                  <input type="checkbox" 
                  className="form-checkbox" 
                  checked={gameSettings.adultMode}
                  onChange={() => toggleSetting('adultMode')}
                  />
                  <span>Adult Mode</span>
                </label>
                <label className="flex items-center space-x-2 text-white">
                  <input type="checkbox" 
                  className="form-checkbox" 
                  checked={gameSettings.challenges}
                  onChange={() => toggleSetting('challenges')}
                  />
                  <span>Challenges</span>
                </label>
              </div>

              <button  
               onClick={startGame}
              className={`px-6 py-3 rounded font-bold w-full ${players.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                Start Game
              </button>
            </div>
            <Link
              href="/admin"
              className="absolute bottom-4 right-4 bg-white text-purple-700 font-semibold px-4 py-1.5 text-sm rounded-full shadow hover:bg-purple-100 transition"
            >
              Admin
            </Link>
            <AddPlayerModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onAdd={(player: Player) => setPlayers((prev) => [...prev, player])}
            />
          </main>
        </div>
      </div>
    </div>
  );
}