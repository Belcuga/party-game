'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Drink, Gender, Player } from './types/player';
import AddPlayerModal from './components/game/AddPlayerModal';
import { supabase } from './lib/SupabaseClient';
import { GamePlayer, GameState } from './types/game';
import { useGame } from './providers/GameContext';
import { TrashIcon } from 'lucide-react';
import { SettingsLabel } from './types/gameSettings';
import AdsLayout from './components/ad-layout/AdsLayout';
import { Question } from './types/question';
import SettingsMenu from './components/ui/SettingsMenu';
import Button from './components/ui/Button';
import Switch from './components/ui/Switch';

export default function Home() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);

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
    setGameSettings((prev) => {
      if (key === 'dirtyMode') {
        if (!prev[key]) {
          return {
            ...prev,
            dirtyMode: true,
            adultMode: false,
            challenges: false
          };
        }
        return {
          ...prev,
          dirtyMode: false
        };
      } else {
        return {
          ...prev,
          [key]: !prev[key],
          dirtyMode: false
        };
      }
    });
  };

  const startGame = async () => {
    if (players.length < 2) return;

    setLoading(true);

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
    router.push(`/game`);
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
          <div className="flex items-center gap-3">
            <img src="/logo.png" width={60} height={60} alt="Logo" />
            <h1 className="text-4xl font-extrabold drop-shadow-lg">Tipsy Trials</h1>
          </div>
          <SettingsMenu/>
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
                  <Switch
                    checked={gameSettings[item.value]}
                    onChange={() => toggleSetting(item.value)}
                    label={item.label}
                    size="small"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={startGame}
              disabled={players.length < 2}
              className="w-full disabled:cursor-not-allowed"
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
