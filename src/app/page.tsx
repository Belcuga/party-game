'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Drink, Gender, Player } from './types/player';
import AddPlayerModal from './components/game/AddPlayerModal';
import { supabase } from './lib/SupabaseClient';
import { GamePlayer, GameState } from './types/game';
import { useGame } from './providers/GameContext';
import { CogIcon, TrashIcon } from 'lucide-react';
import { SettingsLabel } from './types/gameSettings';
import AdsLayout from './components/ad-layout/AdsLayout';
import { Question } from './types/question';
import SettingsMenu from './components/ui/SettingsMenu';
import Button from './components/ui/Button';

export default function Home() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
    const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const savedPlayers = localStorage.getItem('tipsyPlayers');
    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed)) {
          setPlayers(parsed);
        }
      } catch (err) {
        console.error('Failed to parse saved players:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('tipsyPlayers', JSON.stringify(players));
    }
  }, [players]);

  const settings: SettingsLabel[] = [
    { label: 'Include Spicy Questions (18+)', tooltip: 'Include dirty questions', value: 'adultMode' },
    { label: 'Include Challenges', tooltip: 'Include physical or action-based challenges', value: 'challenges' },
    { label: 'Only Spicy Stuff (18+)', tooltip: 'Dirty questions and challenges only', value: 'dirtyMode' },
  ];

  const [modalOpen, setModalOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    adultMode: false,
    challenges: false,
    dirtyMode: false
  });
  const { setGameState, setLoading } = useGame();

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

    setLoading(true);
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
        setLoading(false);
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
    const filteredQuestions = allQuestions.filter((q: Question) => {
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
      <main className="flex flex-col items-center h-full">
        <div className="w-full flex items-center justify-between px-6 mb-6">
          <div className="w-8" /> {/* Spacer to maintain centering */}
          <div className="flex items-center gap-3 cursor-pointer">
            <img src="/logo.png" width={60} height={60} alt="Logo" />
            <h1 className="text-4xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>
          <SettingsMenu onClose={() => setShowMenu(false)} />
        </div>

        <div className="w-full max-w-md flex-1 overflow-y-auto px-4 flex flex-col">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Players</h2>
          </div>
          
          <ul className="space-y-2 mb-6 max-h-[250px] overflow-y-auto w-full">
            {players.map((player, i) => (
              <li
                key={i}
                className="w-full flex items-center justify-between px-3 py-1.5 bg-white/10 rounded-lg shadow-sm"
              >
                <span className="text-sm font-medium truncate">{player.name}</span>
                <button
                  onClick={() => removePlayer(i)}
                  className="p-1.5 rounded-md bg-[#4e2a8e]/40 hover:bg-[#9156f3]/30 text-pink-300 hover:text-pink-100 transition-colors cursor-pointer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <Button
            onClick={() => setModalOpen(true)}
            className="w-full mb-6"
          >
            Add Player
          </Button>

          <div className="w-full mt-auto">
            <div className="font-bold mb-3 text-center text-white text-lg">Choose Your Mode</div>
            <div className="space-y-1 mb-6">
              {settings.map((item, index) => (
                <div key={index} className="flex items-center justify-start gap-3 py-1 w-full">
                  <div 
                    className={`relative w-10 h-6 flex items-center rounded-full px-1 transition-colors duration-300 cursor-pointer ${gameSettings[item.value] ? 'bg-pink-500' : 'bg-purple-700'}`}
                    onClick={() => toggleSetting(item.value)}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${gameSettings[item.value] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              onClick={startGame}
              disabled={players.length < 2}
              className="w-full"
            >
              Start Game
            </Button>
          </div>
        </div>

        <AddPlayerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={(player: Player) => setPlayers((prev) => [...prev, player])}
        />
      </main>
    </AdsLayout>
  );
}
