'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid'; // for generating a random ID

export default function Home() {
  const router = useRouter();

  const startGame = () => {
    const id = uuid(); // generate a unique game session ID
    router.push(`/game/${id}`);
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-600 to-pink-500 text-white px-4">
      <h1 className="text-4xl font-extrabold mb-12 drop-shadow-lg text-center">
        🎉 Party Game
      </h1>

      <div className="flex flex-col space-y-4 w-full max-w-xs">
        <button
          onClick={startGame}
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl shadow hover:bg-purple-100 transition"
        >
          Start Game
        </button>

        <Link
          href="/settings"
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl text-center shadow hover:bg-purple-100 transition"
        >
          Settings
        </Link>

        <Link
          href="/admin"
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl text-center shadow hover:bg-purple-100 transition"
        >
          Admin
        </Link>
      </div>
    </main>
  );
}