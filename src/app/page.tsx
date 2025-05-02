'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Drink, Gender, Player } from './types/player';
import AddPlayerModal from './components/game/AddPlayerModal';
import { supabase } from './lib/SupabaseClient';
import { GamePlayer, GameState } from './types/game';
import { useGame } from './providers/GameContext';
import { Loader2, TrashIcon } from 'lucide-react';
import { SettingsLabel } from './types/gameSettings';
import AdsLayout from './components/ad-layout/AdsLayout';

export default function Home() {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([
    {
      id: uuid(),
      name: "Zensko pivo single",
      gender: Gender.Female,
      drink: Drink.Beer,
      single: true,
    },
    {
      id: uuid(),
      name: "Zensko vino single",
      gender: Gender.Female,
      drink: Drink.Wine,
      single: true,
    },
    {
      id: uuid(),
      name: "Zensko rakija taken",
      gender: Gender.Female,
      drink: Drink.Strong,
      single: false,
    },
    {
      id: uuid(),
      name: "Musko pivo single",
      gender: Gender.Male,
      drink: Drink.Beer,
      single: true,
    },
    {
      id: uuid(),
      name: "Musko vino taken",
      gender: Gender.Male,
      drink: Drink.Wine,
      single: false,
    },
    {
      id: uuid(),
      name: "Musko rakija single",
      gender: Gender.Female,
      drink: Drink.Strong,
      single: true,
    },

  ]);

  const settings: SettingsLabel[] = [
    { label: 'Dirty (18+)', tooltip: 'Include dirty questions', value: 'adultMode' },
    { label: 'Challenges', tooltip: 'Include physical or action-based challenges', value: 'challenges' },
    { label: 'Dirty mode only (18+)', tooltip: 'Dirty questions and challenges only', value: 'dirtyMode' },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    adultMode: false,
    challenges: false,
    dirtyMode: false
  },);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const { setGameState } = useGame();

  const toggleSetting = (key: 'adultMode' | 'challenges' | 'dirtyMode') => {
    setGameSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    if (key === 'dirtyMode') {
      setGameSettings((prev) => ({ ...prev, ['adultMode']: false }));
      setGameSettings((prev) => ({ ...prev, ['challenges']: false }));
    }
    else {
      setGameSettings((prev) => ({ ...prev, ['dirtyMode']: false }));
    }

  };

  const startGame = async () => {
    if (players.length < 2) return;

    setLoadingQuestions(true);
    const id = uuid();

    const pageSize = 1000;
    let from = 0;
    let moreData = true;
    const questionMap = new Map();

    while (moreData) {
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .range(from, to)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });

      if (error) {
        console.error('Failed to fetch questions:', error.message);
        setLoadingQuestions(false);
        return;
      }

      if (data && data.length > 0) {
        data.forEach((q) => questionMap.set(q.id, q));
        from += pageSize;
      } else {
        moreData = false;
      }
    }

    const allQuestions = Array.from(questionMap.values());
    let filteredQuestions = allQuestions.filter((q: Question) => {
      if (gameSettings.dirtyMode) {
        if (q.dirty) return true;
        return false;
      }
      else {
        if (!gameSettings.adultMode && q.dirty) return false;
        if (!gameSettings.challenges && q.challenge) return false;
        return true;
      }
    });

    // Optional gender-based filtering
    // const hasOppositeGenderSingles = players.some((p1) =>
    //   players.some(
    //     (p2) =>
    //       p1.gender !== p2.gender &&
    //       p1.gender !== 'none' &&
    //       p2.gender !== 'none'
    //   )
    // );
    //
    // if (!hasOppositeGenderSingles) {
    //   filteredQuestions = filteredQuestions.filter((q) => !q.question.includes('${player}'));
    // }

    const existingDifficulties = [...new Set(filteredQuestions.map(q => q.difficulty))];

    const initializedPlayers = players.map((p) => ({
      playerInfo: {
        id: String(p.id),
        name: p.name,
        gender: p.gender,
        drink: p.drink,
        single: p.single
      },
      skipCount: 1,
      difficultyQueue: shuffleArray(existingDifficulties),
      difficultyIndex: 0,
      totalQuestionsAnswered: 0,
    } as GamePlayer));

    initializedPlayers.push({
      playerInfo: {
        id: String(0),
        name: 'All players',
        gender: Gender.None,
        drink: Drink.None,
        single: false,
      },
      skipCount: 0,
      difficultyQueue: [],
      difficultyIndex: 0,
      totalQuestionsAnswered: 0,
    } as GamePlayer);

    const gameState: GameState = {
      players: initializedPlayers,
      questions: filteredQuestions,
      answeredQuestionIds: [],
      roundPlayersLeft: initializedPlayers.map(p => p.playerInfo.id),
      currentPlayerId: null,
      currentQuestion: null,
      roundNumber: 1,
      bonusReady: false,
      existingDifficulties: existingDifficulties
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
    <AdsLayout>
      {loadingQuestions && (
        <div className="flex justify-center items-center h-full w-full">
          <Loader2 className="animate-spin w-10 h-10" />
        </div>

      )}
      {!loadingQuestions && (
        <main className="flex flex-col justify-center items-center text-white">
          <h1 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">
            Party Game
          </h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Players</h2>
            <ul className="space-y-1 mb-4 max-h-[280px] overflow-y-auto">
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
              Add Player
            </button>
          </section>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-3">
            <div className="flex flex-col">
              {settings.map((item, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center gap-1 mt-2 group">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 cursor-pointer"
                      checked={gameSettings[item.value]}
                      onChange={() => toggleSetting(item.value)}
                    />
                    <span className="relative cursor-help">
                      {item.label}
                      <div className="absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-3 py-1 text-sm text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {item.tooltip}
                      </div>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              className={`px-6 py-3 rounded font-bold w-full ${players.length < 2 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500  hover:bg-green-600 text-white'
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
      )}

    </AdsLayout>
  );
}