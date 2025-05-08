'use client';

import { Loader2 } from 'lucide-react';
import { useGame } from '@/app/providers/GameContext';

export default function GlobalLoader() {
  const { loading } = useGame();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm z-50">
      <Loader2 className="animate-spin w-10 h-10 text-white" />
    </div>
  );
}