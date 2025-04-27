'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Settings, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function PlayPage() {
  const { id } = useParams();
  const router = useRouter();

  const [playerName, setPlayerName] = useState('Player 1');
  const [question, setQuestion] = useState('What is your greatest fear?');

  const handleNext = () => {
    console.log('Next question!');
    // TODO: Load next question logic
  };

  const handleSkip = () => {
    console.log('Skipped!');
    // TODO: Handle skip logic
  };

  return (
    <main className="min-h-screen bg-purple-900 text-white flex justify-center items-center p-4">
      <div className="w-full max-w-3xl bg-purple-800 p-6 rounded-xl shadow-lg flex flex-col justify-between min-h-[80vh]">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 hover:text-gray-300">
            <ArrowLeft />
            <span>Back</span>
          </button>
          <button className="hover:text-gray-300">
            <Settings />
          </button>
        </div>

        {/* Center content */}
        <div className="flex flex-col items-center text-center gap-6 flex-grow">
          <h1 className="text-2xl font-bold">{playerName}</h1>
          <div className="bg-white text-purple-900 p-6 rounded-lg w-full max-w-md shadow-md">
            <p className="text-lg">{question}</p>
          </div>

          {/* Like / Dislike */}
          <div className="flex items-center gap-8 mt-6">
            <button className="w-12 h-12 rounded-full bg-gray-700 flex justify-center items-center hover:bg-gray-600">
              <ThumbsDown />
            </button>
            <button className="w-12 h-12 rounded-full bg-gray-700 flex justify-center items-center hover:bg-gray-600">
              <ThumbsUp />
            </button>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded border border-white hover:bg-white hover:text-purple-900"
          >
            Skip
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 rounded bg-blue-600 hover:bg-blue-700 font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </main>
  );
}
