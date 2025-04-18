'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Question = {
  id: number;
  text: string;
};

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12 drop-shadow-lg">
        🎉 Party Game
      </h1>

      <div className="flex flex-col space-y-4 w-[200px]">
        <Link
          href="/game"
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl text-center shadow hover:bg-purple-100 transition"
        >
          Start Game
        </Link>

        <Link
          href="/how-to-play"
          className="bg-white text-purple-700 font-semibold py-3 rounded-xl text-center shadow hover:bg-purple-100 transition"
        >
          How to Play
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