'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import AddPlayerModal from '@/app/components/game/AddPlayerModal';
import { Gender, Player } from '@/app/types/player';

export default function GameSetupPage() {
    const { id } = useParams();
    const router = useRouter();

    const [settings, setSettings] = useState({
        adultMode: false,
        challenges: false,
        questionsPerPlayer: 10,
    });

    const [playerName, setPlayerName] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [modalOpen, setModalOpen] = useState(false);

    const toggleSetting = (key: 'adultMode' | 'challenges') => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const updateQuestionCount = (value: number) => {
        const safeValue = Math.max(10, Math.min(50, value));
        setSettings((prev) => ({ ...prev, questionsPerPlayer: safeValue }));
    };

    const addPlayer = () => {
        if (playerName.trim() !== '') {
            const newPlayer: Player = {
                name: playerName.trim(),
                gender: Gender.None, // or some default if gender isn't selected here
            };

            setPlayers((prev) => [...prev, newPlayer]);
            setPlayerName('');
        }
    };

    const startGame = () => {
        console.log({ settings, players });
        router.push(`/game/${id}/play`);
    };

    return (
        <main className="min-h-screen bg-purple-900 text-white flex justify-center items-center px-4">
            <div className="w-full max-w-3xl bg-purple-800 p-6 rounded-xl shadow-lg space-y-8">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    🎮 Game Setup – Session: {id}
                </h1>

                {/* Game Settings */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Game Settings</h2>

                    <div className="space-y-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={settings.adultMode}
                                onChange={() => toggleSetting('adultMode')}
                            />
                            🔞 Adult Mode
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={settings.challenges}
                                onChange={() => toggleSetting('challenges')}
                            />
                            🎯 Challenges
                        </label>

                        <label className="flex flex-col gap-1 mt-4">
                            <span className="text-sm">📋 Questions per Player (10–50)</span>
                            <input
                                type="number"
                                value={settings.questionsPerPlayer}
                                onChange={(e) => updateQuestionCount(Number(e.target.value))}
                                min={10}
                                max={50}
                                className="rounded px-3 py-2 text-black w-full max-w-[150px]"
                            />
                        </label>
                    </div>
                </section>

                {/* Player Form */}
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-2">Players</h2>

                    <ul className="space-y-1 mb-4">
                        {players.map((player, i) => (
                            <li key={i}>
                                {player.name} {player.gender !== 'none' && `(${player.gender})`}
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

                {/* Start Game Button */}
                <button
                    onClick={startGame}
                    className="bg-blue-600 px-6 py-3 rounded font-bold hover:bg-blue-700 w-full"
                >
                    ✅ Start Game
                </button>
                <AddPlayerModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onAdd={(player: Player) => setPlayers((prev) => [...prev, player])}
                />
            </div>
        </main>
    );
}