'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuid } from 'uuid'; // for generating a random ID
import { Player } from './types/player';
import AddPlayerModal from './components/game/AddPlayerModal';

export default function Home() {
  const router = useRouter();

  const [players, setPlayers] = useState<Player[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [gameSettings, setGameSettings] = useState({
    adultMode: false,
    challenges: false,
  });

  const toggleSetting = (key: 'adultMode' | 'challenges') => {
    setGameSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startGame = () => {
    const id = uuid(); // generate a unique game session ID
    router.push(`/game/${id}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-950 to-blue-900 text-white px-4">
      <h1 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">
        Party Game
      </h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Players</h2>

        <ul className="space-y-1 mb-4">
          {players.map((player, i) => (
            <li key={i}>
              {player.name}
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

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            checked={gameSettings.adultMode}
            onChange={() => toggleSetting('adultMode')}
          />
          Adult Mode
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 bg-gray-100 border-gray-300 rounded-sm focus:focus:ring-blue-900 dark:focus:ring-blue-900 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            checked={gameSettings.challenges}
            onChange={() => toggleSetting('challenges')}
          />
          Challenges
        </label>

      </div>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button
          onClick={startGame}
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl shadow hover:bg-purple-100 transition"
        >
          Start Game
        </button>

        <Link
          href="/admin"
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl text-center shadow hover:bg-purple-100 transition"
        >
          Admin
        </Link>
      </div>
      <AddPlayerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={(player: Player) => setPlayers((prev) => [...prev, player])}
      />
    </main>
  );
}